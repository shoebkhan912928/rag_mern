import { tablesDB, DATABASE_ID, TABLE_ID } from '../config/appwrite.js';
import { Query } from 'node-appwrite'; // <-- Direct node-appwrite se import kiya
import axios from 'axios';

const generateEmbedding = async (text) => {
  const response = await axios.post(`${process.env.OLLAMA_BASE_URL}/api/embeddings`, {
    model: process.env.EMBEDDING_MODEL || 'nomic-embed-text',
    prompt: text,
  });
  return response.data.embedding;
};

// Cosine similarity calculation helper
const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const ragService = {
  async queryDocuments(question, selectedFile = "All") {
    const queryEmbedding = await generateEmbedding(question);

    // Fetch documents from Appwrite Table using tablesDB with Query limit
    const response = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.limit(100)]
    });
    let docs = response.rows || [];

    // Filter by specific file if requested and not "All" / "Search Across All Files"
    if (selectedFile && selectedFile !== "All" && selectedFile !== "Search Across All Files") {
      docs = docs.filter(item => item.file_name === selectedFile);
    }

    if (docs.length === 0) {
      return {
        answer: "Mujhe iska jawab uploaded documents me nahi mila.",
        sources: []
      };
    }

    // Compute similarity scores
    const scoredDocs = docs.map(doc => {
      const docEmbedding = JSON.parse(doc.embedding);
      const similarity = cosineSimilarity(queryEmbedding, docEmbedding);
      return { ...doc, similarity };
    });

    // Sort by highest similarity and take top 3 chunks
    scoredDocs.sort((a, b) => b.similarity - a.similarity);
    const topChunks = scoredDocs.slice(0, 3);

    // Threshold check for strict grounding
    if (topChunks.length === 0 || topChunks[0].similarity < 0.25) {
      return {
        answer: "Mujhe iska jawab uploaded documents me nahi mila.",
        sources: []
      };
    }

    const context = topChunks.map(c => c.content).join("\n\n");
    const sources = [...new Set(topChunks.map(c => c.file_name).filter(Boolean))];

    // Construct prompt for local Ollama LLM
    const prompt = `You are a strict and precise AI Assistant. Answer the user's question using ONLY the provided Context. 
If the answer is not present in the Context, respond with exact words: "Mujhe iska jawab uploaded documents me nahi mila."

Context:
${context}

Question: ${question}
Answer:`;

    try {
      const llmResponse = await axios.post(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
        model: process.env.LLM_MODEL || 'llama3.2',
        prompt: prompt,
        stream: false
      });

      return {
        answer: llmResponse.data.response.trim(),
        sources: sources
      };
    } catch (err) {
      console.error("Ollama LLM Generation Error:", err.message);
      throw new Error("Failed to generate response from local AI model.");
    }
  }
};