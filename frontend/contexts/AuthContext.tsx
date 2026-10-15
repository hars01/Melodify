'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '@/types';
import { authService, LoginPayload, RegisterPayload } from '@/services/authService';
import { userStorage } from '@/utils/storage';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isArtist: boolean;
  isAdmin: boolean;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: showError } = useToast();

  // Load persisted user session from storage on initial mount
  useEffect(() => {
    try {
      const savedUser = userStorage.get();
      if (savedUser) {
        setUser(savedUser);
      }
    } catch (err) {
      console.error('Failed to load user session', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (payload: LoginPayload): Promise<boolean> => {
      try {
        setIsLoading(true);
        const res = await authService.login(payload);
        if (res.user) {
          setUser(res.user);
          userStorage.set(res.user);
          success('Welcome Back!', `Logged in as ${res.user.username}`);
          return true;
        }
        return false;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        showError('Authentication Failed', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [success, showError]
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<boolean> => {
      try {
        setIsLoading(true);
        const res = await authService.register(payload);
        if (res.user) {
          setUser(res.user);
          userStorage.set(res.user);
          success('Account Created!', `Welcome to Melodify, ${res.user.username}`);
          return true;
        }
        return false;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        showError('Registration Failed', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [success, showError]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout API call failed:', err);
    } finally {
      setUser(null);
      userStorage.remove();
      success('Logged Out', 'You have been safely signed out.');
    }
  }, [success]);

  const refreshUser = useCallback(() => {
    const updated = userStorage.get();
    setUser(updated);
  }, []);

  const isAuthenticated = !!user;
  const isArtist = user?.role === 'artist' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isArtist,
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
