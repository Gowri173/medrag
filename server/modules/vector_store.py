import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document

CHROMA_PATH = "./chroma_db"

def get_embeddings():
    return HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")    

def get_vector_store():
    embeddings = get_embeddings()
    return Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)

def push_to_vector_store(chunks: list[str]):
    vector_store = get_vector_store()
    
    documents = [Document(page_content=chunk) for chunk in chunks]
    vector_store.add_documents(documents)
