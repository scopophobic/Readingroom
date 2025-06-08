import requests
from typing import Dict, Optional, Any, List
from django.conf import settings
from datetime import datetime
from ..models import Book
from rest_framework.decorators import action

class GoogleBooksAPI:
    BASE_URL = "https://www.googleapis.com/books/v1/volumes"
    
    @staticmethod
    def _parse_date(date_str: Optional[str]) -> Optional[str]:
        """Parse date string from Google Books API to YYYY-MM-DD format"""
        if not date_str:
            return None
        try:
            # Handle different date formats
            if len(date_str) == 4:  # Just year
                return f"{date_str}-01-01"
            elif len(date_str) == 7:  # Year and month
                return f"{date_str}-01"
            else:  # Full date
                return date_str
        except:
            return None

    @staticmethod
    def _extract_authors(authors: Optional[list]) -> str:
        """Convert authors list to comma-separated string"""
        if not authors:
            return ""
        return ", ".join(authors)

    @staticmethod
    def _extract_isbn(industry_identifiers: Optional[list]) -> Optional[str]:
        """Extract ISBN from industry identifiers"""
        if not industry_identifiers:
            return None
        for identifier in industry_identifiers:
            if identifier.get('type') in ['ISBN_13', 'ISBN_10']:
                return identifier.get('identifier')
        return None

    def _format_book_data(self, volume_info: Dict, book_id: str) -> Dict[str, Any]:
        """Format book data from Google Books API to our model format"""
        return {
            'title': volume_info.get('title', ''),
            'authors': self._extract_authors(volume_info.get('authors')),
            'description': volume_info.get('description', ''),
            'publication_date': self._parse_date(volume_info.get('publishedDate')),
            'cover_image_url': volume_info.get('imageLinks', {}).get('thumbnail', ''),
            'isbn': self._extract_isbn(volume_info.get('industryIdentifiers')),
            'publisher': volume_info.get('publisher', ''),
            'google_book_id': book_id
        }

    def get_book(self, book_id: str) -> Dict[str, Any]:
        """
        Fetch book data from Google Books API by ID
        
        Args:
            book_id: Google Books volume ID
            
        Returns:
            Dict containing formatted book data
            
        Raises:
            Exception: If book not found or API request fails
        """
        try:
            response = requests.get(f"{self.BASE_URL}/{book_id}")
            response.raise_for_status()
            data = response.json()
            
            if 'error' in data:
                raise Exception(f"Google Books API error: {data['error']['message']}")
            
            volume_info = data.get('volumeInfo', {})
            return self._format_book_data(volume_info, book_id)
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to fetch book data: {str(e)}")
        except Exception as e:
            raise Exception(f"Error processing book data: {str(e)}")

    def search_books(self, query: str, max_results: int = 10, auto_save: bool = True) -> List[Dict[str, Any]]:
        """
        Search for books using Google Books API and optionally save them to database
        
        Args:
            query: Search query string
            max_results: Maximum number of results to return
            auto_save: Whether to automatically save new books to database
            
        Returns:
            List of book data dictionaries with additional 'exists_in_db' and 'id' fields
        """
        try:
            params = {
                'q': query,
                'maxResults': max_results,
                'fields': 'items(id,volumeInfo(title,authors,description,publishedDate,imageLinks,industryIdentifiers,publisher))'
            }
            
            response = requests.get(f"{self.BASE_URL}", params=params)
            response.raise_for_status()
            data = response.json()
            
            if 'error' in data:
                raise Exception(f"Google Books API error: {data['error']['message']}")
            
            books = []
            for item in data.get('items', []):
                book_id = item.get('id')
                if not book_id:
                    continue

                try:
                    # Check if book exists in our database
                    try:
                        existing_book = Book.objects.get(google_book_id=book_id)
                        book_data = self._format_book_data(item.get('volumeInfo', {}), book_id)
                        book_data['exists_in_db'] = True
                        book_data['id'] = existing_book.id
                        books.append(book_data)
                        continue
                    except Book.DoesNotExist:
                        pass

                    # If book doesn't exist and auto_save is True, save it
                    if auto_save:
                        book_data = self.get_book(book_id)  # Get full book details
                        book = Book.objects.create(**book_data)
                        book_data['exists_in_db'] = True
                        book_data['id'] = book.id
                    else:
                        book_data = self._format_book_data(item.get('volumeInfo', {}), book_id)
                        book_data['exists_in_db'] = False

                    books.append(book_data)

                except Exception as e:
                    print(f"Error processing book {book_id}: {str(e)}")
                    continue
            
            return books
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to search books: {str(e)}")
        except Exception as e:
            raise Exception(f"Error processing search results: {str(e)}") 