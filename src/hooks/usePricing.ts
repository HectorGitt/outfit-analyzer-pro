import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/services/api";
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
	const { user, updatePricingTier } = useAuthStore();

	return useQuery({
		queryKey: pricingQueryKeys.userTier(),
		queryFn: async () => {
			if (!user) {
				throw new Error("User not authenticated");
			}

			const response = await authAPI.getPricingTier();
			const pricingData = response.data;

			// Update the auth store with the latest pricing tier from the API
			const tierKey =
				pricingData.pricing_tier as keyof typeof pricingTiers;
			updatePricingTier(tierKey);

			// Construct the UserPricingTier object
			const tierData = pricingTiers[tierKey] || pricingTiers.free;

			const userTier: UserPricingTier = {
				tier: tierKey,
				name: tierData.name,
				features: tierData,
				isActive: pricingData.subscription_status === "active",
				expiresAt: pricingData.subscription_end_date,
			};

			return userTier;
		},
		enabled: !!user, // Only run query if user is authenticated
		refetchOnWindowFocus: true,
		refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
		refetchIntervalInBackground: false, // Don't refetch when tab is not active
		staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
		gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
		onError: (error) => {
			console.warn("Failed to fetch user pricing tier:", error);
			toast.error("Failed to load pricing information");
		},
	});
};

// Hook to get all available pricing tiers
export const usePricingTiers = () => {
	return useQuery({
		queryKey: pricingQueryKeys.tiers(),
		queryFn: async () => {
			const response = await authAPI.getAllPricingTiers();
			return response.data.data.pricing_tiers.map((tier: any) => ({
				key: tier.name.toLowerCase() as keyof typeof pricingTiers,
				...tier,
			}));
		},
		refetchOnWindowFocus: false,
		refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes for static pricing data
		staleTime: 60 * 60 * 1000, // Static data, keep for 1 hour
		gcTime: 2 * 60 * 60 * 1000, // Keep in cache for 2 hours
	});
};

// Hook to upgrade/downgrade pricing tier (for future subscription implementation)
export const useUpdatePricingTier = () => {
	const queryClient = useQueryClient();
	const { updatePricingTier: updateStorePricingTier } = useAuthStore();

	return useMutation({
		mutationFn: async (tier: keyof typeof pricingTiers) => {
			const response = await apiCall("POST", "/users/pricing-tier", {
				tier,
			});
			return response.data;
		},
		onSuccess: (data) => {
			// Update auth store with new tier
			const newTier = data.pricing_tier as keyof typeof pricingTiers;
			updateStorePricingTier(newTier);

			// Invalidate and refetch user pricing tier
			queryClient.invalidateQueries({
				queryKey: pricingQueryKeys.userTier(),
			});

			toast.success("Pricing tier updated successfully");
		},
		onError: (error) => {
			toast.error("Failed to update pricing tier");
			console.error("Pricing tier update error:", error);
		},
	});
};

// Hook to manually refresh pricing data
export const useRefreshPricingData = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			// Invalidate all pricing queries to force refetch
			await queryClient.invalidateQueries({
				queryKey: pricingQueryKeys.all,
			});
		},
		onSuccess: () => {
			toast.success("Pricing data refreshed");
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
