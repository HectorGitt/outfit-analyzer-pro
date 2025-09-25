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
	TransactionHistoryResponse,
	TransactionDetailResponse,
} from "@/types/api";

// Authentication API endpoints
export const authAPI = {
	login: (credentials: LoginCredentials) =>
		apiCall<Token>("POST", "auth/login", credentials),

	register: (credentials: RegisterCredentials) =>
		apiCall<{ message: string; user_id?: string; email?: string }>(
			"POST",
			"auth/register",
			credentials
		),

	logout: () => apiCall<void>("POST", "/auth/logout"),

	refreshToken: () => apiCall<AuthUser>("POST", "/auth/refresh"),

	getCurrentUser: () => apiCall<User>("GET", "/auth/me"),

	// Password reset: request email and complete reset
	requestPasswordReset: (email: string) =>
		apiCall<{ message: string; requested: boolean }>(
			"POST",
			"/auth/password/forgot",
			{ email }
		),

	resetPassword: (data: { token: string; password: string }) =>
		apiCall<{ message: string; reset: boolean }>(
			"POST",
			"/auth/password/reset",
			data
		),

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

	// Email verification endpoints
	sendVerificationEmail: (email: string) =>
		apiCall<{ message: string; verification_sent: boolean }>(
			"POST",
			"/auth/send-verification",
			{ email }
		),

	verifyEmail: (token: string) =>
		apiCall<{ success: boolean; message: string; email: string }>(
			"GET",
			`/auth/verify-email?token=${token}`
		),
};

// Fashion Analysis API endpoints
export const fashionAPI = {
	uploadAnalyze: (file: File, preferences?: UserPreferences) =>
		uploadFile("/fashion/upload-analyze", file, { preferences }),

	cameraAnalyze: (file: File, preferences?: UserPreferences) =>
		uploadFile("/fashion/camera-analyze", file, { preferences }),

	getAnalysisHistory: (page = 1, limit = 100) =>
		apiCall<any>("GET", `/users/history?page=${page}&limit=${limit}`),

	getAnalysisById: (id: string) =>
		apiCall<any>("GET", `/fashion/analysis/${id}`),

	getLeaderboard: () => apiCall<any>("GET", "/fashion/leaderboard"),

	getFashionIcon: () => apiCall<any>("GET", "/fashion/fashion-icon"),

	chatbot: (data: ChatbotRequest) =>
		apiCall<ChatbotResponse>("POST", "/fashion/chatbot", data),

	getRealtimeClientSecret: () =>
		apiCall<{ client_secret: string }>(
			"POST",
			"/fashion/realtime-client-secret"
		),
};

// Admin API endpoints
export const adminAPI = {
	getDashboard: () => apiCall<any>("GET", "/admin/dashboard"),

	getAnalytics: (timeRange = "7d") =>
		apiCall<any>("GET", `/admin/analytics?range=${timeRange}`),

	getTrends: () => apiCall<any>("GET", "/admin/trends"),

	getUsers: (params?: {
		page?: number;
		per_page?: number;
		search?: string;
		pricing_tier?: string;
		is_active?: boolean;
	}) => {
		const queryParams = new URLSearchParams();

		if (params?.page) queryParams.append("page", params.page.toString());
		if (params?.per_page)
			queryParams.append("per_page", params.per_page.toString());
		if (params?.search) queryParams.append("search", params.search);
		if (params?.pricing_tier)
			queryParams.append("pricing_tier", params.pricing_tier);
		if (params?.is_active !== undefined)
			queryParams.append("is_active", params.is_active.toString());

		return apiCall<{
			users: Array<{
				id: number;
				username: string;
				email: string;
				full_name?: string;
				is_active: boolean;
				pricing_tier: string;
				subscription_status: string;
				style_preference?: string;
				color_preferences?: string;
				body_type?: string;
				occasion_types?: string;
				budget_range?: string;
				gender?: string;
				country?: string;
				created_at: string;
				updated_at?: string;
				average_fashion_score: number;
				total_scored_analyses: number;
			}>;
			total: number;
			page: number;
			per_page: number;
		}>("GET", `/admin/users?${queryParams.toString()}`);
	},

	getUserById: (id: string) =>
		apiCall<{
			id: number;
			username: string;
			email: string;
			full_name?: string;
			is_active: boolean;
			pricing_tier: string;
			subscription_status: string;
			style_preference?: string;
			color_preferences?: string;
			body_type?: string;
			occasion_types?: string;
			budget_range?: string;
			gender?: string;
			country?: string;
			created_at: string;
			updated_at?: string;
			average_fashion_score: number;
			total_scored_analyses: number;
		}>("GET", `/admin/users/${id}`),

	createUser: (userData: {
		username: string;
		email: string;
		full_name?: string;
		pricing_tier?: string;
		is_active?: boolean;
		style_preference?: string;
		color_preferences?: string;
		body_type?: string;
		occasion_types?: string;
		budget_range?: string;
		gender?: string;
		country?: string;
	}) =>
		apiCall<{
			id: number;
			username: string;
			email: string;
			full_name?: string;
			is_active: boolean;
			pricing_tier: string;
			subscription_status: string;
			style_preference?: string;
			color_preferences?: string;
			body_type?: string;
			occasion_types?: string;
			budget_range?: string;
			gender?: string;
			country?: string;
			created_at: string;
			updated_at?: string;
			average_fashion_score: number;
			total_scored_analyses: number;
		}>("POST", "/admin/users", userData),

	updateUser: (
		id: string,
		userData: {
			full_name?: string;
			pricing_tier?: string;
			is_active?: boolean;
			style_preference?: string;
			color_preferences?: string;
			body_type?: string;
			occasion_types?: string;
			budget_range?: string;
			gender?: string;
			country?: string;
		}
	) =>
		apiCall<{
			id: number;
			username: string;
			email: string;
			full_name?: string;
			is_active: boolean;
			pricing_tier: string;
			subscription_status: string;
			style_preference?: string;
			color_preferences?: string;
			body_type?: string;
			occasion_types?: string;
			budget_range?: string;
			gender?: string;
			country?: string;
			created_at: string;
			updated_at?: string;
			average_fashion_score: number;
			total_scored_analyses: number;
		}>("PUT", `/admin/users/${id}`, userData),

	deleteUser: (id: string) =>
		apiCall<{ message: string }>("DELETE", `/admin/users/${id}`),

	updateUserStatus: (id: string, is_active: boolean) =>
		apiCall<{ message: string }>("PATCH", `/admin/users/${id}/status`, {
			is_active,
		}),

	getActivities: (params?: {
		page?: number;
		per_page?: number;
		user_id?: number;
		activity_type?: string;
		start_date?: string;
		end_date?: string;
	}) =>
		apiCall<{
			activities: Array<{
				id: number;
				user_id: number;
				activity_type: string;
				activity_data?: string;
				timestamp: string;
				ip_address?: string;
				user_agent?: string;
				username: string;
			}>;
			total: number;
			page: number;
			per_page: number;
		}>("GET", "/admin/activities", undefined, params),

	getUserActivities: (
		userId: string,
		params?: {
			page?: number;
			per_page?: number;
			activity_type?: string;
			start_date?: string;
			end_date?: string;
		}
	) =>
		apiCall<{
			activities: Array<{
				id: number;
				user_id: number;
				activity_type: string;
				activity_data?: string;
				timestamp: string;
				ip_address?: string;
				user_agent?: string;
				username: string;
			}>;
			total: number;
			page: number;
			per_page: number;
		}>("GET", `/admin/users/${userId}/activities`, undefined, params),

	getUserStats: (userId: string) =>
		apiCall<{
			user_id: number;
			username: string;
			total_activities: number;
			activity_breakdown: Record<string, number>;
			fashion_analyses: number;
			wardrobe_items: number;
			outfit_plans: number;
			recent_activities: Array<{
				activity_type: string;
				timestamp: string;
				data?: string;
			}>;
		}>("GET", `/admin/users/${userId}/stats`),

	// New admin endpoints for the dashboard
	getAdminAnalytics: () => apiCall<any>("GET", "/admin/analytics"),

	getAdminTrends: () => apiCall<any>("GET", "/admin/trends"),

	getStyleDatabase: () => apiCall<any>("GET", "/admin/style-database"),

	getUserInsights: () => apiCall<any>("GET", "/admin/user-insights"),
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
		wardrobe?: WardrobeItem[];
	}) =>
		apiCall<WardrobeResponse>(
			"GET",
			"calendar/wardrobe",
			undefined,
			params
		),

	getItem: (id: string) => apiCall<WardrobeItem>("GET", `/wardrobe/${id}`),

	createItem: (data: CreateWardrobeItemRequest) =>
		apiCall<WardrobeItem>("POST", "calendar/wardrobe/item_add", data),

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
		uploadFile(
			`calendar/wardrobe/image${id ? `?item_id=${id}` : ""}`,
			file
		),
};

// Outfit Suggestions API endpoints
export const outfitAPI = {
	generateSuggestions: () =>
		apiCall<OutfitSuggestion[]>("POST", "/calendar/outfit-plans"),

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

	generateSuggestion: (data: GenerateOutfitRequest) =>
		apiCall<OutfitSuggestion>(
			"POST",
			"/calendar/outfit-plans/generate",
			data
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

	savePlan: (data: PlanOutfitRequest) =>
		apiCall<OutfitPlan>("POST", "/calendar/outfit-plans/single/save", data),

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

// Payment/Transaction API endpoints
export const paymentAPI = {
	getTransactionHistory: (params?: {
		page?: number;
		limit?: number;
		status?: string;
		startDate?: string;
		endDate?: string;
	}) =>
		apiCall<TransactionHistoryResponse>(
			"GET",
			"/payments/history",
			undefined,
			params
		),

	getTransactionById: (id: string) =>
		apiCall<TransactionDetailResponse>(
			"GET",
			`/payments/transactions/${id}`
		),

	managePayment: () =>
		apiCall<{
			management_link: string;
		}>("GET", "/payments/manage"),
};
