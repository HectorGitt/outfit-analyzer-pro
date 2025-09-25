import axios, { AxiosResponse, AxiosError } from "axios";
import { ApiResponse } from "@/types";
import { toast } from "sonner";

// Import React Router navigation for SPA redirects
let navigateFunction: ((path: string) => void) | null = null;

// Function to set the navigate function from the app
export const setNavigateFunction = (navigate: (path: string) => void) => {
	navigateFunction = navigate;
};

// Helper function for SPA navigation
const navigateTo = (path: string) => {
	try {
		if (navigateFunction) {
			navigateFunction(path);
		} else {
			// Fallback to window.location if navigate function not set
			window.location.href = path;
		}
	} catch (error) {
		// Final fallback
		window.location.href = path;
	}
};

// Utility function for redirects with next parameter
export const redirectToLogin = (currentPath?: string) => {
	const path =
		currentPath || window.location.pathname + window.location.search;
	const loginUrl = `/login?next=${encodeURIComponent(path)}`;
	navigateTo(loginUrl);
};

export const redirectToPricing = () => {
	navigateTo("/pricing");
};

export const redirectToProfile = () => {
	navigateTo("/profile");
};

export const redirectToDashboard = () => {
	navigateTo("/dashboard");
};

// Base API configuration
const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 180000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor to add auth token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("auth_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Enhanced error logging with more details
api.interceptors.response.use(
	(response: AxiosResponse) => {
		// Handle HTTP redirects (3xx status codes)
		if (response.status >= 300 && response.status < 400) {
			const redirectUrl =
				response.headers.location || response.headers["location"];
			if (redirectUrl) {
				console.log(
					`🔄 HTTP Redirect ${response.status}: ${response.config.url} → ${redirectUrl}`
				);
				// For SPA, we might want to handle redirects differently
				// For now, let axios handle the redirect automatically
			}
		}

		// Log successful responses for debugging
		/* console.log(
			`✅ ${response.config.method?.toUpperCase()} ${
				response.config.url
			}:`,
			{
				status: response.status,
				data: response.data,
			}
		); */
		return response;
	},
	(error: AxiosError) => {
		// Enhanced error logging
		/* console.error(
			`❌ API Error - ${error.config?.method?.toUpperCase()} ${
				error.config?.url
			}:`,
			{
				status: error.response?.status,
				statusText: error.response?.statusText,
				data: error.response?.data,
				message: error.message,
				headers: error.response?.headers,
			}
		); */

		if (
			error.response?.status === 401 ||
			(error.response?.status === 403 &&
				typeof error.response?.data === "object" &&
				error.response?.data !== null &&
				"detail" in error.response.data &&
				(error.response.data as any).detail === "Not authenticated")
		) {
			// Don't use hooks in interceptors - handle logout through navigation
			const url = error.config?.url || "";
			if (
				window.location.pathname !== "/login" &&
				!url.includes("pricing")
			) {
				// Use SPA navigation with next parameter
				const currentPath =
					window.location.pathname + window.location.search;
				const loginUrl = `/login?next=${encodeURIComponent(
					currentPath
				)}`;
				navigateTo(loginUrl);
			}
		}

		// Handle 403 errors for calendar endpoints - remove Google Calendar tokens
		if (error.response?.status === 403) {
			const url = error.config?.url || "";
			if (url.includes("/calendar/") || url.includes("calendar")) {
				console.warn(
					"📅 Calendar 403 error - removing Google Calendar tokens and redirecting to calendar connect"
				);
				// Remove any stored Google Calendar tokens
				localStorage.removeItem("google_calendar_token");
				localStorage.removeItem("google_calendar_refresh_token");
				localStorage.removeItem("google_calendar_expires_at");
				localStorage.removeItem("google_calendar_user_email");
				localStorage.removeItem("google_calendar_user_name");

				console.log(
					"🔐 Google Calendar tokens removed due to 403 error"
				);

				// Redirect to calendar connect page to re-authenticate
				if (window.location.pathname !== "/calendar-connect") {
					//console.log("� Redirecting to calendar connect page");
					navigateTo("/calendar-connect");
				}
			}
		}

		// Handle 429 errors (Too Many Requests) - show upgrade toast
		if (error.response?.status === 429) {
			const errorData = error.response.data as any;

			// Extract upgrade information from the error response
			const upgradeInfo = errorData?.detail;
			const message =
				upgradeInfo?.message ||
				"AI usage limit reached. Upgrade for more requests.";
			const currentUsage = upgradeInfo?.current_usage;
			const limit = upgradeInfo?.limit;
			const tierName = upgradeInfo?.tier_name || "Pro";
			const resetPeriod = upgradeInfo?.reset_period || "monthly";
			const endpoint = upgradeInfo?.endpoint || "unknown endpoint";

			// Show upgrade toast with detailed information including endpoint
			toast.error("Rate Limit Exceeded", {
				description: message,
				action: {
					label: "Upgrade Now",
					onClick: () => {
						// Navigate to pricing page for upgrading
						navigateTo("/pricing");
					},
				},
				duration: 10000, // Show for 10 seconds
			});

			console.warn("🚫 429 Rate Limit Error:", {
				message,
				currentUsage,
				limit,
				tierName,
				resetPeriod,
				endpoint: error.config?.url,
			});
		}

		// Handle 503 Service Unavailable - redirect to maintenance page
		if (error.response?.status === 503) {
			const errorData = error.response.data as any;
			const isMaintenance =
				errorData?.maintenance ||
				errorData?.detail?.includes("maintenance");

			if (isMaintenance && window.location.pathname !== "/maintenance") {
				console.warn("🔧 Service under maintenance, redirecting...");
				toast.error("Service temporarily unavailable", {
					description:
						"We're performing maintenance. Please try again later.",
					duration: 5000,
				});
				navigateTo("/maintenance");
			}
		}

		// Handle 502/504 Gateway errors - redirect to error page
		if (error.response?.status === 502 || error.response?.status === 504) {
			console.error(
				`🌐 Gateway Error ${error.response.status}:`,
				error.config?.url
			);
			toast.error("Service temporarily unavailable", {
				description: "Please try again in a few moments.",
				duration: 5000,
			});
			// Could redirect to an error page if needed
			// navigateTo("/error");
		}

		return Promise.reject(error);
	}
);

// Enhanced API utility function with detailed error handling
export const apiCall = async <T>(
	method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
	endpoint: string,
	data?: any,
	config?: any
): Promise<ApiResponse<T>> => {
	try {
		/* console.log(`🚀 API Call - ${method} ${endpoint}:`, {
			data,
			config,
		}); */

		const response = await api.request({
			method,
			url: endpoint,
			data,
			...config,
		});
		return response.data;
	} catch (error) {
		/* console.error(`💥 API Call Failed - ${method} ${endpoint}:`, error); */

		if (axios.isAxiosError(error)) {
			const errorResponse = error.response?.data;
			const errorMessage =
				errorResponse?.detail ||
				errorResponse?.message ||
				error.message ||
				"An unexpected error occurred";

			// Handle validation errors from FastAPI
			let validationErrors = {};
			if (errorResponse?.detail && Array.isArray(errorResponse.detail)) {
				validationErrors = errorResponse.detail.reduce(
					(acc: any, err: any) => {
						const field =
							err.loc?.[err.loc.length - 1] || "general";
						if (!acc[field]) acc[field] = [];
						acc[field].push(err.msg);
						return acc;
					},
					{}
				);
			}

			throw {
				success: false,
				message: errorMessage,
				status: error.response?.status,
				validationErrors,
				details: errorResponse,
			};
		}
		throw {
			success: false,
			message: "An unexpected error occurred",
			details: error,
		};
	}
};

// File upload utility
export const uploadFile = async (
	endpoint: string,
	file: File,
	additionalData?: any
): Promise<ApiResponse<any>> => {
	const formData = new FormData();
	formData.append("file", file);

	if (additionalData) {
		Object.keys(additionalData).forEach((key) => {
			formData.append(key, JSON.stringify(additionalData[key]));
		});
	}

	return apiCall("POST", endpoint, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
};

export default api;
