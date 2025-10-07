import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import api from '../api/axios';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('videomeet_user');
    const savedToken = localStorage.getItem('videomeet_token');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('videomeet_user');
      }
    }
    if (savedToken) {
      setToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const data = response.data?.data;
      if (!data || !data.token) throw new Error('Invalid response');

      // Normalize avatar URL: if backend returns a relative path, prefix with API base URL
      const rawAvatar: string | undefined = data.profile?.avatar_url;
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const normalizedAvatar = rawAvatar
        ? (rawAvatar.startsWith('http')
            ? rawAvatar
            : rawAvatar.startsWith('/') && apiBase
              ? `${apiBase}${rawAvatar}`
              : rawAvatar)
        : null;

      const userPayload: User = {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.name || data.user?.username || email,
        avatar: normalizedAvatar,
        isModerator: Boolean(data.user?.is_moderator),
      };

      // Persist
      setUser(userPayload);
      setToken(data.token);
      localStorage.setItem('videomeet_user', JSON.stringify(userPayload));
      localStorage.setItem('videomeet_token', data.token);

      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('videomeet_user');
    localStorage.removeItem('videomeet_token');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};