import os
import requests
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv
from fastapi import HTTPException
from .wiki_fetch import fetch_wikipedia_summary
from .embedder import embed_book_content
from .query_engine import query_book, compress_response

# Load environment variables
load_dotenv()
GOOGLE_BOOKS_API_KEY = os.getenv("GOOGLE_API_KEY")

class BookAPI:
    def __init__(self):
        if not GOOGLE_BOOKS_API_KEY:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")

    async def search_books(self, query: str) -> Dict[str, Any]:
        """Search for books using Google Books API"""
        try:
            url = f"https://www.googleapis.com/books/v1/volumes?q={query}&key={GOOGLE_BOOKS_API_KEY}"
            response = requests.get(url)
            data = response.json()
            
            if "error" in data:
                raise HTTPException(status_code=400, detail=data["error"]["message"])
            
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
            
            return {"status": "success", "results": results}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to search books: {str(e)}")

    async def get_book_metadata(self, book_id: str) -> Dict[str, Any]:
        """Fetch detailed book metadata from Google Books API"""
        try:
            url = f"https://www.googleapis.com/books/v1/volumes/{book_id}?key={GOOGLE_BOOKS_API_KEY}"
            response = requests.get(url)
            data = response.json()
            
            if "error" in data:
                raise HTTPException(status_code=400, detail=data["error"]["message"])
            
            volume = data.get("volumeInfo", {})
            return {
                "title": volume.get("title"),
                "authors": volume.get("authors", []),
                "description": volume.get("description"),
                "thumbnail": volume.get("imageLinks", {}).get("thumbnail"),
                "book_id": book_id,
                "published_date": volume.get("publishedDate"),
                "publisher": volume.get("publisher"),
                "categories": volume.get("categories", []),
                "page_count": volume.get("pageCount"),
                "language": volume.get("language")
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch book metadata: {str(e)}")

    async def prepare_book(self, book_id: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare a book for chat by fetching Wikipedia data and embedding"""
        try:
            # Step 1: Fetch Wikipedia data
            wiki_response = await fetch_wikipedia_summary(
                book_title=metadata["title"],
                book_id=book_id,
                author=metadata.get("authors", [""])[0] if metadata.get("authors") else None
            )
            
            if wiki_response.get("status") == "error":
                print(f"Warning: Wikipedia fetch failed: {wiki_response.get('message')}")
            
            # Step 2: Embed the book
            try:
                embed_result = embed_book_content(book_id)
                return {
                    "status": "success",
                    "message": "Book prepared successfully",
                    "wiki_data": wiki_response
                }
            except Exception as embed_error:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to embed book: {str(embed_error)}"
                )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to prepare book: {str(e)}"
            )

    async def chat_query(
        self,
        book_id: str,
        question: str,
        history: List[str],
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Handle a chat query for a book"""
        try:
            # Step 1: Get or verify metadata
            if not metadata or not metadata.get("title"):
                metadata = await self.get_book_metadata(book_id)

            # Step 2: Try to query
            try:
                answer = query_book(
                    book_id=book_id,
                    question=question,
                    history=history,
                    metadata=metadata
                )
            except Exception as e:
                # Book needs preparation
                print(f"Book needs preparation: {str(e)}")
                await self.prepare_book(book_id, metadata)
                
                # Try query again
                answer = query_book(
                    book_id=book_id,
                    question=question,
                    history=history,
                    metadata=metadata
                )

            # Process response
            trimmed_answer = compress_response(answer)
            updated_history = history + [
                f"User: {question}",
                f"Bot: {trimmed_answer}"
            ]

            return {
                "status": "success",
                "response": answer,
                "history": updated_history,
                "metadata": metadata
            }
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Chat query failed: {str(e)}"
            )

# Create a singleton instance
book_api = BookAPI() 