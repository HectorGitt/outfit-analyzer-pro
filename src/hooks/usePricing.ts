import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/lib/api";
import { pricingTiers } from "@/lib/pricingTiers";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

export interface UserPricingTier {
	tier: keyof typeof pricingTiers;
	name: string;
	features: typeof pricingTiers.free;
	isActive: boolean;
	expiresAt?: string;
}

// Query keys for React Query
export const pricingQueryKeys = {
	all: ["pricing"] as const,
	userTier: () => [...pricingQueryKeys.all, "userTier"] as const,
	tiers: () => [...pricingQueryKeys.all, "tiers"] as const,
};

// Hook to get user's current pricing tier
export const useUserPricingTier = () => {
	return useQuery({
		queryKey: pricingQueryKeys.userTier(),
		queryFn: async (): Promise<UserPricingTier> => {
			try {
				const response = await apiCall("GET", "/users/pricing-tier");
				const data = response.data as any;

				// Transform API response to UserPricingTier format
				const tierKey = data.pricing_tier || "free";
				const tierData =
					pricingTiers[tierKey as keyof typeof pricingTiers] ||
					pricingTiers.free;

				return {
					tier: tierKey,
					name: data.name || tierData.name,
					features: tierData,
					isActive: data.isActive !== false,
					expiresAt: data.expiresAt,
				};
			} catch (error) {
				// If API fails, return free tier as default
				console.warn(
					"Failed to fetch user pricing tier, using free tier as default:",
					error
				);
				if (error.response?.status === 401) {
					useAuthStore.getState().logout();
					toast.error("Session expired. Please log in again.");
				}
				return {
					tier: "free" as keyof typeof pricingTiers,
					name: "Free",
					features: pricingTiers.free,
					isActive: true,
				};
			}
		},
		refetchOnWindowFocus: false,
		enabled: useAuthStore.getState().isAuthenticated, // Only run when user is authenticated
		staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
		gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
	});
};

// Hook to get all available pricing tiers
export const usePricingTiers = () => {
	return useQuery({
		queryKey: pricingQueryKeys.tiers(),
		queryFn: async () => {
			// For now, return static data. Later this can be fetched from API
			return Object.entries(pricingTiers).map(([key, tier]) => ({
				key: key as keyof typeof pricingTiers,
				...tier,
			}));
		},
		refetchOnWindowFocus: false,
		staleTime: 30 * 60 * 1000, // Static data, keep for 30 minutes
		gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
	});
};

// Hook to upgrade/downgrade pricing tier (for future subscription implementation)
export const useUpdatePricingTier = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (tier: keyof typeof pricingTiers) => {
			const response = await apiCall("POST", "/users/pricing-tier", {
				tier,
			});
			return response.data;
		},
		onSuccess: () => {
			// Invalidate and refetch user pricing tier
			queryClient.invalidateQueries({
				queryKey: pricingQueryKeys.userTier(),
			});
		},
	});
};

// Utility function to check if user has access to a feature
export const useFeatureAccess = (feature: keyof typeof pricingTiers.free) => {
	const { data: userTier } = useUserPricingTier();

	if (!userTier) return false; // No data means no access (free tier features only)
	if (feature === "voice_integration") {
		return userTier.features["agent_calls_minutes"] > 0;
	}
	return userTier.features[feature] === true;
};

// Hook to get feature limit for numeric features
export const useFeatureLimit = (feature: keyof typeof pricingTiers.free) => {
	const { data: userTier } = useUserPricingTier();

	if (!userTier) return 0; // No data means no limit (free tier)

	const limit = userTier.features[feature];
	return typeof limit === "number" ? limit : 0;
};
