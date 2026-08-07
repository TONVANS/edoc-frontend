// src/store/useAuthStore.ts
import { create } from 'zustand';
import Cookies from 'js-cookie';
import api from '../lib/api';
import { User, AuthResponse } from '../types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (empCode: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (empCode, password) => {
    set({ isLoading: true });
    try {
      // Assuming the endpoint is /auth/login as per requirements
      const response = await api.post<AuthResponse>('/auth/login', { empCode, password });

      const { accessToken, user } = response.data.data;

      // Save accessToken in Cookie with expiration of exactly 8 hours (8/24 days)
      Cookies.set('accessToken', accessToken, { expires: 8 / 24 });

      // Save the user object in localStorage
      localStorage.setItem('user', JSON.stringify(user));

      // Update Zustand state
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error; // Propagate error to the component for handling (e.g., showing a toast)
    }
  },

  logout: () => {
    Cookies.remove('accessToken');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  initialize: () => {
    const token = Cookies.get('accessToken');
    const storedUserStr = localStorage.getItem('user');

    if (!token) {
      // If cookie is missing or expired, remove user data and reset state
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    } else if (storedUserStr) {
      try {
        const user: User = JSON.parse(storedUserStr);
        set({ user, isAuthenticated: true });
      } catch (e) {
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false });
      }
    }
  },
}));