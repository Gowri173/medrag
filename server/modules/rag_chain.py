import os
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from modules.vector_store import get_vector_store

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def get_rag_chain(session_id: str = "default_collection"):
    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)
    vector_store = get_vector_store(session_id)
    retriever = vector_store.as_retriever(search_kwargs={"k": 5})
    
    template = """You are MedRAGnosis, a helpful and highly accurate medical knowledge assistant.
Answer the question based STRICTLY on the following extracted context from uploaded medical documents.
If the answer cannot be found in the context, politely state that you do not have enough information to answer based on the provided documents.
Do not hallucinate or use outside knowledge.

Context:
{context}

Question: {question}

Answer:"""
    
    prompt = ChatPromptTemplate.from_template(template)
    
    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    
    return rag_chain

async def stream_rag_response(query: str, session_id: str = "default_collection"):
    chain = get_rag_chain(session_id)
    # astream yields chunks of string
    async for chunk in chain.astream(query):
        yield chunk
