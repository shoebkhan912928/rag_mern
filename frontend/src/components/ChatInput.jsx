import React from 'react';

export default function ChatInput({ query, setQuery, handleSend, loading }) {
  return (
    <div className="p-4 md:p-6 bg-white border-t border-slate-200/80 shadow-lg">
      <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-3 items-center">
        <div className="relative flex-1">
          <input 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Apne HR document ya policy se jude sawal yahan poochhein..." 
            className="w-full bg-slate-50 border border-slate-300/80 rounded-2xl px-5 py-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner placeholder:text-slate-400"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading || !query.trim()}
          className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] text-white font-medium text-sm rounded-2xl shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 cursor-pointer flex-shrink-0"
        >
          <span>Send</span>
          <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}