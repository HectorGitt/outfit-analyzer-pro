import { useState, useEffect } from "react";
import {
	Users,
	UserPlus,
	Edit,
	Trash2,
	Search,
	Filter,
	MoreHorizontal,
	Shield,
	UserCheck,
	UserX,
	Activity,
	BarChart3,
	ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navbar } from "@/components/navigation/navbar";
import { toast } from "sonner";
import { adminAPI } from "@/services/api";
import { Link } from "react-router-dom";

interface User {
	id: number;
	username: string;
	email: string;
	full_name?: string;
	is_active: boolean;
	pricing_tier: string;
	subscription_status: string;
	style_preference?: string;
	color_preferences?: string;
	body_type?: string;
	occasion_types?: string;
	budget_range?: string;
	gender?: string;
	country?: string;
	created_at: string;
	updated_at?: string;
	average_fashion_score: number;
	total_scored_analyses: number;
}

interface UserStats {
	user_id: number;
	username: string;
	total_activities: number;
	activity_breakdown: Record<string, number>;
	fashion_analyses: number;
	wardrobe_items: number;
	outfit_plans: number;
	recent_activities: Array<{
		activity_type: string;
		timestamp: string;
		data?: string;
	}>;
}

export default function UserManagement() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [pricingTierFilter, setPricingTierFilter] = useState<string>("all");
	const [activeFilter, setActiveFilter] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalUsers, setTotalUsers] = useState(0);
	const [perPage] = useState(20);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [userStats, setUserStats] = useState<UserStats | null>(null);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showStatsDialog, setShowStatsDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	// Form states
	const [newUser, setNewUser] = useState({
		username: "",
		email: "",
		full_name: "",
		pricing_tier: "free",
		is_active: true,
		style_preference: "",
		color_preferences: "",
		body_type: "",
		occasion_types: "",
		budget_range: "",
		gender: "",
		country: "",
	});

	const [editUser, setEditUser] = useState({
		full_name: "",
		pricing_tier: "free",
		is_active: true,
		style_preference: "",
		color_preferences: "",
		body_type: "",
		occasion_types: "",
		budget_range: "",
		gender: "",
		country: "",
	});

	// Fetch users
	const fetchUsers = async () => {
		try {
			setLoading(true);
			const params: any = {
				page: currentPage,
				per_page: perPage,
			};

			if (searchTerm) params.search = searchTerm;
			if (pricingTierFilter && pricingTierFilter !== "all")
				params.pricing_tier = pricingTierFilter;
			if (activeFilter !== "all") {
				params.is_active = activeFilter === "true";
			}

			const response = await adminAPI.getUsers(params);
			setUsers(response.data.users);
			setTotalUsers(response.data.total);
		} catch (err) {
			console.error("Failed to fetch users:", err);
			setError("Failed to load users");
			toast.error("Failed to load users");
		} finally {
			setLoading(false);
		}
	};

	// Fetch user stats
	const fetchUserStats = async (userId: string) => {
		try {
			const response = await adminAPI.getUserStats(userId);
			setUserStats(response.data);
		} catch (err) {
			console.error("Failed to fetch user stats:", err);
			toast.error("Failed to load user statistics");
		}
	};

	// Create user
	const handleCreateUser = async () => {
		try {
			await adminAPI.createUser(newUser);
			toast.success("User created successfully");
			setShowCreateDialog(false);
			setNewUser({
				username: "",
				email: "",
				full_name: "",
				pricing_tier: "free",
				is_active: true,
				style_preference: "",
				color_preferences: "",
				body_type: "",
				occasion_types: "",
				budget_range: "",
				gender: "",
				country: "",
			});
			fetchUsers();
		} catch (err: any) {
			console.error("Failed to create user:", err);
			toast.error(err.message || "Failed to create user");
		}
	};

	// Update user
	const handleUpdateUser = async () => {
		if (!selectedUser) return;

		try {
			await adminAPI.updateUser(selectedUser.id.toString(), editUser);
			toast.success("User updated successfully");
			setShowEditDialog(false);
			setSelectedUser(null);
			fetchUsers();
		} catch (err: any) {
			console.error("Failed to update user:", err);
			toast.error(err.message || "Failed to update user");
		}
	};

	// Delete user
	const handleDeleteUser = async () => {
		if (!selectedUser) return;

		try {
			await adminAPI.deleteUser(selectedUser.id.toString());
			toast.success("User deactivated successfully");
			setShowDeleteDialog(false);
			setSelectedUser(null);
			fetchUsers();
		} catch (err: any) {
			console.error("Failed to delete user:", err);
			toast.error(err.message || "Failed to deactivate user");
		}
	};

	// Toggle user status
	const handleToggleStatus = async (user: User) => {
		try {
			await adminAPI.updateUserStatus(
				user.id.toString(),
				!user.is_active
			);
			toast.success(
				`User ${
					!user.is_active ? "activated" : "deactivated"
				} successfully`
			);
			fetchUsers();
		} catch (err: any) {
			console.error("Failed to update user status:", err);
			toast.error(err.message || "Failed to update user status");
		}
	};

	// Open edit dialog
	const openEditDialog = (user: User) => {
		setSelectedUser(user);
		setEditUser({
			full_name: user.full_name || "",
			pricing_tier: user.pricing_tier || "free",
			is_active: user.is_active,
			style_preference: user.style_preference || "",
			color_preferences: user.color_preferences || "",
			body_type: user.body_type || "",
			occasion_types: user.occasion_types || "",
			budget_range: user.budget_range || "",
			gender: user.gender || "",
			country: user.country || "",
		});
		setShowEditDialog(true);
	};

	// Open stats dialog
	const openStatsDialog = (user: User) => {
		setSelectedUser(user);
		fetchUserStats(user.id.toString());
		setShowStatsDialog(true);
	};

	// Open delete dialog
	const openDeleteDialog = (user: User) => {
		setSelectedUser(user);
		setShowDeleteDialog(true);
	};

	useEffect(() => {
		fetchUsers();
	}, [currentPage, pricingTierFilter, activeFilter]);

	const getTierColor = (tier: string) => {
		switch (tier) {
			case "free":
				return "bg-gray-100 text-gray-800";
			case "spotlight":
				return "bg-blue-100 text-blue-800";
			case "elite":
				return "bg-purple-100 text-purple-800";
			case "icon":
				return "bg-yellow-100 text-yellow-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};

	const totalPages = Math.ceil(totalUsers / perPage);

	if (loading && users.length === 0) {
		return (
			<div className="min-h-screen bg-gradient-hero">
				<Navbar />
				<div className="container mx-auto px-4 py-8">
					<div className="max-w-7xl mx-auto">
						<div className="flex items-center gap-3 mb-8">
							<Skeleton className="w-8 h-8" />
							<Skeleton className="h-8 w-64" />
						</div>
						<div className="space-y-4">
							{[...Array(10)].map((_, i) => (
								<Card key={i}>
									<CardContent className="p-6">
										<div className="flex items-center justify-between">
											<div className="space-y-2">
												<Skeleton className="h-4 w-32" />
												<Skeleton className="h-3 w-48" />
											</div>
											<Skeleton className="h-6 w-16" />
										</div>
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
		<div className="min-h-screen bg-gradient-hero">
			<Navbar />

			<div className="container mx-auto px-4 py-8">
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-fade-up">
						<div>
							<div className="flex items-center gap-3 mb-2">
								<Link to="/admin">
									<Button
										variant="ghost"
										size="sm"
										className="gap-2"
									>
										<ArrowLeft className="w-4 h-4" />
										Back to Admin
									</Button>
								</Link>
							</div>
							<h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
								<Users className="w-8 h-8 text-primary" />
								User Management
							</h1>
							<p className="text-muted-foreground">
								Manage users, view statistics, and monitor
								activity
							</p>
						</div>
						<div className="flex items-center gap-4 mt-4 md:mt-0">
							<Button
								onClick={() => setShowCreateDialog(true)}
								className="gap-2"
							>
								<UserPlus className="w-4 h-4" />
								Add User
							</Button>
						</div>
					</div>

					{/* Filters */}
					<Card className="mb-6">
						<CardContent className="p-6">
							<div className="grid md:grid-cols-4 gap-4">
								<div>
									<Label htmlFor="search">Search</Label>
									<div className="relative flex items-center gap-2">
										<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											id="search"
											placeholder="Search users..."
											value={searchTerm}
											onChange={(e) =>
												setSearchTerm(e.target.value)
											}
											className="pl-10"
										/>
										<Button
											onClick={fetchUsers}
											className="ml-2"
										>
											Search
										</Button>
									</div>
								</div>
								<div>
									<Label htmlFor="tier">Pricing Tier</Label>
									<Select
										value={pricingTierFilter}
										onValueChange={setPricingTierFilter}
									>
										<SelectTrigger>
											<SelectValue placeholder="All tiers" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">
												All tiers
											</SelectItem>
											<SelectItem value="free">
												Free
											</SelectItem>
											<SelectItem value="spotlight">
												Spotlight
											</SelectItem>
											<SelectItem value="elite">
												Elite
											</SelectItem>
											<SelectItem value="icon">
												Icon
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="status">Status</Label>
									<Select
										value={activeFilter}
										onValueChange={setActiveFilter}
									>
										<SelectTrigger>
											<SelectValue placeholder="All users" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">
												All users
											</SelectItem>
											<SelectItem value="true">
												Active
											</SelectItem>
											<SelectItem value="false">
												Inactive
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex items-end">
									<Button
										variant="outline"
										onClick={() => {
											setSearchTerm("");
											setPricingTierFilter("all");
											setActiveFilter("all");
											setCurrentPage(1);
										}}
										className="w-full"
									>
										Clear Filters
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Users Table */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span>Users ({totalUsers})</span>
								<span className="text-sm text-muted-foreground">
									Page {currentPage} of {totalPages}
								</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							{error && (
								<Alert className="mb-4">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>User</TableHead>
											<TableHead>Email</TableHead>
											<TableHead>Tier</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Joined</TableHead>
											<TableHead>Analyses</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{users.map((user) => (
											<TableRow key={user.id}>
												<TableCell>
													<div>
														<div className="font-medium">
															{user.username}
														</div>
														{user.full_name && (
															<div className="text-sm text-muted-foreground">
																{user.full_name}
															</div>
														)}
													</div>
												</TableCell>
												<TableCell>
													{user.email}
												</TableCell>
												<TableCell>
													<Badge
														className={getTierColor(
															user.pricing_tier
														)}
													>
														{user.pricing_tier}
													</Badge>
												</TableCell>
												<TableCell>
													<Badge
														variant={
															user.is_active
																? "default"
																: "secondary"
														}
													>
														{user.is_active
															? "Active"
															: "Inactive"}
													</Badge>
												</TableCell>
												<TableCell>
													{formatDate(
														user.created_at
													)}
												</TableCell>
												<TableCell>
													{user.total_scored_analyses}
												</TableCell>
												<TableCell>
													<DropdownMenu>
														<DropdownMenuTrigger
															asChild
														>
															<Button
																variant="ghost"
																size="sm"
															>
																<MoreHorizontal className="w-4 h-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuLabel>
																Actions
															</DropdownMenuLabel>
															<DropdownMenuItem
																onClick={() =>
																	openStatsDialog(
																		user
																	)
																}
															>
																<BarChart3 className="w-4 h-4 mr-2" />
																View Stats
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() =>
																	openEditDialog(
																		user
																	)
																}
															>
																<Edit className="w-4 h-4 mr-2" />
																Edit User
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																onClick={() =>
																	handleToggleStatus(
																		user
																	)
																}
															>
																{user.is_active ? (
																	<>
																		<UserX className="w-4 h-4 mr-2" />
																		Deactivate
																	</>
																) : (
																	<>
																		<UserCheck className="w-4 h-4 mr-2" />
																		Activate
																	</>
																)}
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																onClick={() =>
																	openDeleteDialog(
																		user
																	)
																}
																className="text-red-600"
															>
																<Trash2 className="w-4 h-4 mr-2" />
																Delete User
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className="flex items-center justify-between mt-4">
									<Button
										variant="outline"
										onClick={() =>
											setCurrentPage(
												Math.max(1, currentPage - 1)
											)
										}
										disabled={currentPage === 1}
									>
										Previous
									</Button>
									<span className="text-sm text-muted-foreground">
										Page {currentPage} of {totalPages}
									</span>
									<Button
										variant="outline"
										onClick={() =>
											setCurrentPage(
												Math.min(
													totalPages,
													currentPage + 1
												)
											)
										}
										disabled={currentPage === totalPages}
									>
										Next
									</Button>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Create User Dialog */}
					<Dialog
						open={showCreateDialog}
						onOpenChange={setShowCreateDialog}
					>
						<DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
							<DialogHeader className="flex-shrink-0">
								<DialogTitle>Create New User</DialogTitle>
								<DialogDescription>
									Add a new user to the system with their
									basic information.
								</DialogDescription>
							</DialogHeader>
							<div className="flex-1 overflow-y-auto py-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="username">
											Username
										</Label>
										<Input
											id="username"
											value={newUser.username}
											onChange={(e) =>
												setNewUser({
													...newUser,
													username: e.target.value,
												})
											}
										/>
									</div>
									<div>
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											type="email"
											value={newUser.email}
											onChange={(e) =>
												setNewUser({
													...newUser,
													email: e.target.value,
												})
											}
										/>
									</div>
									<div>
										<Label htmlFor="full_name">
											Full Name
										</Label>
										<Input
											id="full_name"
											value={newUser.full_name}
											onChange={(e) =>
												setNewUser({
													...newUser,
													full_name: e.target.value,
												})
											}
										/>
									</div>
									<div>
										<Label htmlFor="pricing_tier">
											Pricing Tier
										</Label>
										<Select
											value={newUser.pricing_tier}
											onValueChange={(value) =>
												setNewUser({
													...newUser,
													pricing_tier: value,
												})
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="free">
													Free
												</SelectItem>
												<SelectItem value="spotlight">
													Spotlight
												</SelectItem>
												<SelectItem value="elite">
													Elite
												</SelectItem>
												<SelectItem value="icon">
													Icon
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor="gender">Gender</Label>
										<Input
											id="gender"
											value={newUser.gender}
											onChange={(e) =>
												setNewUser({
													...newUser,
													gender: e.target.value,
												})
											}
										/>
									</div>
									<div>
										<Label htmlFor="country">Country</Label>
										<Input
											id="country"
											value={newUser.country}
											onChange={(e) =>
												setNewUser({
													...newUser,
													country: e.target.value,
												})
											}
										/>
									</div>
								</div>
							</div>
							<DialogFooter className="flex-shrink-0">
								<Button
									variant="outline"
									onClick={() => setShowCreateDialog(false)}
								>
									Cancel
								</Button>
								<Button onClick={handleCreateUser}>
									Create User
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					{/* Edit User Dialog */}
					<Dialog
						open={showEditDialog}
						onOpenChange={setShowEditDialog}
					>
						<DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
							<DialogHeader className="flex-shrink-0">
								<DialogTitle>Edit User</DialogTitle>
								<DialogDescription>
									Update user information and settings.
								</DialogDescription>
							</DialogHeader>
							<div className="flex-1 overflow-y-auto py-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="edit_full_name">
											Full Name
										</Label>
										<Input
											id="edit_full_name"
											value={editUser.full_name}
											onChange={(e) =>
												setEditUser({
													...editUser,
													full_name: e.target.value,
												})
											}
										/>
									</div>
									<div>
										<Label htmlFor="edit_pricing_tier">
											Pricing Tier
										</Label>
										<Select
											value={editUser.pricing_tier}
											onValueChange={(value) =>
												setEditUser({
													...editUser,
													pricing_tier: value,
												})
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="free">
													Free
												</SelectItem>
												<SelectItem value="spotlight">
													Spotlight
												</SelectItem>
												<SelectItem value="elite">
													Elite
												</SelectItem>
												<SelectItem value="icon">
													Icon
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor="edit_gender">
											Gender
										</Label>
										<Input
											id="edit_gender"
											value={editUser.gender}
											onChange={(e) =>
												setEditUser({
													...editUser,
													gender: e.target.value,
												})
											}
										/>
									</div>
									<div>
										<Label htmlFor="edit_country">
											Country
										</Label>
										<Input
											id="edit_country"
											value={editUser.country}
											onChange={(e) =>
												setEditUser({
													...editUser,
													country: e.target.value,
												})
											}
										/>
									</div>
									<div className="col-span-2">
										<div className="flex items-center space-x-2">
											<Checkbox
												id="edit_is_active"
												checked={editUser.is_active}
												onCheckedChange={(checked) =>
													setEditUser({
														...editUser,
														is_active:
															checked as boolean,
													})
												}
											/>
											<Label htmlFor="edit_is_active">
												Active User
											</Label>
										</div>
									</div>
								</div>
							</div>
							<DialogFooter className="flex-shrink-0">
								<Button
									variant="outline"
									onClick={() => setShowEditDialog(false)}
								>
									Cancel
								</Button>
								<Button onClick={handleUpdateUser}>
									Update User
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					{/* User Stats Dialog */}
					<Dialog
						open={showStatsDialog}
						onOpenChange={setShowStatsDialog}
					>
						<DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
							<DialogHeader className="flex-shrink-0">
								<DialogTitle>User Statistics</DialogTitle>
								<DialogDescription>
									Detailed statistics for{" "}
									{selectedUser?.username}
								</DialogDescription>
							</DialogHeader>
							<div className="flex-1 overflow-y-auto py-4">
								{userStats ? (
									<div className="space-y-6">
										{/* Overview Stats */}
										<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
											<Card>
												<CardContent className="p-4">
													<div className="text-2xl font-bold">
														{
															userStats.total_activities
														}
													</div>
													<p className="text-sm text-muted-foreground">
														Total Activities
													</p>
												</CardContent>
											</Card>
											<Card>
												<CardContent className="p-4">
													<div className="text-2xl font-bold">
														{
															userStats.fashion_analyses
														}
													</div>
													<p className="text-sm text-muted-foreground">
														Fashion Analyses
													</p>
												</CardContent>
											</Card>
											<Card>
												<CardContent className="p-4">
													<div className="text-2xl font-bold">
														{
															userStats.wardrobe_items
														}
													</div>
													<p className="text-sm text-muted-foreground">
														Wardrobe Items
													</p>
												</CardContent>
											</Card>
											<Card>
												<CardContent className="p-4">
													<div className="text-2xl font-bold">
														{userStats.outfit_plans}
													</div>
													<p className="text-sm text-muted-foreground">
														Outfit Plans
													</p>
												</CardContent>
											</Card>
										</div>

										{/* Activity Breakdown */}
										<div>
											<h4 className="font-semibold mb-3">
												Activity Breakdown
											</h4>
											<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
												{Object.entries(
													userStats.activity_breakdown
												).map(([type, count]) => (
													<div
														key={type}
														className="flex justify-between p-2 bg-muted rounded"
													>
														<span className="text-sm capitalize">
															{type.replace(
																"_",
																" "
															)}
														</span>
														<Badge variant="secondary">
															{count}
														</Badge>
													</div>
												))}
											</div>
										</div>

										{/* Recent Activities */}
										<div>
											<h4 className="font-semibold mb-3">
												Recent Activities
											</h4>
											<div className="space-y-2 max-h-60 overflow-y-auto">
												{userStats.recent_activities.map(
													(activity, index) => (
														<div
															key={index}
															className="flex items-center justify-between p-3 bg-muted rounded"
														>
															<div>
																<span className="font-medium capitalize">
																	{activity.activity_type.replace(
																		"_",
																		" "
																	)}
																</span>
																<p className="text-sm text-muted-foreground">
																	{new Date(
																		activity.timestamp
																	).toLocaleString()}
																</p>
															</div>
															<Activity className="w-4 h-4 text-muted-foreground" />
														</div>
													)
												)}
											</div>
										</div>
									</div>
								) : (
									<div className="text-center py-8">
										<BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
										<p className="text-muted-foreground">
											Loading user statistics...
										</p>
									</div>
								)}
							</div>
						</DialogContent>
					</Dialog>

					{/* Delete Confirmation Dialog */}
					<Dialog
						open={showDeleteDialog}
						onOpenChange={setShowDeleteDialog}
					>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Delete User</DialogTitle>
								<DialogDescription>
									Are you sure you want to deactivate{" "}
									{selectedUser?.username}? This action cannot
									be undone.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setShowDeleteDialog(false)}
								>
									Cancel
								</Button>
								<Button
									variant="destructive"
									onClick={handleDeleteUser}
								>
									Deactivate User
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</div>
	);
}
