import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ChatMessage, ChatSession } from '@/types';
import Constants from 'expo-constants';

// Get the API URL based on environment
const getApiUrl = () => {
  // For web (browser), use relative URL to hit the API route
  if (typeof window !== 'undefined') {
    return ''; // Empty string means relative URLs like /api/openai
  }
  
  // For native apps in development
  const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (__DEV__ && debuggerHost) {
    return `http://${debuggerHost}:8081`;
  }
  
  // For production, use your Vercel deployment URL
  return process.env.EXPO_PUBLIC_API_URL || '';
};

const API_BASE_URL = getApiUrl();

// System messages for different modes
const FEEDBACK_SYSTEM_MESSAGE = "You are an encouraging art teacher. Analyze drawings and provide: 2-3 specific strengths, main improvement area with actionable advice, one practice exercise, encouragement. Focus on fundamentals: line quality, proportions, shading, composition. Keep feedback constructive, specific, and concise (150-200 words). IMPORTANT: Avoid generating copyrighted characters from movies/TV/games/comics, brand logos, trademarks, or celebrity likenesses. If a user requests copyrighted content, suggest a similar generic alternative. Focus on original, creative subjects like animals, landscapes, objects, and fantasy creatures.";

const COMPARE_SYSTEM_MESSAGE = "You are an art instructor specializing in observational drawing. Compare student's drawing to reference image. Identify what's accurate, 2-3 specific differences (proportions, values, perspective), explain why differences matter, give one priority improvement. Keep feedback comparative, educational, and encouraging (200-250 words). IMPORTANT: Avoid generating copyrighted characters from movies/TV/games/comics, brand logos, trademarks, or celebrity likenesses. If a user requests copyrighted content, suggest a similar generic alternative. Focus on original, creative subjects like animals, landscapes, objects, and fantasy creatures.";


export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Convert ChatMessage array to OpenAI message format
  const convertToOpenAIMessages = (messages: ChatMessage[], systemMessage: string) => {
    const openAIMessages: any[] = [
      { role: 'system', content: systemMessage }
    ];

    messages.forEach(msg => {
      if (msg.sender === 'user') {
        if (msg.message_type === 'image' && msg.image_url) {
          openAIMessages.push({
            role: 'user',
            content: [
              { type: 'text', text: msg.text || 'Please analyze this drawing.' },
              { type: 'image_url', image_url: { url: msg.image_url } }
            ]
          });
        } else {
          openAIMessages.push({
            role: 'user',
            content: msg.text
          });
        }
      } else if (msg.sender === 'ai') {
        openAIMessages.push({
          role: 'assistant',
          content: msg.text
        });
      }
    });

    return openAIMessages;
  };

  // Get conversation history from database
  const getConversationHistory = async (sessionId: string): Promise<ChatMessage[]> => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading conversation history:', error);
      return [];
    }
  };

  // Save message to database
  const saveMessage = async (
    sessionId: string,
    text: string,
    sender: 'user' | 'ai',
    messageType: 'text' | 'image' | 'feedback' = 'text',
    imageUrl?: string
  ): Promise<ChatMessage> => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_session_id: sessionId,
          text,
          sender,
          message_type: messageType,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  };

  // FEATURE 1: General Feedback
  const sendDrawingForFeedback = async (
    sessionId: string,
    drawingBase64: string,
    userMessage?: string
  ): Promise<string> => {
    setIsLoading(true);
    
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      
      if (!drawingBase64) {
        throw new Error('Drawing image is required');
      }

      // Get conversation history
      const history = await getConversationHistory(sessionId);
      
      // Save user message with image
      await saveMessage(
        sessionId,
        userMessage || 'Please analyze this drawing.',
        'user',
        'image',
        drawingBase64
      );

      // Add the new user message to history for API call
      const updatedHistory = [
        ...history,
        {
          id: 'temp',
          chat_session_id: sessionId,
          text: userMessage || 'Please analyze this drawing.',
          sender: 'user' as const,
          message_type: 'image' as const,
          image_url: drawingBase64,
          created_at: new Date().toISOString()
        }
      ];

      // Convert to OpenAI format
      const openAIMessages = convertToOpenAIMessages(updatedHistory, FEEDBACK_SYSTEM_MESSAGE);

      // Call our backend API instead of OpenAI directly
      const response = await fetch(`${API_BASE_URL}/api/openai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'chat',
          model: 'gpt-4o',
          messages: openAIMessages,
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const result = await response.json();
      const aiResponse = result.data?.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No response received from OpenAI');
      }

      // Save AI response
      await saveMessage(sessionId, aiResponse, 'ai', 'feedback');

      return aiResponse;
    } catch (error) {
      console.error('Error in sendDrawingForFeedback:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze drawing';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // FEATURE 2: Compare Mode
  const compareWithReference = async (
    sessionId: string,
    referenceBase64: string
  ): Promise<string> => {
    setIsLoading(true);
    
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      
      if (!referenceBase64) {
        throw new Error('Reference image is required');
      }

      // Get conversation history to find most recent drawing
      const history = await getConversationHistory(sessionId);
      const mostRecentDrawing = history
        .filter(msg => msg.sender === 'user' && msg.message_type === 'image' && msg.image_url)
        .pop();

      if (!mostRecentDrawing?.image_url) {
        throw new Error('No recent drawing found to compare');
      }

      // Create comparison message
      const comparisonMessages: any[] = [
        { role: 'system', content: COMPARE_SYSTEM_MESSAGE },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'MY DRAWING:' },
            { type: 'image_url', image_url: { url: mostRecentDrawing.image_url } },
            { type: 'text', text: 'REFERENCE IMAGE:' },
            { type: 'image_url', image_url: { url: referenceBase64 } },
            { type: 'text', text: 'Please compare these.' }
          ]
        }
      ];

      // Call our backend API instead of OpenAI directly
      const response = await fetch(`${API_BASE_URL}/api/openai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'chat',
          model: 'gpt-4o',
          messages: comparisonMessages,
          max_tokens: 400,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const result = await response.json();
      const comparisonFeedback = result.data?.choices[0]?.message?.content;
      
      if (!comparisonFeedback) {
        throw new Error('No response received from OpenAI');
      }

      // Save comparison to database
      await saveMessage(sessionId, `Reference image uploaded for comparison`, 'user', 'image', referenceBase64);
      await saveMessage(sessionId, comparisonFeedback, 'ai', 'feedback');

      return comparisonFeedback;
    } catch (error) {
      console.error('Error in compareWithReference:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to compare images';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  // Check if compare button should be enabled
  const checkCompareEnabled = async (sessionId: string): Promise<boolean> => {
    try {
      const history = await getConversationHistory(sessionId);
      return history.some(msg => 
        msg.sender === 'user' && 
        msg.message_type === 'image' && 
        msg.image_url
      );
    } catch (error) {
      console.error('Error checking compare enabled:', error);
      return false;
    }
  };


  return {
    // AI functions
    sendDrawingForFeedback,
    compareWithReference,
    checkCompareEnabled,
    
    // State
    isLoading,
  };
};
