import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
  status: number;
  roles?: Array<{ id: string; name: string; code: string }>;
  permissions?: string[];
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setToken: (token: string) => void;
}

let rehydrateResolve: () => void;
export const authRehydratePromise = new Promise<void>((resolve) => {
  rehydrateResolve = resolve;
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      login: (token, refreshToken, user) =>
        set({ token, refreshToken, user, isAuthenticated: true }),
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      setToken: (token) => set({ token }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (_state, _error) => {
        rehydrateResolve();
      },
    },
  ),
);
