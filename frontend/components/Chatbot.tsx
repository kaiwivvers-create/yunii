'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

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
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    const newUserMessage = message;
    setMessage('');
    
    const newHistory = [...chatHistory, { role: 'user' as const, content: newUserMessage }];
    setChatHistory(newHistory);

    // Build detailed context about current page and app state
    let context = `You are an AI assistant for UniVerse, a university discovery platform that helps students find and explore universities worldwide.\n\n`;
    context += `Current page: ${pathname}\n`;
    
    // Get user info
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      context += `User: ${user.name || user.email}\n`;
    }
    
    // Page-specific context
    if (pathname === '/') {
      context += `Page: Landing page - Main entry point with hero section and features\n`;
    } else if (pathname === '/explore') {
      context += `Page: Explore page - Browsing universities by region and province\n`;
      
      // Add selected university context
      const selectedUniversity = localStorage.getItem('selectedUniversity');
      if (selectedUniversity) {
        const uni = JSON.parse(selectedUniversity);
        context += `Selected university: ${uni.name} - ${uni.location}\n`;
        context += `Description: ${uni.description}\n`;
        context += `User is viewing this university in the side panel. Tell them to click 'See More' for detailed information about this university.\n`;
      }
      
      const storedPreferences = localStorage.getItem('userPreferences');
      if (storedPreferences) {
        const preferences = JSON.parse(storedPreferences);
        context += `User preferences:\n`;
        context += `- Intended major: ${preferences.intendedMajor || 'not specified'}\n`;
        context += `- Degree level: ${preferences.degreeLevel || 'not specified'}\n`;
        context += `- Preferred regions: ${preferences.preferredRegions?.join(', ') || 'none'}\n`;
        context += `- Budget: ${preferences.budget || 'not specified'}\n`;
        context += `- GPA: ${preferences.gpa || 'not specified'}\n`;
      }
    } else if (pathname.startsWith('/university/')) {
      const universityName = pathname.split('/university/')[1].replace(/-/g, ' ');
      context += `Page: University detail page - Viewing specific university: ${universityName}\n`;
      context += `User is looking at detailed information about this university\n`;
    } else if (pathname === '/chat') {
      context += `Page: Chat page - AI conversation interface for university-related questions\n`;
      const storedChats = localStorage.getItem('chats');
      if (storedChats) {
        const chats = JSON.parse(storedChats);
        context += `User has ${chats.length} existing chat conversations\n`;
      }
    } else if (pathname === '/settings') {
      context += `Page: Settings page - User can update preferences and app settings\n`;
      const storedPreferences = localStorage.getItem('userPreferences');
      if (storedPreferences) {
        context += `User has saved preferences\n`;
      }
    } else if (pathname === '/login' || pathname === '/signup') {
      context += `Page: Authentication page\n`;
    } else if (pathname === '/survey') {
      context += `Page: Survey page - User is setting up their study preferences\n`;
    }
    
    context += `\nApp features:\n`;
    context += `- University exploration by region (North America, Europe, Asia, Oceania, South America, Africa)\n`;
    context += `- AI-powered university recommendations based on user preferences\n`;
    context += `- Chat interface for asking questions about universities\n`;
    context += `- User preferences for major, degree level, location, budget, GPA\n`;
    context += `- University details including location, description, and programs\n`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newUserMessage,
          context: context,
          history: newHistory,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory([...newHistory, { role: 'assistant' as const, content: data.response }]);
      } else {
        setChatHistory([...newHistory, { role: 'assistant' as const, content: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (error) {
      setChatHistory([...newHistory, { role: 'assistant' as const, content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-[#9370DB] dark:bg-dark-violet rounded-full shadow-lg flex items-center justify-center hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      ) : (
        <div className="w-96 h-[500px] bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg shadow-2xl flex flex-col">
          <div className="p-4 border-b border-[#A8A8C8] dark:border-dark-border flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 dark:text-dark-text">AI Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-800 dark:text-dark-text hover:text-[#9370DB] dark:hover:text-dark-violet transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center text-slate-600 dark:text-dark-text-secondary py-8">
                <p className="mb-2">Hi! I'm your UniVerse AI assistant.</p>
                <p className="text-sm">
                  {pathname.startsWith('/university/')
                    ? 'I can answer questions about this university, its programs, admissions, and help you compare it with other options.'
                    : pathname === '/explore'
                    ? 'I can help you find universities based on your preferences, answer questions about specific universities, or give advice on your study choices.'
                    : pathname === '/chat'
                    ? 'I can help you with university-related questions, program information, admissions advice, and more.'
                    : 'I can help you navigate the app, find universities, and answer questions about studying abroad.'}
                </p>
              </div>
            )}
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-[#9370DB] dark:bg-dark-violet text-white'
                      : 'bg-[#E8E8F0] dark:bg-dark-bg-tertiary text-slate-900 dark:text-dark-text'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}></p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#E8E8F0] dark:bg-dark-bg-tertiary p-3 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-[#A8A8C8] dark:border-dark-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-900 dark:text-dark-text placeholder-slate-500 dark:placeholder-dark-text-secondary focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !message.trim()}
                className="px-4 py-2 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

