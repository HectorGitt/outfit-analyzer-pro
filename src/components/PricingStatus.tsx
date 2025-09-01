import React from "react";
import {
	useUserPricingTier,
	useFeatureAccess,
	useFeatureLimit,
} from "@/hooks/usePricing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";

export const PricingStatus: React.FC = () => {
	const { data: userTier, isLoading, error } = useUserPricingTier();

	// Example feature checks
	const hasCalendarIntegration = useFeatureAccess("calendar_integration");
	const hasWeatherIntegration = useFeatureAccess("weather_integration");
	const maxUploads = useFeatureLimit("max_upload_analyze");
	const maxOutfits = useFeatureLimit("max_outfit_plans_per_month");

	if (isLoading) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-8">
					<Loader2 className="w-6 h-6 animate-spin mr-2" />
					Loading pricing information...
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardContent className="py-8">
					<p className="text-red-500">
						Failed to load pricing information
					</p>
					<Button
						variant="outline"
						size="sm"
						className="mt-2"
						onClick={() => window.location.reload()}
					>
						Retry
					</Button>
				</CardContent>
			</Card>
		);
	}

	if (!userTier) {
		return (
			<Card>
				<CardContent className="py-8">
					<p className="text-muted-foreground">
						No pricing information available
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>Your Plan</span>
					<Badge variant="secondary">{userTier.name}</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-sm text-muted-foreground">
							Max Uploads
						</p>
						<p className="font-semibold">{maxUploads}</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">
							Max Outfits/Month
						</p>
						<p className="font-semibold">{maxOutfits}</p>
					</div>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-sm">Calendar Integration</span>
						{hasCalendarIntegration ? (
							<Check className="w-4 h-4 text-green-500" />
						) : (
							<X className="w-4 h-4 text-red-500" />
						)}
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm">Weather Integration</span>
						{hasWeatherIntegration ? (
							<Check className="w-4 h-4 text-green-500" />
						) : (
							<X className="w-4 h-4 text-red-500" />
						)}
					</div>
				</div>

				<div className="pt-4 border-t">
					<p className="text-xs text-muted-foreground">
						This information is automatically updated when you login
						or change your subscription. The React Query cache
						ensures efficient data fetching and invalidation.
					</p>
				</div>
			</CardContent>
		</Card>
	);
};

export default PricingStatus;
