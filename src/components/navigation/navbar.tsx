import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
	Menu,
	X,
	Camera,
	Upload,
	User,
	BarChart3,
	LogOut,
	Shield,
	Calendar,
	Shirt,
	Users,
	ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";
import logoImage from "@/assets/logo.png";

const publicNavigation = [{ name: "Home", href: "/", icon: null }];

const authenticatedNavigation = [
	{ name: "Home", href: "/", icon: null },
	{ name: "Upload Analysis", href: "/upload", icon: Upload },
	{ name: "Live Camera", href: "/camera", icon: Camera },
	{ name: "Calendar", href: "/calendar-view", icon: Calendar },
	{ name: "Wardrobe", href: "/wardrobe", icon: Shirt },
	{ name: "Profile", href: "/profile", icon: User },
	{ name: "Dashboard", href: "/dashboard", icon: BarChart3 },
];

const adminNavigation = [{ name: "Admin", href: "/admin", icon: Shield }];

export function Navbar() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const location = useLocation();
	const { user, logout } = useAuthStore();

	const navigation = user
		? [
				...authenticatedNavigation,
				...(user.role === "admin" ? adminNavigation : []),
		  ]
		: publicNavigation;

	const isClosetActive = ["/profile", "/wardrobe", "/calendar-view"].includes(
		location.pathname
	);

	const handleLogout = () => {
		logout();
		setMobileMenuOpen(false);
	};

	// Generate login URL with current page as next parameter
	const getLoginUrl = () => {
		const currentPath = location.pathname + location.search;
		return `/login?next=${encodeURIComponent(currentPath)}`;
	};

	return (
		<nav className="bg-transparent backdrop-blur-md border-b-0 sticky top-0 z-50">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					{/* Logo */}
					<div className="flex items-center">
						<Link to="/" className="flex items-center space-x-2">
							<div className="w-8 h-8 rounded-lg overflow-hidden">
								<img
									src={logoImage}
									alt="Closetic AI Logo"
									className="w-full h-full object-cover"
								/>
							</div>
							<span className="text-xl font-bold text-gradient">
								Closetic AI
							</span>
						</Link>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-1">
						{navigation.map((item) => {
							if (
								item.name === "Calendar" ||
								item.name === "Wardrobe" ||
								item.name === "Profile"
							)
								return null;
							const isActive = location.pathname === item.href;
							return (
								<Link
									key={item.name}
									to={item.href}
									className={cn(
										"flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
										isActive
											? "bg-primary text-primary-foreground shadow-md"
											: "text-muted-foreground hover:text-foreground hover:bg-muted"
									)}
								>
									{item.icon && (
										<item.icon className="w-4 h-4 mr-2" />
									)}
									{item.name}
								</Link>
							);
						})}
						{user && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className={cn(
											"flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
											isClosetActive
												? "bg-primary text-primary-foreground shadow-md"
												: "text-muted-foreground hover:text-foreground hover:bg-muted"
										)}
									>
										<User className="w-4 h-4 mr-2" />
										Closet
										<ChevronDown className="w-4 h-4 ml-1" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem asChild>
										<Link to="/profile">
											<User className="w-4 h-4 mr-2" />
											Profile
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link to="/wardrobe">
											<Shirt className="w-4 h-4 mr-2" />
											Wardrobe
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link to="/calendar-view">
											<Calendar className="w-4 h-4 mr-2" />
											Calendar
										</Link>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>

					{/* Auth Section */}
					<div className="hidden md:flex items-center space-x-4">
						{user ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="relative flex items-center space-x-2"
									>
										<Avatar className="h-8 w-8">
											<AvatarImage
												src={user.avatar}
												alt={user.username}
											/>
											<AvatarFallback>
												{user.username
													.charAt(0)
													.toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<ChevronDown className="w-4 h-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="w-56"
									align="end"
									forceMount
								>
									<div className="flex items-center justify-start gap-2 p-2">
										<div className="flex flex-col space-y-1 leading-none">
											<p className="font-medium">
												{user.username}
											</p>
											<p className="text-xs text-muted-foreground">
												{user.email}
											</p>
										</div>
									</div>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link
											to="/profile"
											className="cursor-pointer"
										>
											<User className="mr-2 h-4 w-4" />
											Profile
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link
											to="/wardrobe"
											className="cursor-pointer"
										>
											<Shirt className="mr-2 h-4 w-4" />
											Wardrobe
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link
											to="/dashboard"
											className="cursor-pointer"
										>
											<BarChart3 className="mr-2 h-4 w-4" />
											Dashboard
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link
											to="/calendar-view"
											className="cursor-pointer"
										>
											<Calendar className="mr-2 h-4 w-4" />
											Calendar
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link
											to="/billing"
											className="cursor-pointer"
										>
											<BarChart3 className="mr-2 h-4 w-4" />
											Billing
										</Link>
									</DropdownMenuItem>
									{user.email === "admin@closetic.com" && (
										<>
											<DropdownMenuItem asChild>
												<Link
													to="/admin"
													className="cursor-pointer"
												>
													<Shield className="mr-2 h-4 w-4" />
													Admin Panel
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link
													to="/admin/users"
													className="cursor-pointer"
												>
													<Users className="mr-2 h-4 w-4" />
													User Management
												</Link>
											</DropdownMenuItem>
										</>
									)}
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={handleLogout}
										className="cursor-pointer"
									>
										<LogOut className="mr-2 h-4 w-4" />
										Sign out
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<>
								<Button variant="ghost" asChild>
									<Link to={getLoginUrl()}>Login</Link>
								</Button>
								<Button className="btn-gradient" asChild>
									<Link to="/register">Get Started</Link>
								</Button>
							</>
						)}
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden flex items-center">
						<button
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="text-muted-foreground hover:text-foreground p-2"
						>
							{mobileMenuOpen ? (
								<X className="w-6 h-6" />
							) : (
								<Menu className="w-6 h-6" />
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Navigation */}
			{mobileMenuOpen && (
				<div className="md:hidden border-t-0 bg-transparent backdrop-blur-md">
					<div className="px-4 pt-2 pb-4 space-y-1">
						{navigation.map((item) => {
							if (
								item.name === "Calendar" ||
								item.name === "Wardrobe" ||
								item.name === "Profile"
							)
								return null;
							const isActive = location.pathname === item.href;
							return (
								<Link
									key={item.name}
									to={item.href}
									onClick={() => setMobileMenuOpen(false)}
									className={cn(
										"flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200",
										isActive
											? "bg-primary text-primary-foreground"
											: "text-muted-foreground hover:text-foreground hover:bg-muted"
									)}
								>
									{item.icon && (
										<item.icon className="w-5 h-5 mr-3" />
									)}
									{item.name}
								</Link>
							);
						})}
						{user && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className={cn(
											"flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 w-full justify-start",
											isClosetActive
												? "bg-primary text-primary-foreground"
												: "text-muted-foreground hover:text-foreground hover:bg-muted"
										)}
									>
										<User className="w-5 h-5 mr-3" />
										Account
										<ChevronDown className="w-4 h-4 ml-auto" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56">
									<DropdownMenuItem asChild>
										<Link
											to="/profile"
											onClick={() =>
												setMobileMenuOpen(false)
											}
										>
											<User className="w-4 h-4 mr-2" />
											Profile
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link
											to="/wardrobe"
											onClick={() =>
												setMobileMenuOpen(false)
											}
										>
											<Shirt className="w-4 h-4 mr-2" />
											Wardrobe
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link
											to="/calendar-view"
											onClick={() =>
												setMobileMenuOpen(false)
											}
										>
											<Calendar className="w-4 h-4 mr-2" />
											Calendar
										</Link>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
						<div className="pt-4 mt-4 border-t-0 space-y-2">
							{user ? (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											className="w-full justify-start p-3 h-auto"
										>
											<div className="flex items-center gap-3 w-full">
												<Avatar className="h-8 w-8">
													<AvatarImage
														src={user.avatar}
														alt={user.username}
													/>
													<AvatarFallback>
														{user.username
															.charAt(0)
															.toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<div className="flex flex-col items-start flex-1">
													<p className="font-medium text-sm">
														{user.username}
													</p>
													<p className="text-xs text-muted-foreground">
														{user.email}
													</p>
												</div>
												<ChevronDown className="w-4 h-4" />
											</div>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										className="w-56"
										align="start"
										forceMount
									>
										<div className="flex items-center justify-start gap-2 p-2">
											<div className="flex flex-col space-y-1 leading-none">
												<p className="font-medium">
													{user.username}
												</p>
												<p className="text-xs text-muted-foreground">
													{user.email}
												</p>
											</div>
										</div>
										<DropdownMenuSeparator />
										<DropdownMenuItem asChild>
											<Link
												to="/profile"
												className="cursor-pointer"
												onClick={() =>
													setMobileMenuOpen(false)
												}
											>
												<User className="mr-2 h-4 w-4" />
												Profile
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link
												to="/wardrobe"
												className="cursor-pointer"
												onClick={() =>
													setMobileMenuOpen(false)
												}
											>
												<Shirt className="mr-2 h-4 w-4" />
												Wardrobe
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link
												to="/dashboard"
												className="cursor-pointer"
												onClick={() =>
													setMobileMenuOpen(false)
												}
											>
												<BarChart3 className="mr-2 h-4 w-4" />
												Dashboard
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link
												to="/calendar-view"
												className="cursor-pointer"
												onClick={() =>
													setMobileMenuOpen(false)
												}
											>
												<Calendar className="mr-2 h-4 w-4" />
												Calendar
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link
												to="/billing"
												className="cursor-pointer"
												onClick={() =>
													setMobileMenuOpen(false)
												}
											>
												<BarChart3 className="mr-2 h-4 w-4" />
												Billing
											</Link>
										</DropdownMenuItem>
										{user.email ===
											"admin@closetic.com" && (
											<>
												<DropdownMenuItem asChild>
													<Link
														to="/admin"
														className="cursor-pointer"
														onClick={() =>
															setMobileMenuOpen(
																false
															)
														}
													>
														<Shield className="mr-2 h-4 w-4" />
														Admin Panel
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link
														to="/admin/users"
														className="cursor-pointer"
														onClick={() =>
															setMobileMenuOpen(
																false
															)
														}
													>
														<Users className="mr-2 h-4 w-4" />
														User Management
													</Link>
												</DropdownMenuItem>
											</>
										)}
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={handleLogout}
											className="cursor-pointer"
										>
											<LogOut className="mr-2 h-4 w-4" />
											Sign out
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							) : (
								<>
									<Button
										variant="ghost"
										className="w-full justify-start"
										asChild
									>
										<Link
											to={getLoginUrl()}
											onClick={() =>
												setMobileMenuOpen(false)
											}
										>
											Login
										</Link>
									</Button>
									<Button
										className="btn-gradient w-full"
										asChild
									>
										<Link
											to="/register"
											onClick={() =>
												setMobileMenuOpen(false)
											}
										>
											Get Started
										</Link>
									</Button>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</nav>
	);
}
