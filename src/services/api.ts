import { apiCall, uploadFile } from "@/lib/api";
import {
	LoginCredentials,
	RegisterCredentials,
	AuthUser,
	User,
	UserPreferences,
	Token,
	PersonalStyleGuide,
} from "@/types";
import {
	CalendarEvent,
	WardrobeItem,
	WardrobeResponse,
	OutfitSuggestion,
	OutfitPlan,
	WeatherData,
	CreateEventRequest,
	UpdateEventRequest,
	CreateWardrobeItemRequest,
	GenerateOutfitRequest,
	PlanOutfitRequest,
	PaginatedResponse,
	ChatbotRequest,
	ChatbotResponse,
} from "@/types/api";

// Authentication API endpoints
export const authAPI = {
	login: (credentials: LoginCredentials) =>
		apiCall<Token>("POST", "auth/login", credentials),

	register: (credentials: RegisterCredentials) =>
		apiCall<Token>("POST", "auth/register", credentials),

	logout: () => apiCall<void>("POST", "/auth/logout"),

	refreshToken: () => apiCall<AuthUser>("POST", "/auth/refresh"),

	getCurrentUser: () => apiCall<User>("GET", "/auth/me"),

	// Send Google Calendar token to backend after connection
	sendGoogleCalendarToken: (token: {
		access_token: string;
		refresh_token?: string;
		expires_in: number;
		token_type: string;
		scope: string;
		expires_at: number;
		user_email: string;
		user_name: string;
	}) =>
		apiCall<{ success: boolean; message: string }>(
			"POST",
			"/calendar/google-token",
			token
		),

	// Disconnect Google Calendar from backend
	disconnectGoogleCalendar: () =>
		apiCall<{ success: boolean; message: string }>(
			"DELETE",
			"/calendar/google-token"
		),

	// Check Google Calendar connection status
	getGoogleCalendarStatus: () =>
		apiCall<{
			connected: boolean;
			user_email?: string;
			user_name?: string;
			last_sync?: string;
		}>("GET", "/calendar/google-calendar/status"),

	// Alternative endpoint for connection status
	getConnectionStatus: () =>
		apiCall<{
			google_calendar: {
				connected: boolean;
				user_email?: string;
				user_name?: string;
				last_sync?: string;
				expires_at?: string;
			};
			outlook_calendar?: {
				connected: boolean;
				user_email?: string;
				user_name?: string;
				last_sync?: string;
			};
		}>("GET", "/connection-status"),

	// Clear Google Calendar tokens from frontend storage
	clearGoogleCalendarTokens: () => {
		localStorage.removeItem("google_calendar_token");
		localStorage.removeItem("google_calendar_refresh_token");
		localStorage.removeItem("google_calendar_expires_at");
		localStorage.removeItem("google_calendar_user_email");
		localStorage.removeItem("google_calendar_user_name");
		//console.log("🔐 Google Calendar tokens cleared from frontend storage");
	},

	// Get user pricing tier information
	getPricingTier: () =>
		apiCall<{
			user_id: number;
			pricing_tier: string;
			is_pro: boolean;
			subscription_status: string;
			subscription_start_date?: string;
			subscription_end_date?: string;
			tier_features: {
				name: string;
				max_wardrobe_items?: number;
				max_outfit_generations?: number;
				advanced_features?: boolean;
				image_upload?: boolean;
			};
		}>("GET", "users/pricing-tier"),

	// Get all pricing tiers (public)
	getAllPricingTiers: () =>
		apiCall<{
			success: boolean;
			data: {
				pricing_tiers: Array<{
					name: string;
					price_monthly: number;
					features: Record<string, boolean | number | string>;
				}>;
				recommended_tier: string;
			};
			message: string;
		}>("GET", "users/pricing-tiers/all"),
};

// User API endpoints
export const userAPI = {
	getProfile: () => apiCall<User>("GET", "/users/profile"),

	updateProfile: (userData: Partial<User>) =>
		apiCall<User>("PUT", "/users/profile", userData),

	updatePreferences: (preferences: UserPreferences) =>
		apiCall<PersonalStyleGuide>("PUT", "/users/preferences", preferences),

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
		apiCall<any>("GET", `/users/history?page=${page}&limit=${limit}`),

	getAnalysisById: (id: string) =>
		apiCall<any>("GET", `/fashion/analysis/${id}`),

	getLeaderboard: () => apiCall<any>("GET", "/fashion/leaderboard"),

	getFashionIcon: () => apiCall<any>("GET", "/fashion/fashion-icon"),

	chatbot: (data: ChatbotRequest) =>
		apiCall<ChatbotResponse>("POST", "/fashion/chatbot", data),
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

// Calendar Events API endpoints
export const calendarAPI = {
	getEvents: (params?: {
		startDate?: string;
		endDate?: string;
		eventType?: string;
		page?: number;
		limit?: number;
	}) =>
		apiCall<PaginatedResponse<CalendarEvent>>(
			"GET",
			"/calendar/events",
			undefined,
			params
		),

	getEvent: (id: string) =>
		apiCall<CalendarEvent>("GET", `/calendar/events/${id}`),

	createEvent: (data: CreateEventRequest) =>
		apiCall<CalendarEvent>("POST", "/calendar/events", data),

	updateEvent: (data: UpdateEventRequest) =>
		apiCall<CalendarEvent>("PUT", `/calendar/events/${data.id}`, data),

	deleteEvent: (id: string) =>
		apiCall<void>("DELETE", `/calendar/events/${id}`),

	syncGoogleCalendarEvents: (
		events: {
			googleEventId: string;
			title: string;
			description?: string;
			startTime: string;
			endTime: string;
			location?: string;
		}[]
	) =>
		apiCall<CalendarEvent[]>("POST", "/calendar/events/sync-google", {
			events,
		}),
};

// Wardrobe API endpoints
export const wardrobeAPI = {
	getItems: (params?: {
		category?: string;
		occasion?: string;
		season?: string;
		limit?: number;
		offset?: number;
		wardrobe: WardrobeItem[];
	}) =>
		apiCall<WardrobeResponse>(
			"GET",
			"calendar/wardrobe",
			undefined,
			params
		),

	getItem: (id: string) => apiCall<WardrobeItem>("GET", `/wardrobe/${id}`),

	createItem: (data: CreateWardrobeItemRequest) =>
		apiCall<WardrobeItem>("POST", "calendar/wardrobe", data),

	createBulkItems: (description: string) =>
		apiCall<{ success: boolean; count: number; message: string }>(
			"POST",
			"calendar/wardrobe",
			{ description }
		),

	updateItem: (id: string, data: Partial<CreateWardrobeItemRequest>) =>
		apiCall<WardrobeItem>("PUT", `/calendar/wardrobe/${id}`, data),

	deleteItem: (id: string) =>
		apiCall<void>("DELETE", `/calendar/wardrobe/${id}`),

	markItemWorn: (id: string, date: string) =>
		apiCall<WardrobeItem>("PUT", `/calendar/wardrobe/${id}/worn`, {
			date,
		}),

	uploadItemImage: (id: string, file: File) =>
		uploadFile(`calendar/wardrobe/${id}/image`, file),
};

// Outfit Suggestions API endpoints
export const outfitAPI = {
	generateSuggestions: (data: GenerateOutfitRequest) =>
		apiCall<OutfitSuggestion[]>("POST", "/calendar/outfit-plans", data),

	getSuggestions: (params?: {
		eventId?: string;
		page?: number;
		limit?: number;
	}) =>
		apiCall<PaginatedResponse<OutfitSuggestion>>(
			"GET",
			"/outfits",
			undefined,
			params
		),

	getSuggestion: (id: string) =>
		apiCall<OutfitSuggestion>("GET", `/outfits/${id}`),

	saveSuggestion: (id: string) =>
		apiCall<OutfitSuggestion>("POST", `/outfits/${id}/save`),

	deleteSuggestion: (id: string) => apiCall<void>("DELETE", `/outfits/${id}`),
};

// Outfit Planning API endpoints
export const planningAPI = {
	planOutfit: (data: PlanOutfitRequest) =>
		apiCall<OutfitPlan>("POST", "calendar/outfit-plans", data),

	getPlans: (params?: {
		eventId?: string;
		status?: string;
		startDate?: string;
		endDate?: string;
		page?: number;
		limit?: number;
	}) =>
		apiCall<PaginatedResponse<OutfitPlan>>(
			"GET",
			"calendar/outfit-plans",
			undefined,
			params
		),

	getPlan: (id: string) => apiCall<OutfitPlan>("GET", `/plans/${id}`),

	updatePlan: (
		id: string,
		data: {
			status?: OutfitPlan["status"];
			notes?: string;
			outfitId?: string;
		}
	) => apiCall<OutfitPlan>("PUT", `/plans/${id}`, data),

	deletePlan: (id: string) => apiCall<void>("DELETE", `/plans/${id}`),
};

// Weather API endpoints
export const weatherAPI = {
	getWeather: (params: {
		location?: string;
		lat?: number;
		lon?: number;
		date?: string;
	}) => apiCall<WeatherData>("GET", "/weather", undefined, params),
};

// Analytics API endpoints
export const analyticsAPI = {
	getOutfitAnalytics: (params?: { startDate?: string; endDate?: string }) =>
		apiCall<{
			totalOutfits: number;
			favoriteItems: WardrobeItem[];
			colorDistribution: { color: string; count: number }[];
			occasionBreakdown: { occasion: string; count: number }[];
			monthlyTrends: { month: string; outfits: number }[];
		}>("GET", "/analytics/outfits", undefined, params),
};
