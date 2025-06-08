from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import requests
from dotenv import load_dotenv
import os
from wiki_fetch import fetch_wikipedia_summary
from embedder import embed_book_content
from query_engine import query_book, ensure_vectors_exist
from pydantic import BaseModel
from query_engine import compress_response

class ChatRequest(BaseModel):
    book_id: str
    question: str
    history: list[str] = []
# load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv()
GOOGLE_BOOKS_API_KEY = os.getenv("GOOGLE_API_KEY")
print("Loaded API Key:", GOOGLE_BOOKS_API_KEY)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}



@app.get("/search-books")
def search_books(q: str = Query(..., description="Search query for books")):
    # url = f"https://www.googleapis.com/books/v1/volumes?q={q}&key={GOOGLE_BOOKS_API_KEY}"
    url = f"https://www.googleapis.com/books/v1/volumes?q={q}&key={GOOGLE_BOOKS_API_KEY}"
    print(url)
    # url = f"https://www.googleapis.com/books/v1/volumes?q={q}"
    response = requests.get(url)
    data = response.json()
    results = []

    for item in data.get("items", []):
        volume = item["volumeInfo"]
        results.append({
            "title": volume.get("title"),
            "authors": volume.get("authors", []),
            "description": volume.get("description"),
            "thumbnail": volume.get("imageLinks", {}).get("thumbnail"),
            "book_id": item["id"]
        })

    return {"results": results}



@app.post("/books/fetch-wiki")
def fetch_wiki(book_title: str = Query(...), book_id: str = Query(...), author: str = Query(None)):
    result = fetch_wikipedia_summary(book_title, book_id, author)
    return result


@app.post("/books/embed")
async def embed_book(book_id: str = Query(...)):
    result = embed_book_content(book_id)
    return result

@app.get("/books/check")
def check_book(book_id: str = Query(...)):
    try:
        # Check if vectors exist for the book
        exists = ensure_vectors_exist(book_id)
        return {
            "status": "success",
            "exists": exists,
            "message": "Book data is ready" if exists else "Book data needs to be prepared"
        }
    except Exception as e:
        return {
            "status": "error",
            "exists": False,
            "message": str(e)
        }

@app.post("/books/prepare")
async def prepare_book(book_id: str = Query(...), book_title: str = Query(...), author: str = Query(None)):
    try:
        print(f"Preparing book: {book_title} (ID: {book_id})")
        
        # First check if book is already prepared
        check_response = check_book(book_id)
        if check_response["status"] == "success" and check_response["exists"]:
            return {
                "status": "success",
                "message": "Book data already exists",
                "data": {
                    "already_exists": True
                }
            }
        
        # If not prepared, proceed with preparation
        # Step 1: Fetch Wikipedia data - no await needed since fetch_wiki is sync
        wiki_response = fetch_wiki(
            book_title=book_title,
            book_id=book_id,
            author=author
        )
        
        if wiki_response.get("status") == "error":
            print(f"Warning: Wikipedia fetch failed: {wiki_response.get('message')}")
            return {
                "status": "error",
                "message": f"Failed to fetch Wikipedia data: {wiki_response.get('message')}"
            }
        
        # Step 2: Embed the book
        try:
            embed_result = embed_book_content(book_id)
            return {
                "status": "success",
                "message": "Book prepared successfully",
                "data": {
                    "wiki_data": wiki_response,
                    "embed_result": embed_result,
                    "already_exists": False
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to embed book: {str(e)}"
            }
            
    except Exception as e:
        print(f"Error preparing book: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/chat/query")
async def ask_question(payload: ChatRequest):
    try:
        print(f"Received query for book {payload.book_id}")
        
        # Try to query the book
        try:
            answer = query_book(
                book_id=payload.book_id,
                question=payload.question,
                history=payload.history
            )
            print("Query successful")
        except Exception as e:
            print(f"Query failed: {str(e)}")
            return {
                "status": "error",
                "message": "Book is not prepared. Please prepare the book first.",
                "response": None,
                "history": payload.history
            }

        # Build new trimmed history entry
        trimmed_answer = compress_response(answer)
        updated_history = payload.history + [
            f"User: {payload.question}",
            f"Bot: {trimmed_answer}"
        ]

        return {
            "status": "success",
            "response": answer,
            "history": updated_history
        }
    except Exception as e:
        error_message = str(e)
        print(f"Error in chat/query: {error_message}")
        return {
            "status": "error",
            "message": error_message,
            "response": None,
            "history": payload.history
        }