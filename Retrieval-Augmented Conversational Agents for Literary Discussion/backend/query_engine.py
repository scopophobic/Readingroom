import os
import google.generativeai as genai
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from embedder import embed_book_content, VECTORSTORE_DIR
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup ChromaDB and embedding model
chroma_client = chromadb.Client(Settings(
    persist_directory=VECTORSTORE_DIR,
    is_persistent=True
))
model = SentenceTransformer("all-MiniLM-L6-v2")

# Initialize Gemini client
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Warning: GEMINI_API_KEY not found in environment variables.")
    print("Please set it in your .env file or environment.")
    print("Example .env file content:")
    print("GEMINI_API_KEY=your-api-key-here")
    raise ValueError("GEMINI_API_KEY environment variable is not set. Please check the console for instructions.")

print("✅ GEMINI_API_KEY loaded successfully")
genai.configure(api_key=api_key)
gemini_model = genai.GenerativeModel("gemini-1.5-flash")

def ensure_vectors_exist(book_id: str) -> bool:
    """Check if vectors exist for a book, create them if they don't."""
    try:
        collection = chroma_client.get_collection(name=book_id)
        return collection.count() > 0
    except:
        # Collection doesn't exist or is empty, try to create it
        try:
            result = embed_book_content(book_id)
            return result["chunks_stored"] > 0
        except Exception as e:
            print(f"Error creating vectors for book {book_id}: {str(e)}")
            return False

def query_book(book_id: str, question: str, history: list[str], metadata: dict = None):
    # Ensure vectors exist
    if not ensure_vectors_exist(book_id):
        return "Sorry, I couldn't find or create the necessary information for this book. Please try again later."

    # Format metadata block if available
    meta_block = ""
    if metadata:
        meta_block = f"""
Book Metadata:
Title: {metadata.get("title", "")}
Author(s): {', '.join(metadata.get("authors", []))}
Description: {metadata.get("description", "")}
Categories: {', '.join(metadata.get("categories", []))}
Published: {metadata.get("publishedDate", "")}
"""

    # Embed and retrieve context
    try:
        question_embedding = model.encode([question]).tolist()[0]
        collection = chroma_client.get_collection(name=book_id)
        results = collection.query(query_embeddings=[question_embedding], n_results=3)
        book_context = "\n\n".join(results["documents"][0])
    except Exception as e:
        print(f"Error retrieving context: {str(e)}")
        return "Sorry, I encountered an error while retrieving the book information."

    history_text = "\n".join(history) if history else "No previous conversation."

    prompt = f"""
You are a helpful assistant that answers questions about books.

{meta_block}

Conversation so far:
{history_text}

Relevant context from the book:
{book_context}

Current question:
{question}

Answer concisely in 2–3 sentences, based on the context and metadata.
"""

    try:
        response = gemini_model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating response: {str(e)}")
        return "Sorry, I encountered an error while generating the response."

def compress_response(text: str) -> str:
    """Compress a response to a shorter version for history."""
    try:
        prompt = f"Summarize this response in one short sentence: {text}"
        response = gemini_model.generate_content(prompt)
        return response.text.strip()
    except:
        return text[:100] + "..." if len(text) > 100 else text
