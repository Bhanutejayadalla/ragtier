import chromadb
from chromadb.utils import embedding_functions
from app.config import settings
import os

# Ensure Chroma directory exists
os.makedirs(settings.CHROMA_DIR, exist_ok=True)

# Initialize Chroma Persistent Client
chroma_client = chromadb.PersistentClient(path=settings.CHROMA_DIR)

# Use sentence-transformers for local embeddings
embedding_func = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")

COLLECTION_NAME = "cv_documents"

def get_chroma_collection():
    collection = chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=embedding_func,
        metadata={"hnsw:space": "cosine"}
    )
    return collection
