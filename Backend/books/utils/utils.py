import requests
from datetime import datetime
from django.conf import settings
from books.models import Book


def fetch_and_save_book_by_google_id(book_id: str, user=None):
    if Book.objects.filter(google_book_id=book_id).exists():
        return Book.objects.get(google_book_id=book_id)

    url = f'https://www.googleapis.com/books/v1/volumes/{book_id}?key={settings.GOOGLE_BOOKS_API_KEY}'
    response = requests.get(url)
    if response.status_code != 200:
        return None

    data = response.json()
    info = data.get('volumeInfo', {})
    pub_date = info.get('publishedDate', '')
    parsed_date = None
    try:
        if len(pub_date) == 4:
            parsed_date = datetime.strptime(pub_date, '%Y').date()
        elif len(pub_date) == 7:
            parsed_date = datetime.strptime(pub_date, '%Y-%m').date()
        elif len(pub_date) == 10:
            parsed_date = datetime.strptime(pub_date, '%Y-%m-%d').date()
    except:
        pass

    book = Book.objects.create(
        title=info.get('title', '')[:300],
        authors=', '.join(info.get('authors', []))[:500],
        description=info.get('description', ''),
        publication_date=parsed_date,
        cover_image_url=info.get('imageLinks', {}).get('thumbnail', '')[:1000],
        isbn=', '.join([id.get('identifier', '') for id in info.get('industryIdentifiers', [])])[:200],
        publisher=info.get('publisher', '')[:300],
        google_book_id=book_id,
    )

    return book