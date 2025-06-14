from django.db import models
from django.conf import settings


# Create your models here.



class ReadingStatus(models.TextChoices):
    TO_READ = 'to_read', 'To Read'
    READING = 'reading', 'Reading'
    FINISHED = 'finished', 'Finished Reading'

class UserBookStatus(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    book = models.ForeignKey('Book', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=ReadingStatus.choices)

    class Meta:
        unique_together = ('user', 'book')  # prevent duplicates

    def __str__(self):
        return f"{self.user} - {self.book.title} ({self.status})"
class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)



class Book(models.Model):
    title = models.CharField(max_length=300)
    authors = models.CharField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    publication_date = models.DateField(blank=True, null=True)
    # cover_image_url = models.URLField(blank=True, null=True)
    cover_image_url = models.URLField(max_length=1000, blank=True, null=True)
    isbn = models.CharField(max_length=200, blank=True, null=True)  # updated
    publisher = models.CharField(max_length=300, blank=True, null=True)
    genres = models.ManyToManyField(Genre, blank=True)
    google_book_id = models.CharField(max_length=255, unique=True, blank=True, null=True)

    def __str__(self):
        return self.title

