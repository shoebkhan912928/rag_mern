import fs from 'fs';
import pdfParse from 'pdf-parse-new';
import mammoth from 'mammoth';
import axios from 'axios';
import { Query } from 'node-appwrite'; // <-- Direct node-appwrite se import kiya
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
        } else {
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

    // Process file chunks and store in Appwrite Table
    async processAndStoreFile(filePath, originalname) {
        const text = await this.parseFileContent(filePath, originalname);

        // Chunking text into smaller blocks (~500 chars)
        const chunks = text.match(/[^.!?]+[.!?]+/g) || [text];

        for (let chunk of chunks) {
            if (!chunk.trim()) continue;

            const embedding = await this.getEmbedding(chunk);

            await tablesDB.createRow({
                databaseId: DATABASE_ID,
                tableId: TABLE_ID,
                rowId: ID.unique(),
                data: {
                    content: chunk.trim(),
                    file_name: originalname,
                    embedding: JSON.stringify(embedding)
                }
            });
        }
    },

    // List unique uploaded files with limit set to 100
    async listFiles() {
        try {
            const response = await tablesDB.listRows({
                databaseId: DATABASE_ID,
                tableId: TABLE_ID,
                queries: [Query.limit(100)]
            });

            return [
                ...new Set(response.rows.map(row => row.file_name))
            ];
        } catch (err) {
            console.error(
                'Error listing files from Appwrite:',
                err.message
            );
            throw err;
        }
    }
};