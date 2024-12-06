export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  bio?: string;
}

export interface Opportunity {
  id: string;
  userId: string;
  content: string;
  audioUrl?: string;
  transcription?: string;
  createdAt: string;
  likes: string[];
  replies: Reply[];
}

export interface Reply {
  id: string;
  userId: string;
  content: string;
  audioUrl?: string;
  transcription?: string;
  createdAt: string;
} 