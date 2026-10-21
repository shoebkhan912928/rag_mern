import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fileRoutes from './routes/fileRoutes.js';
import ragRoutes from './routes/ragRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/files', fileRoutes);
app.use('/', ragRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});