import { useState, useEffect } from "react";
import {
	BarChart3,
	TrendingUp,
	Calendar,
	Star,
	Filter,
	Download,
	AlertCircle,
	RefreshCw,
	Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/authStore";
import { fashionAPI } from "@/services/api";
import { FashionAnalysis } from "@/types";
import { Navbar } from "@/components/navigation/navbar";
import { useUserPricingTier } from "@/hooks/usePricing";

export default function Dashboard() {
	const [timeRange, setTimeRange] = useState("30d");
	const [analysisHistory, setAnalysisHistory] = useState<FashionAnalysis[]>(
		[]
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { user } = useAuthStore();
	const { data: userTier, isLoading: pricingLoading } = useUserPricingTier();
	const isPro = userTier?.tier !== "free";

	const fetchDashboardData = async () => {
		try {
			setLoading(true);
			setError(null); // Clear any previous errors
			//console.log("Fetching dashboard data...");
			//console.log("User:", user);

			const response = await fashionAPI.getAnalysisHistory();
			//console.log("Dashboard API Response:", response);
			//console.log("Response type:", typeof response);
			//console.log("Response data:", response.data);

			// Handle the nested response structure
			if (response.data && response.data.history) {
				/* console.log(
					"Using response.data.history:",
					response.data.history
				); */
				setAnalysisHistory(response.data.history);
			} else if (
				response.data &&
				response.data.data &&
				response.data.data.history
			) {
				/* console.log(
					"Using nested history data:",
					response.data.data.history
				); */
				setAnalysisHistory(response.data.data.history);
			} else if (response.data && Array.isArray(response.data)) {
				//console.log("Using direct array data:", response.data);
				setAnalysisHistory(response.data);
			} else if (
				response &&
				response.data &&
				Array.isArray(response.data)
			) {
				//console.log("Using response.data array:", response.data);
				setAnalysisHistory(response.data);
			} else {
				//console.log("No valid data found, setting empty array");
				/* console.log(
					"Response structure:",
					JSON.stringify(response, null, 2)
				); */
				setAnalysisHistory([]);
			}
		} catch (err) {
			console.error("Dashboard fetch error:", err);
			setError(
				err instanceof Error
					? err.message
					: "Failed to load dashboard data"
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user) {
			fetchDashboardData();
		} else {
			//console.log("No user found, skipping fetch");
			setLoading(false);
		}
	}, [user]);

	const stats = [
		{
			label: "Total Analyses",
			value: analysisHistory.length.toString(),
			change:
				analysisHistory.length > 0 ? `+${analysisHistory.length}` : "0",
			trend: "up",
		},
		{
			label: "Average Style Score",
			value:
				analysisHistory.length > 0
					? Math.round(
							analysisHistory.reduce(
								(acc, a) => acc + (a.overall_score || 0),
								0
							) / analysisHistory.length
					  ).toString()
					: "0",
			change: analysisHistory.length > 0 ? "+5%" : "0%",
			trend: "up",
		},
		{
			label: "Average Color Harmony",
			value:
				analysisHistory.length > 0
					? Math.round(
							analysisHistory.reduce(
								(acc, a) => acc + (a.color_harmony || 0),
								0
							) / analysisHistory.length
					  ).toString()
					: "0",
			change: analysisHistory.length > 0 ? "+3%" : "0%",
			trend: "up",
		},
		{
			label: "Style Coherence",
			value:
				analysisHistory.length > 0
					? Math.round(
							analysisHistory.reduce(
								(acc, a) => acc + (a.style_coherence || 0),
								0
							) / analysisHistory.length
					  ).toString()
					: "0",
			change: analysisHistory.length > 0 ? "+4%" : "0%",
			trend: "up",
		},
	];

	const wardrobeRecommendations = [
		{
			category: "Blazers",
			items: 3,
			recommendation: "Add navy blazer for versatility",
			priority: "high",
		},
		{
			category: "Accessories",
			items: 8,
			recommendation: "Statement necklaces to elevate looks",
			priority: "medium",
		},
		{
			category: "Shoes",
			items: 12,
			recommendation: "Nude heels for formal occasions",
			priority: "low",
		},
	];

	const styleInsights = [
		{ style: "Minimalist", percentage: 45, color: "hsl(213, 94%, 68%)" },
		{ style: "Casual", percentage: 30, color: "hsl(262, 83%, 58%)" },
		{ style: "Business", percentage: 20, color: "hsl(142, 76%, 36%)" },
		{ style: "Formal", percentage: 5, color: "hsl(38, 92%, 50%)" },
	];

	return (
		<div className="min-h-screen bg-gradient-hero pt-16">
			<Navbar />
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-fade-up">
						<div>
							<h1 className="text-4xl font-bold mb-2">
								Your Style Dashboard
							</h1>
							<p className="text-muted-foreground">
								Track your fashion journey and discoveries
							</p>
							{user && (
								<p className="text-sm text-muted-foreground mt-1">
									Welcome back, {user.username}!
								</p>
							)}
						</div>
						<div className="flex items-center gap-4 mt-4 md:mt-0">
							<Button
								variant="outline"
								className="gap-2"
								onClick={fetchDashboardData}
								disabled={loading}
							>
								<RefreshCw
									className={`w-4 h-4 ${
										loading ? "animate-spin" : ""
									}`}
								/>
								{loading ? "Loading..." : "Refresh Data"}
							</Button>
							<Button variant="outline" className="gap-2">
								<Filter className="w-4 h-4" />
								Filter
							</Button>
							<Button variant="outline" className="gap-2">
								<Download className="w-4 h-4" />
								Export
							</Button>
						</div>
					</div>

					{error && (
						<Alert variant="destructive" className="mb-6">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{/* Stats Overview */}
					{loading ? (
						<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
							{[...Array(4)].map((_, index) => (
								<Card key={index} className="card-fashion">
									<CardContent className="p-6">
										<div className="animate-pulse">
											<div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
											<div className="h-8 bg-muted rounded w-1/2"></div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
							{stats.map((stat, index) => (
								<Card key={index} className="card-fashion">
									<CardContent className="p-6">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm text-muted-foreground mb-1">
													{stat.label}
												</p>
												<div className="flex items-center gap-2">
													<span className="text-2xl font-bold">
														{stat.value}
													</span>
													<Badge
														variant={
															stat.trend === "up"
																? "default"
																: "secondary"
														}
														className="text-xs"
													>
														{stat.change}
													</Badge>
												</div>
											</div>
											<TrendingUp className="w-8 h-8 text-primary" />
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}

					<Tabs defaultValue="overview" className="space-y-6">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="history">History</TabsTrigger>
							<TabsTrigger
								value="wardrobe"
								disabled={!isPro}
								className={
									!isPro
										? "opacity-50 cursor-not-allowed"
										: ""
								}
							>
								<div className="flex items-center gap-2">
									Wardrobe
									{!isPro && <Lock className="w-3 h-3" />}
								</div>
							</TabsTrigger>
							<TabsTrigger
								value="insights"
								disabled={!isPro}
								className={
									!isPro
										? "opacity-50 cursor-not-allowed"
										: ""
								}
							>
								<div className="flex items-center gap-2">
									Insights
									{!isPro && <Lock className="w-3 h-3" />}
								</div>
							</TabsTrigger>
						</TabsList>

						<TabsContent value="overview" className="space-y-6">
							<div className="grid lg:grid-cols-2 gap-6">
								{/* Recent Analyses */}
								<Card className="card-fashion">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<BarChart3 className="w-5 h-5 text-primary" />
											Recent Analyses
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											{loading ? (
												[...Array(3)].map(
													(_, index) => (
														<div
															key={index}
															className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 animate-pulse"
														>
															<div className="w-16 h-20 bg-muted rounded-lg"></div>
															<div className="flex-1 space-y-2">
																<div className="h-4 bg-muted rounded w-3/4"></div>
																<div className="h-3 bg-muted rounded w-1/2"></div>
																<div className="flex gap-2">
																	<div className="h-6 bg-muted rounded w-16"></div>
																	<div className="h-6 bg-muted rounded w-20"></div>
																</div>
															</div>
														</div>
													)
												)
											) : analysisHistory.length > 0 ? (
												analysisHistory
													.slice(0, 3)
													.map((analysis) => (
														<div
															key={analysis.id}
															className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
														>
															<div className="w-16 h-20 bg-muted rounded-lg flex items-center justify-center">
																{analysis.image_url ? (
																	<img
																		src={
																			analysis.image_url
																		}
																		alt="Analysis"
																		className="w-full h-full object-cover rounded-lg"
																	/>
																) : (
																	<span className="text-xs text-muted-foreground">
																		IMG
																	</span>
																)}
															</div>
															<div className="flex-1">
																<div className="flex items-center justify-between mb-1">
																	<h4 className="font-medium">
																		Style
																		Analysis
																	</h4>
																	<Badge variant="outline">
																		{
																			analysis.overall_score
																		}
																		/100
																	</Badge>
																</div>
																<p className="text-sm text-muted-foreground mb-2">
																	{new Date(
																		analysis.created_at
																	).toLocaleDateString()}
																</p>
																<div className="flex flex-wrap gap-1">
																	{analysis.suggestions
																		.slice(
																			0,
																			2
																		)
																		.map(
																			(
																				suggestion,
																				idx
																			) => (
																				<span
																					key={
																						idx
																					}
																					className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
																				>
																					{
																						suggestion
																					}
																				</span>
																			)
																		)}
																</div>
															</div>
														</div>
													))
											) : (
												<div className="text-center py-8">
													<BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
													<p className="text-muted-foreground">
														No analyses yet. Start
														by uploading an outfit!
													</p>
												</div>
											)}
										</div>
									</CardContent>
								</Card>

								{/* Style Breakdown */}
								<Card className="card-fashion">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Star className="w-5 h-5 text-primary" />
											Style Breakdown
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											{styleInsights.map(
												(style, index) => (
													<div
														key={index}
														className="space-y-2"
													>
														<div className="flex justify-between text-sm">
															<span className="font-medium">
																{style.style}
															</span>
															<span className="text-muted-foreground">
																{
																	style.percentage
																}
																%
															</span>
														</div>
														<Progress
															value={
																style.percentage
															}
															className="h-2"
														/>
													</div>
												)
											)}
										</div>
									</CardContent>
								</Card>
							</div>
						</TabsContent>

						<TabsContent value="history" className="space-y-6">
							<Card className="card-fashion">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Calendar className="w-5 h-5 text-primary" />
										Analysis History
									</CardTitle>
								</CardHeader>
								<CardContent>
									{loading ? (
										<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
											{[...Array(6)].map((_, index) => (
												<div
													key={index}
													className="bg-muted/50 rounded-lg p-4 space-y-3 animate-pulse"
												>
													<div className="aspect-[3/4] bg-muted rounded-lg"></div>
													<div className="space-y-2">
														<div className="h-4 bg-muted rounded w-3/4"></div>
														<div className="h-3 bg-muted rounded w-1/2"></div>
													</div>
												</div>
											))}
										</div>
									) : analysisHistory.length > 0 ? (
										<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
											{analysisHistory.map((analysis) => (
												<div
													key={analysis.id}
													className="bg-muted/50 rounded-lg p-4 space-y-3 hover:bg-muted/70 transition-colors"
												>
													<div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center overflow-hidden">
														{analysis.image_url ? (
															<img
																src={
																	analysis.image_url
																}
																alt="Outfit analysis"
																className="w-full h-full object-cover"
															/>
														) : (
															<div className="text-center">
																<BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
																<span className="text-xs text-muted-foreground">
																	No Image
																</span>
															</div>
														)}
													</div>
													<div>
														<div className="flex items-center justify-between mb-2">
															<h4 className="font-medium text-sm">
																Style Analysis #
																{analysis.id}
															</h4>
															<Badge
																variant="outline"
																className="text-xs"
															>
																{
																	analysis.overall_score
																}
																/100
															</Badge>
														</div>
														<p className="text-xs text-muted-foreground mb-2">
															{new Date(
																analysis.created_at
															).toLocaleDateString(
																"en-US",
																{
																	year: "numeric",
																	month: "short",
																	day: "numeric",
																}
															)}
														</p>
														<div className="space-y-2">
															<div className="flex items-center gap-2 text-xs">
																<span className="font-medium">
																	Color:
																</span>
																<Badge
																	variant="secondary"
																	className="text-xs"
																>
																	{
																		analysis.color_harmony
																	}
																	/100
																</Badge>
															</div>
															<div className="flex items-center gap-2 text-xs">
																<span className="font-medium">
																	Style:
																</span>
																<Badge
																	variant="secondary"
																	className="text-xs"
																>
																	{
																		analysis.style_coherence
																	}
																	/100
																</Badge>
															</div>
														</div>
														{analysis.analysis_text && (
															<p className="text-xs text-muted-foreground mt-2 line-clamp-2">
																{
																	analysis.analysis_text
																}
															</p>
														)}
														{analysis.suggestions &&
															analysis.suggestions
																.length > 0 && (
																<div className="flex flex-wrap gap-1 mt-2">
																	{analysis.suggestions
																		.slice(
																			0,
																			2
																		)
																		.map(
																			(
																				suggestion,
																				idx
																			) => (
																				<span
																					key={
																						idx
																					}
																					className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
																				>
																					{
																						suggestion
																					}
																				</span>
																			)
																		)}
																	{analysis
																		.suggestions
																		.length >
																		2 && (
																		<span className="text-xs text-muted-foreground">
																			+
																			{analysis
																				.suggestions
																				.length -
																				2}{" "}
																			more
																		</span>
																	)}
																</div>
															)}
													</div>
												</div>
											))}
										</div>
									) : (
										<div className="text-center py-12">
											<Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
											<h3 className="text-lg font-medium mb-2">
												No Analysis History
											</h3>
											<p className="text-muted-foreground mb-4">
												You haven't analyzed any outfits
												yet.
											</p>
											<Button className="btn-gradient">
												Start Your First Analysis
											</Button>
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="wardrobe" className="space-y-6">
							{isPro ? (
								<Card className="card-fashion">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<BarChart3 className="w-5 h-5 text-primary" />
											Wardrobe Recommendations
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											{wardrobeRecommendations.map(
												(rec, index) => (
													<div
														key={index}
														className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
													>
														<div>
															<h4 className="font-medium">
																{rec.category}
															</h4>
															<p className="text-sm text-muted-foreground">
																{rec.items}{" "}
																items currently
															</p>
															<p className="text-sm mt-1">
																{
																	rec.recommendation
																}
															</p>
														</div>
														<Badge
															variant={
																rec.priority ===
																"high"
																	? "destructive"
																	: rec.priority ===
																	  "medium"
																	? "default"
																	: "secondary"
															}
														>
															{rec.priority}{" "}
															priority
														</Badge>
													</div>
												)
											)}
										</div>
									</CardContent>
								</Card>
							) : (
								<Card className="card-fashion relative">
									<div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 backdrop-blur-sm rounded-lg z-10" />
									<CardHeader className="relative z-20">
										<CardTitle className="flex items-center gap-2">
											<Lock className="w-5 h-5 text-blue-600" />
											Wardrobe Recommendations - Pro
											Feature
										</CardTitle>
									</CardHeader>
									<CardContent className="relative z-20">
										<div className="text-center py-8">
											<div className="mb-6 relative">
												<div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-full mx-auto flex items-center justify-center">
													<BarChart3 className="w-8 h-8 text-white" />
												</div>
											</div>
											<h3 className="text-xl font-semibold mb-2">
												Unlock Wardrobe Insights
											</h3>
											<p className="text-muted-foreground mb-6 max-w-md mx-auto">
												Get personalized wardrobe
												recommendations, gap analysis,
												and style suggestions with our
												Pro plan.
											</p>
											<Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2">
												Upgrade to Pro
											</Button>
										</div>
									</CardContent>
								</Card>
							)}
						</TabsContent>

						<TabsContent value="insights" className="space-y-6">
							{isPro ? (
								<div className="grid lg:grid-cols-2 gap-6">
									<Card className="card-fashion">
										<CardHeader>
											<CardTitle>
												Style Evolution
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="text-center py-8">
												<TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
												<p className="text-muted-foreground">
													Style evolution chart coming
													soon
												</p>
											</div>
										</CardContent>
									</Card>

									<Card className="card-fashion">
										<CardHeader>
											<CardTitle>
												Color Analysis
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="text-center py-8">
												<BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
												<p className="text-muted-foreground">
													Color analysis coming soon
												</p>
											</div>
										</CardContent>
									</Card>
								</div>
							) : (
								<Card className="card-fashion relative">
									<div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 backdrop-blur-sm rounded-lg z-10" />
									<CardHeader className="relative z-20">
										<CardTitle className="flex items-center gap-2">
											<Lock className="w-5 h-5 text-blue-600" />
											Style Insights - Pro Feature
										</CardTitle>
									</CardHeader>
									<CardContent className="relative z-20">
										<div className="text-center py-8">
											<div className="mb-6 relative">
												<div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-full mx-auto flex items-center justify-center">
													<Star className="w-8 h-8 text-white" />
												</div>
											</div>
											<h3 className="text-xl font-semibold mb-2">
												Unlock Advanced Analytics
											</h3>
											<p className="text-muted-foreground mb-6 max-w-md mx-auto">
												Discover your style evolution,
												color preferences, and detailed
												fashion insights with advanced
												analytics.
											</p>
											<Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2">
												Upgrade to Pro
											</Button>
										</div>
									</CardContent>
								</Card>
							)}
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
