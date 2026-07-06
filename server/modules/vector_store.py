import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document

CHROMA_PATH = "./chroma_db"

import re

def sanitize_collection_name(name: str) -> str:
    # 1. Clean the string to lowercase, alphanumeric, hyphens, underscores
    cleaned = re.sub(r'[^a-z0-9_-]', '-', name.lower())
    
    # 2. Avoid consecutive hyphens/underscores
    cleaned = re.sub(r'[-_]+', '-', cleaned)
    
    # 3. Ensure it starts with a letter
    if not cleaned or not cleaned[0].isalpha():
        cleaned = "session-" + cleaned
        
    # 4. Ensure it ends with an alphanumeric character
    if not cleaned[-1].isalnum():
        cleaned = cleaned[:-1]
        
    # 5. Restrict length to 3-63 characters
    cleaned = cleaned[:63]
    if len(cleaned) < 3:
        cleaned = cleaned.ljust(3, 'a')
        
    return cleaned

def get_embeddings():
    return HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")    

def get_vector_store(session_id: str = "default_collection"):
    sanitized_id = sanitize_collection_name(session_id)
    embeddings = get_embeddings()
    return Chroma(collection_name=sanitized_id, persist_directory=CHROMA_PATH, embedding_function=embeddings)

def push_to_vector_store(chunks: list[str], session_id: str = "default_collection"):
    if not chunks:
        return
    vector_store = get_vector_store(session_id)
    
    documents = [Document(page_content=chunk) for chunk in chunks]
    vector_store.add_documents(documents)
