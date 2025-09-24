import { useCountryList } from "@/hooks/useCountryList";
import { useState, useEffect } from "react";
import {
	User,
	Palette,
	Heart,
	ShoppingBag,
	Save,
	Camera,
	Calendar,
	ArrowRight,
	Globe,
	Users,
	Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StyleChip } from "@/components/ui/style-chip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/navigation/navbar";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { userAPI } from "@/services/api";
import { UserPreferences, PersonalStyleGuide } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import { Link } from "react-router-dom";
import { useUserPricingTier } from "@/hooks/usePricing";

export default function Profile() {
	const countryList = useCountryList();
	const { user } = useAuthStore();
	const { data: userTier, isLoading: pricingLoading } = useUserPricingTier();
	const [preferences, setPreferences] = useState<UserPreferences | null>(
		null
	);
	const [personal_style_guide, setPersonalStyleGuide] =
		useState<PersonalStyleGuide | null>(null);
	const isPro = userTier?.tier !== "free";
	const hasPreferences = Boolean(
		preferences && Object.keys(preferences).length > 0
	);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const { toast } = useToast();
	const [averageScore, setAverageScore] = useState<number | null>(null);
	const [showWelcomeModal, setShowWelcomeModal] = useState(false);

	const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
	const [selectedColors, setSelectedColors] = useState<string[]>([]);
	const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
	const [bodyType, setBodyType] = useState<string>("");
	const [budgetRange, setBudgetRange] = useState<string>("");
	const [country, setCountry] = useState<string>("");
	const [gender, setGender] = useState<string>("");

	// Fetch user preferences on component mount
	useEffect(() => {
		if (user?.username) {
			setLoading(true);

			userAPI
				.getPreferences()
				.then((response) => {
					//console.log("API Response:", response);
					// Handle different response structures
					let prefs: UserPreferences;

					if (response.data && typeof response.data === "object") {
						// Check if response has nested data structure {status: 200, data: {...}}
						if ("data" in response.data && response.data.data) {
							prefs = response.data.data as UserPreferences;
						} else {
							// Direct data structure
							prefs = response.data as UserPreferences;
						}
					} else {
						// Fallback to response itself if it's the preferences object
						prefs = response as any;
					}

					//console.log("Extracted preferences:", prefs);

					setPersonalStyleGuide(prefs.personal_style_guide || null);
					setPreferences(prefs);
					setAverageScore(prefs.average_score || null);
					/* console.log(
						"Personal Style Guide:",
						prefs.personal_style_guide
					); */

					// Set form values from API response
					setSelectedStyles(prefs.style_preference || []);
					setSelectedColors(prefs.color_preferences || []);
					setSelectedOccasions(prefs.occasion_types || []);
					setBodyType(prefs.body_type || "");
					setBudgetRange(prefs.budget_range || "");
					setCountry(prefs.country || "");
					setGender(prefs.gender || "");
				})
				.catch((err) => {
					console.error("Failed to load preferences:", err);
					toast({
						title: "Failed to load preferences",
						description:
							err instanceof Error
								? err.message
								: "Failed to load preferences",
						variant: "destructive",
					});
				})
				.finally(() => {
					setLoading(false);
				});
		}
	}, [user?.username]);

	// Show welcome modal for yc2025 user
	useEffect(() => {
		if (user?.username === "yc2025" && !loading) {
			// Small delay to ensure the page has loaded
			const timer = setTimeout(() => {
				setShowWelcomeModal(true);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [user?.username, loading]);

	const styleOptions = [
		"Casual",
		"Formal",
		"Minimalist",
		"Bohemian",
		"Classic",
		"Trendy",
		"Vintage",
		"Sporty",
		"Elegant",
		"Edgy",
		"Romantic",
		"Preppy",
	];

	const colorOptions = [
		"#000000",
		"#FFFFFF",
		"#FF0000",
		"#00FF00",
		"#0000FF",
		"#FFFF00",
		"#FF00FF",
		"#00FFFF",
		"#FFA500",
		"#800080",
		"#FFC0CB",
		"#A52A2A",
		"#808080",
		"#000080",
		"#008000",
		"#800000",
		"#4F46E5",
		"#7C3AED",
	];

	const occasionOptions = [
		"Work",
		"Casual",
		"Formal Events",
		"Date Night",
		"Travel",
		"Sports",
		"Party",
		"Wedding",
		"Business",
		"Weekend",
		"Vacation",
		"Shopping",
	];

	const bodyTypes = [
		"Apple",
		"Pear",
		"Hourglass",
		"Rectangle",
		"Inverted Triangle",
		"Prefer not to say",
	];

	const budgetRanges = [
		"Under $50",
		"$50 - $100",
		"$100 - $200",
		"$200 - $500",
		"$500+",
		"No budget limit",
	];

	const toggleStyle = (style: string) => {
		setSelectedStyles((prev) =>
			prev.includes(style.toLowerCase())
				? prev.filter((s) => s !== style.toLowerCase())
				: [...prev, style.toLowerCase()]
		);
	};

	const toggleColor = (color: string) => {
		setSelectedColors((prev) =>
			prev.includes(color)
				? prev.filter((c) => c !== color)
				: [...prev, color]
		);
	};

	const toggleOccasion = (occasion: string) => {
		setSelectedOccasions((prev) =>
			prev.includes(occasion.toLowerCase())
				? prev.filter((o) => o !== occasion.toLowerCase())
				: [...prev, occasion.toLowerCase()]
		);
	};

	const handleSave = async () => {
		if (!user?.username) {
			toast({
				title: "Not authenticated",
				description: "Please sign in to save your preferences.",
				variant: "destructive",
			});
			return;
		}

		setSaving(true);

		try {
			const updatedPreferences: UserPreferences = {
				style_preference: selectedStyles,
				color_preferences: selectedColors,
				body_type: bodyType,
				occasion_types: selectedOccasions,
				budget_range: budgetRange,
				country: country,
				gender: gender,
			};

			const response = await userAPI.updatePreferences(
				updatedPreferences
			);
			//console.log("Update preferences response:", response);
			//console.log("Response data:", response.data);
			/* console.log(
				"Response structure:",
				typeof response.data,
				Object.keys(response.data || {})
			); */

			// Update the preferences state
			setPreferences(updatedPreferences);

			// Handle the PersonalStyleGuide response - try multiple possible structures
			let styleGuideData = null;

			// Check if response.data directly contains personal_style_guide
			if (response.data?.personal_style_guide) {
				styleGuideData = response.data.personal_style_guide;
			}
			/* // Check if response itself contains personal_style_guide
			else if (response.personal_style_guide) {
				styleGuideData = response;
			}
			// Check if response.data.data contains personal_style_guide
			else if (response.data?.data?.personal_style_guide) {
				styleGuideData = response.data.data;
			}
 */
			if (styleGuideData) {
				setPersonalStyleGuide(styleGuideData);
				toast({
					title: "Preferences saved",
					description:
						"Preferences saved and personal style guide generated!",
				});
			} else {
				toast({
					title: "Preferences saved",
					description: "Preferences saved successfully!",
				});
			}
		} catch (err: any) {
			console.error("Failed to save preferences:", err);
			toast({
				title: "Save failed",
				description:
					err instanceof Error
						? err.message
						: "Failed to save preferences",
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-hero pt-16">
			<Navbar />

			<div className="container mx-auto px-4 py-8">
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<div className="text-center mb-8 animate-fade-up">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
							<User className="w-8 h-8 text-primary" />
						</div>
						<h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4">
							Your Style Profile
						</h1>
						<p className="text-lg xl:text-xl text-muted-foreground max-w-3xl xl:max-w-4xl mx-auto mb-6">
							Customize your preferences to get personalized
							fashion recommendations
						</p>
						{averageScore !== null && (
							<div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-6 py-3 border border-primary/20">
								<Star className="w-5 h-5 text-primary fill-primary" />
								<div className="text-center">
									<div className="text-sm text-muted-foreground">
										Average Fashion Score
									</div>
									<div className="text-2xl font-bold text-primary">
										{averageScore.toFixed(1)}/100
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Loading State */}
					{loading && (
						<div className="text-center py-8">
							<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
							<p className="mt-2 text-muted-foreground">
								Loading preferences...
							</p>
						</div>
					)}

					{/* Main Content */}
					{!loading && (
						<div className="grid lg:grid-cols-3 xl:grid-cols-4 gap-8">
							{/* Profile Picture & Basic Info */}
							<div className="lg:col-span-1 xl:col-span-1">
								<Card className="card-fashion">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Camera className="w-5 h-5 text-primary" />
											Profile Photo
										</CardTitle>
									</CardHeader>
									<CardContent className="text-center space-y-4">
										<div className="w-32 h-32 bg-gradient-primary rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold">
											JD
										</div>
										<Button
											variant="outline"
											className="w-full"
										>
											Upload Photo
										</Button>
										<div className="space-y-4 pt-4">
											<div>
												<Label htmlFor="name">
													Display Name
												</Label>
												<Input
													id="name"
													defaultValue={
														user?.username || ""
													}
													className="input-fashion"
												/>
											</div>
											<div>
												<Label htmlFor="email">
													Email
												</Label>
												<Input
													id="email"
													defaultValue={
														user?.email || ""
													}
													className="input-fashion"
													disabled
												/>
											</div>
											<div>
												<Label htmlFor="country">
													Country
												</Label>
												<div className="relative">
													<Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
													<Select
														value={country}
														onValueChange={
															setCountry
														}
													>
														<SelectTrigger className="input-fashion pl-10">
															<SelectValue placeholder="Select country" />
														</SelectTrigger>
														<SelectContent className="max-h-60 overflow-y-auto">
															{countryList.map(
																(c) => (
																	<SelectItem
																		key={c}
																		value={
																			c
																		}
																	>
																		{c}
																	</SelectItem>
																)
															)}
														</SelectContent>
													</Select>
												</div>
											</div>
											<div>
												<Label htmlFor="gender">
													Gender
												</Label>
												<div className="relative">
													<Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
													<Select
														value={gender}
														onValueChange={
															setGender
														}
													>
														<SelectTrigger className="input-fashion pl-10">
															<SelectValue placeholder="Select gender" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="male">
																Male
															</SelectItem>
															<SelectItem value="female">
																Female
															</SelectItem>
															<SelectItem value="non-binary">
																Non-binary
															</SelectItem>
															<SelectItem value="prefer not to say">
																Prefer not to
																say
															</SelectItem>
														</SelectContent>
													</Select>
												</div>
											</div>
											<div>
												<Label htmlFor="body_type">
													Body Type
												</Label>
												<div className="relative">
													<Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
													<Select
														value={bodyType}
														onValueChange={
															setBodyType
														}
													>
														<SelectTrigger className="input-fashion pl-10">
															<SelectValue placeholder="Select body type" />
														</SelectTrigger>
														<SelectContent>
															{bodyTypes.map(
																(type) => (
																	<SelectItem
																		key={
																			type
																		}
																		value={type.toLowerCase()}
																	>
																		{type}
																	</SelectItem>
																)
															)}
														</SelectContent>
													</Select>
												</div>
											</div>
											<div>
												<Label htmlFor="budget">
													Budget Range
												</Label>
												<div className="relative">
													<Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
													<Select
														value={budgetRange}
														onValueChange={
															setBudgetRange
														}
													>
														<SelectTrigger className="input-fashion pl-10">
															<SelectValue placeholder="Select budget range" />
														</SelectTrigger>
														<SelectContent>
															{budgetRanges.map(
																(range) => (
																	<SelectItem
																		key={
																			range
																		}
																		value={range.toLowerCase()}
																	>
																		{range}
																	</SelectItem>
																)
															)}
														</SelectContent>
													</Select>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Preferences */}
							<div className="lg:col-span-2 xl:col-span-3 space-y-8">
								{/* Style Preferences */}
								<Card className="card-fashion">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Heart className="w-5 h-5 text-primary" />
											Style Preferences
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div>
											<Label className="text-base font-medium mb-3 block">
												What styles do you love?
												<Badge
													variant="secondary"
													className="ml-2"
												>
													{selectedStyles.length}{" "}
													selected
												</Badge>
											</Label>
											<div className="flex flex-wrap gap-2">
												{styleOptions.map((style) => (
													<StyleChip
														key={style}
														label={style}
														selected={selectedStyles.includes(
															style.toLowerCase()
														)}
														onClick={() =>
															toggleStyle(style)
														}
													/>
												))}
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Color Preferences */}
								<Card className="card-fashion">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Palette className="w-5 h-5 text-primary" />
											Color Palette
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div>
											<Label className="text-base font-medium mb-3 block">
												Your favorite colors
												<Badge
													variant="secondary"
													className="ml-2"
												>
													{selectedColors.length}{" "}
													selected
												</Badge>
											</Label>
											<div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9 gap-3">
												{colorOptions.map((color) => (
													<StyleChip
														key={color}
														label=""
														variant="color"
														color={color}
														selected={selectedColors.includes(
															color
														)}
														onClick={() =>
															toggleColor(color)
														}
													/>
												))}
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Occasion Preferences */}
								<Card className="card-fashion">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<ShoppingBag className="w-5 h-5 text-primary" />
											Occasion Types
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div>
											<Label className="text-base font-medium mb-3 block">
												What occasions do you dress for?
												<Badge
													variant="secondary"
													className="ml-2"
												>
													{selectedOccasions.length}{" "}
													selected
												</Badge>
											</Label>
											<div className="flex flex-wrap gap-2">
												{occasionOptions.map(
													(occasion) => (
														<StyleChip
															key={occasion}
															label={occasion}
															selected={selectedOccasions.includes(
																occasion.toLowerCase()
															)}
															onClick={() =>
																toggleOccasion(
																	occasion
																)
															}
														/>
													)
												)}
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Personal Style Guide - Separate Card */}
								{personal_style_guide && (
									<Card className="card-fashion">
										<CardHeader>
											<CardTitle className="flex items-center gap-2">
												<Heart className="w-5 h-5 text-primary" />
												Your Personal Style Guide
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-6">
											{[
												{
													label: "Style Principles",
													key: "style_principles",
												},
												{
													label: "Color Palette",
													key: "color_palette",
												},
												{
													label: "Essential Pieces",
													key: "essential_pieces",
												},
												{
													label: "Shopping Priorities",
													key: "shopping_priorities",
												},
												{
													label: "Styling Tips",
													key: "styling_tips",
												},
											].map(({ label, key }) => {
												const value =
													personal_style_guide?.[
														key as keyof typeof personal_style_guide
													];
												if (!value) return null;
												return (
													<div
														key={key}
														className="space-y-2"
													>
														<Label className="font-semibold text-lg">
															{label}
														</Label>
														{Array.isArray(
															value
														) ? (
															<ul className="list-disc pl-6 text-muted-foreground space-y-1">
																{value.map(
																	(
																		item: string,
																		idx: number
																	) => (
																		<li
																			key={
																				idx
																			}
																			className="leading-relaxed"
																		>
																			{
																				item
																			}
																		</li>
																	)
																)}
															</ul>
														) : typeof value ===
																"object" &&
														  value !== null ? (
															<div className="text-muted-foreground space-y-1">
																{Object.entries(
																	value
																).map(
																	(
																		[
																			key,
																			val,
																		],
																		idx
																	) => (
																		<p
																			key={
																				idx
																			}
																			className="leading-relaxed"
																		>
																			<span className="font-medium capitalize">
																				{key.replace(
																					/_/g,
																					" "
																				)}

																				:
																			</span>{" "}
																			{String(
																				val
																			)}
																		</p>
																	)
																)}
															</div>
														) : (
															<p className="text-muted-foreground whitespace-pre-line leading-relaxed">
																{String(value)}
															</p>
														)}
													</div>
												);
											})}
										</CardContent>
									</Card>
								)}

								{/* Calendar Integration */}
								<Card className="card-fashion">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Calendar className="w-5 h-5 text-primary" />
											Calendar Integration
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<p className="text-muted-foreground">
											Connect your calendar to get
											AI-powered outfit recommendations
											for your upcoming events.
										</p>
										<div className="flex flex-col sm:flex-row gap-3">
											<Button
												variant="outline"
												asChild
												className="flex-1"
											>
												<Link to="/calendar-connect">
													<Calendar className="w-4 h-4 mr-2" />
													Connect Calendar
												</Link>
											</Button>
											<Button
												variant="ghost"
												asChild
												className="flex-1"
											>
												<Link to="/calendar-view">
													View Calendar
													<ArrowRight className="w-4 h-4 ml-2" />
												</Link>
											</Button>
										</div>
									</CardContent>
								</Card>

								{/* Save / Update Button (gated by preferences existence + Pro tier) */}
								<div className="flex justify-end">
									{
										// Determine if the user already has saved preferences
										(() => {
											// If the user has preferences, show the "Update" action only for Pro users
											if (hasPreferences) {
												if (isPro) {
													return (
														<Button
															onClick={handleSave}
															className="btn-gradient"
															disabled={
																saving ||
																loading
															}
														>
															<Save className="w-4 h-4 mr-2" />
															{saving
																? "Saving..."
																: "Update Preferences"}
														</Button>
													);
												} else {
													// Not Pro: prompt to upgrade instead of showing update action
													return (
														<Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2">
															Upgrade to Pro
														</Button>
													);
												}
											} else {
												// No existing preferences: allow initial save for all users
												return (
													<Button
														onClick={handleSave}
														className="btn-gradient"
														disabled={
															saving || loading
														}
													>
														<Save className="w-4 h-4 mr-2" />
														{saving
															? "Saving..."
															: "Save Preferences"}
													</Button>
												);
											}
										})()
									}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Welcome Modal for yc2025 */}
			<Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							🎉 Welcome to Closetic AI - Your Fashion Assistant!
						</DialogTitle>
						<DialogDescription className="text-center text-lg">
							You've been granted access to test our premium
							features!
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6 mt-6">
						{/* Account Status */}
						<div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
							<div className="flex items-center gap-3 mb-3">
								<div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
									<Star className="w-5 h-5 text-white fill-white" />
								</div>
								<h3 className="text-xl font-bold text-green-800 dark:text-green-200">
									Premium Test Account
								</h3>
							</div>
							<p className="text-green-700 dark:text-green-300">
								Your account (yc2025) has been set up with the
								highest pricing tier for testing purposes. You
								have access to all premium features without any
								limitations!
							</p>
						</div>

						{/* App Features */}
						<div className="space-y-4">
							<h3 className="text-xl font-bold flex items-center gap-2">
								✨ Full App Features Available to You:
							</h3>

							<div className="grid md:grid-cols-2 gap-4">
								<div className="space-y-3">
									<div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
										<Camera className="w-5 h-5 text-blue-600 mt-0.5" />
										<div>
											<h4 className="font-semibold text-blue-800 dark:text-blue-200">
												AI Fashion Analysis
											</h4>
											<p className="text-sm text-blue-700 dark:text-blue-300">
												Upload photos for instant style
												analysis and personalized
												recommendations
											</p>
										</div>
									</div>

									<div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
										<Heart className="w-5 h-5 text-purple-600 mt-0.5" />
										<div>
											<h4 className="font-semibold text-purple-800 dark:text-purple-200">
												Personal Style Guide
											</h4>
											<p className="text-sm text-purple-700 dark:text-purple-300">
												Get AI-generated style
												principles, color palettes, and
												shopping tips
											</p>
										</div>
									</div>

									<div className="flex items-start gap-3 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
										<ShoppingBag className="w-5 h-5 text-pink-600 mt-0.5" />
										<div>
											<h4 className="font-semibold text-pink-800 dark:text-pink-200">
												Wardrobe Management
											</h4>
											<p className="text-sm text-pink-700 dark:text-pink-300">
												Organize your clothing items and
												get outfit suggestions
											</p>
										</div>
									</div>
								</div>

								<div className="space-y-3">
									<div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
										<Calendar className="w-5 h-5 text-orange-600 mt-0.5" />
										<div>
											<h4 className="font-semibold text-orange-800 dark:text-orange-200">
												Calendar Integration
											</h4>
											<p className="text-sm text-orange-700 dark:text-orange-300">
												Connect Google Calendar for
												event-based outfit
												recommendations
											</p>
										</div>
									</div>

									<div className="flex items-start gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
										<User className="w-5 h-5 text-teal-600 mt-0.5" />
										<div>
											<h4 className="font-semibold text-teal-800 dark:text-teal-200">
												Style Preferences
											</h4>
											<p className="text-sm text-teal-700 dark:text-teal-300">
												Set your style preferences,
												colors, and occasions for better
												recommendations
											</p>
										</div>
									</div>

									<div className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
										<Palette className="w-5 h-5 text-indigo-600 mt-0.5" />
										<div>
											<h4 className="font-semibold text-indigo-800 dark:text-indigo-200">
												Color Analysis
											</h4>
											<p className="text-sm text-indigo-700 dark:text-indigo-300">
												Advanced color harmony analysis
												and palette recommendations
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Voice Agent Highlight */}
						<div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
							<div className="flex items-center gap-3 mb-3">
								<div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
									<span className="text-white text-lg">
										🎤
									</span>
								</div>
								<h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">
									Try Our Voice Agent!
								</h3>
							</div>
							<p className="text-blue-700 dark:text-blue-300 mb-4">
								Experience our cutting-edge voice-powered
								fashion assistant. Click the microphone button
								in the bottom-right corner to start a
								conversation and get personalized fashion
								advice!
							</p>
							<div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
								<span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
								Available 24/7 with instant responses
							</div>
						</div>

						{/* Additional Information */}
						<div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800">
							<div className="flex items-center gap-3 mb-3">
								<div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
									<span className="text-white text-lg">
										ℹ️
									</span>
								</div>
								<h3 className="text-xl font-bold text-amber-800 dark:text-amber-200">
									Important Information
								</h3>
							</div>
							<div className="space-y-3 text-amber-700 dark:text-amber-300">
								<p>
									<strong>Wardrobe Items:</strong> Your
									account has been pre-populated with sample
									wardrobe items to help you explore the
									features immediately.
								</p>
								<p>
									<strong>Google Account:</strong> A Google
									account has already been connected to your
									profile, so you can start generating outfits
									for calendar events right away.
								</p>
								<p>
									<strong>Calendar Connection:</strong> You
									can also connect additional Google accounts
									in the{" "}
									<Link
										to="/calendar-connect"
										className="underline hover:text-amber-800"
									>
										Calendar Connect
									</Link>{" "}
									page for even more personalized
									recommendations.
								</p>
							</div>
						</div>

						{/* Call to Action */}
						<div className="text-center pt-4 border-t">
							<p className="text-muted-foreground mb-4">
								Start exploring all these features and let us
								know your feedback!
							</p>
							<Button
								onClick={() => setShowWelcomeModal(false)}
								className="btn-gradient px-8 py-3"
							>
								Start Exploring ✨
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
