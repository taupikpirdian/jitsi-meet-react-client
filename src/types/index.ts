export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
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
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}