import React from "react";
import { useAuthStore } from "@/stores/authStore";
import { pricingTiers } from "@/lib/pricingTiers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export const PricingStatus: React.FC = () => {
	const { pricingTier } = useAuthStore();
	const tierData =
		pricingTiers[pricingTier as keyof typeof pricingTiers] ||
		pricingTiers.free;

	// Feature checks
	const hasCalendarIntegration = tierData.calendar_integration;
	const hasWeatherIntegration = tierData.weather_integration;
	const maxUploads = tierData.max_upload_analyze;
	const maxOutfits = tierData.max_outfit_plans_per_month;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>Your Plan</span>
					<Badge variant="secondary">{tierData.name}</Badge>
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
