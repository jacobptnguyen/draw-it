import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { DailyChallenge } from '@/types';
import Constants from 'expo-constants';

const getApiUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (__DEV__ && debuggerHost) {
    return `http://${debuggerHost}:8081`;
  }
  return process.env.EXPO_PUBLIC_API_URL || '';
};

const API_BASE_URL = getApiUrl();

const INITIAL_CHALLENGE_PROMPT = "You are a creative art educator who designs fun, engaging daily drawing challenges for artists of all ages and skill levels. Generate a unique, specific drawing challenge that is family-friendly and achievable in 15-30 minutes. Make it creative and varied - it could be about nature, objects, people, fantasy, patterns, or anything interesting. IMPORTANT: Avoid generating copyrighted characters from movies/TV/games/comics, brand logos, trademarks, or celebrity likenesses. If a user requests copyrighted content, suggest a similar generic alternative. Focus on original, creative subjects like animals, landscapes, objects, and fantasy creatures. Format as: **Today's Challenge:** [5-10 word prompt], **Description:** [1-2 sentences], **Tip:** [helpful technique], **Bonus:** [creative twist]. End with 'IMAGE_PROMPT:' followed by a concise description for generating a reference image.";

export function useDailyChallenges() {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [todaysChallenge, setTodaysChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingChallenge, setGeneratingChallenge] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const generateDynamicSystemPrompt = async (): Promise<string> => {
    try {
      const { data: recentChallenges, error } = await supabase
        .from('daily_challenges')
        .select('title, prompt')
        .order('challenge_date', { ascending: false })
        .limit(1);

      if (error || !recentChallenges || recentChallenges.length === 0) {
        return INITIAL_CHALLENGE_PROMPT;
      }

      const lastChallenge = recentChallenges[0];

      const metaResponse = await fetch(`${API_BASE_URL}/api/openai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'chat',
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: "You are an expert at creating variety in educational content. Given a previous drawing challenge, create a system prompt for generating tomorrow's challenge that will be DIFFERENT and COMPLEMENTARY. Consider what topic, style, or theme would provide good variety. IMPORTANT: Ensure the generated prompt instructs to avoid copyrighted characters from movies/TV/games/comics, brand logos, trademarks, or celebrity likenesses. The prompt should focus on original, creative subjects like animals, landscapes, objects, and fantasy creatures.",
            },
            {
              role: 'user',
              content: `The previous challenge was: "${lastChallenge.title}". Create a system prompt (200 words max) for an AI that will generate tomorrow's drawing challenge. The prompt should guide the AI to create something different from the previous challenge to ensure variety. The format should remain: **Today's Challenge:** [prompt], **Description:** [text], **Tip:** [text], **Bonus:** [text], IMAGE_PROMPT: [description].`,
            },
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!metaResponse.ok) {
        throw new Error('Failed to generate dynamic prompt');
      }

      const metaResult = await metaResponse.json();
      const dynamicPrompt = metaResult.data?.choices[0]?.message?.content;
      
      return dynamicPrompt || INITIAL_CHALLENGE_PROMPT;
    } catch (error) {
      console.error('Error generating dynamic system prompt:', error);
      return INITIAL_CHALLENGE_PROMPT;
    }
  };

  const generateDailyChallenge = async (date: string, isInitialGeneration: boolean = false): Promise<DailyChallenge> => {
    setGeneratingChallenge(true);
    try {
      const systemPrompt = await generateDynamicSystemPrompt();

      const challengeResponse = await fetch(`${API_BASE_URL}/api/openai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'chat',
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'Generate today\'s drawing challenge.' }
          ],
          max_tokens: 300,
          temperature: 0.8,
        }),
      });

      if (!challengeResponse.ok) {
        throw new Error('Failed to generate challenge');
      }

      const challengeResult = await challengeResponse.json();
      const fullResponse = challengeResult.data?.choices[0]?.message?.content || '';
      
      if (!fullResponse) {
        throw new Error('No response from OpenAI');
      }
      
      // Extract challenge text and image prompt
      const imagePROMPTIndex = fullResponse.indexOf('IMAGE_PROMPT:');
      if (imagePROMPTIndex === -1) {
        throw new Error('No IMAGE_PROMPT found in challenge response');
      }

      const challengeText = fullResponse.substring(0, imagePROMPTIndex).trim();
      const imagePrompt = fullResponse.substring(imagePROMPTIndex + 'IMAGE_PROMPT:'.length).trim();

      const imageResponse = await fetch(`${API_BASE_URL}/api/openai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'image',
          model: 'dall-e-3',
          prompt: `${imagePrompt}, simple artistic reference, clean composition, suitable for drawing practice`,
          size: '1024x1024',
          n: 1,
        }),
      });

      if (!imageResponse.ok) {
        throw new Error('Failed to generate reference image');
      }

      const imageResult = await imageResponse.json();
      const referenceImageUrl = imageResult.data?.data?.[0]?.url;
      if (!referenceImageUrl) {
        throw new Error('Failed to generate reference image');
      }

      const titleMatch = challengeText.match(/\*\*Today's Challenge:\*\*\s*(.+)/);
      const descriptionMatch = challengeText.match(/\*\*Description:\*\*\s*(.+)/);
      const tipMatch = challengeText.match(/\*\*Tip:\*\*\s*(.+)/);
      const bonusMatch = challengeText.match(/\*\*Bonus:\*\*\s*(.+)/);
      
      const title = titleMatch?.[1]?.trim() || 'Daily Drawing Challenge';
      const prompt = descriptionMatch?.[1]?.trim() || 'Draw something creative today!';
      const tip = tipMatch?.[1]?.trim() || '';
      const bonus = bonusMatch?.[1]?.trim() || '';
      const fullPrompt = `${prompt}${tip ? `\n\nTip: ${tip}` : ''}${bonus ? `\n\nBonus: ${bonus}` : ''}`;
      
      let { data: challengeData, error: insertError } = await supabase
        .from('daily_challenges')
        .insert({
          challenge_date: date,
          title,
          prompt: fullPrompt,
          difficulty: 'medium',
          thumbnail_url: referenceImageUrl,
        })
        .select()
        .single();

      if (insertError && insertError.code === '23505') {
        const { data: updateData, error: updateError } = await supabase
          .from('daily_challenges')
          .update({
            title,
            prompt: fullPrompt,
            difficulty: 'medium',
            thumbnail_url: referenceImageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('challenge_date', date)
          .select()
          .single();

        if (updateError) {
          console.error('Database error updating challenge:', updateError);
          throw new Error(`Failed to update challenge: ${updateError.message}`);
        }
        challengeData = updateData;
      } else if (insertError) {
        console.error('Database error saving challenge:', insertError);
        throw new Error(`Failed to save challenge: ${insertError.message}`);
      }
      
      return challengeData;
    } catch (error) {
      console.error('Error generating daily challenge:', error);
      return {
        id: `fallback-${date}`,
        challenge_date: date,
        title: 'Daily Drawing Challenge',
        prompt: 'Draw something that makes you happy today!',
        difficulty: 'easy' as const,
        thumbnail_url: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } finally {
      setGeneratingChallenge(false);
    }
  };

  const fetchOrGenerateTodaysChallenge = async (forceCheckNewDay: boolean = false) => {
    if (hasFetched.current && !forceCheckNewDay) {
      return;
    }
    
    hasFetched.current = true;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // First, try to get existing challenges
      const { data: challengesData, error: fetchError } = await supabase
        .from('daily_challenges')
        .select('*')
        .order('challenge_date', { ascending: true });

      if (fetchError) throw fetchError;

      const challengesList = challengesData || [];
      setChallenges(challengesList);

      // Check if today's challenge exists
      const todayChallenge = challengesList.find(
        challenge => challenge.challenge_date === today
      );

      if (todayChallenge) {
        setTodaysChallenge(todayChallenge);
      } else {
        const newChallenge = await generateDailyChallenge(today);
        setTodaysChallenge(newChallenge);
        setChallenges(prev => [...prev, newChallenge]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrGenerateTodaysChallenge();
  }, []);

  const refreshChallenges = async (forceRegenerate: boolean = false) => {
    setLoading(true);
    hasFetched.current = false;
    
    if (forceRegenerate) {
      await regenerateTodaysChallenge();
    } else {
      await fetchOrGenerateTodaysChallenge(true);
    }
  };

  const regenerateTodaysChallenge = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Delete existing challenge for today and wait for completion
      const { error: deleteError } = await supabase
        .from('daily_challenges')
        .delete()
        .eq('challenge_date', today);

      if (deleteError) {
        console.error('Error deleting existing challenge:', deleteError);
        throw new Error(`Failed to delete existing challenge: ${deleteError.message}`);
      }

      // Wait longer to ensure deletion is processed and database constraint is cleared
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate new challenge for today
      const newChallenge = await generateDailyChallenge(today);
      setTodaysChallenge(newChallenge);
      
      // Update the challenges list
      setChallenges(prev => {
        const filtered = prev.filter(challenge => challenge.challenge_date !== today);
        return [...filtered, newChallenge];
      });
    } catch (error) {
      console.error('Error regenerating today\'s challenge:', error);
      setError(error instanceof Error ? error.message : 'Failed to regenerate challenge');
    } finally {
      setLoading(false);
    }
  };

  const getChallengeByDate = (date: string) => {
    return challenges.find(challenge => challenge.challenge_date === date);
  };

  const getUpcomingChallenges = (days: number = 7) => {
    const today = new Date();
    const upcoming = new Date(today);
    upcoming.setDate(today.getDate() + days);

    return challenges.filter(challenge => {
      const challengeDate = new Date(challenge.challenge_date);
      return challengeDate > today && challengeDate <= upcoming;
    });
  };

  // Generate challenge content for chat messages (without saving to database)
  const generateChallengeContent = async (): Promise<{
    challengeText: string;
    referenceImageUrl: string;
  }> => {
    try {
      // Use the initial prompt for one-off challenge generation
      const challengeResponse = await fetch(`${API_BASE_URL}/api/openai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'chat',
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: INITIAL_CHALLENGE_PROMPT },
            { role: 'user', content: 'Generate a drawing challenge.' }
          ],
          max_tokens: 300,
          temperature: 0.8,
        }),
      });

      if (!challengeResponse.ok) {
        throw new Error('Failed to generate challenge');
      }

      const challengeResult = await challengeResponse.json();
      const fullResponse = challengeResult.data?.choices[0]?.message?.content || '';
      
      if (!fullResponse) {
        throw new Error('No response from OpenAI');
      }
      
      // Extract challenge text and image prompt
      const imagePROMPTIndex = fullResponse.indexOf('IMAGE_PROMPT:');
      if (imagePROMPTIndex === -1) {
        throw new Error('No IMAGE_PROMPT found in challenge response');
      }

      const challengeText = fullResponse.substring(0, imagePROMPTIndex).trim();
      const imagePrompt = fullResponse.substring(imagePROMPTIndex + 'IMAGE_PROMPT:'.length).trim();

      // Generate reference image with DALL-E 3
      const imageResponse = await fetch(`${API_BASE_URL}/api/openai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'image',
          model: 'dall-e-3',
          prompt: `${imagePrompt}, simple artistic reference, clean composition, suitable for drawing practice`,
          size: '1024x1024',
          n: 1,
        }),
      });

      if (!imageResponse.ok) {
        throw new Error('Failed to generate reference image');
      }

      const imageResult = await imageResponse.json();
      const referenceImageUrl = imageResult.data?.data?.[0]?.url;
      if (!referenceImageUrl) {
        throw new Error('Failed to generate reference image');
      }

      return {
        challengeText,
        referenceImageUrl,
      };
    } catch (error) {
      console.error('Error generating challenge content:', error);
      throw error;
    }
  };

  return {
    challenges,
    todaysChallenge,
    loading,
    generatingChallenge,
    error,
    refreshChallenges,
    regenerateTodaysChallenge,
    getChallengeByDate,
    getUpcomingChallenges,
    generateChallengeContent,
  };
}