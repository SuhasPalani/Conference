// FILE: frontend/src/hooks/useAuth.ts
import { create } from 'zustand';
import { authAPI } from '@/services/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean; // NEW: Track if auth check is done
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('token'),
  isInitialized: false, // NEW

  login: async (email, password, rememberMe = false) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.login({ email, password, rememberMe });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ 
        user: data.user, 
        token: data.token, 
        isAuthenticated: true, 
        isLoading: false,
        isInitialized: true 
      });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email, password, fullName) => {
    set({ isLoading: true });
    try {
      await authAPI.register({ email, password, fullName });
      set({ isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false, isInitialized: true });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      set({ isAuthenticated: false, user: null, isInitialized: true });
      return;
    }

    try {
      const { data } = await authAPI.getMe();
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ 
        user: data.user, 
        isAuthenticated: true,
        isInitialized: true 
      });
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        isInitialized: true 
      });
    }
  },

  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
}));