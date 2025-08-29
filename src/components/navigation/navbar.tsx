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

	const handleLogout = () => {
		logout();
		setMobileMenuOpen(false);
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
					</div>

					{/* Auth Section */}
					<div className="hidden md:flex items-center space-x-4">
						{user ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="relative h-8 w-8 rounded-full"
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
									<Link to="/login">Login</Link>
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
						<div className="pt-4 mt-4 border-t-0 space-y-2">
							{user ? (
								<>
									<div className="flex items-center gap-3 px-4 py-2">
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
										<div className="flex flex-col">
											<p className="font-medium text-sm">
												{user.username}
											</p>
											<p className="text-xs text-muted-foreground">
												{user.email}
											</p>
										</div>
									</div>
									<Button
										variant="ghost"
										className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
										onClick={handleLogout}
									>
										<LogOut className="mr-2 h-4 w-4" />
										Sign out
									</Button>
								</>
							) : (
								<>
									<Button
										variant="ghost"
										className="w-full justify-start"
										asChild
									>
										<Link
											to="/login"
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
