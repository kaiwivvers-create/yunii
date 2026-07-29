'use client';

import { usePathname } from 'next/navigation';
import Chatbot from './Chatbot';

export default function ChatbotWrapper() {
  const pathname = usePathname();
  
  // Don't show chatbot on the dedicated chat page
  if (pathname === '/chat') {
    return null;
  }
  
  return <Chatbot />;
}
