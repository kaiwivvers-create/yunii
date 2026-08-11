'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare, Send, X } from 'lucide-react';
import LoginModal from './LoginModal';
import { loadUserData } from '@/utils/userStorage';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBrand } from '@/contexts/BrandContext';

const parseMarkdown = (text: string) => {
  // Bold: **text**
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold;">$1</strong>');
  // Italic: *text* (but not **text** which is already handled)
  html = html.replace(/(?<!\*)\*(?!\*)(.*?)\*(?!\*)/g, '<em style="font-style: italic;">$1</em>');
  
  // Headings: # Heading, ## Heading, ### Heading
  html = html.replace(/^### (.*$)/gm, '<h3 style="font-size: 1.17em; font-weight: bold; margin: 1em 0;">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 style="font-size: 1.5em; font-weight: bold; margin: 1em 0;">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 style="font-size: 2em; font-weight: bold; margin: 1em 0;">$1</h1>');
  
  // Horizontal rules: --- or ***
  html = html.replace(/^\s*[-*]{3,}\s*$/gm, '<hr style="border: none; border-top: 1px solid #ccc; margin: 1em 0;" />');
  
  // Blockquotes: > text
  html = html.replace(/^> (.*$)/gm, '<blockquote style="border-left: 4px solid #ddd; padding-left: 1em; margin: 1em 0; color: #666;">$1</blockquote>');
  
  // Inline code: `text`
  html = html.replace(/`([^`]+)`/g, '<code style="background: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>');
  
  // Links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #9370DB; text-decoration: underline;">$1</a>');
  
  // Lists: * item - handle consecutive list items
  const lines = html.split('\n');
  let inList = false;
  const processedLines = lines.map(line => {
    if (line.match(/^\* /)) {
      if (!inList) {
        inList = true;
        return '<ul style="margin: 1em 0; padding-left: 2em;"><li>' + line.replace(/^\* /, '') + '</li>';
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
  
  // Line breaks (but not inside lists or after block elements)
  html = html.replace(/\n(?!<)/g, '<br>');
  
  // Remove extra breaks after block elements
  html = html.replace(/(<\/h[1-6]>|<\/ul>|<hr style[^>]*\/>|<\/blockquote>)<br>/g, '$1');
  
  return html;
};

export default function Chatbot() {
  const { t } = useLanguage();
  const { appName } = useBrand();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [dbPreferences, setDbPreferences] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const checkLogin = () => setIsLoggedIn(!!localStorage.getItem('user'));
    checkLogin();
    window.addEventListener('storage', checkLogin);
    window.addEventListener('userLogin', checkLogin);
    return () => {
      window.removeEventListener('storage', checkLogin);
      window.removeEventListener('userLogin', checkLogin);
    };
  }, []);

  // Preferences persisted on the backend are authoritative and survive
  // logout/login — load them so the AI can tailor answers.
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) return;
    try {
      const email = JSON.parse(user).email;
      if (!email) return;
      fetch(`/api/preferences?email=${encodeURIComponent(email)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.preferences) setDbPreferences(d.preferences);
        })
        .catch(() => {});
    } catch {
      /* ignore malformed user */
    }
  }, [isLoggedIn]);

  const handleSendMessage = async () => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }

    if (!message.trim()) return;
    
    setIsLoading(true);
    const newUserMessage = message;
    setMessage('');
    
    const newHistory = [...chatHistory, { role: 'user' as const, content: newUserMessage }];
    setChatHistory(newHistory);

    // Build detailed context about current page and app state
    let context = `You are an AI assistant for ${appName}, a university discovery platform that helps students find and explore universities worldwide.\n\n`;
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
      const selectedUniversity = loadUserData<any>('selectedUniversity', null);
      if (selectedUniversity) {
        const uni = selectedUniversity;
        context += `Selected university: ${uni.name} - ${uni.location}\n`;
        context += `Description: ${uni.description}\n`;
        context += `User is viewing this university in the side panel. Tell them to click 'See More' for detailed information about this university.\n`;
      }
      
      // DB preferences win (authoritative); localStorage is the fallback
      const storedPreferences = loadUserData<any>('userPreferences', null);
      const preferences = dbPreferences || storedPreferences;
      if (preferences) {
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
      const storedChats = loadUserData<any[]>('chats', []);
      if (storedChats.length > 0) {
        context += `User has ${storedChats.length} existing chat conversations\n`;
      }
    } else if (pathname === '/settings') {
      context += `Page: Settings page - User can update preferences and app settings\n`;
      const storedPreferences = loadUserData<any>('userPreferences', null);
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
        setChatHistory([...newHistory, { role: 'assistant' as const, content: t('chatError') }]);
      }
    } catch (error) {
      setChatHistory([...newHistory, { role: 'assistant' as const, content: t('chatError') }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => {
            if (!isLoggedIn) {
              setShowLogin(true);
            } else {
              setIsOpen(true);
            }
          }}
          className="w-14 h-14 bg-[#9370DB] dark:bg-dark-violet rounded-full shadow-lg flex items-center justify-center hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors"
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </button>
      ) : (
        <div className="w-[calc(100vw-2rem)] max-w-96 h-[60vh] min-h-[320px] sm:h-[500px] bg-[#C8C8E0] dark:bg-dark-bg-secondary border border-[#A8A8C8] dark:border-dark-border rounded-lg shadow-2xl flex flex-col">
          <div className="p-4 border-b border-[#A8A8C8] dark:border-dark-border flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 dark:text-dark-text">{t('aiAssistant')}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-800 dark:text-dark-text hover:text-[#9370DB] dark:hover:text-dark-violet transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center text-slate-600 dark:text-dark-text-secondary py-8">
                <p className="mb-2">{t('aiWelcome')}</p>
                <p className="text-sm">
                  {pathname.startsWith('/university/')
                    ? t('aiWelcomeUni')
                    : pathname === '/explore'
                    ? t('aiWelcomeExplore')
                    : pathname === '/chat'
                    ? t('aiWelcomeChat')
                    : t('aiWelcomeDefault')}
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
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={t('typeYourMessage')}
                rows={1}
                className="flex-1 px-3 py-2 bg-[#E8E8F0] dark:bg-dark-bg-tertiary border border-[#A8A8C8] dark:border-dark-border rounded-lg text-slate-900 dark:text-dark-text placeholder-slate-500 dark:placeholder-dark-text-secondary focus:outline-none focus:border-[#9370DB] dark:focus:border-dark-violet resize-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !message.trim()}
                className="px-4 py-2 bg-[#9370DB] dark:bg-dark-violet text-white rounded-lg hover:bg-[#7B68EE] dark:hover:bg-dark-violet-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}

