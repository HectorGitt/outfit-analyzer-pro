import {
	GoogleCalendarToken,
	GoogleCalendarEvent,
	GoogleCalendarTokenRequest,
} from "@/types/api";
import { authAPI } from "./api";

// Extend Window interface to include gapi
declare global {
	interface Window {
		gapi: any;
	}
}

class GoogleCalendarService {
	private static readonly CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
	private static readonly DISCOVERY_DOC =
		"https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";
	private static readonly SCOPES =
		"https://www.googleapis.com/auth/calendar.readonly";
	private static readonly REDIRECT_URI = `${window.location.origin}/calendar-connect`;

	private gapi: any;
	private isInitialized = false;

	constructor() {
		this.loadGoogleAPI();
	}

	private async loadGoogleAPI(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (typeof window === "undefined") {
				reject(
					new Error(
						"Google API not available in server-side environment"
					)
				);
				return;
			}

			if (window.gapi) {
				this.gapi = window.gapi;
				resolve();
				return;
			}

			// Check if script is already being loaded
			const existingScript = document.querySelector(
				'script[src="https://apis.google.com/js/api.js"]'
			);
			if (existingScript) {
				existingScript.addEventListener("load", () => {
					this.gapi = window.gapi;
					resolve();
				});
				return;
			}

			const script = document.createElement("script");
			script.src = "https://apis.google.com/js/api.js";
			script.async = true;
			script.defer = true;

			script.onload = () => {
				// Add a small delay to ensure gapi is fully loaded
				setTimeout(() => {
					if (window.gapi) {
						this.gapi = window.gapi;
						resolve();
					} else {
						reject(
							new Error(
								"Google API loaded but gapi object not available"
							)
						);
					}
				}, 100);
			};

			script.onerror = (error) => {
				console.error("Failed to load Google API script:", error);
				reject(new Error("Failed to load Google API"));
			};

			document.head.appendChild(script);
		});
	}

	async initialize(): Promise<void> {
		if (this.isInitialized) return;

		try {
			await this.loadGoogleAPI();

			if (!this.gapi) {
				throw new Error("Google API not loaded");
			}

			// Load auth2 and client libraries
			await new Promise<void>((resolve, reject) => {
				this.gapi.load("client:auth2", {
					callback: () => {
						console.log("Google API libraries loaded successfully");
						resolve();
					},
					onerror: (error: any) => {
						console.error(
							"Failed to load Google API libraries:",
							error
						);
						reject(
							new Error("Failed to load Google API libraries")
						);
					},
				});
			});

			// Validate environment variables
			if (!GoogleCalendarService.CLIENT_ID) {
				throw new Error(
					"Google Client ID not configured. Please check VITE_GOOGLE_CLIENT_ID environment variable."
				);
			}

			// Initialize the Google API client
			await this.gapi.client.init({
				discoveryDocs: [GoogleCalendarService.DISCOVERY_DOC],
				clientId: GoogleCalendarService.CLIENT_ID,
				scope: GoogleCalendarService.SCOPES,
			});

			console.log("Google Calendar API initialized successfully");
			this.isInitialized = true;
		} catch (error) {
			console.error("Google Calendar API initialization failed:", error);
			this.isInitialized = false;
			throw error;
		}
	}

	async signIn(): Promise<GoogleCalendarToken> {
		// Use redirect flow instead of popup
		return this.signInWithRedirect();
	}

	// New method for redirect-based authentication
	async signInWithRedirect(): Promise<GoogleCalendarToken> {
		try {
			console.log("Initiating Google Calendar OAuth redirect...");

			// Check if we're returning from OAuth callback
			const urlParams = new URLSearchParams(window.location.search);
			const authCode = urlParams.get("code");
			const error = urlParams.get("error");

			if (error) {
				throw new Error(`OAuth error: ${error}`);
			}

			if (authCode) {
				// We're returning from OAuth, exchange code for token
				return await this.handleOAuthCallback(authCode);
			} else {
				// Initiate OAuth flow
				this.redirectToGoogleAuth();
				// This will redirect, so we never actually return from here
				throw new Error("Redirecting to Google OAuth...");
			}
		} catch (error) {
			console.error("Google Calendar sign-in failed:", error);

			// Clean up any partial state
			localStorage.removeItem("google_calendar_token");
			localStorage.removeItem("google_calendar_user");

			// Re-throw with more specific error message
			if (error instanceof Error) {
				throw new Error(
					`Google Calendar authentication failed: ${error.message}`
				);
			} else {
				throw new Error(
					"Google Calendar authentication failed: Unknown error"
				);
			}
		}
	}

	// Redirect to Google OAuth
	private redirectToGoogleAuth(): void {
		const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
		authUrl.searchParams.set("client_id", GoogleCalendarService.CLIENT_ID);
		authUrl.searchParams.set(
			"redirect_uri",
			GoogleCalendarService.REDIRECT_URI
		);
		authUrl.searchParams.set("response_type", "code");
		authUrl.searchParams.set("scope", GoogleCalendarService.SCOPES);
		authUrl.searchParams.set("access_type", "offline");
		authUrl.searchParams.set("prompt", "consent");
		authUrl.searchParams.set("include_granted_scopes", "true");

		console.log("🔗 Redirect URI:", GoogleCalendarService.REDIRECT_URI);
		console.log("🔗 Full auth URL:", authUrl.toString());
		window.location.href = authUrl.toString();
	}

	// Handle OAuth callback and exchange code for token
	private async handleOAuthCallback(
		authCode: string
	): Promise<GoogleCalendarToken> {
		try {
			console.log(
				"Handling OAuth callback with code:",
				authCode.substring(0, 20) + "..."
			);

			// Exchange authorization code for access token
			const tokenResponse = await this.exchangeCodeForToken(authCode);

			console.log("Token exchange successful");

			// Get user info using the access token
			//const userInfo = await this.getUserInfo(tokenResponse.access_token);

			const userInfo = {
				email: "",
				name: "",
			};

			// Send token to backend for server-side integration
			try {
				console.log("Sending token to backend...");
				const tokenRequest: GoogleCalendarTokenRequest = {
					...tokenResponse,
					user_email: userInfo.email,
					user_name: userInfo.name,
				};

				await authAPI.sendGoogleCalendarToken(tokenRequest);
				console.log(
					"✅ Google Calendar token successfully sent to backend"
				);
			} catch (error) {
				console.error(
					"❌ Failed to send Google Calendar token to backend:",
					error
				);
				// Continue with frontend-only flow even if backend call fails
			}

			// Clean up URL parameters
			const url = new URL(window.location.href);
			url.searchParams.delete("code");
			url.searchParams.delete("scope");
			url.searchParams.delete("authuser");
			url.searchParams.delete("prompt");
			window.history.replaceState({}, document.title, url.toString());

			return tokenResponse;
		} catch (error) {
			console.error("Failed to handle OAuth callback:", error);
			throw error;
		}
	}

	// Exchange authorization code for access token
	private async exchangeCodeForToken(
		authCode: string
	): Promise<GoogleCalendarToken> {
		const tokenEndpoint = "https://oauth2.googleapis.com/token";

		const body = new URLSearchParams({
			client_id: GoogleCalendarService.CLIENT_ID,
			client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || "",
			code: authCode,
			grant_type: "authorization_code",
			redirect_uri: GoogleCalendarService.REDIRECT_URI,
		});

		const response = await fetch(tokenEndpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: body.toString(),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				`Token exchange failed: ${
					errorData.error_description || errorData.error
				}`
			);
		}

		const tokenData = await response.json();

		return {
			access_token: tokenData.access_token,
			refresh_token: tokenData.refresh_token,
			expires_in: tokenData.expires_in || 3600,
			token_type: tokenData.token_type || "Bearer",
			scope: tokenData.scope || GoogleCalendarService.SCOPES,
			expires_at: Date.now() + (tokenData.expires_in || 3600) * 1000,
		};
	}

	// Get user info using access token
	private async getUserInfo(
		accessToken: string
	): Promise<{ email: string; name: string }> {
		const userInfoEndpoint =
			"https://www.googleapis.com/oauth2/v2/userinfo";

		const response = await fetch(userInfoEndpoint, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			throw new Error("Failed to get user info");
		}

		const userData = await response.json();

		return {
			email: userData.email,
			name: userData.name || userData.email,
		};
	}

	// Check if we're currently handling an OAuth callback
	isHandlingOAuthCallback(): boolean {
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.has("code") || urlParams.has("error");
	}

	// Handle OAuth callback if present in URL
	async handleOAuthCallbackIfPresent(): Promise<GoogleCalendarToken | null> {
		if (!this.isHandlingOAuthCallback()) {
			return null;
		}

		const urlParams = new URLSearchParams(window.location.search);
		const authCode = urlParams.get("code");
		const error = urlParams.get("error");

		if (error) {
			console.error("OAuth error:", error);
			// Clean up URL
			const url = new URL(window.location.href);
			url.searchParams.delete("error");
			url.searchParams.delete("error_description");
			window.history.replaceState({}, document.title, url.toString());
			throw new Error(`OAuth error: ${error}`);
		}

		if (authCode) {
			return await this.handleOAuthCallback(authCode);
		}

		return null;
	}

	async signOut(): Promise<void> {
		// Notify backend about disconnection
		try {
			await authAPI.disconnectGoogleCalendar();
			console.log("Google Calendar disconnected from backend");
		} catch (error) {
			console.error(
				"Failed to disconnect Google Calendar from backend:",
				error
			);
			// Continue with frontend cleanup even if backend call fails
		}

		localStorage.removeItem("google_calendar_token");
		localStorage.removeItem("google_calendar_user");
	}

	isSignedIn(): boolean {
		const token = this.getStoredToken();
		return token !== null && token.expires_at > Date.now();
	}

	async isConnectedToBackend(): Promise<boolean> {
		try {
			const status = await authAPI.getGoogleCalendarStatus();
			return status.data.connected;
		} catch (error) {
			console.error("Failed to check backend connection status:", error);
			return false;
		}
	}

	async getBackendConnectionStatus(): Promise<{
		connected: boolean;
		user_email?: string;
		user_name?: string;
		last_sync?: string;
	} | null> {
		try {
			const response = await authAPI.getGoogleCalendarStatus();
			return response.data;
		} catch (error) {
			console.error("Failed to get backend connection status:", error);
			return null;
		}
	}

	async syncTokenWithBackend(): Promise<boolean> {
		const token = this.getStoredToken();
		const user = this.getStoredUser();

		if (!token || !user) {
			console.warn("No token or user data available for backend sync");
			return false;
		}

		try {
			const tokenRequest: GoogleCalendarTokenRequest = {
				...token,
				user_email: user.email,
				user_name: user.name,
			};

			await authAPI.sendGoogleCalendarToken(tokenRequest);
			console.log("Google Calendar token re-synced with backend");
			return true;
		} catch (error) {
			console.error(
				"Failed to sync Google Calendar token with backend:",
				error
			);
			return false;
		}
	}

	getStoredToken(): GoogleCalendarToken | null {
		try {
			const tokenStr = localStorage.getItem("google_calendar_token");
			if (!tokenStr) return null;

			const token: GoogleCalendarToken = JSON.parse(tokenStr);
			if (token.expires_at <= Date.now()) {
				localStorage.removeItem("google_calendar_token");
				return null;
			}

			return token;
		} catch {
			return null;
		}
	}

	getStoredUser(): { email: string; name: string } | null {
		try {
			const userStr = localStorage.getItem("google_calendar_user");
			return userStr ? JSON.parse(userStr) : null;
		} catch {
			return null;
		}
	}

	private async ensureAuthenticated(): Promise<void> {
		if (!this.isSignedIn()) {
			throw new Error("Not authenticated with Google Calendar");
		}

		// For redirect flow, we use direct API calls instead of gapi client
		// This avoids the need to initialize the full Google API client
	}

	async getCalendarList(): Promise<any[]> {
		const token = this.getStoredToken();
		if (!token) {
			throw new Error("Not authenticated with Google Calendar");
		}

		const response = await fetch(
			"https://www.googleapis.com/calendar/v3/users/me/calendarList",
			{
				headers: {
					Authorization: `Bearer ${token.access_token}`,
				},
			}
		);

		if (!response.ok) {
			throw new Error("Failed to fetch calendar list");
		}

		const data = await response.json();
		return data.items || [];
	}

	async getEvents(params?: {
		calendarId?: string;
		timeMin?: string;
		timeMax?: string;
		maxResults?: number;
		singleEvents?: boolean;
		orderBy?: string;
	}): Promise<GoogleCalendarEvent[]> {
		const token = this.getStoredToken();
		if (!token) {
			throw new Error("Not authenticated with Google Calendar");
		}

		const defaultParams = {
			calendarId: "primary",
			timeMin: new Date().toISOString(),
			timeMax: new Date(
				Date.now() + 30 * 24 * 60 * 60 * 1000
			).toISOString(), // 30 days from now
			maxResults: 50,
			singleEvents: true,
			orderBy: "startTime",
			...params,
		};

		const url = new URL(
			`https://www.googleapis.com/calendar/v3/calendars/${defaultParams.calendarId}/events`
		);
		Object.entries(defaultParams).forEach(([key, value]) => {
			if (key !== "calendarId" && value !== undefined) {
				url.searchParams.set(key, value.toString());
			}
		});

		const response = await fetch(url.toString(), {
			headers: {
				Authorization: `Bearer ${token.access_token}`,
			},
		});

		if (!response.ok) {
			throw new Error("Failed to fetch calendar events");
		}

		const data = await response.json();
		return data.items || [];
	}

	async getEvent(
		eventId: string,
		calendarId = "primary"
	): Promise<GoogleCalendarEvent> {
		const token = this.getStoredToken();
		if (!token) {
			throw new Error("Not authenticated with Google Calendar");
		}

		const response = await fetch(
			`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
			{
				headers: {
					Authorization: `Bearer ${token.access_token}`,
				},
			}
		);

		if (!response.ok) {
			throw new Error("Failed to fetch calendar event");
		}

		return await response.json();
	}

	async getUpcomingEvents(maxResults = 50): Promise<GoogleCalendarEvent[]> {
		return this.getEvents({
			maxResults,
			timeMin: new Date().toISOString(),
		});
	}

	async getEventsForDateRange(
		startDate: Date,
		endDate: Date
	): Promise<GoogleCalendarEvent[]> {
		return this.getEvents({
			timeMin: startDate.toISOString(),
			timeMax: endDate.toISOString(),
		});
	}

	async getEventsForDay(date: Date): Promise<GoogleCalendarEvent[]> {
		const startOfDay = new Date(date);
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date(date);
		endOfDay.setHours(23, 59, 59, 999);

		return this.getEventsForDateRange(startOfDay, endOfDay);
	}

	// Utility method to convert Google Calendar event to our internal format
	convertToInternalEvent(googleEvent: GoogleCalendarEvent): {
		id: string;
		googleEventId: string;
		title: string;
		description?: string;
		startTime: string;
		endTime: string;
		location?: string;
	} {
		const startTime =
			googleEvent.start.dateTime || googleEvent.start.date || "";
		const endTime = googleEvent.end.dateTime || googleEvent.end.date || "";

		return {
			id: `google_${googleEvent.id}`,
			googleEventId: googleEvent.id,
			title: googleEvent.summary || "Untitled Event",
			description: googleEvent.description,
			startTime,
			endTime,
			location: googleEvent.location,
		};
	}

	// Convert multiple Google events to internal format
	convertToInternalEvents(googleEvents: GoogleCalendarEvent[]): {
		id: string;
		googleEventId: string;
		title: string;
		description?: string;
		startTime: string;
		endTime: string;
		location?: string;
	}[] {
		return googleEvents.map((event) => this.convertToInternalEvent(event));
	}
}

// Export singleton instance
export const googleCalendarService = new GoogleCalendarService();
export default googleCalendarService;
