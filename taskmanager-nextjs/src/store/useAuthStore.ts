'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as api from '@/services/api';
import type { User, RegisterRequest, LoginRequest, GoogleAuthRequest, UpdateUserRequest, ChangePasswordRequest, ResetPasswordRequest } from '@/services/api';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  register: (userData: RegisterRequest) => Promise<boolean>;
  login: (credentials: LoginRequest) => Promise<boolean>;
  googleAuth: (googleData: GoogleAuthRequest) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  getUserProfile: (userId: string) => Promise<void>;
  updateProfile: (userData: UpdateUserRequest) => Promise<boolean>;
  changePassword: (passwordData: ChangePasswordRequest) => Promise<boolean>;
  resetPassword: (resetData: ResetPasswordRequest) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      
      register: async (userData: RegisterRequest) => {
        set({ loading: true, error: null });
        try {
          const user = await api.register(userData);
          if (user) {
            set({ 
              user, 
              isAuthenticated: true, 
              loading: false,
              error: null 
            });
            return true;
          }
          throw new Error('Registration failed');
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || error.message || 'Registration failed';
          set({ 
            error: errorMessage, 
            loading: false,
            user: null,
            isAuthenticated: false 
          });
          return false;
        }
      },
      
      login: async (credentials: LoginRequest) => {
        set({ loading: true, error: null });
        try {
          const user = await api.login(credentials);
          if (user) {
            set({ 
              user, 
              isAuthenticated: true, 
              loading: false,
              error: null 
            });
            return true;
          }
          throw new Error('Login failed');
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || error.message || 'Login failed';
          set({ 
            error: errorMessage, 
            loading: false,
            user: null,
            isAuthenticated: false 
          });
          return false;
        }
      },
      
      googleAuth: async (googleData: GoogleAuthRequest) => {
        set({ loading: true, error: null });
        try {
          const user = await api.googleAuth(googleData);
          if (user) {
            set({ 
              user, 
              isAuthenticated: true, 
              loading: false,
              error: null 
            });
            return true;
          }
          throw new Error('Google authentication failed');
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || error.message || 'Google authentication failed';
          set({ 
            error: errorMessage, 
            loading: false,
            user: null,
            isAuthenticated: false 
          });
          return false;
        }
      },
      
      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null 
        });
        // Clear localStorage auth token if it exists
        if (typeof window !== 'undefined') {
          localStorage.removeItem('organic-mind-auth');
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      getUserProfile: async (userId: string) => {
        set({ loading: true });
        try {
          const user = await api.getUserProfile(userId);
          if (user) {
            set({ 
              user, 
              isAuthenticated: true, 
              loading: false 
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          set({ loading: false });
        }
      },
      
      updateProfile: async (userData: UpdateUserRequest) => {
        const { user } = get();
        if (!user) return false;
        
        set({ loading: true, error: null });
        try {
          const updatedUser = await api.updateUserProfile(user.id, userData);
          if (updatedUser) {
            set({ 
              user: updatedUser, 
              loading: false,
              error: null 
            });
            return true;
          }
          throw new Error('Profile update failed');
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || error.message || 'Profile update failed';
          set({ 
            error: errorMessage, 
            loading: false 
          });
          return false;
        }
      },
      
      changePassword: async (passwordData: ChangePasswordRequest) => {
        const { user } = get();
        if (!user) {
          return false;
        }
        
        set({ loading: true, error: null });
        try {
          await api.changePassword(user.id, passwordData);
          set({ 
            loading: false,
            error: null 
          });
          return true;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || error.message || 'Password change failed';
          set({ 
            error: errorMessage, 
            loading: false 
          });
          return false;
        }
      },
      
      resetPassword: async (resetData: ResetPasswordRequest) => {
        set({ loading: true, error: null });
        try {
          await api.resetPassword(resetData);
          set({ 
            loading: false,
            error: null 
          });
          return true;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || error.message || 'Password reset failed';
          set({ 
            error: errorMessage, 
            loading: false 
          });
          return false;
        }
      },
      
      deleteAccount: async () => {
        const { user } = get();
        if (!user) return false;
        
        set({ loading: true, error: null });
        try {
          await api.deleteAccount(user.id);
          set({ 
            user: null, 
            isAuthenticated: false, 
            loading: false,
            error: null 
          });
          // Clear localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('organic-mind-auth');
          }
          return true;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || error.message || 'Account deletion failed';
          set({ 
            error: errorMessage, 
            loading: false 
          });
          return false;
        }
      },
    }),
    {
      name: 'organic-mind-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;