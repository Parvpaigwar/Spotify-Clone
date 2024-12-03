// Import MongoDB client
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017"; 
const databaseName = "musicLibrary";
const collectionName = "songs";

// Function to fetch data and return it as a JSON array
export async function fetchData() {
  // Create a new MongoClient
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB server
    await client.connect();

    console.log("Connected to MongoDB!");

    // Access the database and collection
    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    // Query to fetch all documents from the collection
    const query = {}; // Empty query to fetch all documents
    const data = await collection.find(query).toArray();

    // Return the data as a JSON array
    return data;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error; // Rethrow the error so the caller can handle it
  } finally {
    // Ensure the client is closed
    await client.close();
    console.log("MongoDB connection closed.");
  }
}


