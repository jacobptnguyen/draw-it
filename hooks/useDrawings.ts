import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Drawing } from '@/types';

export const useDrawings = () => {
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDrawings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('drawings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDrawings(data || []);
    } catch (err) {
      console.error('Error loading drawings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load drawings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrawings().catch(console.error);
  }, [loadDrawings]);

  const createDrawing = useCallback(async (drawingData: Partial<Drawing>): Promise<Drawing | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('drawings')
        .insert({
          ...drawingData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      
      setDrawings(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating drawing:', err);
      setError(err instanceof Error ? err.message : 'Failed to create drawing');
      return null;
    }
  }, []);

  const createDrawingFromConversation = useCallback(async (title: string, imageUrl?: string): Promise<Drawing | null> => {
    return createDrawing({
      title,
      image_url: imageUrl,
      is_compare_feature: true,
      is_daily_challenge: false,
    });
  }, [createDrawing]);

  const updateDrawing = useCallback(async (id: string, updates: Partial<Drawing>): Promise<Drawing | null> => {
    try {
      const { data, error } = await supabase
        .from('drawings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setDrawings(prev => prev.map(d => d.id === id ? data : d));
      return data;
    } catch (err) {
      console.error('Error updating drawing:', err);
      setError(err instanceof Error ? err.message : 'Failed to update drawing');
      return null;
    }
  }, []);

  const deleteDrawing = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('drawing_id', id);

      if (sessionsError) {
        console.error('Error fetching chat sessions:', sessionsError);
      } else if (sessions && sessions.length > 0) {
        for (const session of sessions) {
          const { error: messagesError } = await supabase
            .from('chat_messages')
            .delete()
            .eq('chat_session_id', session.id);

          if (messagesError) {
            console.error('Error deleting chat messages:', messagesError);
          }
        }
      }

      const { error: chatError } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('drawing_id', id);

      if (chatError) {
        console.error('Error deleting chat sessions:', chatError);
      }

      const { error } = await supabase
        .from('drawings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setDrawings(prev => prev.filter(d => d.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting drawing:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete drawing');
      return false;
    }
  }, []);

  const refreshDrawings = useCallback(async () => {
    return loadDrawings();
  }, [loadDrawings]);

  const getMostRecentImageForDrawing = useCallback(async (drawingId: string): Promise<string | null> => {
    try {
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('drawing_id', drawingId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessionsError || !sessions || sessions.length === 0) {
        return null;
      }

      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('image_url')
        .eq('chat_session_id', sessions[0].id)
        .eq('message_type', 'image')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (messagesError || !messages || messages.length === 0) {
        return null;
      }

      return messages[0].image_url;
    } catch (error) {
      console.error('Error getting most recent image:', error);
      return null;
    }
  }, []);

  return {
    drawings,
    isLoading,
    error,
    loadDrawings,
    createDrawing,
    createDrawingFromConversation,
    updateDrawing,
    deleteDrawing,
    refreshDrawings, // Now this is stable and returns a Promise
    getMostRecentImageForDrawing,
  };
};