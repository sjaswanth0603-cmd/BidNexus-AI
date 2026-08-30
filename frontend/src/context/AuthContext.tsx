import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: any) => Promise<User>;
  logout: () => void;
  fastLogin: (email: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(() => !!localStorage.getItem('token'));

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const currentUser = await authService.getMe();
          setUser(currentUser);
        } catch (err) {
          console.error('Session expired or invalid, auto-logging in demo user:', err);
          try {
            const data = await authService.login({ email: 'user@example.com', password: 'Password@123' });
            localStorage.setItem('token', data.access_token);
            setToken(data.access_token);
            setUser(data.user);
          } catch {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        }
      } else {
        try {
          const data = await authService.login({ email: 'user@example.com', password: 'Password@123' });
          localStorage.setItem('token', data.access_token);
          setToken(data.access_token);
          setUser(data.user);
        } catch {
          // Ignore fallback if offline
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials: any) => {
    const data = await authService.login(credentials);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const fastLogin = async (email: string) => {
    return login({ email, password: 'Password@123' });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        fastLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
