import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChatMessage, ChatSession, Drawing } from '@/types';

export const useChatSession = (sessionId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load messages for existing session
  useEffect(() => {
    if (sessionId) {
      loadMessages(sessionId);
    }
  }, [sessionId]);

  // Load session details when sessionId is provided
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId]);

  const loadSession = async (chatSessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', chatSessionId)
        .single();

      if (error) throw error;
      setSession(data);
    } catch (error) {
      console.error('Error loading session:', error);
      throw error; // Bubble up the error
    }
  };

  const loadMessages = async (chatSessionId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_session_id', chatSessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const findExistingSession = async (drawingId: string): Promise<ChatSession | null> => {
    try {
      console.log('🔍 [useChatSession] Looking for existing session for drawing:', drawingId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First validate that the drawing exists in the database
      const { data: drawingData, error: drawingError } = await supabase
        .from('drawings')
        .select('id')
        .eq('id', drawingId)
        .single();

      if (drawingError || !drawingData) {
        console.warn(`Drawing with ID ${drawingId} not found in database. Cannot find existing session.`);
        return null;
      }

      // Check if this is the daily challenge
      const DAILY_CHALLENGE_DRAWING_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const isDailyChallenge = drawingId === DAILY_CHALLENGE_DRAWING_ID;
      
      let query = supabase
        .from('chat_sessions')
        .select('*')
        .eq('drawing_id', drawingId)
        .eq('user_id', user.id);
      
      // For daily challenges, only look for today's sessions
      if (isDailyChallenge) {
        const today = new Date().toISOString().split('T')[0];
        console.log('🔍 [useChatSession] Daily challenge detected, filtering to today\'s sessions:', today);
        query = query
          .gte('created_at', `${today}T00:00:00.000Z`)
          .lt('created_at', `${today}T23:59:59.999Z`);
      }
      
      const { data, error } = await query
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('🔍 [useChatSession] Error finding existing session:', error);
        return null;
      }

      if (data) {
        console.log('🔍 [useChatSession] Found existing session:', data.id);
        setSession(data);
        return data;
      } else {
        console.log('🔍 [useChatSession] No existing session found');
        return null;
      }
    } catch (error) {
      console.error('🔍 [useChatSession] Error in findExistingSession:', error);
      return null;
    }
  };

  const createNewSession = async (drawingId?: string, title?: string): Promise<string> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const insertData: any = {
        user_id: user.id,
        title: title || 'New Conversation',
      };

      if (drawingId) {
        // Validate that the drawing exists in the database before creating a session
        const { data: drawingData, error: drawingError } = await supabase
          .from('drawings')
          .select('id')
          .eq('id', drawingId)
          .single();

        if (drawingError || !drawingData) {
          console.warn(`Drawing with ID ${drawingId} not found in database. Creating session without drawing reference.`);
          // Don't include drawing_id if the drawing doesn't exist
        } else {
          insertData.drawing_id = drawingId;
        }
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating session:', error);
        throw error;
      }
      
      console.log('Session created successfully:', data);
      setSession(data);
      setMessages([]);
      return data.id;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const addMessage = async (
    text: string,
    sender: 'user' | 'ai',
    messageType: 'text' | 'image' | 'feedback' = 'text',
    imageUrl?: string
  ) => {
    if (!session?.id) {
      const error = new Error('No session available for adding message');
      console.error(error.message);
      throw error;
    }

    try {
      console.log('Adding message to session:', session.id, { text, sender, messageType });
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_session_id: session.id,
          text,
          sender,
          message_type: messageType,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error adding message:', error);
        throw error;
      }
      
      console.log('Message added successfully:', data);
      setMessages(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  };

  const deleteSession = async (): Promise<void> => {
    console.log('🗑️ [useChatSession] deleteSession called');
    console.log('🗑️ [useChatSession] Current session state:', session);
    
    if (!session?.id) {
      const error = new Error('No session available for deletion');
      console.error('🗑️ [useChatSession] ERROR:', error.message);
      throw error;
    }

    console.log('🗑️ [useChatSession] Session ID to delete:', session.id);
    setIsDeleting(true);
    
    try {
      // Get current user to verify ownership
      console.log('🗑️ [useChatSession] Getting current user...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('🗑️ [useChatSession] ERROR: User not authenticated');
        throw new Error('User not authenticated');
      }
      console.log('🗑️ [useChatSession] Current user ID:', user.id);

      // Verify user owns this session
      console.log('🗑️ [useChatSession] Verifying session ownership...');
      const { data: sessionData, error: sessionCheckError } = await supabase
        .from('chat_sessions')
        .select('user_id')
        .eq('id', session.id)
        .single();

      if (sessionCheckError) {
        console.error('🗑️ [useChatSession] ERROR checking session ownership:', sessionCheckError);
        throw new Error('Failed to verify session ownership');
      }

      console.log('🗑️ [useChatSession] Session owner ID:', sessionData.user_id);
      if (sessionData.user_id !== user.id) {
        console.error('🗑️ [useChatSession] ERROR: User does not own this session');
        throw new Error('Not authorized to delete this session');
      }

      console.log('🗑️ [useChatSession] Ownership verified, proceeding with deletion...');

      // Delete messages first
      console.log('🗑️ [useChatSession] Deleting messages for session:', session.id);
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('chat_session_id', session.id);

      if (messagesError) {
        console.error('🗑️ [useChatSession] ERROR deleting messages:', messagesError);
        throw messagesError;
      }
      console.log('🗑️ [useChatSession] Messages deleted successfully');

      // Delete the session
      console.log('🗑️ [useChatSession] Deleting session:', session.id);
      const { error: sessionError } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', session.id)
        .eq('user_id', user.id); // Additional safety check

      if (sessionError) {
        console.error('🗑️ [useChatSession] ERROR deleting session:', sessionError);
        throw sessionError;
      }

      // Clear local state only after successful deletion
      console.log('🗑️ [useChatSession] Session deleted successfully, clearing local state...');
      setSession(null);
      setMessages([]);
      setIsLoading(false);
      console.log('🗑️ [useChatSession] Local state cleared completely, deletion complete!');
      
    } catch (error) {
      console.error('🗑️ [useChatSession] FINAL ERROR in deleteSession:', error);
      throw error; // Re-throw to allow calling component to handle
    } finally {
      console.log('🗑️ [useChatSession] Setting isDeleting to false');
      setIsDeleting(false);
    }
  };

  // Alternative deleteSession using RPC if you prefer database-side logic
  const deleteSessionRPC = async (): Promise<void> => {
    if (!session?.id) {
      throw new Error('No session available for deletion');
    }

    setIsDeleting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Call a stored procedure/RPC function that handles the deletion atomically
      const { error } = await supabase.rpc('delete_chat_session', {
        session_id: session.id,
        user_id: user.id
      });

      if (error) {
        console.error('RPC error deleting session:', error);
        throw error;
      }

      setSession(null);
      setMessages([]);
      
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const findOrCreateSession = async (drawingId?: string, title?: string): Promise<string> => {
    console.log('🔄 [useChatSession] findOrCreateSession called with:', { drawingId, title });
    
    if (!drawingId) {
      console.log('🔄 [useChatSession] No drawingId provided, creating new session');
      return await createNewSession(drawingId, title);
    }

    // First try to find an existing session
    const existingSession = await findExistingSession(drawingId);
    
    if (existingSession) {
      console.log('🔄 [useChatSession] Using existing session, loading messages...');
      await loadMessages(existingSession.id);
      return existingSession.id;
    } else {
      console.log('🔄 [useChatSession] No existing session found, creating new one');
      return await createNewSession(drawingId, title);
    }
  };

  return {
    messages,
    session,
    isLoading,
    isDeleting, // New state for deletion loading
    createNewSession,
    findExistingSession,
    findOrCreateSession, // New combined function
    addMessage,
    deleteSession,
    deleteSessionRPC, // Alternative method using RPC
    loadMessages,
    loadSession,
  };
};