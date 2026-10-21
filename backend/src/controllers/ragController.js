import { ragService } from '../services/ragService.js';

export const ragController = {
  async handleQuery(req, res) {
    try {
      const { question, selected_file } = req.body;
      if (!question) {
        return res.status(400).json({ error: "Question is required." });
      }

      // Call ragService to process embedding, similarity search, and Ollama LLM call
      const result = await ragService.queryDocuments(question, selected_file);

      res.status(200).json(result);
    } catch (err) {
      console.error("Error in handleQuery controller:", err);
      res.status(500).json({ error: err.message });
    }
  }
};