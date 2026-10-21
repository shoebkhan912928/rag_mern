import { documentService } from '../services/documentService.js';
import fs from 'fs';

export const fileController = {
  async getFiles(req, res) {
    try {
      const files = await documentService.listFiles();
      res.status(200).json({ files });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async uploadFiles(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded." });
      }

      const uploadedFiles = [];
      for (const file of req.files) {
        await documentService.processAndStoreFile(file.path, file.originalname);
        uploadedFiles.push(file.originalname);
        
        // Clean up temp file safely
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }

      res.status(200).json({
        message: "Files successfully uploaded and processed to Appwrite!",
        files: uploadedFiles
      });
    } catch (err) {
      console.error("Upload Error:", err);
      res.status(500).json({ error: err.message });
    }
  }
};