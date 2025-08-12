import { useState, useEffect } from "react";
import {
	User,
	Palette,
	Heart,
	ShoppingBag,
	Save,
	Camera,
	AlertCircle,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navbar } from "@/components/navigation/navbar";
import { Badge } from "@/components/ui/badge";
import { userAPI } from "@/services/api";
import { UserPreferences } from "@/types";
import { useAuthStore } from "@/stores/authStore";

export default function Profile() {
	const { user } = useAuthStore();
	const [preferences, setPreferences] = useState<UserPreferences | null>(
		null
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
	const [selectedColors, setSelectedColors] = useState<string[]>([]);
	const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
	const [bodyType, setBodyType] = useState<string>("");
	const [budgetRange, setBudgetRange] = useState<string>("");

	// Fetch user preferences on component mount
	useEffect(() => {
		if (user?.username) {
			setLoading(true);
			setError(null);

			userAPI
				.getPreferences()
				.then((response) => {
					console.log("API Response:", response);
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

					console.log("Extracted preferences:", prefs);
					setPreferences(prefs);

					// Set form values from API response
					setSelectedStyles(prefs.style_preference || []);
					setSelectedColors(prefs.color_preferences || []);
					setSelectedOccasions(prefs.occasion_types || []);
					setBodyType(prefs.body_type || "");
					setBudgetRange(prefs.budget_range || "");
				})
				.catch((err) => {
					console.error("Failed to load preferences:", err);
					setError(err.message || "Failed to load preferences");
				})
				.finally(() => {
					setLoading(false);
				});
		}
	}, [user?.username]);

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
			setError("User not authenticated");
			return;
		}

		setSaving(true);
		setError(null);

		try {
			const updatedPreferences: UserPreferences = {
				style_preference: selectedStyles,
				color_preferences: selectedColors,
				body_type: bodyType,
				occasion_types: selectedOccasions,
				budget_range: budgetRange,
			};

			await userAPI.updatePreferences(updatedPreferences);
			setPreferences(updatedPreferences);

			// Show success message (you could add a toast here)
			console.log("Preferences saved successfully!");
		} catch (err: any) {
			console.error("Failed to save preferences:", err);
			setError(err.message || "Failed to save preferences");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-hero">
			<Navbar />

			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					{/* Header */}
					<div className="text-center mb-8 animate-fade-up">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
							<User className="w-8 h-8 text-primary" />
						</div>
						<h1 className="text-4xl font-bold mb-4">
							Your Style Profile
						</h1>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Customize your preferences to get personalized
							fashion recommendations
						</p>
					</div>

					{/* Error Alert */}
					{error && (
						<Alert variant="destructive" className="mb-6">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

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
						<div className="grid lg:grid-cols-3 gap-8">
							{/* Profile Picture & Basic Info */}
							<div className="lg:col-span-1">
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
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Preferences */}
							<div className="lg:col-span-2 space-y-8">
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
											<div className="grid grid-cols-9 gap-3">
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

								{/* Additional Preferences */}
								<Card className="card-fashion">
									<CardHeader>
										<CardTitle>
											Additional Preferences
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-6">
										<div className="grid md:grid-cols-2 gap-4">
											<div>
												<Label htmlFor="bodyType">
													Body Type
												</Label>
												<Select
													value={bodyType}
													onValueChange={setBodyType}
												>
													<SelectTrigger className="input-fashion">
														<SelectValue placeholder="Select body type" />
													</SelectTrigger>
													<SelectContent>
														{bodyTypes.map(
															(type) => (
																<SelectItem
																	key={type}
																	value={type.toLowerCase()}
																>
																	{type}
																</SelectItem>
															)
														)}
													</SelectContent>
												</Select>
											</div>
											<div>
												<Label htmlFor="budget">
													Budget Range
												</Label>
												<Select
													value={budgetRange}
													onValueChange={
														setBudgetRange
													}
												>
													<SelectTrigger className="input-fashion">
														<SelectValue placeholder="Select budget range" />
													</SelectTrigger>
													<SelectContent>
														{budgetRanges.map(
															(range) => (
																<SelectItem
																	key={range}
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
										<div>
											<Label htmlFor="notes">
												Style Notes
											</Label>
											<Textarea
												id="notes"
												placeholder="Tell us more about your style preferences, favorite brands, or specific requirements..."
												className="input-fashion min-h-[100px]"
											/>
										</div>
									</CardContent>
								</Card>

								{/* Save Button */}
								<div className="flex justify-end">
									<Button
										onClick={handleSave}
										className="btn-gradient"
										disabled={saving || loading}
									>
										<Save className="w-4 h-4 mr-2" />
										{saving
											? "Saving..."
											: "Save Preferences"}
									</Button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
