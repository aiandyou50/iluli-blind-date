import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  idToken: string | null;
  isAuthenticated: boolean;
  setIdToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      idToken: null,
      isAuthenticated: false,
      setIdToken: (token) =>
        set({
          idToken: token,
          isAuthenticated: !!token,
        }),
      logout: () =>
        set({
          idToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'iluli-auth',
    }
  )
);
