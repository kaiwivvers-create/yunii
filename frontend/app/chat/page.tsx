'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import LoginModal from '@/components/LoginModal';
import { loadUserData, saveUserData, removeUserData } from '@/utils/userStorage';
import { Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Chat {
  id: string;
  title: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  createdAt: Date;
}

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

export default function ChatPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [secretModeChats, setSecretModeChats] = useState<Set<string>>(new Set());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024
  );
  const lastIsDesktop = useRef<boolean | null>(null);

  // Keep the sidebar mode in sync when crossing the desktop breakpoint (e.g. tablet rotation)
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      const prev = lastIsDesktop.current;
      if (prev !== null && prev !== isDesktop) {
        setSidebarOpen(isDesktop);
      }
      lastIsDesktop.current = isDesktop;
    };
    lastIsDesktop.current = window.innerWidth >= 1024;
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [randomPrompt, setRandomPrompt] = useState<string | null>(null);
  const [waitingForPasscode, setWaitingForPasscode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPath, setCurrentPath] = useState('/');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [usePreferences, setUsePreferences] = useState(false);
  const [userPreferences, setUserPreferences] = useState<any>(null);

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

  useEffect(() => {
    // Load user preferences from the per-user key (loadUserData returns the
    // parsed value, and falls back to the legacy shared key with migration)
    const storedPreferences = loadUserData<any>('userPreferences', null);
    if (storedPreferences) {
      setUserPreferences(storedPreferences);
    }
    // The database is authoritative — it survives logout/login and other devices
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const email = JSON.parse(user).email;
        if (email) {
          fetch(`/api/preferences?email=${encodeURIComponent(email)}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
              if (d?.preferences) setUserPreferences(d.preferences);
            })
            .catch(() => {});
        }
      } catch {
        /* ignore malformed user */
      }
    }
  }, []);

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const currentChat = chats.find(c => c.id === currentChatId);
  const isSecretMode = currentChatId && secretModeChats.has(currentChatId);

  // Filter chats based on search query
  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Load data from localStorage after mount
  useEffect(() => {
    const savedChats = loadUserData<any[] | null>('chats', null);
    const savedCurrentChatId = loadUserData<string | null>('currentChatId', null);
    const savedSecretModeChats = loadUserData<string[]>('secretModeChats', []);
    const storedUser = localStorage.getItem('user');
    
    if (savedChats) {
      setChats(savedChats);
    }
    if (savedCurrentChatId) {
      setCurrentChatId(savedCurrentChatId);
    }
    if (savedSecretModeChats.length) {
      setSecretModeChats(new Set(savedSecretModeChats));
    }

    const loadUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        // User is now handled by Navbar component
      }
    };
    
    loadUser();

    // Update user when localStorage changes
    const handleStorageChange = () => {
      loadUser();
    };
    
    // Update user when custom login event is dispatched
    const handleUserUpdate = () => {
      loadUser();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleUserUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserUpdate);
    };
  }, []);

  // Reset currentChatId if the chat doesn't exist in chats array
  useEffect(() => {
    if (currentChatId && !chats.find(c => c.id === currentChatId)) {
      setCurrentChatId(null);
    }
  }, [currentChatId, chats]);

  // Save data to localStorage
  useEffect(() => {
    saveUserData('chats', chats);
  }, [chats]);

  useEffect(() => {
    if (currentChatId) {
      saveUserData('currentChatId', currentChatId);
    } else {
      removeUserData('currentChatId');
    }
  }, [currentChatId]);

  useEffect(() => {
    saveUserData('secretModeChats', Array.from(secretModeChats));
  }, [secretModeChats]);

  useEffect(() => {
    // Random chance to show the 89/70 prompt (1% chance)
    const randomChance = Math.random();
    if (randomChance < 0.01) {
      setRandomPrompt("I'd say there's a 89/70 chance for you to ask something unrelated.");
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const createNewChat = () => {
    setCurrentChatId(null);
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  };

  const sendMessage = async () => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }

    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Check for secret mode trigger
    if (userMessage === "I have a lot on my mind" && !isSecretMode) {
      setWaitingForPasscode(true);
      setChats(prev => prev.map(chat => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            messages: [...chat.messages, { role: 'user' as const, content: userMessage }, { role: 'assistant' as const, content: 'Please enter the passcode.' }],
          };
        }
        return chat;
      }));
      setIsLoading(false);
      return;
    }

    // Check for passcode
    if (waitingForPasscode && userMessage === "250510") {
      setWaitingForPasscode(false);
      setSecretModeChats(prev => new Set([...prev, currentChatId!]));
      setChats(prev => prev.map(chat => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            messages: [...chat.messages, { role: 'user' as const, content: userMessage }, { role: 'assistant' as const, content: 'Secret mode unlocked. I can now help you with any topic.' }],
          };
        }
        return chat;
      }));
      setIsLoading(false);
      return;
    }

    // Wrong passcode
    if (waitingForPasscode) {
      setChats(prev => prev.map(chat => {
        if (chat.id === currentChatId) {
          return {
            ...chat,
            messages: [...chat.messages, { role: 'user' as const, content: userMessage }, { role: 'assistant' as const, content: "Huhhhhh what are you talking about I didnt say a thinggggggggg. Pssh what password? You're probably just delusional, nothing happened, don't look at the message above that wasn't me that was uhhh AI generated." }],
          };
        }
        return chat;
      }));
      setWaitingForPasscode(false);
      setIsLoading(false);
      return;
    }

    let chatId = currentChatId;
    if (!chatId) {
      // Create new chat with initial message in one update
      const newChatId = Date.now().toString();
      const newChat: Chat = {
        id: newChatId,
        title: userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : ''),
        messages: [{ role: 'user' as const, content: userMessage }],
        createdAt: new Date(),
      };
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(newChatId);
      chatId = newChatId;
    } else {
      // Add user message to existing chat
      setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, { role: 'user' as const, content: userMessage }],
          };
        }
        return chat;
      }));
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage, 
          history: chats.find(c => c.id === chatId)?.messages || [],
          isNewChat: !currentChatId,
          secretMode: isSecretMode,
          usePreferences: usePreferences,
          userPreferences: usePreferences ? userPreferences : null
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChats(prev => prev.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [...chat.messages, { role: 'assistant' as const, content: data.response }],
              title: data.suggestedTitle || chat.title,
            };
          }
          return chat;
        }));
        // Save AI recommendation results when the user asked the AI to use their
        // preferences — this feeds the recommendations table.
        if (usePreferences) {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const email = JSON.parse(storedUser).email;
              if (email) {
                fetch('/api/recommendations', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email,
                    source: 'chat',
                    query: userMessage,
                    response: data.response,
                  }),
                }).catch(() => {});
              }
            } catch {
              /* ignore */
            }
          }
        }
      } else {
        setChats(prev => prev.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [...chat.messages, { role: 'assistant' as const, content: t('chatError') }],
            };
          }
          return chat;
        }));
      }
    } catch (error) {
      setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, { role: 'assistant' as const, content: t('chatError') }],
          };
        }
        return chat;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen bg-[#E8E8F0] overflow-hidden relative flex flex-col pt-16">
      {/* 3D Geometric Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#9370DB]/20 rounded-lg animate-float-1 transform rotate-12"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-[#7B68EE]/20 rounded-full animate-float-2"></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-[#9370DB]/15 rounded-lg animate-float-3 transform -rotate-6"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-[#A8A8C8]/20 rounded-full animate-float-4"></div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-[#9370DB]/10 rounded-lg animate-float-5 transform rotate-45"></div>
        <div className="absolute top-1/3 right-1/3 w-36 h-36 bg-[#7B68EE]/10 rounded-full animate-float-6"></div>
        <div className="absolute top-1/4 left-1/2 w-16 h-16 bg-[#9370DB]/10 rounded-lg animate-float-7"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-[#A8A8C8]/10 rounded-full animate-float-8"></div>
        
        {/* Additional shapes */}
        <div className="absolute top-10 left-1/3 w-12 h-12 bg-[#9370DB]/15 rounded-full animate-float-1"></div>
        <div className="absolute top-1/4 right-1/2 w-20 h-20 bg-[#7B68EE]/15 rounded-lg animate-float-2 transform rotate-30"></div>
        <div className="absolute bottom-1/3 left-1/5 w-16 h-16 bg-[#A8A8C8]/15 rounded-full animate-float-3"></div>
        <div className="absolute top-3/4 right-1/5 w-28 h-28 bg-[#9370DB]/10 rounded-lg animate-float-4 transform -rotate-15"></div>
        <div className="absolute top-1/5 left-2/3 w-14 h-14 bg-[#7B68EE]/10 rounded-full animate-float-5"></div>
        <div className="absolute bottom-1/5 right-2/3 w-18 h-18 bg-[#A8A8C8]/10 rounded-lg animate-float-6 transform rotate-60"></div>
        <div className="absolute top-2/3 left-1/6 w-10 h-10 bg-[#9370DB]/12 rounded-full animate-float-7"></div>
        <div className="absolute top-1/6 right-1/6 w-22 h-22 bg-[#7B68EE]/12 rounded-lg animate-float-8 transform -rotate-30"></div>
        <div className="absolute bottom-2/5 left-3/4 w-16 h-16 bg-[#A8A8C8]/12 rounded-full animate-float-1"></div>
        <div className="absolute top-3/5 right-3/4 w-12 h-12 bg-[#9370DB]/10 rounded-lg animate-float-2 transform rotate-45"></div>
        <div className="absolute top-1/2 left-1/6 w-20 h-20 bg-[#7B68EE]/10 rounded-full animate-float-3"></div>
        <div className="absolute bottom-1/2 right-1/6 w-14 h-14 bg-[#A8A8C8]/10 rounded-lg animate-float-4 transform -rotate-45"></div>
        <div className="absolute top-2/5 left-2/5 w-8 h-8 bg-[#9370DB]/15 rounded-full animate-float-5"></div>
        <div className="absolute bottom-3/5 right-2/5 w-24 h-24 bg-[#7B68EE]/15 rounded-lg animate-float-6 transform rotate-15"></div>
        <div className="absolute top-4/5 left-3/5 w-16 h-16 bg-[#A8A8C8]/15 rounded-full animate-float-7"></div>
        <div className="absolute top-1/5 right-3/5 w-12 h-12 bg-[#9370DB]/12 rounded-lg animate-float-8 transform -rotate-60"></div>
        <div className="absolute bottom-4/5 left-1/5 w-20 h-20 bg-[#7B68EE]/12 rounded-full animate-float-1"></div>
        <div className="absolute top-3/4 right-4/5 w-8 h-8 bg-[#A8A8C8]/12 rounded-lg animate-float-2 transform rotate-75"></div>
        <div className="absolute top-2/3 left-4/5 w-14 h-14 bg-[#9370DB]/10 rounded-full animate-float-3"></div>
        <div className="absolute bottom-1/3 right-4/5 w-18 h-18 bg-[#7B68EE]/10 rounded-lg animate-float-4 transform -rotate-75"></div>
      </div>

      {/* Navigation */}
      <Navbar 
        currentPage="chat" 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        showHamburger={true}
      />

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — overlay drawer on mobile, static column on desktop */}
        {sidebarOpen && (
          <div className="absolute inset-y-0 left-0 z-30 lg:static w-72 lg:w-64 bg-[#D8D8E8] dark:bg-dark-bg-secondary border-r border-[#A8A8C8] dark:border-dark-border p-4 flex flex-col animate-fade-in-down lg:animate-none shadow-2xl lg:shadow-none">
            <button
              onClick={createNewChat}
              className="w-full px-4 py-3 bg-[#9370DB] text-white rounded-lg hover:bg-[#7B68EE] transition-colors mb-4 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t('newChat')}
            </button>
            {/* Search Input */}
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchChats')}
                className="w-full px-3 py-2 bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg text-slate-800 placeholder-slate-500 text-sm focus:outline-none focus:border-[#9370DB]"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredChats.map(chat => (
                <div
                  key={chat.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    currentChatId === chat.id
                      ? 'bg-[#9370DB] text-white'
                      : 'bg-[#E8E8F0] text-slate-800 hover:bg-[#C8C8E0]'
                  }`}
                  onClick={() => setCurrentChatId(chat.id)}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium truncate flex-1">{chat.title}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="ml-2 text-xs hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(chat.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {!currentChat ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="text-center max-w-2xl w-full">
                {!isLoggedIn && (
                  <div className="mb-6 p-4 bg-[#9370DB]/10 border border-[#9370DB] rounded-lg flex items-center justify-between gap-4">
                    <p className="text-slate-800 font-medium text-sm">
                      {t('signInToStartChatting')}
                    </p>
                    <button
                      onClick={() => setShowLogin(true)}
                      className="px-4 py-2 bg-[#9370DB] text-white rounded-lg font-medium hover:bg-[#7B68EE] transition-colors text-sm whitespace-nowrap"
                    >
                      {t('signIn')}
                    </button>
                  </div>
                )}
                <h2 className="text-3xl font-bold text-slate-800 mb-2">{t('howCanIHelp')}</h2>
                <p className="text-slate-600 mb-8">{t('chatSubtitle')}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {randomPrompt ? (
                    <button
                      onClick={() => { 
                        setInput(randomPrompt);
                        sendMessage();
                      }}
                      className="col-span-2 p-4 bg-white border border-[#A8A8C8] rounded-lg hover:border-[#9370DB] hover:shadow-md transition-all text-left animate-rise-in"
                    >
                      <p className="text-slate-800 font-medium">{randomPrompt}</p>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => { 
                          setInput(t('promptCS'));
                          sendMessage();
                        }}
                        className="p-4 bg-white border border-[#A8A8C8] rounded-lg hover:border-[#9370DB] hover:shadow-md transition-all text-left animate-rise-in"
                      >
                        <p className="text-slate-800 font-medium">{t('promptCS')}</p>
                      </button>
                      <button
                        onClick={() => { 
                          setInput(t('promptEssay'));
                          sendMessage();
                        }}
                        className="p-4 bg-white border border-[#A8A8C8] rounded-lg hover:border-[#9370DB] hover:shadow-md transition-all text-left animate-rise-in-1"
                      >
                        <p className="text-slate-800 font-medium">{t('promptEssay')}</p>
                      </button>
                      <button
                        onClick={() => { 
                          setInput(t('promptScholarships'));
                          sendMessage();
                        }}
                        className="p-4 bg-white border border-[#A8A8C8] rounded-lg hover:border-[#9370DB] hover:shadow-md transition-all text-left animate-rise-in-2"
                      >
                        <p className="text-slate-800 font-medium">{t('promptScholarships')}</p>
                      </button>
                      <button
                        onClick={() => { 
                          setInput(t('promptMajor'));
                          sendMessage();
                        }}
                        className="p-4 bg-white border border-[#A8A8C8] rounded-lg hover:border-[#9370DB] hover:shadow-md transition-all text-left animate-rise-in-3"
                      >
                        <p className="text-slate-800 font-medium">{t('promptMajor')}</p>
                      </button>
                    </>
                  )}
                </div>

                {/* Input box for custom questions */}
                <div className="w-full max-w-2xl animate-rise-in-4">
                  <div className="flex gap-2">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={t('typeYourOwnQuestion')}
                      rows={1}
                      className="flex-1 px-4 py-3 bg-white border border-[#A8A8C8] rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:border-[#9370DB] resize-none"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim()}
                      className="px-6 py-3 bg-[#9370DB] text-white rounded-lg hover:bg-[#7B68EE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('send')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentChat.messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-600">{t('startConversation')}</p>
                  </div>
                ) : (
                  currentChat.messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-[#9370DB] text-white'
                            : 'bg-white text-slate-800 border border-[#A8A8C8]'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <div 
                            className="prose prose-sm"
                            dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                          />
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-slate-800 border border-[#A8A8C8] rounded-lg p-4">
                      <p>{t('thinking')}</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-[#A8A8C8]">
                {/* Preference Toggle */}
                <div className="mb-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="usePreferences"
                    checked={usePreferences}
                    onChange={(e) => setUsePreferences(e.target.checked)}
                    className="w-4 h-4 accent-[#9370DB]"
                  />
                  <label htmlFor="usePreferences" className="text-sm text-slate-800 cursor-pointer">
                    {t('basedOnMyPreferences')}
                  </label>
                  {usePreferences && !userPreferences && (
                    <span className="text-xs text-slate-500 ml-2">
                      {t('noPreferencesSet')}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 max-w-4xl mx-auto">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={t('askAbout')}
                    rows={1}
                    className="flex-1 px-4 py-3 bg-white border border-[#A8A8C8] rounded-lg text-slate-800 placeholder-slate-500 focus:outline-none focus:border-[#9370DB] resize-none"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="px-6 py-3 bg-[#9370DB] text-white rounded-lg hover:bg-[#7B68EE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('send')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
