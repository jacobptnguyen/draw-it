import { StyleProp, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

export interface User {
  id: string;
  name: string;
  email: string;
  profile_picture_url?: string;
  current_streak: number;
  longest_streak: number;
  total_drawings: number;
  average_score: number;
  total_minutes: number;
  level: number;
  experience_points: number;
  created_at: string;
  updated_at: string;
}

export interface Drawing {
  id: string;
  user_id: string;
  title: string;
  image_url?: string;
  prompt?: string;
  ai_feedback?: string;
  ai_score?: number;
  is_daily_challenge: boolean;
  is_compare_feature: boolean;
  created_at: string;
  updated_at: string;
}

// Define interfaces for components
export interface DrawingCardProps {
  drawing: Drawing;
  isFirst?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onDelete?: (id: string) => void;
  onEditName?: (id: string, newName: string) => void;
  currentStreak?: number;
  isStreakSafe?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  requirement_count: number;
  requirement_type: string;
  color: string;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  drawing_id?: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  chat_session_id: string;
  text: string;
  sender: 'user' | 'ai';
  message_type: 'text' | 'image' | 'feedback';
  image_url?: string;
  created_at: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  prompt: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_time?: number;
  challenge_date: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  profile_picture_url?: string;
  current_streak: number;
  longest_streak: number;
  total_drawings: number;
  average_score: number;
  total_minutes: number;
  level: number;
  experience_points: number;
  pro_status: boolean;
  last_streak_update?: string;
  created_at: string;
  updated_at: string;
}

// Auth-related interfaces
export interface AuthUser {
  id: string;
  email?: string;
  displayName?: string;
}

export interface AuthContext {
  user: AuthUser | null;
  signOut: () => void;
}

// Settings-related interfaces
export interface SettingItemProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onPress: () => void;
  rightElement?: React.ReactNode;
  isProFeature?: boolean;
}

export interface SectionHeaderProps {
  title: string;
}