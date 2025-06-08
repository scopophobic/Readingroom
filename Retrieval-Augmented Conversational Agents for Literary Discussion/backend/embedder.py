import os
import json
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings

# Ensure vectorstore directory exists
VECTORSTORE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "vectorstore")
os.makedirs(VECTORSTORE_DIR, exist_ok=True)

# Set persistent storage with absolute path
chroma_client = chromadb.Client(Settings(
    persist_directory=VECTORSTORE_DIR,
    is_persistent=True
))
model = SentenceTransformer("all-MiniLM-L6-v2")

def embed_book_content(book_id):
    path = f"data/{book_id}/summary.json"
    if not os.path.exists(path):
        raise FileNotFoundError(f"No summary found for book_id: {book_id}")

    with open(path, "r") as f:
        data = json.load(f)

    content = data.get("content")
    if not content:
        raise ValueError("No content found in summary.json")

    # Chunking
    chunks = [content[i:i+500] for i in range(0, len(content), 500)]
    embeddings = model.encode(chunks).tolist()

    # Store in vector DB
    collection = chroma_client.get_or_create_collection(name=book_id)
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=[f"{book_id}_{i}" for i in range(len(chunks))],
        metadatas=[{"source": "wiki"} for _ in chunks]
    )

    # Persist changes
    try:
        chroma_client.persist()
    except Exception as e:
        print(f"Warning: Could not persist changes: {str(e)}")

    print("✅ Book ID:", book_id)
    print("✅ Embedded chunks:", len(chunks))
    print("✅ Collection count:", collection.count())   
    print("✅ Current working dir:", os.getcwd())
    print("✅ Vectorstore path:", VECTORSTORE_DIR)
    print("✅ Vectorstore exists:", os.path.exists(VECTORSTORE_DIR))
    print("✅ Vectorstore contents:", os.listdir(VECTORSTORE_DIR) if os.path.exists(VECTORSTORE_DIR) else "not created")

    return {
        "book_id": book_id,
        "chunks_stored": len(chunks)
    }
