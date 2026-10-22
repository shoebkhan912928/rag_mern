import React, { useState } from 'react';

export default function Sidebar({
  selectedFiles,
  setSelectedFiles,
  handleUpload,
  loading,
  fileList,
  targetFile,
  setTargetFile
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <aside className="w-full md:w-80 bg-slate-900 text-slate-100 p-6 flex flex-col justify-between shadow-2xl border-r border-slate-800 transition-all duration-300">
      <div>
        {/* Brand Header */}
        <div className="flex items-center space-x-3 mb-6 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
            <span className="text-xl animate-bounce">⚡</span>
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-wide text-emerald-400">Appwrite  RAG Portal</h2>
            <p className="text-xs text-slate-400">Secure Document Intelligence</p>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-6" />

        {/* Upload Form */}
        <form onSubmit={handleUpload} className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Upload HR Documents
          </label>
          
          <div 
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files) {
                setSelectedFiles(e.dataTransfer.files);
              }
            }}
            className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition-all duration-300 cursor-pointer overflow-hidden ${
              dragOver ? 'border-emerald-400 bg-emerald-500/10 scale-[1.02]' : 'border-slate-700 bg-slate-800/40 hover:border-emerald-500 hover:bg-slate-800/80'
            }`}
          >
            <input 
              type="file" 
              multiple 
              onChange={(e) => setSelectedFiles(e.target.files)} 
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            <div className="flex flex-col items-center space-y-2">
              <svg className="w-8 h-8 text-emerald-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-xs text-slate-300 font-medium">
                {selectedFiles && selectedFiles.length > 0 
                  ? `${selectedFiles.length} file(s) selected` 
                  : "Drag & drop files or browse"}
              </p>
              <p className="text-[10px] text-slate-500">PDF, TXT, DOCX supported</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !selectedFiles}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98] transition-all duration-200 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing & Storing...</span>
              </>
            ) : (
              <span>Upload & Process to Cloud</span>
            )}
          </button>
        </form>

        {/* Target File Selection */}
        <div className="mt-8">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            🎯 Target Search Scope
          </label>
          <div className="relative">
            <select 
              value={targetFile} 
              onChange={(e) => setTargetFile(e.target.value)} 
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="All">🌐 Search Across All Files</option>
              {Array.isArray(fileList) && fileList.map((file, idx) => (
                <option key={idx} value={file}>📄 {file}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-800/80">
        <div className="flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-800/50 p-3 rounded-xl border border-slate-800">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="truncate">Appwrite pgvector & Ollama Connected</span>
        </div>
      </div>
    </aside>
  );
}