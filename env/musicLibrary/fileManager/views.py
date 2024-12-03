from django.http import JsonResponse
from pymongo import MongoClient
from gridfs import GridFS
from bson import ObjectId

# MongoDB Connection
client = MongoClient("mongodb://localhost:27017/")  # Connect to MongoDB
db = client['musicLibrary']  # Access the 'musicLibrary' database
fs = GridFS(db)  # Create GridFS object for file handling

# View to handle file upload
def upload_file(request):
    if request.method == "POST" and request.FILES.get('file'):
        file = request.FILES['file']
        content_type = file.content_type

        # Save file to GridFS
        file_id = fs.put(file, filename=file.name, content_type=content_type)

        # Handle image or audio files
        if content_type.startswith("image/"):
            # Save or update a song document with the imageFileId
            song_id = int(request.POST.get('id'))  # Fetch song ID from the POST request
            db.songs.update_one(
                {"id": song_id},
                {"$set": {"imageFileId": str(file_id)}},
                upsert=True  # Create the document if it doesn't exist
            )
            return JsonResponse({"imageFileId": str(file_id)}, status=200)

        elif content_type == "audio/mpeg":
            # Save or update a song document with the songFileId
            song_id = int(request.POST.get('id'))  # Fetch song ID from the POST request
            db.songs.update_one(
                {"id": song_id},
                {"$set": {"songFileId": str(file_id)}},
                upsert=True
            )
            return JsonResponse({"songFileId": str(file_id)}, status=200)

        else:
            return JsonResponse({"error": "Unsupported file type"}, status=400)

    return JsonResponse({"error": "No file provided or invalid method"}, status=400)


def create_or_update_song(request):
    if request.method == "POST":
        song_id = int(request.POST.get('id'))  # Song ID
        name = request.POST.get('name')  # Song name
        singer = request.POST.get('singer')  # Singer name

        # Update or create the song metadata
        db.songs.update_one(
            {"id": song_id},
            {"$set": {"name": name, "singer": singer}},
            upsert=True
        )
        return JsonResponse({"message": "Song metadata saved successfully!"}, status=200)

    return JsonResponse({"error": "Invalid method"}, status=400)
