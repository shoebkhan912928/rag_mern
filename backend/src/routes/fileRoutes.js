import express from 'express';
import { fileController } from '../controllers/fileController.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

router.get('/', fileController.getFiles);
router.post('/upload', upload.array('files'), fileController.uploadFiles);

export default router;