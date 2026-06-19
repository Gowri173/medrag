import json
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from modules.document_processor import process_pdfs
from modules.vector_store import push_to_vector_store
from modules.rag_chain import stream_rag_response

router = APIRouter()

class QueryRequest(BaseModel):
    query: str

@router.post("/upload_pdfs/")
async def upload_pdfs(files: list[UploadFile] = File(...)):
    try:
        file_contents = []
        for file in files:
            content = await file.read()
            file_contents.append(content)
        
        # 1. Process and chunk
        chunks = process_pdfs(file_contents)
        
        # 2. Push to Vector Store (Chroma)
        push_to_vector_store(chunks)
        
        return {"message": f"Successfully processed and embedded {len(files)} files into {len(chunks)} chunks."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ask/")
async def ask_question(request: QueryRequest):
    try:
        # We wrap the generator in EventSourceResponse for SSE streaming
        return EventSourceResponse(stream_rag_wrapper(request.query))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def stream_rag_wrapper(query: str):
    try:
        async for chunk in stream_rag_response(query):
            # Send the chunk explicitly JSON serialized to prevent SSE parsing errors on frontend
            yield dict(data=json.dumps({"text": chunk}))
    except Exception as e:
        yield dict(data=json.dumps({"error": str(e)}))
