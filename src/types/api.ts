// API Types for Calendar System
export interface User {
	id: string;
	email: string;
	name: string;
	preferences?: {
		style?: string;
		colors?: string[];
		brands?: string[];
	};
}

export interface CalendarEvent {
	id: string;
	googleEventId?: string;
	title: string;
	description?: string;
	startTime: string;
	endTime: string;
	location?: string;
	eventType:
		| "business"
		| "casual"
		| "formal"
		| "workout"
		| "date"
		| "party"
		| "travel"
		| "other";
	weatherConsideration?: boolean;
	userId: string;
	createdAt: string;
	updatedAt: string;
}

export interface WardrobeItem {
	id: number;
	category:
		| "top"
		| "bottom"
		| "pants"
		| "shirt"
		| "shoes"
		| "accessories"
		| "outerwear"
		| "dress";
	subcategory?: string | null;
	description: string;
	color_primary: string;
	color_secondary?: string | null;
	brand?: string | null;
	size?: string | null;
	season: "spring" | "summer" | "fall" | "winter" | "all";
	occasion: string[];
	image_url?: string | null;
	tags: string[];
	is_favorite: boolean;
	created_at: string;
}

export interface WardrobeResponse {
	wardrobe: WardrobeItem[];
	total_count: number;
	limit: number;
	offset: number;
	has_more: boolean;
	filters: {
		category: string | null;
		season: string | null;
		occasion: string | null;
	};
	message: string;
}

export interface OutfitSuggestion {
	id: string;
	eventId?: string;
	name: string;
	items: WardrobeItem[];
	confidence: number;
	weatherAppropriate: boolean;
	occasionMatch: number;
	aiReasoning: string;
	alternatives: WardrobeItem[][];
	userId: string;
	createdAt: string;
}

export interface OutfitPlan {
	id: string;
	eventId: string;
	selectedOutfit: OutfitSuggestion;
	status: "planned" | "confirmed" | "worn" | "cancelled";
	notes?: string;
	userId: string;
	createdAt: string;
	updatedAt: string;
}

export interface WeatherData {
	temperature: number;
	condition: string;
	humidity: number;
	windSpeed: number;
	precipitation: number;
	location: string;
	date: string;
}

// API Request/Response types
export interface CreateEventRequest {
	title: string;
	description?: string;
	startTime: string;
	endTime: string;
	location?: string;
	eventType: CalendarEvent["eventType"];
	weatherConsideration?: boolean;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
	id: string;
}

export interface CreateWardrobeItemRequest {
	description: string;
	category: WardrobeItem["category"];
	subcategory?: string;
	color_primary: string;
	color_secondary?: string;
	brand?: string;
	size?: string;
	season: WardrobeItem["season"];
	occasion: string[];
	image_url?: string;
	tags?: string[];
	favorite?: boolean;
}

export interface GenerateOutfitRequest {
	eventId?: string;
	eventType: CalendarEvent["eventType"];
	weather?: WeatherData;
	preferences?: {
		colors?: string[];
		brands?: string[];
		avoidItems?: string[];
	};
}

export interface PlanOutfitRequest {
	eventId: string;
	outfitId: string;
	notes?: string;
}

// Chatbot API types
export interface ChatbotRequest {
	message: string;
	conversation_id?: string;
	include_wardrobe?: boolean;
	include_preferences?: boolean;
}

export interface ChatbotResponse {
	response: string;
	conversation_id: string;
	context_used: Record<string, any>;
	message_count?: number;
	remaining_messages?: number;
}

// API Response types
export interface ApiResponse<T> {
	data: T;
	message?: string;
	success: boolean;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	success: boolean;
}

// Google Calendar Integration types (frontend only)
export interface GoogleCalendarToken {
	access_token: string;
	refresh_token?: string;
	expires_in: number;
	token_type: string;
	scope: string;
	expires_at: number;
}

export interface GoogleCalendarTokenRequest extends GoogleCalendarToken {
	user_email: string;
	user_name: string;
}

export interface GoogleCalendarEvent {
	id: string;
	summary: string;
	description?: string;
	start: {
		dateTime?: string;
		date?: string;
		timeZone?: string;
	};
	end: {
		dateTime?: string;
		date?: string;
		timeZone?: string;
	};
	location?: string;
	status: string;
	htmlLink: string;
}
