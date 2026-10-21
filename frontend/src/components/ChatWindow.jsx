import React, { useRef, useEffect } from 'react';

export default function ChatWindow({ chatHistory, targetFile, loading }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-gradient-to-b from-slate-50/50 to-white">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header Bar */}
        <div className="mb-6 pb-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center space-x-2">
              <span>🤖 AI HR Document Assistant</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Ask queries and extract precise context instantly from your uploaded files.
            </p>
          </div>
          <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            Mode: {targetFile === "All" ? "All Files" : targetFile}
          </div>
        </div>

        {/* Welcome State when no messages */}
        {chatHistory.length === 0 ? (
          <div className="text-center py-20 px-6 space-y-6 animate-fade-in bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 mt-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/25 animate-bounce">
              👋
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                Welcome to AI HR Portal!
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Upload your company policy documents, HR code of conduct, or contracts from the sidebar and start asking questions right away.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium">✨ Instant Answers</span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium">🔒 Secure Cloud Vector DB</span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium">🚀 Local AI Speed</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {chatHistory.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex items-start space-x-3 transition-all duration-500 ease-out transform translate-y-0 opacity-100 ${
                  msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div className={`h-9 w-9 rounded-2xl flex items-center justify-center text-xs font-bold text-white shadow-md flex-shrink-0 ${
                  msg.role === "user" ? "bg-indigo-600 shadow-indigo-500/25" : "bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/25"
                }`}>
                  {msg.role === "user" ? "You" : "AI"}
                </div>
                
                <div className={`p-4 md:p-5 rounded-2xl max-w-xl text-sm leading-relaxed shadow-sm ${
                  msg.role === "user" 
                    ? "bg-indigo-600 text-white rounded-br-none shadow-indigo-500/10" 
                    : "bg-white text-slate-800 border border-slate-100 rounded-bl-none shadow-slate-100/80"
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}

            {/* Loading typing indicator */}
            {loading && (
              <div className="flex items-start space-x-3 animate-pulse">
                <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
                  AI
                </div>
                <div className="p-4 bg-white border border-slate-100 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-slate-400 ml-2">Searching vector db & generating response...</span>
                </div>
              </div>
            )}
            
            <div ref={scrollRef} />
          </div>
        )}
      </div>
    </div>
  );
}