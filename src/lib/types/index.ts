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
  userName: string;
  userPhotoUrl?: string;
  content: string;
  createdAt: string;
  likes: string[];
  replies: Array<{
    id: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: string;
  }>;
}

export interface Reply {
  id: string;
  userId: string;
  content: string;
  audioUrl?: string;
  transcription?: string;
  createdAt: string;
}

// Generic type for Firestore document data
export type FirestoreData = {
  id?: string;
  userId?: string;
  userName?: string;
  userPhotoUrl?: string;
  content?: string;
  createdAt?: string;
  likes?: string[];
  replies?: Reply[];
  audioUrl?: string;
  transcription?: string;
  [key: string]: any;
} 