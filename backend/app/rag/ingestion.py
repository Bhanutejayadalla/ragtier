import fitz  # PyMuPDF
from app.rag.embeddings import get_chroma_collection
import uuid

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text()
    except Exception as e:
        print(f"Error reading PDF {file_path}: {e}")
    return text

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks

def process_and_ingest_cv(cv_id: int, file_path: str, tier: str, filename: str):
    text = extract_text_from_pdf(file_path)
    if not text.strip():
        return False
        
    chunks = chunk_text(text)
    if not chunks:
        return False
        
    collection = get_chroma_collection()
    
    ids = [str(uuid.uuid4()) for _ in chunks]
    metadatas = [{"cv_id": cv_id, "tier": tier, "filename": filename} for _ in chunks]
    
    collection.add(
        documents=chunks,
        metadatas=metadatas,
        ids=ids
    )
    return True
