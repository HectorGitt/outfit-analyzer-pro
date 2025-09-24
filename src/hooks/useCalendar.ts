import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	calendarAPI,
	wardrobeAPI,
	outfitAPI,
	planningAPI,
	weatherAPI,
	analyticsAPI,
	authAPI,
} from "@/services/api";
import { pricingTiers } from "@/lib/pricingTiers";
import { useAuthStore } from "@/stores/authStore";
import {
	CalendarEvent,
	WardrobeItem,
	OutfitSuggestion,
	OutfitPlan,
	WeatherData,
	CreateEventRequest,
	UpdateEventRequest,
	CreateWardrobeItemRequest,
	GenerateOutfitRequest,
	PlanOutfitRequest,
} from "@/types/api";

// Helper function to extract error detail
const getErrorDetail = (error: any): string => {
	return (
		error?.response?.data?.detail ||
		error?.detail ||
		error?.message ||
		"An error occurred"
	);
};

// Google Calendar Connection Hooks
export const useGoogleCalendarStatus = () => {
	return useQuery({
		queryKey: ["google-calendar-status"],
		queryFn: () => authAPI.getGoogleCalendarStatus(),
	});
};

export const useGoogleCalendarConnect = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (
			token: Parameters<typeof authAPI.sendGoogleCalendarToken>[0]
		) => authAPI.sendGoogleCalendarToken(token),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["google-calendar-status"],
			});
			toast.success("Google Calendar connected successfully!");
		},
		onError: (error: any) => {
			toast.error(getErrorDetail(error));
		},
	});
};

export const useGoogleCalendarDisconnect = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => authAPI.disconnectGoogleCalendar(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["google-calendar-status"],
			});
			toast.success("Google Calendar disconnected successfully!");
		},
		onError: (error: any) => {
			toast.error(getErrorDetail(error));
		},
	});
};

export const useGoogleCalendarSync = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (
			token: Parameters<typeof authAPI.sendGoogleCalendarToken>[0]
		) => authAPI.sendGoogleCalendarToken(token),
		onSuccess: (response) => {
			if (response.data.success) {
				queryClient.invalidateQueries({
					queryKey: ["google-calendar-status"],
				});
				toast.success("Google Calendar synced with backend!");
			} else {
				toast.error("Failed to sync Google Calendar with backend.");
			}
		},
		onError: (error: any) => {
			toast.error(getErrorDetail(error));
		},
	});
};

// Calendar Events Hooks
export const useEvents = (params?: {
	startDate?: string;
	endDate?: string;
	eventType?: string;
	page?: number;
	limit?: number;
}) => {
	return useQuery({
		queryKey: ["events", params],
		queryFn: () => calendarAPI.getEvents(params),
		refetchOnWindowFocus: false,
	});
};

export const useEvent = (id: string) => {
	return useQuery({
		queryKey: ["events", id],
		queryFn: () => calendarAPI.getEvent(id),
		enabled: !!id,
	});
};

export const useCreateEvent = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateEventRequest) => calendarAPI.createEvent(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["events"] });
			toast.success("Event created successfully!");
		},
		onError: (error: any) => {
			toast.error(getErrorDetail(error));
		},
	});
};

export const useUpdateEvent = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateEventRequest) => calendarAPI.updateEvent(data),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["events"] });
			queryClient.setQueryData(["events", data.data.id], data);
			toast.success("Event updated successfully!");
		},
		onError: (error: any) => {
			toast.error(getErrorDetail(error));
		},
	});
};

export const useDeleteEvent = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => calendarAPI.deleteEvent(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["events"] });
			toast.success("Event deleted successfully!");
		},
		onError: (error: any) => {
			toast.error(getErrorDetail(error));
		},
	});
};

export const useSyncGoogleCalendarEvents = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => calendarAPI.getEvents(),
		onSuccess: () => {
			toast.success("Google Calendar events synced successfully!");
		},
		onError: (error: any) => {
			toast.error(getErrorDetail(error));
		},
	});
};

// Wardrobe Items Hooks
export const useWardrobeItems = (params?: {
	category?: string;
	occasion?: string;
	season?: string;
	limit?: number;
	offset?: number;
	wardrobe: WardrobeItem[];
}) => {
	return useQuery({
		queryKey: ["wardrobe", params],
		queryFn: () => wardrobeAPI.getItems(params),
		refetchOnWindowFocus: false,
	});
};

export const useWardrobeItem = (id: string) => {
	return useQuery({
		queryKey: ["wardrobe", id],
		queryFn: () => wardrobeAPI.getItem(id),
		enabled: !!id,
	});
};

export const useCreateWardrobeItem = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateWardrobeItemRequest) =>
			wardrobeAPI.createItem(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
			toast.success("Wardrobe item created successfully!");
		},
		onError: (error: any) => {
			toast.error(getErrorDetail(error));
		},
	});
};

export const useCreateBulkWardrobeItems = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (description: string) =>
			wardrobeAPI.createBulkItems(description),
		onSuccess: (response) => {
			queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
			const itemsCreated = response?.data?.count || 0;
			toast.success(
				`${itemsCreated} wardrobe items created successfully!`
			);
		},
		onError: (error: any) => {
			toast.error(getErrorDetail(error));
		},
	});
};

export const useUpdateWardrobeItem = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: Partial<CreateWardrobeItemRequest>;
		}) => wardrobeAPI.updateItem(id, data),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
			queryClient.setQueryData(["wardrobe", data.data.id], data);
			toast.success("Wardrobe item updated successfully!");
		},
		onError: (error: any) => {
			toast.error(getErrorDetail(error));
		},
	});
};

export const useDeleteWardrobeItem = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => wardrobeAPI.deleteItem(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
			toast.success("Wardrobe item deleted successfully!");
		},
		onError: (error: any) => {
			toast.error(getErrorDetail(error));
		},
	});
};

export const useMarkItemWorn = (options?: {
	onSuccess?: (wasAvailable: boolean) => void;
}) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, date }: { id: string; date: string }) =>
			wardrobeAPI.markItemWorn(id, date),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: ["wardrobe"] });

			// Call the success callback if provided
			if (options?.onSuccess) {
				options.onSuccess(true);
			}

			// Remove default toast - let component handle it
		},
		onError: (error: any) => {
			toast.error(getErrorDetail(error));
		},
	});
};

export const useUploadItemImage = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, file }: { id: string; file: File }) =>
			wardrobeAPI.uploadItemImage(id, file),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
			toast.success("Item image uploaded successfully!");
		},
		onError: (error: any) => {
			toast.error(getErrorDetail(error));
		},
	});
};

// Outfit Suggestions Hooks
export const useGenerateOutfitSuggestions = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => outfitAPI.generateSuggestions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plans"] });
			toast.success("Outfit suggestions generated successfully!");
		},
		onError: (error: any) => {
			toast.error(getErrorDetail(error));
		},
	});
};

export const useGenerateOutfitSuggestion = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: GenerateOutfitRequest) =>
			outfitAPI.generateSuggestion(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plans"] });
			toast.success("Outfit suggestion generated successfully!");
		},
		onError: (error: any) => {
			toast.error(getErrorDetail(error));
		},
	});
};

export const useOutfitSuggestions = (params?: {
	eventId?: string;
	page?: number;
	limit?: number;
}) => {
	return useQuery({
		queryKey: ["outfits", params],
		queryFn: () => outfitAPI.getSuggestions(params),
		refetchOnWindowFocus: false,
	});
};

export const useOutfitSuggestion = (id: string) => {
	return useQuery({
		queryKey: ["outfits", id],
		queryFn: () => outfitAPI.getSuggestion(id),
		enabled: !!id,
	});
};

export const useSaveOutfitSuggestion = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => outfitAPI.saveSuggestion(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["outfits"] });
			toast.success("Outfit suggestion saved!");
		},
		onError: (error: any) => {
			toast.error(getErrorDetail(error));
		},
	});
};

export const useDeleteOutfitSuggestion = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => outfitAPI.deleteSuggestion(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["outfits"] });
			toast.success("Outfit suggestion deleted!");
		},
		onError: (error: any) => {
			toast.error(getErrorDetail(error));
		},
	});
};

// Outfit Planning Hooks
export const usePlanOutfit = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: PlanOutfitRequest) => planningAPI.planOutfit(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plans"] });
			toast.success("Outfit planned successfully!");
		},
		onError: (error: any) => {
			toast.error(getErrorDetail(error));
		},
	});
};

export const useOutfitPlans = (params?: {
	eventId?: string;
	status?: string;
	startDate?: string;
	endDate?: string;
	page?: number;
	limit?: number;
}) => {
	return useQuery({
		queryKey: ["plans", params],
		queryFn: () => planningAPI.getPlans(params),
		refetchOnWindowFocus: false,
	});
};

export const useOutfitPlan = (id: string) => {
	return useQuery({
		queryKey: ["plans", id],
		queryFn: () => planningAPI.getPlan(id),
		enabled: !!id,
	});
};

export const useUpdateOutfitPlan = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: {
				status?: OutfitPlan["status"];
				notes?: string;
				outfitId?: string;
			};
		}) => planningAPI.updatePlan(id, data),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["plans"] });
			queryClient.setQueryData(["plans", data.data.id], data);
			toast.success("Outfit plan updated successfully!");
		},
		onError: (error: any) => {
			toast.error(getErrorDetail(error));
		},
	});
};

export const useDeleteOutfitPlan = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => planningAPI.deletePlan(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["plans"] });
			toast.success("Outfit plan deleted successfully!");
		},
		onError: (error: any) => {
			toast.error(getErrorDetail(error));
		},
	});
};

// Weather Hook
export const useWeather = (params: {
	location?: string;
	lat?: number;
	lon?: number;
	date?: string;
}) => {
	return useQuery({
		queryKey: ["weather", params],
		queryFn: () => weatherAPI.getWeather(params),
		enabled: !!(params.location || (params.lat && params.lon)),
	});
};

// Analytics Hook
export const useOutfitAnalytics = (params?: {
	startDate?: string;
	endDate?: string;
}) => {
	return useQuery({
		queryKey: ["analytics", "outfits", params],
		queryFn: () => analyticsAPI.getOutfitAnalytics(params),
	});
};

// Combined Calendar Dashboard Hook
export const useCalendarDashboard = (date?: Date) => {
	const startDate = date ? new Date(date) : new Date();
	startDate.setHours(0, 0, 0, 0);

	const endDate = new Date(startDate);
	endDate.setDate(endDate.getDate() + 7); // Next 7 days
	endDate.setHours(23, 59, 59, 999);

	const eventsQuery = useEvents({
		startDate: startDate.toISOString(),
		endDate: endDate.toISOString(),
		limit: 50,
	});

	const plansQuery = useOutfitPlans({
		startDate: startDate.toISOString(),
		endDate: endDate.toISOString(),
		limit: 50,
	});

	const wardrobeQuery = useWardrobeItems();

	return {
		events: eventsQuery,
		plans: plansQuery,
		wardrobe: wardrobeQuery,
		isLoading:
			eventsQuery.isLoading ||
			plansQuery.isLoading ||
			wardrobeQuery.isLoading,
		isError:
			eventsQuery.isError || plansQuery.isError || wardrobeQuery.isError,
	};
};
