import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { ACCESS_TOKEN } from "@/config/constants";
import { getItem, removeItem, setItem, zustandStorage } from "@/lib/storage";

export interface AuthUser {
	user_token: string;
	user_phone?: string;
	exp: number;
}

interface AuthState {
	user: AuthUser | null;
	accessToken: string;
	isAuthenticated: boolean;
	setAccessToken: (accessToken: string) => void;
	resetAccessToken: () => void;
	reset: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => {
			const tokenState = getItem(ACCESS_TOKEN);
			const initToken = tokenState ? JSON.parse(tokenState) : "";
			return {
				accessToken: initToken,
				isAuthenticated: false,
				reset: () =>
					set((state) => {
						removeItem(ACCESS_TOKEN);
						return {
							...state,
							accessToken: "",
							isAuthenticated: false,
							user: null,
						};
					}),
				resetAccessToken: () =>
					set((state) => {
						removeItem(ACCESS_TOKEN);
						return { ...state, accessToken: "", isAuthenticated: false };
					}),
				setAccessToken: (accessToken) =>
					set((state) => {
						setItem(ACCESS_TOKEN, JSON.stringify(accessToken));
						return { ...state, accessToken, isAuthenticated: true };
					}),
				setUser: (user) => set((state) => ({ ...state, user })),
				user: null,
			};
		},
		{
			name: "auth-storage", // name of the item in the storage (must be unique)
			storage: createJSONStorage(() => zustandStorage),
		},
	),
);

export const getAuthStoreState = () => useAuthStore.getState();
export const setAuthStoreState = (state: AuthState) => useAuthStore.setState(state);
