import { apiCall, uploadFile } from "@/lib/api";
import {
	LoginCredentials,
	RegisterCredentials,
	AuthUser,
	User,
	UserPreferences,
	Token,
} from "@/types";

// Authentication API endpoints
export const authAPI = {
	login: (credentials: LoginCredentials) =>
		apiCall<Token>("POST", "auth/login", credentials),

	register: (credentials: RegisterCredentials) =>
		apiCall<Token>("POST", "auth/register", credentials),

	logout: () => apiCall<void>("POST", "/auth/logout"),

	refreshToken: () => apiCall<AuthUser>("POST", "/auth/refresh"),

	getCurrentUser: () => apiCall<User>("GET", "/auth/me"),
};

// User API endpoints
export const userAPI = {
	getProfile: () => apiCall<User>("GET", "/users/profile"),

	updateProfile: (userData: Partial<User>) =>
		apiCall<User>("PUT", "/users/profile", userData),

	updatePreferences: (preferences: UserPreferences) =>
		apiCall<UserPreferences>("PUT", "/users/preferences", preferences),

	getPreferences: () => apiCall<UserPreferences>("GET", `/users/preferences`),

	getWardrobeBuilder: () => apiCall<any>("GET", "/users/wardrobe-builder"),
};

// Fashion Analysis API endpoints
export const fashionAPI = {
	uploadAnalyze: (file: File, preferences?: UserPreferences) =>
		uploadFile("/fashion/upload-analyze", file, { preferences }),

	cameraAnalyze: (file: File, preferences?: UserPreferences) =>
		uploadFile("/fashion/camera-analyze", file, { preferences }),

	getAnalysisHistory: (page = 1, limit = 10) =>
		apiCall<any>("GET", `/fashion/history?page=${page}&limit=${limit}`),

	getAnalysisById: (id: string) =>
		apiCall<any>("GET", `/fashion/analysis/${id}`),

	getLeaderboard: () => apiCall<any>("GET", "/fashion/leaderboard"),

	getFashionIcon: () => apiCall<any>("GET", "/fashion/fashion-icon"),
};

// Admin API endpoints
export const adminAPI = {
	getDashboard: () => apiCall<any>("GET", "/admin/dashboard"),

	getAnalytics: (timeRange = "7d") =>
		apiCall<any>("GET", `/admin/analytics?range=${timeRange}`),

	getTrends: () => apiCall<any>("GET", "/admin/trends"),

	getUsers: (page = 1, limit = 20) =>
		apiCall<any>("GET", `/admin/users?page=${page}&limit=${limit}`),

	getUserById: (id: string) => apiCall<any>("GET", `/admin/users/${id}`),
};
