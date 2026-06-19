# MedRAGnosis

MedRAGnosis is a full-stack, Retrieval-Augmented Generation (RAG) Artificial Intelligence application tailored for medical documents. Upload PDF documents, and question an AI strictly based on that local knowledge corpus.

## Architecture

- **Frontend**: Modern React (Vite) styled with clean Vanilla CSS for a dynamic and premium feel.
- **Backend**: FastAPI with Python 3.
- **Vector DB**: ChromaDB (100% Local).
- **LLM Engine**: Groq (LLaMA-3.3-70B model).
- **Embeddings**: BBAI/bge-small-en-v1.5 (via HuggingFace).

## Prerequisites

- Node.js (for the React application)
- Python 3.9+ (for the FastAPI backend)
- API Keys: 
  - Groq API Key

## Setup Guide

### 1. Backend Setup (FastAPI)

Navigate to the server directory:
```bash
cd server
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Create environment variables:
Copy `.env.example` to `.env` and fill in your keys:
```
GROQ_API_KEY=your_groq_api_key_here
```

Start the fastAPI Server:
```bash
uvicorn main:app --reload
```
The API should now be running on `http://localhost:8000`.

### 2. Frontend Setup (React/Vite)

Open a new terminal window and navigate to the client directory:
```bash
cd client
```

Install Node packages:
```bash
npm install
```

Start the React Development Server:
```bash
npm run dev
```
The UI should now be accessible at `http://localhost:5173`.
