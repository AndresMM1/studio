"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string) => {
    const response = await fetch('https://bb1c482e0f77e8d6bb0369c6726081.01.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/531c8430edea42c0bb9b7d94d2bfff69/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=DA4hJOx3nQC7RTZpYIvSHQuHvGCFzA1XwxN2KEGVybo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Correo: email }),
    });

    if (!response.ok) {
        throw new Error('Authentication failed');
    }

    const responseData = await response.json();

    if (responseData && responseData.nombre) {
        const userData = { name: responseData.nombre, email };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    } else {
        throw new Error('User data not found in response');
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const value = {
    isAuthenticated: !!user,
    user,
    isLoading,
    login,
    logout,
  };

  if (isLoading) {
     return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
