'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const parseMarkdown = (text: string) => {
  // Bold: **text**
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic: *text* (but not **text** which is already handled)
  html = html.replace(/(?<!\*)\*(?!\*)(.*?)\*(?!\*)/g, '<em>$1</em>');
  
  // Lists: * item - handle consecutive list items
  const lines = html.split('\n');
  let inList = false;
  const processedLines = lines.map(line => {
    if (line.match(/^\* /)) {
      if (!inList) {
        inList = true;
        return '<ul><li>' + line.replace(/^\* /, '') + '</li>';
      }
      return '<li>' + line.replace(/^\* /, '') + '</li>';
    } else {
      if (inList) {
        inList = false;
        return '</ul>' + line;
      }
      return line;
    }
  });
  if (inList) {
    processedLines.push('</ul>');
  }
  html = processedLines.join('\n');
  
  // Line breaks (but not inside lists)
  html = html.replace(/\n(?!<)/g, '<br>');
  return html;
};

export default function Chatbot() {
  const router = useRouter();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => router.push('/chat')}
        className="w-14 h-14 bg-[#9370DB] rounded-full shadow-lg flex items-center justify-center hover:bg-[#7B68EE] transition-colors"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    </div>
  );
}
