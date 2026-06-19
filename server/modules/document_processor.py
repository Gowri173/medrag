import io
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter

def process_pdfs(file_contents: list[bytes]) -> list[str]:
    """
    Reads a list of PDF byte pages, extracts text, and chunks it.
    """
    all_text = ""
    for content in file_contents:
        pdf_reader = PdfReader(io.BytesIO(content))
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                all_text += text + "\n"
    
    # Semantic chunking using RecursiveCharacterTextSplitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        is_separator_regex=False,
    )
    
    chunks = text_splitter.split_text(all_text)
    return chunks
