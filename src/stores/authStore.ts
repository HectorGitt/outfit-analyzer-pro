import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
	AuthUser,
	LoginCredentials,
	RegisterCredentials,
	User,
	Token,
} from "@/types";
import { authAPI } from "@/services/api";
import { pricingTiers } from "@/lib/pricingTiers";
import { apiCall } from "@/lib/api";

interface AuthState {
	user: AuthUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	errorDetails: {
		message: string;
		statusCode?: number;
		validationErrors?: Record<string, string[]>;
		timestamp?: string;
		details?: any;
	} | null;
	pricingTier: keyof typeof pricingTiers;
}

interface AuthActions {
	login: (credentials: LoginCredentials) => Promise<boolean>;
	register: (credentials: RegisterCredentials) => Promise<boolean>;
	logout: () => void;
	clearError: () => void;
	updateUser: (userData: Partial<User>) => void;
	updatePricingTier: (tier: keyof typeof pricingTiers) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
	persist(
		(set, get) => ({
			user: null,
			isAuthenticated: false,
			isLoading: false,
			error: null,
			errorDetails: null,
			pricingTier: "free" as keyof typeof pricingTiers,

			// Helper function to fetch user's pricing tier (deprecated - now handled by React Query)
			// fetchUserPricingTier: async () => {
			// 	try {
			// 		const response = await apiCall(
			// 			"GET",
			// 			"/users/pricing-tier"
			// 		);
			// 		const data = response.data as any;
			// 		const tierKey = data.pricing_tier || "free";
			// 		set({ pricingTier: tierKey as keyof typeof pricingTiers });
			// 		console.log("✅ User pricing tier loaded:", tierKey);
			// 	} catch (error) {
			// 		console.warn(
			// 			"⚠️ Failed to fetch user pricing tier, keeping default 'free' tier:",
			// 			error
			// 		);
			// 		if (error.response?.status === 401) {
			// 			//logout
			// 			get().logout();
			// 			console.log("🔒 Logged out due to unauthorized access");
			// 		}
			// 		// Keep default 'free' tier if API fails
			// 	}
			// },

			login: async (credentials: LoginCredentials) => {
				set({ isLoading: true, error: null, errorDetails: null });
				try {
					const response = await authAPI.login(credentials);
					//console.log("Login response:", response);

					const tokenData = response.data;
					//console.log("Token data:", tokenData);

					// Check if we have the expected structure
					if (!tokenData) {
						throw new Error("No token data received from server");
					}

					// Handle different possible response structures
					let userInfo: any, accessToken: string;

					if (tokenData.user_info && tokenData.access_token) {
						// Expected FastAPI structure
						userInfo = tokenData.user_info;
						accessToken = tokenData.access_token;
						const tierInfo = userInfo.tier;
						console.log("Tier info from login:", tierInfo);
					} else if (
						(tokenData as any).user &&
						(tokenData as any).token
					) {
						// Alternative structure
						userInfo = (tokenData as any).user;
						accessToken = (tokenData as any).token;
						const tierInfo = (tokenData as any).tier;
						console.log("Tier info from login:", tierInfo);
					} else if (tokenData.access_token) {
						// Token only structure - extract user info from token or use defaults
						accessToken = tokenData.access_token;

						userInfo = {
							id: credentials.username, // fallback
							username: credentials.username,
							email: credentials.username, // fallback
							tier: "free", // fallback
						};
					} else {
						throw new Error(
							"Invalid response structure from server"
						);
					}

					// Get the tier from the response
					const userTier =
						userInfo.tier || (tokenData as any).tier || "free";
					console.log("Final user tier:", userTier);

					// Transform Token response to AuthUser
					const authUser: AuthUser = {
						id: userInfo.id || userInfo.username || "unknown",
						username: userInfo.username || credentials.username,
						email: userInfo.email || credentials.username,
						avatar: undefined, // Backend doesn't provide avatar in login response
						role: "user", // Default role, could be enhanced with backend role info
						token: accessToken,
						pricingTier: userTier,
					};

					// Store token for API requests
					localStorage.setItem("auth_token", accessToken);

					set({
						user: authUser,
						isAuthenticated: true,
						isLoading: false,
						error: null,
						errorDetails: null,
						pricingTier: userTier as keyof typeof pricingTiers,
					});

					// Note: Pricing tier will be fetched automatically by React Query hooks when needed
					// No need to manually fetch here as it would duplicate the API call

					return true; // Success
				} catch (error: any) {
					const errorDetails = {
						message: error.message || "Login failed",
						statusCode: error.status,
						validationErrors: error.validationErrors,
						timestamp: new Date().toISOString(),
						details: error.details,
					};

					console.error(
						"Login failed - Full error details:",
						errorDetails
					);

					set({
						isLoading: false,
						error: error.message || "Login failed",
						errorDetails,
					});
					return false; // Failure
				}
			},

			register: async (credentials: RegisterCredentials) => {
				set({ isLoading: true, error: null, errorDetails: null });
				try {
					const response = await authAPI.register(credentials);

					// Registration successful - no token expected yet
					// User needs to verify email before getting token
					set({
						isLoading: false,
						error: null,
						errorDetails: null,
					});
					return true;
				} catch (error: any) {
					console.error("Registration error:", error);

					let errorMessage = "Registration failed";
					let errorDetails = null;

					if (error?.response?.data) {
						errorDetails = error.response.data;
						errorMessage =
							error.response.data.message || errorMessage;
					} else if (error?.message) {
						errorMessage = error.message;
					}

					set({
						isLoading: false,
						error: errorMessage,
						errorDetails,
					});
					return false;
				}
			},

			logout: () => {
				localStorage.removeItem("auth_token");
				set({
					user: null,
					isAuthenticated: false,
					pricingTier: "free" as keyof typeof pricingTiers,
					error: null,
					errorDetails: null,
				});
			},

			clearError: () => {
				set({ error: null, errorDetails: null });
			},

			updateUser: (userData: Partial<User>) => {
				const currentUser = get().user;
				if (currentUser) {
					set({
						user: {
							...currentUser,
							...userData,
						},
					});
				}
			},

			updatePricingTier: (tier: keyof typeof pricingTiers) => {
				set({ pricingTier: tier });
			},
		}),
		{
			name: "auth-storage",
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
				pricingTier: state.pricingTier,
			}),
		}
	)
);
