import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInput from './components/ChatInput';
import ChatWindow from './components/Chatwindow';
import { fetchFilesApi, uploadFilesApi, sendQueryApi } from './controllers/apiService';

function App() {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [targetFile, setTargetFile] = useState("All");
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    try {
      const files = await fetchFilesApi();
      setFileList(files);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFiles) return;

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("files", selectedFiles[i]);
    }

    setUploading(true);
    try {
      await uploadFilesApi(formData);
      alert("Files successfully uploaded and processed to Appwrite!");
      setSelectedFiles(null);
      fetchFiles();
    } catch (err) {
      alert("Upload failed! Please check backend console.");
    }
    setUploading(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query;
    setQuery("");
    setChatHistory(prev => [...prev, { role: "user", content: userMsg }]);

    setLoading(true);
    try {
      // JSON object bhej rahe hain
      const res = await sendQueryApi({
        question: userMsg,
        selected_file: targetFile
      });
      setChatHistory(prev => [...prev, { role: "assistant", content: res.answer }]);
    } catch (err) {
      console.error("Query Error:", err);
      setChatHistory(prev => [...prev, { role: "assistant", content: "Error connecting to server or LLM service." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      {/* Sidebar Component */}
      <Sidebar 
        fileList={fileList} 
        handleUpload={handleUpload} 
        loading={uploading} 
        selectedFiles={selectedFiles} 
        setSelectedFiles={setSelectedFiles} 
        setTargetFile={setTargetFile} 
        targetFile={targetFile}
      />

      {/* Main Chat Interface Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        <ChatWindow chatHistory={chatHistory} targetFile={targetFile} loading={loading} />
        <ChatInput handleSend={handleSend} loading={loading} query={query} setQuery={setQuery} />
      </main>
    </div>
  );
}

export default App;