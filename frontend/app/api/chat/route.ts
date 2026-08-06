import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, history, isNewChat, secretMode, context, usePreferences, userPreferences } = await request.json();

    // Google Gemini API endpoint
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Build system prompt with context
    let systemPrompt = secretMode 
      ? `You are Cae, a helpful AI assistant for UniVerse, a university discovery platform that helps students find and explore universities worldwide. You can answer questions about any topic - universities, general knowledge, personal advice, or anything else the user asks. Be helpful, conversational, and provide thoughtful responses. Only introduce yourself if the user asks "who are you" or similar questions.`
      : `You are Cae, a helpful university assistant for UniVerse, a university discovery platform that helps students find and explore universities worldwide. You answer questions related to:
- Universities and colleges
- Courses and academic programs
- Admissions and applications
- Scholarships and financial aid
- Campus life and student resources
- Study tips and academic advice
- The UniVerse app features and navigation

If a user asks about anything outside these topics (medical advice, legal advice, general knowledge, etc.), politely decline and redirect them to appropriate resources. Keep responses concise and helpful. Only introduce yourself if the user asks "who are you" or similar questions.`;

    // Add context to system prompt if provided
    if (context) {
      systemPrompt += `\n\nContext about the current situation:\n${context}\n\nUse this context to provide relevant answers based on the user's current page and preferences.`;
    }

    // Add user preferences to system prompt if enabled
    if (usePreferences && userPreferences) {
      let preferencesContext = '\n\nUser Preferences:\n';
      
      if (userPreferences.intendedMajor && userPreferences.intendedMajor.length > 0) {
        preferencesContext += `- Intended Majors: ${userPreferences.intendedMajor.join(', ')}\n`;
      }
      
      if (userPreferences.degreeLevel) {
        preferencesContext += `- Degree Level: ${userPreferences.degreeLevel}\n`;
      }
      
      if (userPreferences.preferredRegions && userPreferences.preferredRegions.length > 0) {
        preferencesContext += `- Preferred Regions: ${userPreferences.preferredRegions.join(', ')}\n`;
      }
      
      if (userPreferences.preferredCountries && userPreferences.preferredCountries.length > 0) {
        preferencesContext += `- Preferred Countries: ${userPreferences.preferredCountries.join(', ')}\n`;
      }
      
      if (userPreferences.budget) {
        preferencesContext += `- Budget: ${userPreferences.budget}\n`;
      }
      
      if (userPreferences.gpa) {
        preferencesContext += `- GPA: ${userPreferences.gpa}\n`;
      }
      
      if (userPreferences.studyMode) {
        preferencesContext += `- Study Mode: ${userPreferences.studyMode}\n`;
      }
      
      if (userPreferences.startDate) {
        preferencesContext += `- Start Date: ${userPreferences.startDate}\n`;
      }
      
      preferencesContext += '\nWhen answering questions about universities, courses, or academic advice, prioritize recommendations that align with these preferences. Tailor your responses to the user\'s specific goals and constraints.';
      
      systemPrompt += preferencesContext;
    }

    // Build conversation history for context
    let conversationHistory = '';
    if (history && history.length > 0) {
      conversationHistory = '\n\nPrevious conversation:\n';
      history.forEach((msg: any) => {
        conversationHistory += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}${conversationHistory}

User: ${message}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: 'Failed to get response from Gemini API. Your API key may not have access to the Gemini API. Please check your Google Cloud console and enable the Gemini API.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    let suggestedTitle = null;
    if (isNewChat) {
      // Generate a suggested title for new chats
      try {
        const titleResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Generate a very short, concise title (3-5 words maximum) for this conversation. The title should capture the main topic. Return ONLY the title, no punctuation or extra text.

User message: ${message}`
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 20,
              },
            }),
          }
        );

        if (titleResponse.ok) {
          const titleData = await titleResponse.json();
          suggestedTitle = titleData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
          // Clean up the title
          if (suggestedTitle) {
            suggestedTitle = suggestedTitle.replace(/^[\"'\.]/, '').replace(/[\"'\.]$/, '');
            suggestedTitle = suggestedTitle.slice(0, 30);
          }
        }
      } catch (error) {
        // If title generation fails, continue without it
      }
    }

    return NextResponse.json({ response: aiResponse, suggestedTitle });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
