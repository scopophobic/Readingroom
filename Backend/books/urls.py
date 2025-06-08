from django.urls import path
from . import views
from .views import (
    BookListCreateAPIView,
    BookRetrieveUpdateDestroyAPIView,
    GoogleBooksSearchView,
    SaveGoogleBookView,
    UserBookStatusListCreateView,
    UserBookStatusUpdateView
)

urlpatterns = [

    # Google Books API endpoints
    path('search/', GoogleBooksSearchView.as_view(), name='google_books_search'),
    path('save/', SaveGoogleBookView.as_view(), name='book-save'),

    path('my-reading-status/', UserBookStatusListCreateView.as_view(), name='user-reading-status'),
    path('my-reading-status/<int:pk>/', UserBookStatusUpdateView.as_view(), name='update-reading-status'),
    # New CRUD endpoints
    path('', BookListCreateAPIView.as_view(), name='book-list-create'),
    path('<str:book_id>/', BookRetrieveUpdateDestroyAPIView.as_view(), name='book-detail'),
    
    # Keep existing endpoints for backward compatibility
    path('fetch-books/', views.fetch_books_from_api, name='fetch_books'),
]