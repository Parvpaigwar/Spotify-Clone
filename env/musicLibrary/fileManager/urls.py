from django.urls import path
from .views import upload_file, create_or_update_song

urlpatterns = [
    path('upload/', upload_file, name='upload_file'),  # For file uploads
    path('create_or_update/', create_or_update_song, name='create_or_update_song'),  # For song metadata
]
