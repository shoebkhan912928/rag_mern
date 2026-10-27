
import fs from 'fs';
import pdfParse from 'pdf-parse-new';
import mammoth from 'mammoth';
import axios from 'axios';
import { Query } from 'node-appwrite';
import {
    tablesDB,
    DATABASE_ID,
    TABLE_ID,
    ID
} from '../config/appwrite.js';

export const documentService = {
    async parseFileContent(filePath, originalname) {
        const buffer = fs.readFileSync(filePath);
        let text = "";

        if (originalname.endsWith('.pdf')) {
            const parsed = await pdfParse(buffer);
            text = parsed.text;
        } else if (originalname.endsWith('.docx')) {
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else if (originalname.endsWith('.html') || originalname.endsWith('.htm')) {
            // HTML tags clean karne ke liye raw text se tags remove kar rahe hain
            const rawHtml = buffer.toString('utf-8');
            // Simple regex to strip HTML tags and keep plain text
            text = rawHtml.replace(/<[^>]*>?/gm, ' ');
        } else {
            // Plain text files (.txt, etc.)
            text = buffer.toString('utf-8');
        }
        return text;
    },

    // Generate Embedding from Ollama
    async getEmbedding(text) {
        try {
            const response = await axios.post(`${process.env.OLLAMA_BASE_URL}/api/embeddings`, {
                model: process.env.EMBEDDING_MODEL || 'nomic-embed-text',
                prompt: text
            });
            return response.data.embedding;
        } catch (err) {
            console.error("Error generating embedding from Ollama:", err.message);
            throw err;
        }
    },

    // Smart Paragraph Chunking (larger chunks = fewer total requests)
    chunkText(text, maxChunkSize = 1200) {
        const paragraphs = text.split(/\n\s*\n/);
        const chunks = [];
        let currentChunk = "";

        for (const para of paragraphs) {
            if ((currentChunk + para).length < maxChunkSize) {
                currentChunk += (currentChunk ? "\n\n" : "") + para;
            } else {
                if (currentChunk.trim()) chunks.push(currentChunk.trim());
                currentChunk = para;
            }
        }
        if (currentChunk.trim()) chunks.push(currentChunk.trim());
        return chunks.length > 0 ? chunks : [text];
    },

    // Process chunks SEQUENTIALLY one-by-one to avoid connection timeout
    async processAndStoreFile(filePath, originalname) {
        const text = await this.parseFileContent(filePath, originalname);
        const chunks = this.chunkText(text, 1200);

        console.log(`Processing ${chunks.length} chunks for file: ${originalname}`);

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const trimmedChunk = chunk.trim();
            if (!trimmedChunk) continue;

            try {
                // 1. Get embedding from local Ollama
                const embedding = await this.getEmbedding(trimmedChunk);

                // 2. Store row in Appwrite one by one safely
                await tablesDB.createRow({
                    databaseId: DATABASE_ID,
                    tableId: TABLE_ID,
                    rowId: ID.unique(),
                    data: {
                        content: trimmedChunk,
                        file_name: originalname,
                        embedding: JSON.stringify(embedding)
                    }
                });
                console.log(`Uploaded chunk ${i + 1}/${chunks.length}`);
            } catch (err) {
                console.error(`Failed at chunk ${i + 1}:`, err.message);
                throw err;
            }
        }
    },

    // List unique uploaded files with limit and sorting
    async listFiles() {
        try {
            const response = await tablesDB.listRows({
                databaseId: DATABASE_ID,
                tableId: TABLE_ID,
                queries: [
                    Query.limit(5000),
                    Query.orderDesc('$createdAt')
                ]
            });

            return [
                ...new Set(response.rows.map(row => row.file_name))
            ];
        } catch (err) {
            console.error('Error listing files from Appwrite:', err.message);
            throw err;
        }
    }
};