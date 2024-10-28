import React, { useState } from 'react';
import './EZNotes.css';

const EZNotes = () => {
  const [fontSize, setFontSize] = useState(11);
  const [text, setText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="h-screen bg-white">
      {/* Header */}
      <div className="p-2 border-b">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">EZnotes</h1>
        </div>
        <div className="text-sm text-gray-600">File</div>
      </div>

      {/* Menu Bar */}
      <div className="flex items-center space-x-2 bg-[#F5F1FF] p-2">
        <button className="p-2 hover:bg-[#E9E3FF] rounded text-gray-600">
          ⭐
        </button>
        <div className="flex items-center space-x-1 border-l border-r px-2 border-gray-300">
          <button 
            className="px-2 hover:bg-[#E9E3FF] rounded"
            onClick={() => setFontSize(prev => Math.max(8, prev - 1))}
          >
            -
          </button>
          <input 
            type="text" 
            value={fontSize}
            className="w-12 text-center border rounded bg-white"
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
          <button 
            className="px-2 hover:bg-[#E9E3FF] rounded"
            onClick={() => setFontSize(prev => prev + 1)}
          >
            +
          </button>
        </div>
        <select className="border rounded px-2 py-1 bg-white text-sm">
          <option>Arial</option>
        </select>
        <button className="font-bold px-3 py-1 hover:bg-[#E9E3FF] rounded">B</button>
        <button className="italic px-3 py-1 hover:bg-[#E9E3FF] rounded">I</button>
        <button className="underline px-3 py-1 hover:bg-[#E9E3FF] rounded">U</button>
        <button className="px-4 py-1 hover:bg-[#E9E3FF] rounded text-gray-600 text-sm">
          Clear Formatting
        </button>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-116px)]">
        {/* Sidebar */}
        <div className="w-64 bg-[#F5F1FF] p-4 space-y-4">
          {/* Custom Dropdown */}
          <div className="relative">
            <button
              className="w-full bg-[#B87FFF] text-white px-4 py-2 rounded-full flex items-center justify-between text-sm"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>Summarize</span>
              <span className="ml-2 text-xs">▼</span>
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full bg-white border rounded-lg mt-1 shadow-lg z-10">
                <button 
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Summarize
                </button>
                <button 
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Fill/Keywords
                </button>
                <button 
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Define
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg h-32 border"></div>
          <div className="bg-white rounded-lg h-32 border"></div>

          <button className="w-full bg-[#B87FFF] text-white px-4 py-2 rounded-full text-sm">
            Generate
          </button>
        </div>

        {/* Main Editor */}
        <div className="flex-1 p-4">
          <textarea 
            className="w-full h-full p-4 border rounded-lg resize-none bg-white"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ fontSize: `${fontSize}px` }}
            placeholder="Start typing..."
          />
        </div>
      </div>
    </div>
  );
};

export default EZNotes;