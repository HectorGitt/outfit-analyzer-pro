import React from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Heart,
	Tag,
	CheckCircle,
	Trash2,
	Calendar,
	Palette,
	Shirt,
	Footprints,
	Watch,
} from "lucide-react";

interface WardrobeItemModalProps {
	item: any;
	isOpen: boolean;
	onClose: () => void;
	onMarkAsWorn: (itemId: string) => void;
	onDelete: (itemId: string) => void;
	markItemWorn: any;
	deleteItem: any;
}

// Get category icon for items
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
		colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
	);
};

export const WardrobeItemModal: React.FC<WardrobeItemModalProps> = ({
	item,
	isOpen,
	onClose,
	onMarkAsWorn,
	onDelete,
	markItemWorn,
	deleteItem,
}) => {
	const IconComponent = getCategoryIcon(item.category);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-3">
						<div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
							{item.image_url ? (
								<img
									src={item.image_url}
									alt={item.description}
									className="w-full h-full object-cover rounded-lg"
								/>
							) : (
								<IconComponent className="w-6 h-6 text-muted-foreground" />
							)}
						</div>
						<div>
							<h2 className="text-xl font-bold">
								{item.description}
							</h2>
							{item.is_favorite && (
								<div className="flex items-center gap-1 mt-1">
									<Heart className="w-4 h-4 text-red-500 fill-red-500" />
									<span className="text-sm text-red-600">
										Favorite
									</span>
								</div>
							)}
						</div>
					</DialogTitle>
					<DialogDescription>
						Detailed information about this wardrobe item
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Image Section */}
					{item.image_url && (
						<div className="flex justify-center">
							<div className="w-full max-w-md aspect-square bg-muted rounded-lg overflow-hidden">
								<img
									src={item.image_url}
									alt={item.description}
									className="w-full h-full object-cover"
								/>
							</div>
						</div>
					)}

					{/* Item Details */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-4">
							<div>
								<h3 className="font-semibold mb-2 flex items-center gap-2">
									<Shirt className="w-4 h-4" />
									Item Details
								</h3>
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<span className="text-sm text-muted-foreground">
											Category:
										</span>
										<Badge
											className={getCategoryColor(
												item.category
											)}
										>
											{item.subcategory || item.category}
										</Badge>
									</div>
									{item.brand && (
										<div className="flex items-center gap-2">
											<span className="text-sm text-muted-foreground">
												Brand:
											</span>
											<span className="text-sm font-medium">
												{item.brand}
											</span>
										</div>
									)}
									{item.size && (
										<div className="flex items-center gap-2">
											<span className="text-sm text-muted-foreground">
												Size:
											</span>
											<span className="text-sm font-medium">
												{item.size}
											</span>
										</div>
									)}
								</div>
							</div>

							<div>
								<h3 className="font-semibold mb-2 flex items-center gap-2">
									<Palette className="w-4 h-4" />
									Colors
								</h3>
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<span className="text-sm text-muted-foreground">
											Primary:
										</span>
										<Badge variant="outline">
											{item.color_primary}
										</Badge>
									</div>
									{item.color_secondary && (
										<div className="flex items-center gap-2">
											<span className="text-sm text-muted-foreground">
												Secondary:
											</span>
											<Badge variant="outline">
												{item.color_secondary}
											</Badge>
										</div>
									)}
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div>
								<h3 className="font-semibold mb-2 flex items-center gap-2">
									<Calendar className="w-4 h-4" />
									Usage
								</h3>
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<span className="text-sm text-muted-foreground">
											Status:
										</span>
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
									{item.last_worn_date && (
										<div className="flex items-center gap-2">
											<span className="text-sm text-muted-foreground">
												Last worn:
											</span>
											<span className="text-sm">
												{new Date(
													item.last_worn_date
												).toLocaleString(undefined, {
													year: "numeric",
													month: "short",
													day: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										</div>
									)}
									{item.season && (
										<div className="flex items-center gap-2">
											<span className="text-sm text-muted-foreground">
												Season:
											</span>
											<Badge
												variant="outline"
												className="text-xs"
											>
												{item.season}
											</Badge>
										</div>
									)}
									{item.occasion &&
										item.occasion.length > 0 && (
											<div className="flex items-center gap-2">
												<span className="text-sm text-muted-foreground">
													Occasion:
												</span>
												<Badge
													variant="outline"
													className="text-xs"
												>
													{item.occasion.join(", ")}
												</Badge>
											</div>
										)}
								</div>
							</div>

							{item.tags && item.tags.length > 0 && (
								<div>
									<h3 className="font-semibold mb-2 flex items-center gap-2">
										<Tag className="w-4 h-4" />
										Tags
									</h3>
									<div className="flex flex-wrap gap-1">
										{item.tags.map(
											(tag: string, index: number) => (
												<Badge
													key={index}
													variant="secondary"
													className="text-xs"
												>
													{tag}
												</Badge>
											)
										)}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center justify-between pt-4 border-t">
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={onClose}
							>
								Close
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => onMarkAsWorn(item.id.toString())}
								disabled={markItemWorn.isPending}
								className={
									item.is_available
										? "text-green-600 hover:text-green-700 hover:bg-green-50"
										: "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
								}
							>
								<CheckCircle className="w-4 h-4 mr-2" />
								{item.is_available
									? "Mark as Worn"
									: "Mark as Clean"}
							</Button>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="destructive"
								size="sm"
								onClick={() => {
									onDelete(item.id.toString());
									onClose();
								}}
								disabled={deleteItem.isPending}
							>
								<Trash2 className="w-4 h-4 mr-2" />
								Delete
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
