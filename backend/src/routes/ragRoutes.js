import express from 'express';
import { ragController } from '../controllers/ragController.js';

const router = express.Router();

router.post('/', ragController.handleQuery);

export default router;