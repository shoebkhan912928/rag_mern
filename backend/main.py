# import os
# from fastapi import FastAPI, UploadFile, File, Form
# from fastapi.middleware.cors import CORSMiddleware
# from supabase import create_client, Client

# # Modern & Compatible Imports
# from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from langchain_chroma import Chroma
# from langchain_ollama import OllamaEmbeddings, OllamaLLM
# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.runnables import RunnablePassthrough
# from langchain_core.output_parsers import StrOutputParser

# app = FastAPI()

# # Enable CORS for Frontend
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # --- Supabase Credentials ---
# # Apne Supabase Credentials Yahan Dalein
# SUPABASE_URL = "https://qsjioedzserbymbsuijx.supabase.co"
# SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzamlvZWR6c2VyYnltYnN1aWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMzk2MjMsImV4cCI6MjEwNzcxNTYyM30.VoQ03yx2wAGvQ4J7P-G8FHHRd8eqiwlQpxlKsTLEZpE"

# supabase: Client = None
# if "APKA_SUPABASE" not in SUPABASE_URL:
#     supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# # Directory Setup
# UPLOAD_DIR = "./uploaded_files"
# CHROMA_DB_DIR = "./chroma_db"
# os.makedirs(UPLOAD_DIR, exist_ok=True)
# os.makedirs(CHROMA_DB_DIR, exist_ok=True)

# # Initialize Embeddings & Chroma Persistent DB
# embeddings = OllamaEmbeddings(model="nomic-embed-text")
# vectorstore = Chroma(
#     persist_directory=CHROMA_DB_DIR, 
#     embedding_function=embeddings
# )


# # --- Helper Function: Document Loader ---
# def load_single_document(file_path: str, filename: str):
#     ext = os.path.splitext(filename)[1].lower()
#     if ext == ".pdf":
#         loader = PyPDFLoader(file_path)
#     elif ext == ".txt":
#         loader = TextLoader(file_path, encoding="utf-8")
#     elif ext in [".docx", ".doc"]:
#         loader = Docx2txtLoader(file_path)
#     else:
#         return []
    
#     docs = loader.load()
#     for doc in docs:
#         doc.metadata["source"] = filename
#     return docs


# # --- 1. Upload & Save to Supabase + Chroma DB ---
# @app.post("/upload")
# async def upload_files(files: list[UploadFile] = File(...)):
#     global vectorstore
#     saved_files = []
#     new_docs = []

#     for file in files:
#         file_path = os.path.join(UPLOAD_DIR, file.filename)
#         with open(file_path, "wb") as f:
#             f.write(await file.read())
        
#         saved_files.append(file.filename)
        
#         # Save Metadata to Supabase
#         if supabase:
#             try:
#                 supabase.table("uploaded_files").upsert({"filename": file.filename}).execute()
#             except Exception as e:
#                 print(f"Supabase error for {file.filename}: {e}")

#         # Extract docs
#         docs = load_single_document(file_path, file.filename)
#         new_docs.extend(docs)

#     # Chunking & Storing in Vector Store
#     if new_docs:
#         text_splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=80)
#         split_docs = text_splitter.split_documents(new_docs)
        
#         # Add to existing Chroma Vector Database
#         vectorstore.add_documents(documents=split_docs)
        
#         return {
#             "message": "Files successfully uploaded & processed!", 
#             "files": saved_files
#         }
    
#     return {"error": "No valid text content found in uploaded documents."}


# # --- 2. Get Uploaded Files List ---
# @app.get("/files")
# async def get_files():
#     # If Supabase is connected, get from Supabase
#     if supabase:
#         try:
#             response = supabase.table("uploaded_files").select("filename").execute()
#             files = [row["filename"] for row in response.data]
#             return {"files": files}
#         except Exception as e:
#             print(f"Supabase fetch error: {e}")

#     # Fallback to local files directory
#     if os.path.exists(UPLOAD_DIR):
#         return {"files": os.listdir(UPLOAD_DIR)}
#     return {"files": []}


# # --- 3. RAG Query API (All files or Specific file choice) ---
# @app.post("/query")
# async def query_rag(question: str = Form(...), selected_file: str = Form("All")):
#     global vectorstore

#     # Check if vector store has data
#     if vectorstore is None:
#         return {"answer": "Pehle kam se kam ek file upload karke process karein."}

#     llm = OllamaLLM(model="llama3.2")
    
#     # Specific File Filtering Logic
#     if selected_file == "All":
#         retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
#     else:
#         retriever = vectorstore.as_retriever(
#             search_kwargs={
#                 "k": 3, 
#                 "filter": {"source": selected_file}
#             }
#         )

#     template = """You are a strict AI Assistant. Answer the user's question using ONLY the provided Context below.
# If the answer is NOT present in the Context, you MUST reply: "Mujhe iska jawab uploaded documents me nahi mila."

# Context:
# {context}

# Question: {question}
# Answer:"""

#     prompt = ChatPromptTemplate.from_template(template)

#     def format_docs(docs):
#         if not docs:
#             return "No relevant text found."
#         return "\n\n".join(doc.page_content for doc in docs)

#     # LCEL RAG Chain Definition
#     chain = (
#         {"context": retriever | format_docs, "question": RunnablePassthrough()}
#         | prompt
#         | llm
#         | StrOutputParser()
#     )

#     answer = chain.invoke(question)
#     return {"answer": answer}