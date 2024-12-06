export interface Opportunity {
  id: string;
  userId: string;
  userName?: string;
  userPhotoUrl?: string;
  content: string;
  audioUrl?: string;
  createdAt: string;
  likes: string[];
  replies?: {
    id: string;
    content: string;
    userId: string;
    createdAt: string;
  }[];
} 