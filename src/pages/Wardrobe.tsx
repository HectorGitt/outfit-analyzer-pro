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
	RotateCcw,
	X,
	Loader2,
	Zap,
	AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useAuthStore } from "@/stores/authStore";
import { pricingTiers } from "@/lib/pricingTiers";
import {
	useWardrobeItems,
	useCreateWardrobeItem,
	useCreateBulkWardrobeItems,
	useUpdateWardrobeItem,
	useDeleteWardrobeItem,
	useUploadItemImage,
	useMarkItemWorn,
} from "@/hooks/useCalendar";

import { WardrobeItemModal } from "@/components/ui/wardrobe-item-modal";

interface UploadedWardrobeFile {
	id: string;
	file: File;
	preview: string;
	isUploading: boolean;
	success?: boolean;
	error?: string;
	uploadedAt: Date;
}

const Wardrobe = () => {
	const navigate = useNavigate();
	const [viewMode, setViewMode] = useState<"text" | "image">("text");
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [seasonFilter, setSeasonFilter] = useState("all");
	const [bulkWardrobeText, setBulkWardrobeText] = useState("");
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
	const [uploadedImage, setUploadedImage] = useState<File | null>(null);
	const [uploadedWardrobeFiles, setUploadedWardrobeFiles] = useState<
		UploadedWardrobeFile[]
	>([]);
	const [isBatchUploading, setIsBatchUploading] = useState(false);
	const [selectedItem, setSelectedItem] = useState<any>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

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
	const { pricingTier } = useAuthStore();

	// Get pricing tier information and feature access
	const tierData = pricingTiers[pricingTier];
	const isPro = pricingTier !== "free";
	const canUploadImages = pricingTier === "icon"; // Only Icon tier gets image upload
	const maxWardrobeItems = tierData.max_wardrobe_items;
	const canUseBulkAdd = pricingTier !== "free"; // Paid tiers get bulk add

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

	// Stats for uploaded wardrobe files
	const wardrobeUploadStats = {
		total: uploadedWardrobeFiles.length,
		uploading: uploadedWardrobeFiles.filter((f) => f.isUploading).length,
		success: uploadedWardrobeFiles.filter((f) => f.success).length,
		pending: uploadedWardrobeFiles.filter(
			(f) => !f.success && !f.error && !f.isUploading
		).length,
		errors: uploadedWardrobeFiles.filter((f) => f.error).length,
	};

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
		if (!canUploadImages) {
			toast.error(
				"Image upload is only available for Pro users. Please upgrade your account."
			);
			return;
		}

		if (!uploadedImage) {
			toast.error("Please upload an image");
			return;
		}

		try {
			// Send only the image to the API - backend will create the wardrobe item
			await uploadImage.mutateAsync({
				id: "", // Empty ID since we're creating from image
				file: uploadedImage,
			});

			// Reset form
			setUploadedImage(null);

			// Toasts are handled by the hooks
		} catch (error) {
			console.error("Failed to create wardrobe item with image:", error);
		}
	};

	// Handle multiple wardrobe file uploads
	const handleWardrobeFileUpload = (files: File[]) => {
		if (!canUploadImages) {
			toast.error(
				"Image upload is only available for Pro users. Please upgrade your account."
			);
			return;
		}

		const newUploadedFiles: UploadedWardrobeFile[] = files.map((file) => ({
			id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
			file,
			preview: "",
			isUploading: false,
			uploadedAt: new Date(),
		}));

		// Create previews for new files
		newUploadedFiles.forEach((uploadedFile) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const preview = e.target?.result as string;
				setUploadedWardrobeFiles((prev) =>
					prev.map((f) =>
						f.id === uploadedFile.id ? { ...f, preview } : f
					)
				);
			};
			reader.readAsDataURL(uploadedFile.file);
		});

		setUploadedWardrobeFiles((prev) => [...prev, ...newUploadedFiles]);
	};

	// Handle batch upload of wardrobe items
	const handleBatchWardrobeUpload = async () => {
		const pendingFiles = uploadedWardrobeFiles.filter(
			(f) => !f.success && !f.isUploading && !f.error
		);

		if (pendingFiles.length === 0) return;

		setIsBatchUploading(true);

		try {
			await Promise.all(
				pendingFiles.map((file) => uploadWardrobeFile(file.id))
			);
		} finally {
			setIsBatchUploading(false);
		}
	};

	// Handle individual wardrobe file upload with retry
	const uploadWardrobeFile = async (fileId: string): Promise<void> => {
		setUploadedWardrobeFiles((prev) =>
			prev.map((f) =>
				f.id === fileId
					? { ...f, isUploading: true, error: undefined }
					: f
			)
		);

		try {
			const fileData = uploadedWardrobeFiles.find((f) => f.id === fileId);
			if (!fileData) return;

			await uploadImage.mutateAsync({
				id: "", // Empty ID since we're creating from image
				file: fileData.file,
			});

			setUploadedWardrobeFiles((prev) =>
				prev.map((f) =>
					f.id === fileId
						? { ...f, isUploading: false, success: true }
						: f
				)
			);
		} catch (err: any) {
			console.error("❌ Wardrobe upload failed:", err);
			const errorMessage =
				err?.message ||
				err?.details?.message ||
				"Failed to upload wardrobe item";

			setUploadedWardrobeFiles((prev) =>
				prev.map((f) =>
					f.id === fileId
						? { ...f, error: errorMessage, isUploading: false }
						: f
				)
			);
		}
	};

	// Remove uploaded wardrobe file
	const removeWardrobeFile = (fileId: string) => {
		setUploadedWardrobeFiles((prev) => prev.filter((f) => f.id !== fileId));
	};

	// Clear all uploaded wardrobe files
	const clearAllWardrobeFiles = () => {
		setUploadedWardrobeFiles([]);
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

	// Modal handlers
	const handleItemClick = (item: any) => {
		setSelectedItem(item);
		setIsModalOpen(true);
	};

	const handleModalClose = () => {
		setIsModalOpen(false);
		setSelectedItem(null);
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
		<div className="min-h-screen bg-background pt-16">
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
								<Badge
									variant={isPro ? "default" : "secondary"}
									className={
										isPro
											? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
											: ""
									}
								>
									{pricingTiers[
										pricingTier as keyof typeof pricingTiers
									]?.name || "Free"}
								</Badge>
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
								{maxWardrobeItems > 0 && (
									<span className="text-xs">
										{" "}
										/ {maxWardrobeItems} max
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

					{/* Floating View Toggle */}
					<div className="fixed top-20 right-4 z-50">
						<div className="bg-background border rounded-lg shadow-lg p-1">
							<div className="flex items-center gap-1">
								<Button
									variant={
										viewMode === "text"
											? "default"
											: "ghost"
									}
									size="sm"
									onClick={() => setViewMode("text")}
									className="h-8 px-3"
								>
									<List className="w-4 h-4 mr-1" />
									Text
								</Button>
								<Button
									variant={
										viewMode === "image"
											? "default"
											: "ghost"
									}
									size="sm"
									onClick={() => setViewMode("image")}
									className="h-8 px-3"
								>
									<ImageIcon className="w-4 h-4 mr-1" />
									Image
									{!canUploadImages && (
										<Lock className="w-3 h-3 ml-1" />
									)}
								</Button>
							</div>
						</div>
					</div>

					{/* Main Content */}
					{viewMode === "text" ? (
						<>
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
									{canUseBulkAdd ? (
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
											{!canUseBulkAdd && (
												<p className="text-xs text-muted-foreground">
													<Button
														variant="link"
														className="p-0 h-auto text-purple-600 hover:text-purple-700"
														onClick={() =>
															navigate("/pricing")
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
													className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
													onClick={() =>
														handleItemClick(item)
													}
												>
													<div className="flex items-center gap-4 flex-1 min-w-0">
														<div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
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
																		<IconComponent className="w-6 h-6 text-muted-foreground" />
																	);
																})()
															)}
														</div>
														<div className="flex-1 min-w-0">
															<h4 className="font-medium truncate">
																{
																	item.description
																}
															</h4>
															<div className="flex flex-wrap items-center gap-1 mt-1">
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
																		? "Ready"
																		: "Laundry"}
																</Badge>
															</div>
															{item.tags &&
																item.tags
																	.length >
																	0 && (
																	<div className="flex items-center gap-1 mt-1">
																		<Tag className="w-3 h-3 text-muted-foreground flex-shrink-0" />
																		<span className="text-xs text-muted-foreground truncate">
																			{item.tags.join(
																				", "
																			)}
																		</span>
																	</div>
																)}
															{item.last_worn_date && (
																<div className="flex items-center gap-1 mt-1">
																	<CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
																	<span className="text-xs text-muted-foreground truncate">
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
													<div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
														{item.is_favorite && (
															<Heart className="w-4 h-4 text-red-500 fill-red-500 flex-shrink-0" />
														)}
														<div className="flex gap-2">
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
																className={`text-xs px-2 py-1 h-8 ${
																	item.is_available
																		? "text-green-600 hover:text-green-700 hover:bg-green-50"
																		: "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
																}`}
																title="Toggle worn status"
															>
																<CheckCircle className="w-3 h-3 mr-1" />
																<span className="hidden sm:inline">
																	{item.is_available
																		? "Mark as Worn"
																		: "Mark as Clean"}
																</span>
																<span className="sm:hidden">
																	{item.is_available
																		? "Wear"
																		: "Clean"}
																</span>
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
																className="text-xs px-2 py-1 h-8"
															>
																<Trash2 className="w-3 h-3" />
																<span className="hidden sm:inline ml-1">
																	Delete
																</span>
															</Button>
														</div>
													</div>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</>
					) : (
						<>
							{/* Add New Item with Image - Pro only or disabled preview */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Upload className="w-5 h-5" />
										Add Items from Images
										{!canUploadImages && (
											<Badge
												variant="outline"
												className="ml-2"
											>
												Pro Only
											</Badge>
										)}
									</CardTitle>
									{!canUploadImages && (
										<p className="text-sm text-muted-foreground">
											Image upload is available with our
											Pro plan. Upgrade to add items with
											photos.
										</p>
									)}
									{/* Upload Stats */}
									{uploadedWardrobeFiles.length > 0 && (
										<div className="flex flex-wrap gap-4 mt-4">
											<div className="text-center">
												<div className="text-2xl font-bold text-primary">
													{wardrobeUploadStats.total}
												</div>
												<div className="text-sm text-muted-foreground">
													Uploaded
												</div>
											</div>
											<div className="text-center">
												<div className="text-2xl font-bold text-green-600">
													{
														wardrobeUploadStats.success
													}
												</div>
												<div className="text-sm text-muted-foreground">
													Success
												</div>
											</div>
											<div className="text-center">
												<div className="text-2xl font-bold text-blue-600">
													{
														wardrobeUploadStats.pending
													}
												</div>
												<div className="text-sm text-muted-foreground">
													Pending
												</div>
											</div>
											<div className="text-center">
												<div className="text-2xl font-bold text-red-600">
													{wardrobeUploadStats.errors}
												</div>
												<div className="text-sm text-muted-foreground">
													Errors
												</div>
											</div>
										</div>
									)}
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="relative">
											<Label htmlFor="wardrobe-images">
												Upload Wardrobe Images
											</Label>
											<p className="text-sm text-muted-foreground mt-1 mb-4">
												AI will process each outfit
												image to create wardrobe items.
												Information like category,
												description, colors, brand,
												size, season, occasion, and tags
												are inferred from the image.
												Multiple items can be included
												in a single image for efficient
												processing.
											</p>
											<div className="relative">
												{canUploadImages ? (
													<ImageUpload
														onUpload={
															handleWardrobeFileUpload
														}
														maxFiles={
															maxWardrobeItems
														}
														multiple={true}
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
										</div>

										{/* Batch Upload Actions */}
										{uploadedWardrobeFiles.length > 0 && (
											<div className="space-y-3">
												<Button
													onClick={
														handleBatchWardrobeUpload
													}
													disabled={
														isBatchUploading ||
														wardrobeUploadStats.pending ===
															0
													}
													className="w-full"
													size="lg"
												>
													{isBatchUploading ? (
														<>
															<Loader2 className="w-5 h-5 mr-2 animate-spin" />
															Uploading All (
															{
																wardrobeUploadStats.pending
															}
															)...
														</>
													) : (
														<>
															<Zap className="w-5 h-5 mr-2" />
															Upload All (
															{
																wardrobeUploadStats.pending
															}
															)
														</>
													)}
												</Button>

												<div className="flex gap-2">
													<Button
														variant="outline"
														onClick={
															clearAllWardrobeFiles
														}
														className="flex-1"
													>
														Clear All
													</Button>
												</div>
											</div>
										)}

										{/* Uploaded Files Grid */}
										{uploadedWardrobeFiles.length > 0 && (
											<div className="space-y-4">
												<h4 className="font-medium">
													Uploaded Images (
													{
														uploadedWardrobeFiles.length
													}
													)
												</h4>
												<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
													{uploadedWardrobeFiles.map(
														(file) => (
															<div
																key={file.id}
																className="relative group border rounded-lg overflow-hidden"
															>
																<img
																	src={
																		file.preview
																	}
																	alt={
																		file
																			.file
																			.name
																	}
																	className="w-full aspect-square object-cover"
																/>
																<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
																	<div className="absolute top-1 right-1">
																		{file.success && (
																			<Badge className="bg-gray-500 text-white text-xs">
																				<CheckCircle className="w-3 h-3 mr-1" />
																				Done
																			</Badge>
																		)}
																		{file.isUploading && (
																			<Badge className="bg-gray-500 text-white text-xs">
																				<Loader2 className="w-3 h-3 mr-1 animate-spin" />
																				Uploading
																			</Badge>
																		)}
																		{file.error && (
																			<Badge className="bg-gray-500 text-white text-xs">
																				Error
																			</Badge>
																		)}
																		<Button
																			size="icon"
																			variant="outline"
																			className="w-8 h-8 bg-gray-500/20 border-gray-500/50 hover:bg-gray-500/30 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
																			onClick={() =>
																				removeWardrobeFile(
																					file.id
																				)
																			}
																		>
																			<X className="w-4 h-4" />
																		</Button>
																	</div>
																</div>
																<div className="absolute bottom-1 left-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs truncate max-w-[calc(100%-8px)]">
																	{file.file
																		.name
																		.length >
																	12
																		? `${file.file.name.substring(
																				0,
																				12
																		  )}...`
																		: file
																				.file
																				.name}
																</div>
																{file.error && (
																	<div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
																		<Button
																			size="sm"
																			variant="outline"
																			className="w-full bg-gray-500/20 border-gray-500/50 hover:bg-gray-500/30 text-white text-xs"
																			onClick={() =>
																				uploadWardrobeFile(
																					file.id
																				)
																			}
																		>
																			<RotateCcw className="w-3 h-3 mr-1" />
																			Retry
																		</Button>
																	</div>
																)}
															</div>
														)
													)}
												</div>
											</div>
										)}

										{/* Legacy Single Upload - Keep for backward compatibility */}
										{uploadedWardrobeFiles.length === 0 && (
											<div className="border-t pt-4">
												<p className="text-sm text-muted-foreground mb-4">
													Or upload a single image:
												</p>
												<div className="flex items-center gap-2">
													<Button
														onClick={
															handleCreateImageItem
														}
														disabled={
															!canUploadImages ||
															createItem.isPending ||
															uploadImage.isPending ||
															!uploadedImage
														}
														className="flex items-center gap-2"
													>
														<Upload className="w-4 h-4" />
														{createItem.isPending ||
														uploadImage.isPending
															? "Adding..."
															: !canUploadImages
															? "Upgrade to Add Images"
															: "Add Item with Image"}
													</Button>
													{!canUploadImages && (
														<Button
															size="sm"
															variant="outline"
															onClick={() =>
																navigate(
																	"/pricing"
																)
															}
															className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
														>
															Upgrade to Pro
														</Button>
													)}
												</div>
											</div>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Image Grid View - Available for all users */}
							<Card>
								<CardHeader>
									<CardTitle>Wardrobe Gallery</CardTitle>
									<p className="text-sm text-muted-foreground">
										{!canUploadImages &&
											"Items added through text view or Pro image uploads will appear here"}
									</p>
								</CardHeader>
								<CardContent>
									{isLoading ? (
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
												{canUploadImages
													? "Add items with images to see them in the gallery"
													: "Add items from the Summary/Text view to populate your gallery"}
											</p>
										</div>
									) : (
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
											{filteredItems.map((item: any) => (
												<div
													key={item.id}
													className="group relative cursor-pointer"
													onClick={() =>
														handleItemClick(item)
													}
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
																	<IconComponent className="w-12 h-12 text-muted-foreground" />
																);
															})()
														)}
													</div>
													<div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
														<Button
															variant="secondary"
															size="sm"
															onClick={(e) => {
																e.stopPropagation();
																handleMarkAsWorn(
																	item.id.toString()
																);
															}}
															disabled={
																markItemWorn.isPending
															}
															className={`h-6 px-2 text-xs ${
																item.is_available
																	? "bg-green-600 hover:bg-green-700 text-white"
																	: "bg-orange-600 hover:bg-orange-700 text-white"
															}`}
															title="Toggle worn status"
														>
															<CheckCircle className="w-3 h-3" />
														</Button>
													</div>
													<Button
														variant="destructive"
														size="sm"
														className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
														onClick={(e) => {
															e.stopPropagation();
															handleDeleteItem(
																item.id.toString()
															);
														}}
													>
														<Trash2 className="w-3 h-3" />
													</Button>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</>
					)}

					{/* Wardrobe Item Modal */}
					{selectedItem && (
						<WardrobeItemModal
							item={selectedItem}
							isOpen={isModalOpen}
							onClose={handleModalClose}
							onDelete={handleDeleteItem}
							onMarkAsWorn={handleMarkAsWorn}
							markItemWorn={markItemWorn}
							deleteItem={deleteItem}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default Wardrobe;
