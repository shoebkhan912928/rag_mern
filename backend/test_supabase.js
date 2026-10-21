// import { createClient } from '@supabase/supabase-js';
// import dotenv from 'dotenv';

// // Load environment variables from .env file
// dotenv.config();

// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_KEY;

// console.log("Checking Supabase Connection...");
// console.log("URL:", supabaseUrl ? "Present ✅" : "Missing ❌");
// console.log("KEY:", supabaseKey ? "Present ✅" : "Missing ❌");

// if (!supabaseUrl || !supabaseKey) {
//   console.error("❌ Error: Supabase URL or Key is missing in your .env file!");
//   process.exit(1);
// }

// const supabase = createClient(supabaseUrl, supabaseKey);

// async function testConnection() {
//   try {
//     // Ek lightweight query run karke dekhte hain
//     const { data, error } = await supabase.from('documents').select('id').limit(1);
    
//     if (error) {
//       console.error("❌ Connection Failed! Error details:", error.message);
//     } else {
//       console.log("✅ SUCCESS! Your Supabase URL and Key are CORRECT!");
//       console.log("Data returned from database:", data);
//     }
//   } catch (err) {
//     console.error("❌ Unexpected Error:", err.message);
//   }
// }

// testConnection();