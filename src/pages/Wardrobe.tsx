import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Shirt,
	Plus,
	Upload,
	ImageIcon,
	List,
	Edit,
	Trash2,
	Search,
	Filter,
	Tag,
	Lock,
	Heart,
	CheckCircle,
	Footprints,
	Watch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/ui/image-upload";
import { Navbar } from "@/components/navigation/navbar";
import { toast } from "sonner";
import {
	useWardrobeItems,
	useCreateWardrobeItem,
	useCreateBulkWardrobeItems,
	useUpdateWardrobeItem,
	useDeleteWardrobeItem,
	useUploadItemImage,
	usePricingTier,
	useMarkItemWorn,
} from "@/hooks/useCalendar";

const Wardrobe = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("summary");
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [seasonFilter, setSeasonFilter] = useState("all");

	// Form states for adding new items
	const [newItemForm, setNewItemForm] = useState({
		description: "",
		category: "",
		subcategory: "",
		color_primary: "",
		color_secondary: "",
		brand: "",
		size: "",
		season: "",
		occasion: "",
		tags: "",
		is_favorite: false,
	});

	// Simple text input for bulk wardrobe items (free users)
	const [bulkWardrobeText, setBulkWardrobeText] = useState("");

	// Image upload state
	const [uploadedImage, setUploadedImage] = useState<File | null>(null);
	const [imageDescription, setImageDescription] = useState("");

	// API hooks
	const {
		data: wardrobeData,
		isLoading,
		error,
		refetch,
	} = useWardrobeItems();
	const createItem = useCreateWardrobeItem();
	const createBulkItems = useCreateBulkWardrobeItems();
	const updateItem = useUpdateWardrobeItem();
	const deleteItem = useDeleteWardrobeItem();
	const markItemWorn = useMarkItemWorn();
	const uploadImage = useUploadItemImage();
	const { data: pricingData, isLoading: pricingLoading } = usePricingTier();

	// Get pricing tier information
	const isPro = pricingData?.data?.is_pro || false;
	const tierFeatures = pricingData?.data?.tier_features;

	// Get wardrobe items from API response
	const wardrobeItems = wardrobeData?.data?.wardrobe || [];
	//console.log("Wardrobe items:", wardrobeItems);

	// Filter items based on search and filters
	const filteredItems = wardrobeItems.filter((item: any) => {
		const matchesSearch =
			item.description
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.color_primary
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			item.tags?.some((tag: string) =>
				tag.toLowerCase().includes(searchTerm.toLowerCase())
			);

		const matchesCategory =
			categoryFilter === "all" || item.category === categoryFilter;
		const matchesSeason =
			seasonFilter === "all" || item.season === seasonFilter;

		return matchesSearch && matchesCategory && matchesSeason;
	});

	// Handle form submission for text-based item creation
	const handleCreateTextItem = async () => {
		if (
			!newItemForm.description ||
			!newItemForm.category ||
			!newItemForm.color_primary
		) {
			toast.error(
				"Please fill in at least description, category, and primary color"
			);
			return;
		}

		try {
			const itemData = {
				description: newItemForm.description,
				category: newItemForm.category as any,
				color_primary: newItemForm.color_primary,
				color_secondary: newItemForm.color_secondary || undefined,
				brand: newItemForm.brand || undefined,
				season: (newItemForm.season as any) || "all",
				occasion: newItemForm.occasion
					? [newItemForm.occasion]
					: ["casual"],
				tags: newItemForm.tags
					.split(",")
					.map((tag) => tag.trim())
					.filter((tag) => tag),
				favorite: newItemForm.is_favorite,
			};

			await createItem.mutateAsync(itemData);

			// Reset form
			setNewItemForm({
				description: "",
				category: "",
				subcategory: "",
				color_primary: "",
				color_secondary: "",
				brand: "",
				size: "",
				season: "",
				occasion: "",
				tags: "",
				is_favorite: false,
			});

			// Toast is handled by the hook
		} catch (error) {
			console.error("Failed to create wardrobe item:", error);
		}
	};

	// Handle bulk wardrobe text submission (for free users)
	const handleCreateBulkItems = async () => {
		if (!bulkWardrobeText.trim()) {
			toast.error("Please enter your wardrobe items");
			return;
		}

		try {
			// Send the full text directly to backend for LLM processing
			await createBulkItems.mutateAsync(bulkWardrobeText.trim());
			setBulkWardrobeText("");
		} catch (error) {
			console.error("Failed to create bulk wardrobe items:", error);
		}
	};

	// Handle image upload and item creation
	const handleCreateImageItem = async () => {
		if (!isPro) {
			toast.error(
				"Image upload is only available for Pro users. Please upgrade your account."
			);
			return;
		}

		if (!uploadedImage || !imageDescription) {
			toast.error("Please upload an image and provide a description");
			return;
		}

		try {
			// Create item first with basic info derived from description
			const itemData = {
				description: imageDescription,
				category: "top" as any, // Default category, could be improved with AI classification
				color_primary: "multicolor", // Default color, could be improved with AI detection
				season: "all" as any,
				occasion: ["casual"],
			};

			const newItem = await createItem.mutateAsync(itemData);

			// Upload image for the created item
			if (newItem.data.id) {
				await uploadImage.mutateAsync({
					id: newItem.data.id.toString(),
					file: uploadedImage,
				});
			}

			// Reset form
			setUploadedImage(null);
			setImageDescription("");

			// Toasts are handled by the hooks
		} catch (error) {
			console.error("Failed to create wardrobe item with image:", error);
		}
	};

	// Handle item deletion
	const handleDeleteItem = async (itemId: string) => {
		try {
			await deleteItem.mutateAsync(itemId);
		} catch (error) {
			console.error("Failed to delete item:", error);
		}
	};

	// Handle mark as worn toggle (backend handles the toggle logic)
	const handleMarkAsWorn = async (itemId: string) => {
		try {
			// Find the current item to determine its state before toggle
			const currentItem = wardrobeItems.find(
				(item) => item.id.toString() === itemId
			);
			const now = new Date().toISOString(); // Get full timestamp in ISO format
			await markItemWorn.mutateAsync({ id: itemId, date: now });

			// Show appropriate toast based on the item's previous state
			if (currentItem?.is_available) {
				toast.success("Item marked as worn and sent to laundry!");
			} else {
				toast.success("Item marked as ready to wear!");
			}
		} catch (error) {
			console.error("Failed to toggle item worn status:", error);
		}
	};

	// Get category color for badges
	const getCategoryColor = (category: string) => {
		const colors = {
			tops: "bg-blue-100 text-blue-800",
			bottoms: "bg-green-100 text-green-800",
			shoes: "bg-purple-100 text-purple-800",
			accessories: "bg-yellow-100 text-yellow-800",
			outerwear: "bg-gray-100 text-gray-800",
			dresses: "bg-pink-100 text-pink-800",
			suits: "bg-indigo-100 text-indigo-800",
			shirt: "bg-cyan-100 text-cyan-800",
			pants: "bg-orange-100 text-orange-800",
			top: "bg-blue-100 text-blue-800",
		};
		return (
			colors[category as keyof typeof colors] ||
			"bg-gray-100 text-gray-800"
		);
	};

	// Get category icon for items without images
	const getCategoryIcon = (category: string) => {
		const icons = {
			top: Shirt,
			shirt: Shirt,
			pants: Shirt, // Using Shirt as fallback since Underwear doesn't exist
			shoes: Footprints,
			accessories: Watch,
			outerwear: Shirt, // Using Shirt as fallback since Coat doesn't exist
			dresses: Shirt, // Using Shirt as fallback since Dress doesn't exist
			suits: Shirt, // Using Shirt as fallback
		};
		return icons[category as keyof typeof icons] || Shirt;
	};

	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-6xl mx-auto space-y-6">
					{/* Header */}
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<div>
							<div className="flex items-center gap-3">
								<h1 className="text-3xl font-bold">
									My Wardrobe
								</h1>
								{pricingLoading ? (
									<Skeleton className="h-6 w-16 rounded-full" />
								) : (
									<Badge
										variant={
											isPro ? "default" : "secondary"
										}
										className={
											isPro
												? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
												: ""
										}
									>
										{tierFeatures?.name ||
											(isPro ? "Pro" : "Free")}
									</Badge>
								)}
							</div>
							<p className="text-muted-foreground mt-1">
								Manage your clothing items and create outfits
								{!isPro &&
									" • Upgrade to Pro for image uploads and detailed item management"}
							</p>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground">
								{wardrobeItems.length} items
								{tierFeatures?.max_wardrobe_items && (
									<span className="text-xs">
										{" "}
										/ {tierFeatures.max_wardrobe_items} max
									</span>
								)}
							</span>
						</div>
					</div>

					{/* Search and Filters */}
					<Card>
						<CardContent className="pt-6">
							<div className="flex flex-col sm:flex-row gap-4">
								<div className="flex-1">
									<div className="relative">
										<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Search wardrobe items..."
											value={searchTerm}
											onChange={(e) =>
												setSearchTerm(e.target.value)
											}
											className="pl-9"
										/>
									</div>
								</div>
								<Select
									value={categoryFilter}
									onValueChange={setCategoryFilter}
								>
									<SelectTrigger className="w-full sm:w-40">
										<SelectValue placeholder="Category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											All Categories
										</SelectItem>
										<SelectItem value="top">
											Tops
										</SelectItem>
										<SelectItem value="shirt">
											Shirts
										</SelectItem>
										<SelectItem value="pants">
											Pants
										</SelectItem>
										<SelectItem value="shoes">
											Shoes
										</SelectItem>
										<SelectItem value="accessories">
											Accessories
										</SelectItem>
									</SelectContent>
								</Select>
								<Select
									value={seasonFilter}
									onValueChange={setSeasonFilter}
								>
									<SelectTrigger className="w-full sm:w-32">
										<SelectValue placeholder="Season" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											All Seasons
										</SelectItem>
										<SelectItem value="spring">
											Spring
										</SelectItem>
										<SelectItem value="summer">
											Summer
										</SelectItem>
										<SelectItem value="fall">
											Fall
										</SelectItem>
										<SelectItem value="winter">
											Winter
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>

					{/* Main Content Tabs */}
					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger
								value="summary"
								className="flex items-center gap-2"
							>
								<List className="w-4 h-4" />
								Summary/Text View
							</TabsTrigger>
							<TabsTrigger
								value="image"
								className="flex items-center gap-2"
							>
								<ImageIcon className="w-4 h-4" />
								Image View {!isPro && "(Upload Locked)"}
							</TabsTrigger>
						</TabsList>

						{/* Summary/Text Tab */}
						<TabsContent value="summary" className="space-y-6">
							{/* Add New Item Form */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Plus className="w-5 h-5" />
										{isPro
											? "Add New Item (Detailed)"
											: "Add Wardrobe Items"}
									</CardTitle>
									{!isPro && (
										<p className="text-sm text-muted-foreground">
											Enter all your wardrobe items in the
											text area below.
										</p>
									)}
								</CardHeader>
								<CardContent>
									{/* Show bulk text input for all users, but prioritize Pro features */}
									{isPro ? (
										<>
											{/* Pro users get both options */}
											<div className="space-y-6">
												{/* Quick bulk add option for Pro users */}
												<div className="space-y-4">
													<div className="flex items-center gap-2">
														<div className="h-px bg-border flex-1" />
														<Badge
															variant="secondary"
															className="text-xs"
														>
															Quick Bulk Add
														</Badge>
														<div className="h-px bg-border flex-1" />
													</div>
													<div>
														<Label htmlFor="bulkItemsPro">
															Add Multiple Items
															(Quick)
														</Label>
														<Textarea
															id="bulkItemsPro"
															placeholder="Example&#10;2 brown cotton jeans , 1 white t-shirt, 3 black sneakers, 1 red hoodie with red inscription"
															value={
																bulkWardrobeText
															}
															onChange={(e) =>
																setBulkWardrobeText(
																	e.target
																		.value
																)
															}
															rows={4}
															className="mt-2"
														/>
														<p className="text-xs text-muted-foreground mt-2">
															Quick way to add
															multiple items - LLM
															will parse all the
															text and generate
															your wardrobe items.
														</p>
													</div>
													<Button
														onClick={
															handleCreateBulkItems
														}
														disabled={
															createBulkItems.isPending
														}
														className="flex items-center gap-2"
														variant="outline"
													>
														<Plus className="w-4 h-4" />
														{createBulkItems.isPending
															? "Processing..."
															: "Add All Items"}
													</Button>
												</div>

												{/* Divider */}
												<div className="flex items-center gap-2">
													<div className="h-px bg-border flex-1" />
													<Badge
														variant="default"
														className="text-xs bg-gradient-to-r from-purple-500 to-pink-500"
													>
														Detailed Item Management
													</Badge>
													<div className="h-px bg-border flex-1" />
												</div>
											</div>
										</>
									) : (
										<>
											{/* Free users get blurred LLM section and detailed form */}
											<div className="space-y-6">
												{/* Blurred LLM section for free users */}
												<div className="relative">
													<div className="space-y-4 p-4 border rounded-lg bg-muted/30">
														<div className="flex items-center gap-2">
															<div className="h-px bg-border flex-1" />
															<Badge
																variant="outline"
																className="text-xs"
															>
																AI Bulk Add (Pro
																Only)
															</Badge>
															<div className="h-px bg-border flex-1" />
														</div>
														<div>
															<Label htmlFor="bulkItemsBlurred">
																Add Multiple
																Items (AI)
															</Label>
															<Textarea
																id="bulkItemsBlurred"
																placeholder="Example&#10;2 brown cotton jeans , 1 white t-shirt, 3 black sneakers, 1 red hoodie with red inscription"
																value=""
																rows={4}
																className="mt-2"
																disabled
															/>
															<p className="text-xs text-muted-foreground mt-2">
																AI-powered bulk
																addition
																available with
																Pro subscription
															</p>
														</div>
														<Button
															disabled
															className="flex items-center gap-2 opacity-50 cursor-not-allowed"
															variant="outline"
														>
															<Plus className="w-4 h-4" />
															Upgrade to Pro
														</Button>
													</div>
													{/* Blur overlay */}
													<div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] rounded-lg flex items-center justify-center">
														<div className="text-center p-4">
															<Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
															<Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-2">
																Pro Feature
															</Badge>
															<p className="text-sm text-muted-foreground">
																AI bulk addition
																requires Pro
																subscription
															</p>
														</div>
													</div>
												</div>

												{/* Divider */}
												<div className="flex items-center gap-2">
													<div className="h-px bg-border flex-1" />
													<Badge
														variant="secondary"
														className="text-xs"
													>
														Detailed Item Management
													</Badge>
													<div className="h-px bg-border flex-1" />
												</div>
											</div>
										</>
									)}

									{/* Detailed form - always shown and functional for all users */}
									<div className="space-y-4">
										{/* Detailed form fields - enabled for all users */}
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<div>
												<Label htmlFor="description">
													Item Description *
												</Label>
												<Input
													id="description"
													placeholder="Blue cotton t-shirt"
													value={
														newItemForm.description
													}
													onChange={(e) =>
														setNewItemForm(
															(prev) => ({
																...prev,
																description:
																	e.target
																		.value,
															})
														)
													}
												/>
											</div>
											<div>
												<Label htmlFor="category">
													Category *
												</Label>
												<Select
													value={newItemForm.category}
													onValueChange={(value) =>
														setNewItemForm(
															(prev) => ({
																...prev,
																category: value,
															})
														)
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select category" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="top">
															Top
														</SelectItem>
														<SelectItem value="shirt">
															Shirt
														</SelectItem>
														<SelectItem value="pants">
															Pants
														</SelectItem>
														<SelectItem value="shoes">
															Shoes
														</SelectItem>
														<SelectItem value="accessories">
															Accessories
														</SelectItem>
														<SelectItem value="outerwear">
															Outerwear
														</SelectItem>
														<SelectItem value="dresses">
															Dresses
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
											<div>
												<Label htmlFor="color">
													Primary Color *
												</Label>
												<Input
													id="color"
													placeholder="Blue"
													value={
														newItemForm.color_primary
													}
													onChange={(e) =>
														setNewItemForm(
															(prev) => ({
																...prev,
																color_primary:
																	e.target
																		.value,
															})
														)
													}
												/>
											</div>
											<div>
												<Label htmlFor="brand">
													Brand (Optional)
												</Label>
												<Input
													id="brand"
													placeholder="Nike"
													value={newItemForm.brand}
													onChange={(e) =>
														setNewItemForm(
															(prev) => ({
																...prev,
																brand: e.target
																	.value,
															})
														)
													}
												/>
											</div>
											<div>
												<Label htmlFor="season">
													Season
												</Label>
												<Select
													value={newItemForm.season}
													onValueChange={(value) =>
														setNewItemForm(
															(prev) => ({
																...prev,
																season: value,
															})
														)
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select season" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="all">
															All Seasons
														</SelectItem>
														<SelectItem value="spring">
															Spring
														</SelectItem>
														<SelectItem value="summer">
															Summer
														</SelectItem>
														<SelectItem value="fall">
															Fall
														</SelectItem>
														<SelectItem value="winter">
															Winter
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
											<div>
												<Label htmlFor="occasion">
													Occasion
												</Label>
												<Select
													value={newItemForm.occasion}
													onValueChange={(value) =>
														setNewItemForm(
															(prev) => ({
																...prev,
																occasion: value,
															})
														)
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select occasion" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="casual">
															Casual
														</SelectItem>
														<SelectItem value="business">
															Business
														</SelectItem>
														<SelectItem value="formal">
															Formal
														</SelectItem>
														<SelectItem value="workout">
															Workout
														</SelectItem>
														<SelectItem value="party">
															Party
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
										<div className="mt-4 space-y-4">
											<div className="flex items-center space-x-2">
												<Checkbox
													id="is_favorite"
													checked={
														newItemForm.is_favorite
													}
													onCheckedChange={(
														checked
													) =>
														setNewItemForm(
															(prev) => ({
																...prev,
																is_favorite:
																	!!checked,
															})
														)
													}
												/>
												<Label
													htmlFor="is_favorite"
													className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
												>
													Mark as favorite
												</Label>
											</div>
											<Button
												onClick={handleCreateTextItem}
												disabled={
													createItem.isPending ||
													!newItemForm.description.trim() ||
													!newItemForm.category ||
													!newItemForm.color_primary.trim()
												}
												className="flex items-center gap-2"
											>
												<Plus className="w-4 h-4" />
												{createItem.isPending
													? "Adding..."
													: "Add Item"}
											</Button>
											{!isPro && (
												<p className="text-xs text-muted-foreground">
													<Button
														variant="link"
														className="p-0 h-auto text-purple-600 hover:text-purple-700"
														onClick={() =>
															navigate("/profile")
														}
													>
														Upgrade to Pro
													</Button>{" "}
													for AI bulk addition and
													advanced features
												</p>
											)}
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Wardrobe Items List */}
							<Card>
								<CardHeader>
									<CardTitle>Your Wardrobe Items</CardTitle>
								</CardHeader>
								<CardContent>
									{isLoading ? (
										<div className="space-y-4">
											{[...Array(3)].map((_, i) => (
												<div
													key={i}
													className="flex items-center space-x-4"
												>
													<Skeleton className="h-12 w-12 rounded" />
													<div className="space-y-2 flex-1">
														<Skeleton className="h-4 w-full" />
														<Skeleton className="h-4 w-2/3" />
													</div>
												</div>
											))}
										</div>
									) : error ? (
										<Alert>
											<AlertDescription>
												Failed to load wardrobe items.
												Please try again.
											</AlertDescription>
										</Alert>
									) : filteredItems.length === 0 ? (
										<div className="text-center py-8">
											<Shirt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
											<h3 className="text-lg font-medium mb-2">
												No items found
											</h3>
											<p className="text-muted-foreground">
												{wardrobeItems.length === 0
													? "Add your first wardrobe item to get started"
													: "Try adjusting your search or filters"}
											</p>
										</div>
									) : (
										<div className="space-y-4">
											{filteredItems.map((item: any) => (
												<div
													key={item.id}
													className="flex items-center justify-between p-4 border rounded-lg"
												>
													<div className="flex items-center gap-4">
														<div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
															{(() => {
																const IconComponent =
																	getCategoryIcon(
																		item.category
																	);
																return (
																	<IconComponent className="w-6 h-6 text-muted-foreground" />
																);
															})()}
														</div>
														<div>
															<h4 className="font-medium">
																{
																	item.description
																}
															</h4>
															<div className="flex items-center gap-2 mt-1">
																<Badge
																	className={getCategoryColor(
																		item.category
																	)}
																>
																	{item.subcategory ||
																		item.category}
																</Badge>
																<Badge
																	variant="outline"
																	className="text-xs"
																>
																	{
																		item.color_primary
																	}
																</Badge>
																{item.season && (
																	<Badge
																		variant="outline"
																		className="text-xs"
																	>
																		{
																			item.season
																		}
																	</Badge>
																)}
																<Badge
																	variant={
																		item.is_available
																			? "default"
																			: "secondary"
																	}
																	className={`text-xs ${
																		item.is_available
																			? "bg-green-100 text-green-800"
																			: "bg-orange-100 text-orange-800"
																	}`}
																>
																	{item.is_available
																		? "Ready to Wear"
																		: "In Laundry"}
																</Badge>
															</div>
															{item.tags &&
																item.tags
																	.length >
																	0 && (
																	<div className="flex items-center gap-1 mt-1">
																		<Tag className="w-3 h-3 text-muted-foreground" />
																		<span className="text-xs text-muted-foreground">
																			{item.tags.join(
																				", "
																			)}
																		</span>
																	</div>
																)}
															{item.last_worn_date && (
																<div className="flex items-center gap-1 mt-1">
																	<CheckCircle className="w-3 h-3 text-green-600" />
																	<span className="text-xs text-muted-foreground">
																		Worn{" "}
																		{new Date(
																			item.last_worn_date
																		).toLocaleString(
																			undefined,
																			{
																				year: "numeric",
																				month: "short",
																				day: "numeric",
																				hour: "2-digit",
																				minute: "2-digit",
																				timeZoneName:
																					"short",
																			}
																		)}
																	</span>
																</div>
															)}
														</div>
													</div>
													<div className="flex items-center gap-2">
														{item.is_favorite && (
															<Heart className="w-4 h-4 text-red-500 fill-red-500" />
														)}
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																handleMarkAsWorn(
																	item.id.toString()
																)
															}
															disabled={
																markItemWorn.isPending
															}
															className={
																item.is_available
																	? "text-green-600 hover:text-green-700 hover:bg-green-50"
																	: "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
															}
															title="Toggle worn status"
														>
															<CheckCircle className="w-4 h-4 mr-1" />
															{item.is_available
																? "Mark as Worn"
																: "Mark as Clean"}
														</Button>
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																handleDeleteItem(
																	item.id.toString()
																)
															}
															disabled={
																deleteItem.isPending
															}
														>
															<Trash2 className="w-4 h-4" />
														</Button>
													</div>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						{/* Image View Tab */}
						<TabsContent value="image" className="space-y-6">
							{/* Add New Item with Image - Pro only or disabled preview */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Upload className="w-5 h-5" />
										Add New Item (Image)
										{!isPro && (
											<Badge
												variant="outline"
												className="ml-2"
											>
												Pro Only
											</Badge>
										)}
									</CardTitle>
									{!isPro && (
										<p className="text-sm text-muted-foreground">
											Image upload is available with our
											Pro plan. Upgrade to add items with
											photos.
										</p>
									)}
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="relative">
											<Label htmlFor="image">
												Upload Image
											</Label>
											<div className="relative">
												{isPro ? (
													<ImageUpload
														onUpload={(file) =>
															setUploadedImage(
																Array.isArray(
																	file
																)
																	? file[0]
																	: file
															)
														}
														className="mt-2"
													/>
												) : (
													<div className="mt-2 border-2 border-dashed rounded-xl p-8 text-center bg-muted/50">
														<div className="space-y-4">
															<div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
																<Lock className="w-8 h-8 text-muted-foreground" />
															</div>
															<div className="space-y-2">
																<h3 className="text-lg font-semibold text-muted-foreground">
																	Pro Feature
																</h3>
																<p className="text-muted-foreground">
																	Image upload
																	is available
																	with Pro
																	subscription
																</p>
															</div>
														</div>
													</div>
												)}
											</div>
											{uploadedImage && (
												<p className="text-sm text-muted-foreground mt-2">
													Selected:{" "}
													{uploadedImage.name}
												</p>
											)}
										</div>
										<div className="relative">
											<Label htmlFor="imageDescription">
												Description
											</Label>
											<div className="relative">
												<Textarea
													id="imageDescription"
													placeholder="Describe this clothing item (e.g., Blue denim jacket with silver buttons)"
													value={imageDescription}
													onChange={(e) =>
														setImageDescription(
															e.target.value
														)
													}
													rows={3}
													disabled={!isPro}
													className="mt-2"
												/>
												{!isPro && (
													<div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
														<div className="text-center">
															<Lock className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
															<p className="text-xs text-muted-foreground">
																Pro Only
															</p>
														</div>
													</div>
												)}
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Button
												onClick={handleCreateImageItem}
												disabled={
													!isPro ||
													createItem.isPending ||
													uploadImage.isPending ||
													!uploadedImage ||
													!imageDescription.trim()
												}
												className="flex items-center gap-2"
											>
												<Upload className="w-4 h-4" />
												{createItem.isPending ||
												uploadImage.isPending
													? "Adding..."
													: !isPro
													? "Upgrade to Add Images"
													: "Add Item with Image"}
											</Button>
											{!isPro && (
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														navigate("/profile")
													}
													className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
												>
													Upgrade to Pro
												</Button>
											)}
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Image Grid View - Available for all users */}
							<Card>
								<CardHeader>
									<CardTitle>Wardrobe Gallery</CardTitle>
									<p className="text-sm text-muted-foreground">
										{!isPro &&
											"Items added through text view or Pro image uploads will appear here"}
									</p>
								</CardHeader>
								<CardContent>
									{isLoading ? (
										<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
											{[...Array(6)].map((_, i) => (
												<Skeleton
													key={i}
													className="aspect-square rounded-lg"
												/>
											))}
										</div>
									) : filteredItems.length === 0 ? (
										<div className="text-center py-8">
											<ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
											<h3 className="text-lg font-medium mb-2">
												No items to display
											</h3>
											<p className="text-muted-foreground">
												{isPro
													? "Add items with images to see them in the gallery"
													: "Add items from the Summary/Text view to populate your gallery"}
											</p>
										</div>
									) : (
										<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
											{filteredItems.map((item: any) => (
												<div
													key={item.id}
													className="group relative"
												>
													<div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
														{item.image_url ? (
															<img
																src={
																	item.image_url
																}
																alt={
																	item.description
																}
																className="w-full h-full object-cover"
															/>
														) : (
															(() => {
																const IconComponent =
																	getCategoryIcon(
																		item.category
																	);
																return (
																	<IconComponent className="w-8 h-8 text-muted-foreground" />
																);
															})()
														)}
													</div>
													<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
														<div className="text-center text-white p-2">
															<p className="text-sm font-medium truncate">
																{
																	item.description
																}
															</p>
															<div className="flex items-center justify-center gap-1 mt-1">
																<Badge className="text-xs">
																	{
																		item.color_primary
																	}
																</Badge>
																<Badge
																	className={`text-xs ${
																		item.is_available
																			? "bg-green-500"
																			: "bg-orange-500"
																	}`}
																>
																	{item.is_available
																		? "Ready to Wear"
																		: "In Laundry"}
																</Badge>
															</div>
															{item.last_worn_date && (
																<p className="text-xs mt-1 opacity-90">
																	Worn{" "}
																	{new Date(
																		item.last_worn_date
																	).toLocaleString(
																		undefined,
																		{
																			year: "numeric",
																			month: "short",
																			day: "numeric",
																			hour: "2-digit",
																			minute: "2-digit",
																			timeZoneName:
																				"short",
																		}
																	)}{" "}
																	•{" "}
																	{item.is_available
																		? "Ready"
																		: "Laundry"}
																</p>
															)}
														</div>
													</div>
													<div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
														<Button
															variant="secondary"
															size="sm"
															onClick={() =>
																handleMarkAsWorn(
																	item.id.toString()
																)
															}
															disabled={
																markItemWorn.isPending
															}
															className={`h-8 px-2 text-xs ${
																item.is_available
																	? "bg-green-600 hover:bg-green-700 text-white"
																	: "bg-orange-600 hover:bg-orange-700 text-white"
															}`}
															title="Toggle worn status"
														>
															<CheckCircle className="w-3 h-3 mr-1" />
															{item.is_available
																? "Mark as Worn"
																: "Mark as Clean"}
														</Button>
													</div>
													<Button
														variant="destructive"
														size="sm"
														className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
														onClick={() =>
															handleDeleteItem(
																item.id.toString()
															)
														}
													>
														<Trash2 className="w-3 h-3" />
													</Button>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
};

export default Wardrobe;
