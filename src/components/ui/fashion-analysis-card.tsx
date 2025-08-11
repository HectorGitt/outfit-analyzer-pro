import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	Sparkles,
	Heart,
	Palette,
	Star,
	ShoppingBag,
	Lightbulb,
	Shirt,
} from "lucide-react";
import { FashionAnalysisResponse } from "@/types";

interface FashionAnalysisCardProps {
	result: FashionAnalysisResponse;
	className?: string;
}

export function FashionAnalysisCard({
	result,
	className,
}: FashionAnalysisCardProps) {
	// Safely destructure with fallbacks
	const data = result?.data;
	const analysis = data?.analysis;
	const recommendations = data?.recommendations;

	// Return early if data is not available
	if (!data || !analysis || !recommendations) {
		return (
			<Card className={`border-0 shadow-lg ${className}`}>
				<CardContent className="p-6">
					<div className="text-center text-muted-foreground">
						<p>
							Unable to display analysis results. Invalid data
							format.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	const getScoreColor = (score: number) => {
		if (score >= 8) return "text-green-600";
		if (score >= 6) return "text-yellow-600";
		return "text-red-600";
	};

	const getScoreIcon = (score: number) => {
		if (score >= 8) return <Star className="w-5 h-5 text-green-600" />;
		if (score >= 6) return <Heart className="w-5 h-5 text-yellow-600" />;
		return <Sparkles className="w-5 h-5 text-red-600" />;
	};

	return (
		<Card className={`border-0 shadow-lg ${className}`}>
			<CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
				<CardTitle className="flex items-center gap-2">
					<Palette className="w-6 h-6 text-primary" />
					Fashion Analysis Results
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6 p-6">
				{/* Overall Score */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium">
							Overall Style Rating
						</span>
						<div className="flex items-center gap-2">
							{getScoreIcon(analysis.overall_rating || 0)}
							<span
								className={`text-lg font-bold ${getScoreColor(
									analysis.overall_rating || 0
								)}`}
							>
								{analysis.overall_rating || "N/A"}/10
							</span>
						</div>
					</div>
					<Progress
						value={(analysis.overall_rating || 0) * 10}
						className="h-3"
					/>
				</div>

				{/* Analysis Sections */}
				<div className="grid gap-4">
					<div className="space-y-2">
						<h4 className="text-sm font-semibold flex items-center gap-2">
							<Palette className="w-4 h-4 text-blue-600" />
							Color Analysis
						</h4>
						<p className="text-sm text-gray-600 leading-relaxed bg-blue-50 p-3 rounded-lg">
							{analysis.color_analysis ||
								"No color analysis available"}
						</p>
					</div>

					<div className="space-y-2">
						<h4 className="text-sm font-semibold flex items-center gap-2">
							<Shirt className="w-4 h-4 text-purple-600" />
							Fit Analysis
						</h4>
						<p className="text-sm text-gray-600 leading-relaxed bg-purple-50 p-3 rounded-lg">
							{analysis.fit_analysis ||
								"No fit analysis available"}
						</p>
					</div>

					<div className="space-y-2">
						<h4 className="text-sm font-semibold flex items-center gap-2">
							<Sparkles className="w-4 h-4 text-green-600" />
							Texture & Style
						</h4>
						<p className="text-sm text-gray-600 leading-relaxed bg-green-50 p-3 rounded-lg">
							{analysis.texture_analysis ||
								"No texture analysis available"}
						</p>
					</div>
				</div>

				{/* Occasion & Trends */}
				<div className="grid md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<h4 className="text-sm font-semibold">
							Best Occasions
						</h4>
						<p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
							{analysis.occasion ||
								"No occasion recommendations available"}
						</p>
					</div>
					<div className="space-y-2">
						<h4 className="text-sm font-semibold">
							Trend Analysis
						</h4>
						<p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
							{analysis.trends || "No trend analysis available"}
						</p>
					</div>
				</div>

				{/* Improvements */}
				<div className="space-y-3">
					<h4 className="text-sm font-semibold flex items-center gap-2">
						<Lightbulb className="w-4 h-4 text-orange-600" />
						Immediate Improvements
					</h4>
					<div className="space-y-2">
						{recommendations.immediate_improvements &&
						recommendations.immediate_improvements.length > 0 ? (
							recommendations.immediate_improvements.map(
								(improvement, index) => (
									<p
										key={index}
										className="text-sm text-gray-600 bg-orange-50 p-3 rounded-lg"
									>
										{improvement}
									</p>
								)
							)
						) : (
							<p className="text-sm text-gray-600 bg-orange-50 p-3 rounded-lg">
								No specific improvements suggested
							</p>
						)}
					</div>
				</div>

				{/* Shopping List */}
				<div className="space-y-3">
					<h4 className="text-sm font-semibold flex items-center gap-2">
						<ShoppingBag className="w-4 h-4 text-pink-600" />
						Shopping Recommendations
					</h4>
					<div className="flex flex-wrap gap-2">
						{recommendations.shopping_list &&
						recommendations.shopping_list.length > 0 ? (
							recommendations.shopping_list.map((item, index) => (
								<Badge
									key={index}
									variant="secondary"
									className="text-xs bg-pink-50 text-pink-700 border-pink-200"
								>
									{item}
								</Badge>
							))
						) : (
							<Badge
								variant="secondary"
								className="text-xs bg-gray-50 text-gray-600"
							>
								No shopping recommendations available
							</Badge>
						)}
					</div>
				</div>

				{/* Styling Alternatives */}
				<div className="space-y-3">
					<h4 className="text-sm font-semibold flex items-center gap-2">
						<Heart className="w-4 h-4 text-red-600" />
						Styling Alternatives
					</h4>
					<div className="space-y-2">
						{recommendations.styling_alternatives &&
						recommendations.styling_alternatives.length > 0 ? (
							recommendations.styling_alternatives.map(
								(alternative, index) => (
									<p
										key={index}
										className="text-sm text-gray-600 bg-red-50 p-3 rounded-lg"
									>
										{alternative}
									</p>
								)
							)
						) : (
							<p className="text-sm text-gray-600 bg-red-50 p-3 rounded-lg">
								No styling alternatives suggested
							</p>
						)}
					</div>
				</div>

				{/* Color Palette & Accessories */}
				<div className="grid md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<h4 className="text-sm font-semibold">
							Color Palette Tips
						</h4>
						<div className="space-y-2">
							{recommendations.color_palette &&
							recommendations.color_palette.length > 0 ? (
								recommendations.color_palette.map(
									(tip, index) => (
										<p
											key={index}
											className="text-sm text-gray-600 bg-indigo-50 p-3 rounded-lg"
										>
											{tip}
										</p>
									)
								)
							) : (
								<p className="text-sm text-gray-600 bg-indigo-50 p-3 rounded-lg">
									No color palette tips available
								</p>
							)}
						</div>
					</div>
					<div className="space-y-2">
						<h4 className="text-sm font-semibold">Accessories</h4>
						<div className="space-y-2">
							{recommendations.accessories &&
							recommendations.accessories.length > 0 ? (
								recommendations.accessories.map(
									(accessory, index) => (
										<p
											key={index}
											className="text-sm text-gray-600 bg-cyan-50 p-3 rounded-lg"
										>
											{accessory}
										</p>
									)
								)
							) : (
								<p className="text-sm text-gray-600 bg-cyan-50 p-3 rounded-lg">
									No accessory recommendations available
								</p>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
