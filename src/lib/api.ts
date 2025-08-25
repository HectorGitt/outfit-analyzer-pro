import axios, { AxiosResponse, AxiosError } from "axios";
import { ApiResponse } from "@/types";

// Base API configuration
const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 45000,
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

		if (error.response?.status === 401 || error.response?.status === 403) {
			// Token expired or invalid
			localStorage.removeItem("auth_token");
			if (window.location.pathname !== "/login") {
				window.location.href = "/login";
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
					window.location.href = "/calendar-connect";
				}
			}
		}

		return Promise.reject(error);
	}
);

// Enhanced API utility function with detailed error handling
export const apiCall = async <T>(
	method: "GET" | "POST" | "PUT" | "DELETE",
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
