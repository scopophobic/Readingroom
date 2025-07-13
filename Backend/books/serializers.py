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
    book = BookSerializer(read_only=True)
    book_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = UserBookStatus
        fields = ['id', 'book', 'book_id', 'status', 'user']
        read_only_fields = ['user', 'book']