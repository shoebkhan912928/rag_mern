// import dotenv from 'dotenv';
// import { fetch as undiciFetch, Agent } from 'undici';
// dotenv.config();

// const url = `${process.env.SUPABASE_URL}/rest/v1/`;
// console.log("Testing fetch with Custom Undici Agent to:", url);

// // Use pipelining: 0 instead of keepAlive
// const customDispatcher = new Agent({
//   pipelining: 0,
//   connect: { timeout: 60000 },
// });

// try {
//   const response = await undiciFetch(url, {
//     dispatcher: customDispatcher,
//     headers: {
//       'apikey': process.env.SUPABASE_KEY,
//       'Authorization': `Bearer ${process.env.SUPABASE_KEY}`
//     }
//   });
//   console.log("✅ Fetch Successful! Status:", response.status);
// } catch (error) {
//   console.error("❌ Fetch Failed Completely!");
//   console.error("Error Message:", error.message);
//   console.error("Underlying Cause:", error.cause);
// }