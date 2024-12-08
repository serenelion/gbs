export interface Opportunity {
  id: string;
  userId: string;
  userName: string;
  userPhotoUrl: string | null;
  content: string;
  audioUrl?: string | null;
  createdAt: string;
  likes: string[];
  replies: string[];
}

// Generic type for Firestore document data
export type FirestoreData = {
  id?: string;
  userId?: string;
  userName?: string;
  userPhotoUrl?: string;
  content?: string;
  audioUrl?: string;
  createdAt?: string;
  likes?: string[];
  replies?: Reply[];
  transcription?: string;
  [key: string]: any;
};

export interface Reply {
  id: string;
  userId: string;
  userName: string;
  userPhotoUrl: string | null;
  content: string;
  audioUrl?: string | null;
  createdAt: string;
} 