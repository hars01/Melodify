import { api } from './api';
import { User, UserRole } from '@/types';

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginPayload {
  username?: string;
  email?: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export const authService = {
  /**
   * Register a new user or artist
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/register', payload);
  },

  /**
   * Log in an existing user
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', payload);
  },

  /**
   * Log out the current user and clear auth cookies
   */
  async logout(): Promise<{ message: string }> {
    return api.post<{ message: string }>('/auth/logout');
  },
};
