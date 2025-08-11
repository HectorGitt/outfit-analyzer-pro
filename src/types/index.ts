// Core data models for the outfit analyzer application

export interface User {
	id: string;
	username: string;
	email: string;
	preferences: UserPreferences;
	createdAt: string;
	updatedAt: string;
}

export interface UserPreferences {
	style_preference: string[];
	color_preferences: string[];
	body_type?: string;
	occasion_types: string[];
	budget_range?: string;
}

export interface FashionAnalysis {
	id: string;
	overall_score: number;
	color_harmony: number;
	style_coherence: number;
	suggestions: string[];
	improvements: string[];
	analysis_text: string;
	created_at: string;
	image_url?: string;
	user_id: string;
}

export interface FashionAnalysisResponse {
	success: boolean;
	message: string;
	data: {
		analysis: {
			overall_rating: number;
			color_analysis: string;
			texture_analysis: string;
			fit_analysis: string;
			improvements: string;
			alternatives: string;
			occasion: string;
			trends: string;
		};
		recommendations: {
			immediate_improvements: string[];
			shopping_list: string[];
			styling_alternatives: string[];
			color_palette: string[];
			accessories: string[];
		};
	};
}

export interface AuthUser {
	id: string;
	username: string;
	email: string;
	avatar?: string;
	role: "user" | "admin";
	token: string;
}

export interface LoginCredentials {
	username: string;
	password: string;
}

export interface Token {
	access_token: string;
	token_type: string;
	user_info: {
		id: string;
		username: string;
		email: string;
		full_name: string;
	};
}
export interface RegisterCredentials {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
	full_name: string;
}

export interface AnalysisRequest {
	image: File | string;
	preferences?: UserPreferences;
}

export interface WardrobeRecommendation {
	id: string;
	title: string;
	description: string;
	items: WardrobeItem[];
	occasion: string;
	season: string;
	budget_range: string;
}

export interface WardrobeItem {
	id: string;
	name: string;
	category: string;
	color: string;
	brand?: string;
	price?: number;
	image_url?: string;
}

export interface AdminAnalytics {
	total_users: number;
	total_analyses: number;
	active_users_today: number;
	popular_styles: Array<{
		style: string;
		count: number;
	}>;
	color_trends: Array<{
		color: string;
		usage_percentage: number;
	}>;
}

export interface StyleOption {
	id: string;
	name: string;
	description: string;
	icon?: string;
}

export interface ColorOption {
	id: string;
	name: string;
	hex: string;
	rgb: string;
}

export interface BodyTypeOption {
	id: string;
	name: string;
	description: string;
	tips: string[];
}

export interface OccasionOption {
	id: string;
	name: string;
	description: string;
	styles: string[];
}

// API Response types
export interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}
