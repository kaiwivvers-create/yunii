import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  async generateResponse(message: string, context?: string, history?: Array<{role: string; content: string}>): Promise<{ response: string }> {
    // Build system prompt with context
    let systemPrompt = 'You are a helpful AI assistant for UniVerse, a university discovery platform that helps students find and explore universities worldwide.';
    
    if (context) {
      systemPrompt += '\n\nContext about the current situation:\n' + context;
    }
    
    systemPrompt += '\n\nProvide helpful, accurate responses about universities, study programs, admissions, and related topics. Use the context to give relevant answers based on the user\'s current page and preferences.';
    
    // Build messages array with history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []),
      { role: 'user', content: message }
    ];
    
    try {
      // Call the AI API
      const response = await this.callAIAPI(messages);
      
      return { response };
    } catch (error) {
      console.error('Error calling AI API:', error);
      return { response: 'Sorry, I encountered an error. Please try again.' };
    }
  }
  
  private async callAIAPI(messages: Array<{role: string; content: string}>): Promise<string> {
    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not set in environment variables');
      return 'AI API key not configured. Please set ANTHROPIC_API_KEY in your .env file.';
    }
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1024,
          messages: messages,
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error('Anthropic API error:', error);
        return `Error calling AI API: ${response.status} ${response.statusText}`;
      }
      
      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Error calling Anthropic API:', error);
      throw error;
    }
  }
}
