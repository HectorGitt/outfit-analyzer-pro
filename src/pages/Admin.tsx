import { useState, useEffect } from "react";
import {
	Shield,
	Users,
	TrendingUp,
	MessageCircle,
	Filter,
	Download,
	Calendar,
	RefreshCw,
	BarChart3,
	Palette,
	Target,
	Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navbar } from "@/components/navigation/navbar";
import { toast } from "sonner";
import { adminAPI } from "@/services/api";
import { Link } from "react-router-dom";

// API Types based on FastAPI endpoints
interface AnalyticsData {
	total_analyses: number;
	popular_styles: string[];
	common_issues: string[];
	user_satisfaction: number;
}

interface FashionTrends {
	trending_styles?: string[];
	popular_colors?: string[];
	emerging_movements?: string[];
	sustainability_trends?: string[];
	predictions?: string[];
	raw_trends?: string;
}

interface StyleDatabase {
	style_categories: Record<
		string,
		{
			description: string;
			key_pieces: string[];
			occasions: string[];
		}
	>;
	color_theory: {
		complementary: string[];
		analogous: string[];
		triadic: string[];
		seasonal_palettes: Record<string, string[]>;
	};
	body_types: Record<
		string,
		{
			characteristics: string;
			flattering: string[];
			avoid: string[];
		}
	>;
}

interface UserInsights {
	most_analyzed_styles: string[];
	common_fashion_issues: string[];
	user_satisfaction_trend: number[];
	total_users_served: number;
	improvement_areas: string[];
}

export default function Admin() {
	const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
	const [trends, setTrends] = useState<FashionTrends | null>(null);
	const [styleDatabase, setStyleDatabase] = useState<StyleDatabase | null>(
		null
	);
	const [userInsights, setUserInsights] = useState<UserInsights | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("analytics");
	const [serverStatus, setServerStatus] = useState<
		"online" | "offline" | "unknown"
	>("unknown");

	// Mock data for development/fallback
	const mockAnalytics: AnalyticsData = {
		total_analyses: 15420,
		popular_styles: [
			"Minimalist",
			"Casual",
			"Professional",
			"Streetwear",
			"Bohemian",
		],
		common_issues: [
			"Color coordination",
			"Fit problems",
			"Style consistency",
			"Occasion mismatch",
		],
		user_satisfaction: 87,
	};

	const mockTrends: FashionTrends = {
		trending_styles: [
			"Sustainable Fashion",
			"Gender Fluid",
			"Tech-Integrated",
			"Cultural Fusion",
		],
		popular_colors: [
			"Sage Green",
			"Warm Neutrals",
			"Deep Blues",
			"Earth Tones",
		],
		emerging_movements: [
			"Circular Fashion",
			"AI-Designed Clothing",
			"Virtual Wardrobes",
		],
		raw_trends:
			"Current fashion trends show a strong shift towards sustainability and technology integration. Consumers are increasingly interested in eco-friendly materials and smart clothing.",
	};

	const mockStyleDatabase: StyleDatabase = {
		style_categories: {
			minimalist: {
				description:
					"Clean, simple designs with neutral colors and basic shapes",
				key_pieces: ["White tee", "Black pants", "Blazer", "Loafers"],
				occasions: ["Office", "Casual", "Travel"],
			},
			bohemian: {
				description:
					"Free-spirited, artistic style with flowing fabrics and eclectic patterns",
				key_pieces: [
					"Maxi dress",
					"Kimono",
					"Ankle boots",
					"Layered jewelry",
				],
				occasions: ["Festivals", "Beach", "Casual outings"],
			},
		},
		color_theory: {
			complementary: ["Red", "Green", "Blue", "Orange"],
			analogous: ["Blue", "Blue-Green", "Green"],
			triadic: ["Red", "Yellow", "Blue"],
			seasonal_palettes: {
				spring: ["Pastels", "Light greens", "Soft yellows"],
				summer: ["Bright colors", "Tropical hues", "Light blues"],
				fall: ["Earth tones", "Deep reds", "Warm oranges"],
				winter: ["Dark colors", "Rich jewel tones", "Cool metallics"],
			},
		},
		body_types: {
			hourglass: {
				characteristics: "Balanced proportions with defined waist",
				flattering: [
					"Fitted dresses",
					"High-waisted pants",
					"Belted tops",
				],
				avoid: ["Boxy shapes", "Oversized clothing"],
			},
		},
	};

	const mockUserInsights: UserInsights = {
		most_analyzed_styles: [
			"Casual",
			"Professional",
			"Streetwear",
			"Minimalist",
		],
		common_fashion_issues: [
			"Color coordination",
			"Fit issues",
			"Style consistency",
		],
		user_satisfaction_trend: [82, 85, 87, 89, 87],
		total_users_served: 15420,
		improvement_areas: [
			"Color analysis accuracy",
			"Size recommendations",
			"Style diversity",
		],
	};

	// Fetch data from FastAPI endpoints
	const fetchAnalytics = async () => {
		try {
			const response = await adminAPI.getAdminAnalytics();
			setAnalytics(response.data);
			setServerStatus("online");
		} catch (err) {
			console.error("Analytics fetch error:", err);
			// Use mock data as fallback
			setAnalytics(mockAnalytics);
			setServerStatus("offline");
			toast.warning("Using demo data - FastAPI server not available");
		}
	};

	const fetchTrends = async () => {
		try {
			const response = await adminAPI.getAdminTrends();
			setTrends(response.data);
		} catch (err) {
			console.error("Trends fetch error:", err);
			// Use mock data as fallback
			setTrends(mockTrends);
		}
	};

	const fetchStyleDatabase = async () => {
		try {
			const response = await adminAPI.getStyleDatabase();
			setStyleDatabase(response.data);
		} catch (err) {
			console.error("Style database fetch error:", err);
			// Use mock data as fallback
			setStyleDatabase(mockStyleDatabase);
		}
	};

	const fetchUserInsights = async () => {
		try {
			const response = await adminAPI.getUserInsights();
			setUserInsights(response.data);
		} catch (err) {
			console.error("User insights fetch error:", err);
			// Use mock data as fallback
			setUserInsights(mockUserInsights);
		}
	};

	const refreshAllData = async () => {
		setLoading(true);

		await Promise.all([
			fetchAnalytics(),
			fetchTrends(),
			fetchStyleDatabase(),
			fetchUserInsights(),
		]);

		setLoading(false);
		toast.success("Data refreshed successfully");
	};

	useEffect(() => {
		refreshAllData();
	}, []);

	const getCategoryColor = (category: string) => {
		switch (category) {
			case "positive":
				return "bg-success text-success-foreground";
			case "suggestion":
				return "bg-primary text-primary-foreground";
			case "issue":
				return "bg-warning text-warning-foreground";
			default:
				return "bg-secondary text-secondary-foreground";
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-hero pt">
				<Navbar />
				<div className="container mx-auto px-4 py-8">
					<div className="max-w-7xl mx-auto">
						<div className="flex items-center gap-3 mb-8">
							<Skeleton className="w-8 h-8" />
							<Skeleton className="h-8 w-64" />
						</div>
						<div className="grid md:grid-cols-4 gap-6 mb-8">
							{[...Array(4)].map((_, i) => (
								<Card key={i}>
									<CardContent className="p-6">
										<Skeleton className="h-4 w-24 mb-2" />
										<Skeleton className="h-8 w-16" />
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-hero pt-16">
			<Navbar />

			<div className="container mx-auto px-4 py-8">
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-fade-up">
						<div>
							<h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
								<Shield className="w-8 h-8 text-primary" />
								Admin Dashboard
							</h1>
							<p className="text-muted-foreground">
								Monitor platform performance and user insights
							</p>
							{serverStatus === "offline" && (
								<div className="flex items-center gap-2 mt-2">
									<div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
									<span className="text-sm text-orange-600">
										Demo Mode - FastAPI server offline
									</span>
								</div>
							)}
							{serverStatus === "online" && (
								<div className="flex items-center gap-2 mt-2">
									<div className="w-2 h-2 bg-green-500 rounded-full"></div>
									<span className="text-sm text-green-600">
										Live Data - Connected to FastAPI
									</span>
								</div>
							)}
						</div>
						<div className="flex items-center gap-4 mt-4 md:mt-0">
							<Button
								onClick={refreshAllData}
								variant="outline"
								className="gap-2"
							>
								<RefreshCw className="w-4 h-4" />
								Refresh Data
							</Button>
							<Link to="/admin/users">
								<Button variant="outline" className="gap-2">
									<Users className="w-4 h-4" />
									User Management
								</Button>
							</Link>
							<Button variant="outline" className="gap-2">
								<Download className="w-4 h-4" />
								Export Report
							</Button>
						</div>
					</div>

					{/* Stats Overview */}
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
						<Card className="card-fashion">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground mb-1">
											Total Analyses
										</p>
										<span className="text-2xl font-bold">
											{analytics?.total_analyses?.toLocaleString() ||
												"0"}
										</span>
									</div>
									<BarChart3 className="w-8 h-8 text-primary" />
								</div>
							</CardContent>
						</Card>

						<Card className="card-fashion">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground mb-1">
											User Satisfaction
										</p>
										<span className="text-2xl font-bold">
											{analytics?.user_satisfaction || 0}%
										</span>
									</div>
									<Star className="w-8 h-8 text-yellow-500" />
								</div>
							</CardContent>
						</Card>

						<Card className="card-fashion">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground mb-1">
											Popular Styles
										</p>
										<span className="text-2xl font-bold">
											{analytics?.popular_styles
												?.length || 0}
										</span>
									</div>
									<Palette className="w-8 h-8 text-purple-500" />
								</div>
							</CardContent>
						</Card>

						<Card className="card-fashion">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground mb-1">
											Common Issues
										</p>
										<span className="text-2xl font-bold">
											{analytics?.common_issues?.length ||
												0}
										</span>
									</div>
									<Target className="w-8 h-8 text-orange-500" />
								</div>
							</CardContent>
						</Card>
					</div>

					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="space-y-6"
					>
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="analytics">
								Analytics
							</TabsTrigger>
							<TabsTrigger value="trends">Trends</TabsTrigger>
							<TabsTrigger value="styles">
								Style Database
							</TabsTrigger>
							<TabsTrigger value="insights">
								User Insights
							</TabsTrigger>
						</TabsList>

						<TabsContent value="analytics" className="space-y-6">
							<div className="grid lg:grid-cols-2 gap-6">
								{/* Popular Styles */}
								<Card className="card-fashion">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Palette className="w-5 h-5 text-primary" />
											Popular Styles
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-3">
											{analytics?.popular_styles?.map(
												(style, index) => (
													<div
														key={index}
														className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
													>
														<span className="font-medium">
															{style}
														</span>
														<Badge variant="secondary">
															#{index + 1}
														</Badge>
													</div>
												)
											) || (
												<p className="text-muted-foreground text-center py-4">
													No style data available
												</p>
											)}
										</div>
									</CardContent>
								</Card>

								{/* Common Issues */}
								<Card className="card-fashion">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Target className="w-5 h-5 text-primary" />
											Common Issues
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-3">
											{analytics?.common_issues?.map(
												(issue, index) => (
													<div
														key={index}
														className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
													>
														<span className="font-medium">
															{issue}
														</span>
														<Badge variant="outline">
															#{index + 1}
														</Badge>
													</div>
												)
											) || (
												<p className="text-muted-foreground text-center py-4">
													No issue data available
												</p>
											)}
										</div>
									</CardContent>
								</Card>
							</div>
						</TabsContent>

						<TabsContent value="trends" className="space-y-6">
							<Card className="card-fashion">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<TrendingUp className="w-5 h-5 text-primary" />
										Fashion Trends Analysis
									</CardTitle>
								</CardHeader>
								<CardContent>
									{trends ? (
										<div className="space-y-6">
											{trends.trending_styles && (
												<div>
													<h4 className="font-semibold mb-3">
														Trending Styles
													</h4>
													<div className="grid md:grid-cols-2 gap-3">
														{trends.trending_styles.map(
															(style, index) => (
																<div
																	key={index}
																	className="p-3 bg-muted/50 rounded-lg"
																>
																	<span className="font-medium">
																		{style}
																	</span>
																</div>
															)
														)}
													</div>
												</div>
											)}

											{trends.popular_colors && (
												<div>
													<h4 className="font-semibold mb-3">
														Popular Colors
													</h4>
													<div className="grid md:grid-cols-3 gap-3">
														{trends.popular_colors.map(
															(color, index) => (
																<div
																	key={index}
																	className="p-3 bg-muted/50 rounded-lg"
																>
																	<span className="font-medium">
																		{color}
																	</span>
																</div>
															)
														)}
													</div>
												</div>
											)}

											{trends.emerging_movements && (
												<div>
													<h4 className="font-semibold mb-3">
														Emerging Movements
													</h4>
													<div className="space-y-2">
														{trends.emerging_movements.map(
															(
																movement,
																index
															) => (
																<div
																	key={index}
																	className="p-3 bg-muted/50 rounded-lg"
																>
																	<span className="font-medium">
																		{
																			movement
																		}
																	</span>
																</div>
															)
														)}
													</div>
												</div>
											)}

											{trends.raw_trends && (
												<div>
													<h4 className="font-semibold mb-3">
														Raw Trends Data
													</h4>
													<div className="p-4 bg-muted/50 rounded-lg">
														<p className="text-sm whitespace-pre-wrap">
															{trends.raw_trends}
														</p>
													</div>
												</div>
											)}
										</div>
									) : (
										<div className="text-center py-8">
											<TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
											<p className="text-muted-foreground">
												Loading fashion trends...
											</p>
											<Button
												onClick={fetchTrends}
												variant="outline"
												className="mt-4"
											>
												<RefreshCw className="w-4 h-4 mr-2" />
												Retry
											</Button>
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="styles" className="space-y-6">
							<Card className="card-fashion">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Palette className="w-5 h-5 text-primary" />
										Style Database
									</CardTitle>
								</CardHeader>
								<CardContent>
									{styleDatabase ? (
										<div className="space-y-6">
											{/* Style Categories */}
											<div>
												<h4 className="font-semibold mb-4">
													Style Categories
												</h4>
												<div className="grid md:grid-cols-2 gap-4">
													{Object.entries(
														styleDatabase.style_categories
													).map(([key, category]) => (
														<div
															key={key}
															className="p-4 bg-muted/50 rounded-lg"
														>
															<h5 className="font-medium capitalize mb-2">
																{key}
															</h5>
															<p className="text-sm text-muted-foreground mb-3">
																{
																	category.description
																}
															</p>
															<div className="space-y-2">
																<div>
																	<span className="text-xs font-medium text-muted-foreground">
																		Key
																		Pieces:
																	</span>
																	<div className="flex flex-wrap gap-1 mt-1">
																		{category.key_pieces.map(
																			(
																				piece,
																				idx
																			) => (
																				<Badge
																					key={
																						idx
																					}
																					variant="outline"
																					className="text-xs"
																				>
																					{
																						piece
																					}
																				</Badge>
																			)
																		)}
																	</div>
																</div>
																<div>
																	<span className="text-xs font-medium text-muted-foreground">
																		Occasions:
																	</span>
																	<div className="flex flex-wrap gap-1 mt-1">
																		{category.occasions.map(
																			(
																				occasion,
																				idx
																			) => (
																				<Badge
																					key={
																						idx
																					}
																					variant="secondary"
																					className="text-xs"
																				>
																					{
																						occasion
																					}
																				</Badge>
																			)
																		)}
																	</div>
																</div>
															</div>
														</div>
													))}
												</div>
											</div>

											{/* Color Theory */}
											<div>
												<h4 className="font-semibold mb-4">
													Color Theory
												</h4>
												<div className="grid md:grid-cols-2 gap-4">
													{Object.entries(
														styleDatabase.color_theory
													).map(([key, value]) => (
														<div
															key={key}
															className="p-4 bg-muted/50 rounded-lg"
														>
															<h5 className="font-medium capitalize mb-2">
																{key.replace(
																	"_",
																	" "
																)}
															</h5>
															{Array.isArray(
																value
															) ? (
																<div className="flex flex-wrap gap-1">
																	{value.map(
																		(
																			item,
																			idx
																		) => (
																			<Badge
																				key={
																					idx
																				}
																				variant="outline"
																				className="text-xs"
																			>
																				{
																					item
																				}
																			</Badge>
																		)
																	)}
																</div>
															) : (
																<div className="space-y-2">
																	{Object.entries(
																		value
																	).map(
																		([
																			season,
																			colors,
																		]) => (
																			<div
																				key={
																					season
																				}
																			>
																				<span className="text-xs font-medium capitalize">
																					{
																						season
																					}

																					:
																				</span>
																				<div className="flex flex-wrap gap-1 mt-1">
																					{colors.map(
																						(
																							color,
																							idx
																						) => (
																							<Badge
																								key={
																									idx
																								}
																								variant="secondary"
																								className="text-xs"
																							>
																								{
																									color
																								}
																							</Badge>
																						)
																					)}
																				</div>
																			</div>
																		)
																	)}
																</div>
															)}
														</div>
													))}
												</div>
											</div>
										</div>
									) : (
										<div className="text-center py-8">
											<Palette className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
											<p className="text-muted-foreground">
												Loading style database...
											</p>
											<Button
												onClick={fetchStyleDatabase}
												variant="outline"
												className="mt-4"
											>
												<RefreshCw className="w-4 h-4 mr-2" />
												Retry
											</Button>
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="insights" className="space-y-6">
							<div className="grid lg:grid-cols-2 gap-6">
								{/* User Insights */}
								<Card className="card-fashion">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Users className="w-5 h-5 text-primary" />
											User Insights
										</CardTitle>
									</CardHeader>
									<CardContent>
										{userInsights ? (
											<div className="space-y-4">
												<div>
													<h5 className="font-medium mb-2">
														Most Analyzed Styles
													</h5>
													<div className="space-y-2">
														{userInsights.most_analyzed_styles.map(
															(style, index) => (
																<div
																	key={index}
																	className="flex items-center justify-between p-2 bg-muted/50 rounded"
																>
																	<span className="text-sm">
																		{style}
																	</span>
																	<Badge variant="secondary">
																		#
																		{index +
																			1}
																	</Badge>
																</div>
															)
														)}
													</div>
												</div>

												<div>
													<h5 className="font-medium mb-2">
														Common Fashion Issues
													</h5>
													<div className="space-y-2">
														{userInsights.common_fashion_issues.map(
															(issue, index) => (
																<div
																	key={index}
																	className="flex items-center justify-between p-2 bg-muted/50 rounded"
																>
																	<span className="text-sm">
																		{issue}
																	</span>
																	<Badge variant="outline">
																		#
																		{index +
																			1}
																	</Badge>
																</div>
															)
														)}
													</div>
												</div>

												<div>
													<h5 className="font-medium mb-2">
														Total Users Served
													</h5>
													<div className="text-2xl font-bold text-primary">
														{userInsights.total_users_served.toLocaleString()}
													</div>
												</div>
											</div>
										) : (
											<div className="text-center py-8">
												<Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
												<p className="text-muted-foreground">
													Loading user insights...
												</p>
												<Button
													onClick={fetchUserInsights}
													variant="outline"
													className="mt-4"
												>
													<RefreshCw className="w-4 h-4 mr-2" />
													Retry
												</Button>
											</div>
										)}
									</CardContent>
								</Card>

								{/* Improvement Areas */}
								<Card className="card-fashion">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Target className="w-5 h-5 text-primary" />
											Improvement Areas
										</CardTitle>
									</CardHeader>
									<CardContent>
										{userInsights ? (
											<div className="space-y-3">
												{userInsights.improvement_areas.map(
													(area, index) => (
														<div
															key={index}
															className="p-3 bg-muted/50 rounded-lg"
														>
															<div className="flex items-center gap-2">
																<Target className="w-4 h-4 text-primary" />
																<span className="font-medium">
																	{area}
																</span>
															</div>
														</div>
													)
												)}
											</div>
										) : (
											<div className="text-center py-8">
												<Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
												<p className="text-muted-foreground">
													Loading improvement areas...
												</p>
											</div>
										)}
									</CardContent>
								</Card>
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
