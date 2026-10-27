// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import fileRoutes from './routes/fileRoutes.js';
// import ragRoutes from './routes/ragRoutes.js';

// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 8000;

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use('/files', fileRoutes);
// app.use('/', ragRoutes);

// app.listen(PORT, () => {
//   console.log(`🚀 Backend server running on port ${PORT}`);
// });
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fileRoutes from './routes/fileRoutes.js';
import ragRoutes from './routes/ragRoutes.js';
import { tablesDB, DATABASE_ID, TABLE_ID } from './config/appwrite.js';
import { Query } from 'node-appwrite';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- SAFE FUNCTION: Server restart par records delete karne ke liye (with delay & batching) ---
async function clearDatabaseOnStartup() {
  try {
    console.log('🔄 Server restart detected: Fetching old database records...');
    
    const response = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.limit(5000)]
    });

    if (response.rows && response.rows.length > 0) {
      console.log(`Found ${response.rows.length} old records. Deleting them safely (with slight delay)...`);
      
      for (let i = 0; i < response.rows.length; i++) {
        const row = response.rows[i];
        try {
          await tablesDB.deleteRow({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
            rowId: row.$id
          });

          // Progress print karte rahenge
          if ((i + 1) % 50 === 0 || i === response.rows.length - 1) {
            console.log(`Deleted ${i + 1}/${response.rows.length} records...`);
          }

          // 50ms ka chhota delay taaki network overload na ho aur fetch failed error na aaye
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (delErr) {
          console.error(`⚠️ Could not delete row ${row.$id}:`, delErr.message);
        }
      }
      console.log('✨ Database successfully wiped clean on server restart!');
    } else {
      console.log('✅ Database pehle se hi clean hai.');
    }
  } catch (err) {
    console.error('❌ Error clearing database on startup:', err.message);
  }
}

// Routes
app.use('/files', fileRoutes);
app.use('/', ragRoutes);

// Server listen hone se pehle database clean function call hoga
app.listen(PORT, async () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  await clearDatabaseOnStartup();
});