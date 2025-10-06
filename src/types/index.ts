export interface User {
  id: string | number;
  username?: string;
  email: string;
  name: string;
  avatar?: string | null;
  isModerator?: boolean;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
  participants: string[];
  maxParticipants?: number;
  jwt?: string; // optional JWT returned by backend for this room
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}