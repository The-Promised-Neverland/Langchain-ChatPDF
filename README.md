# 🧠 Langchain-ChatPDF

> Chat with your PDFs using powerful embeddings, vector search, and Gemini AI — with a sleek frontend generated using Bolt.

---

## 🚀 What is Langchain-ChatPDF?

**Langchain-ChatPDF** is an AI-powered chatbot that allows users to ask questions about a PDF and get intelligent, context-aware responses. Built with **Langchain4j**, **Gemini AI**, **MiniLM embeddings**, and a stylish **React frontend** generated via **Bolt**, it enables seamless conversational interaction with documents.

---

## 📚 How It Works

1. **📄 Upload PDF**  
   Users upload a PDF. It’s parsed and split into **300-token chunks** to preserve semantic meaning while being model-friendly.

2. **🧩 Embedding**  
   Each chunk is embedded using the **MiniLM model**, turning it into a dense vector that captures its semantic content.

3. **🧠 Vector Store**  
   Embeddings are stored in an in-memory **vector store** (`EmbeddingStore<TextSegment>`), enabling fast semantic search.

4. **💬 Ask a Question**  
   User questions are also embedded and semantically compared with document chunks to fetch the most relevant ones.

5. **🪄 Contextual Response**  
   The chatbot builds a prompt using:
   - Matched document chunks  
   - Full chat history (`sessionId`-based)  
   - The user’s current question  

   Then passes it to **Gemini AI** for a natural, informative answer.

6. **🗂️ Chat Persistence**  
   - Frontend caches chat in `localStorage` (persisted across reloads)  
   - Backend manages memory with `chatHistoryMemoryService` for deeper context retention

---

## 🛠️ Tech Stack

- **Backend**: Spring Boot + Langchain4j + Gemini + MiniLM
- **Frontend**: React + Tailwind CSS (Generated via [Bolt](https://boltai.app/))
- **Embeddings**: MiniLM
- **Vector DB**: In-memory vector store

---

## 🎯 Why Chunking + Embeddings?

- 🔹 **Chunking** ensures long documents are broken into manageable, semantically coherent pieces.
- 🔹 **Embeddings** help translate text into machine-understandable meaning.
- 🔹 **Vector search** finds conceptually similar information, outperforming keyword search.

---

## 🧪 Example

> Upload your **financial report** and ask:  
> _"What was the profit in Q3?"_  
> → Get precise, context-rich answers drawn from the actual PDF content.

---

> ⚡ Built for speed, accuracy, and interactivity — Langchain-ChatPDF makes your documents talk.

