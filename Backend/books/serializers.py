from rest_framework import serializers
from .models import Book, Genre, UserBookStatus

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name']

class BookSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, required=False)

    class Meta:
        model = Book
        fields = '__all__'


class UserBookStatusSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)

    class Meta:
        model = UserBookStatus
        fields = ['id', 'book', 'book_title', 'status']