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
			console.error("Google Calendar connection failed:", error);
			toast.error("Failed to connect Google Calendar. Please try again.");
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
			console.error("Google Calendar disconnection failed:", error);
			toast.error(
				"Failed to disconnect Google Calendar. Please try again."
			);
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
			console.error("Google Calendar sync failed:", error);
			toast.error("Failed to sync Google Calendar. Please try again.");
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
			console.error("Failed to create event:", error);
			toast.error("Failed to create event. Please try again.");
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
			console.error("Failed to update event:", error);
			toast.error("Failed to update event. Please try again.");
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
			console.error("Failed to delete event:", error);
			toast.error("Failed to delete event. Please try again.");
		},
	});
};

export const useSyncGoogleCalendarEvents = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (
			events: Parameters<typeof calendarAPI.syncGoogleCalendarEvents>[0]
		) => calendarAPI.syncGoogleCalendarEvents(events),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["events"] });
			toast.success("Google Calendar events synced successfully!");
		},
		onError: (error: any) => {
			console.error("Failed to sync Google Calendar events:", error);
			toast.error(
				"Failed to sync Google Calendar events. Please try again."
			);
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
			console.error("Failed to create wardrobe item:", error);
			toast.error("Failed to create wardrobe item. Please try again.");
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
			console.error("Failed to create bulk wardrobe items:", error);
			toast.error("Failed to create wardrobe items. Please try again.");
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
			console.error("Failed to update wardrobe item:", error);
			toast.error("Failed to update wardrobe item. Please try again.");
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
			console.error("Failed to delete wardrobe item:", error);
			toast.error("Failed to delete wardrobe item. Please try again.");
		},
	});
};

export const useMarkItemWorn = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, date }: { id: string; date: string }) =>
			wardrobeAPI.markItemWorn(id, date),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
			toast.success("Item marked as worn!");
		},
		onError: (error: any) => {
			console.error("Failed to mark item as worn:", error);
			toast.error("Failed to mark item as worn. Please try again.");
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
			console.error("Failed to upload item image:", error);
			toast.error("Failed to upload item image. Please try again.");
		},
	});
};

// Outfit Suggestions Hooks
export const useGenerateOutfitSuggestions = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: GenerateOutfitRequest) =>
			outfitAPI.generateSuggestions(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["outfits"] });
			toast.success("Outfit suggestions generated successfully!");
		},
		onError: (error: any) => {
			console.error("Failed to generate outfit suggestions:", error);
			toast.error(
				"Failed to generate outfit suggestions. Please try again."
			);
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
			console.error("Failed to save outfit suggestion:", error);
			toast.error("Failed to save outfit suggestion. Please try again.");
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
			console.error("Failed to delete outfit suggestion:", error);
			toast.error(
				"Failed to delete outfit suggestion. Please try again."
			);
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
			console.error("Failed to plan outfit:", error);
			toast.error("Failed to plan outfit. Please try again.");
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
			console.error("Failed to update outfit plan:", error);
			toast.error("Failed to update outfit plan. Please try again.");
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
			console.error("Failed to delete outfit plan:", error);
			toast.error("Failed to delete outfit plan. Please try again.");
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

// Pricing Tier Hook
export const usePricingTier = () => {
	return useQuery({
		queryKey: ["pricing-tier"],
		queryFn: () => authAPI.getPricingTier(),
	});
};
