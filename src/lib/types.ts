// lib/types.ts

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: 'member' | 'leader' | 'pastor' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  author?: Profile;
  content: string;
  image_url: string | null;
  visibility: 'public' | 'church' | 'private';
  post_type: 'post' | 'prayer' | 'event' | 'announcement';
  created_at: string;
  updated_at: string;
  reactions?: ReactionCount;
  comments_count?: number;
  user_reaction?: string | null;
}

export interface ReactionCount {
  love: number;
  amen: number;
  praying: number;
}

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: 'love' | 'amen' | 'praying';
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author?: Profile;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface PrayerRequest {
  id: string;
  author_id: string;
  author?: Profile;
  content: string;
  is_answered: boolean;
  created_at: string;
  updated_at: string;
  praying_count?: number;
  is_praying?: boolean;
}

export interface PrayerSupport {
  id: string;
  prayer_id: string;
  user_id: string;
  created_at: string;
}

export interface Event {
  id: string;
  author_id: string;
  author?: Profile;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  sender?: Profile;
  receiver_id: string;
  receiver?: Profile;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'reaction' | 'comment' | 'follow' | 'prayer' | 'message';
  reference_id: string | null;
  message: string;
  read_at: string | null;
  created_at: string;
}

// Additional utility types
export type ReactionType = 'love' | 'amen' | 'praying';
export type PostType = 'post' | 'prayer' | 'event' | 'announcement';
export type Visibility = 'public' | 'church' | 'private';
export type UserRole = 'member' | 'leader' | 'pastor' | 'admin';
export type NotificationType = 'reaction' | 'comment' | 'follow' | 'prayer' | 'message';

// Database response types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'> & {
          id: string;
        };
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'author' | 'reactions' | 'comments_count' | 'user_reaction'>;
        Update: Partial<Omit<Post, 'id' | 'created_at' | 'author_id'>>;
      };
      reactions: {
        Row: Reaction;
        Insert: Omit<Reaction, 'id' | 'created_at'>;
        Update: Partial<Omit<Reaction, 'id' | 'created_at'>>;
      };
      comments: {
        Row: Comment;
        Insert: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'author'>;
        Update: Partial<Omit<Comment, 'id' | 'created_at' | 'author_id'>>;
      };
      follows: {
        Row: Follow;
        Insert: Omit<Follow, 'id' | 'created_at'>;
        Update: never;
      };
      prayer_requests: {
        Row: PrayerRequest;
        Insert: Omit<PrayerRequest, 'id' | 'created_at' | 'updated_at' | 'author' | 'praying_count' | 'is_praying'>;
        Update: Partial<Omit<PrayerRequest, 'id' | 'created_at' | 'author_id'>>;
      };
      prayer_support: {
        Row: PrayerSupport;
        Insert: Omit<PrayerSupport, 'id' | 'created_at'>;
        Update: never;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'author'>;
        Update: Partial<Omit<Event, 'id' | 'created_at' | 'author_id'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at' | 'sender' | 'receiver'>;
        Update: Partial<Omit<Message, 'id' | 'created_at' | 'sender_id' | 'receiver_id'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id' | 'created_at' | 'user_id'>>;
      };
    };
  };
}