import { useState, useEffect } from "react";
import {
	Link,
	useNavigate,
	useLocation,
	useSearchParams,
} from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ErrorDisplay } from "@/components/ui/error-display";
import { useAuthStore } from "@/stores/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { pricingQueryKeys } from "@/hooks/usePricing";

export default function Login() {
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});

	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();

	const { login, isLoading, error, errorDetails, clearError } =
		useAuthStore();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Pre-fill username from localStorage or location state
	useEffect(() => {
		const storedUsername = localStorage.getItem("loginUsername");
		const stateUsername = location.state?.username;

		if (storedUsername) {
			setFormData((prev) => ({
				...prev,
				username: storedUsername,
			}));
			localStorage.removeItem("loginUsername"); // Clear after use
		} else if (stateUsername) {
			setFormData((prev) => ({
				...prev,
				username: stateUsername,
			}));
		}
	}, [location.state]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		// Clear any existing errors when user starts typing
		if (error) clearError();
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const success = await login({
				username: formData.username,
				password: formData.password,
			});

			if (success) {
				toast({
					title: "Signed in",
					description: `Welcome back${
						formData.username ? `, ${formData.username}` : ""
					}!`,
				});

				// Invalidate pricing query to refetch user's current tier
				queryClient.invalidateQueries({
					queryKey: pricingQueryKeys.userTier(),
				});

				// Check for next parameter in URL or from state
				const nextParam = searchParams.get("next");
				const fromLocation = location.state?.from?.pathname;

				// Redirect to the intended page or default to profile
				const redirectTo = nextParam || fromLocation || "/profile";
				navigate(redirectTo, { replace: true });
			} else {
				// Login failed - check if it's due to unverified email
				console.log("Login failed - checking error details");
				console.log("error:", error);
				console.log("errorDetails:", errorDetails);

				const isEmailNotVerified =
					errorDetails?.message === "Email not verified" ||
					errorDetails?.details?.detail === "Email not verified" ||
					error === "Email not verified";

				console.log("isEmailNotVerified:", isEmailNotVerified);

				if (isEmailNotVerified) {
					toast({
						title: "Email verification required",
						description:
							"Please verify your email address before signing in.",
						variant: "default",
					});

					// Redirect to email verification page
					navigate("/email-verification-required");
					return;
				}

				// Other login errors are already displayed via ErrorDisplay component
			}
		} catch (err: any) {
			console.error("Unexpected login error:", err);
			// Handle unexpected errors that might still be thrown
			toast({
				title: "Sign in error",
				description:
					err instanceof Error ? err.message : "Failed to sign in",
				variant: "destructive",
			});
		}
	};

	const handleDemoLogin = () => {
		setFormData({
			username: "demo",
			password: "demo123",
		});
		clearError();
	};

	return (
		<div className="min-h-screen bg-gradient-hero">
			<div className="flex items-center justify-center py-12 px-4">
				<div className="w-full max-w-md space-y-8">
					{/* Header */}
					<div className="text-center animate-fade-up">
						<h1 className="text-3xl font-bold">Welcome Back</h1>
						<p className="text-muted-foreground mt-2">
							Sign in to continue your style journey
						</p>
					</div>

					{/* Enhanced Error Display */}
					<ErrorDisplay
						error={error}
						errorDetails={errorDetails}
						className="animate-fade-up"
					/>

					{/* Login Form */}
					<Card className="glass-card animate-fade-up">
						<CardHeader>
							<CardTitle className="text-center">
								Sign In
							</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="space-y-2">
									<Label htmlFor="username">Username</Label>
									<div className="relative">
										<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											id="username"
											name="username"
											type="text"
											placeholder="Enter your username"
											className="pl-10 input-fashion"
											value={formData.username}
											onChange={handleInputChange}
											required
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="password">Password</Label>
									<div className="relative">
										<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											id="password"
											name="password"
											type={
												showPassword
													? "text"
													: "password"
											}
											placeholder="Enter your password"
											className="pl-10 pr-10 input-fashion"
											value={formData.password}
											onChange={handleInputChange}
											required
										/>
										<button
											type="button"
											onClick={() =>
												setShowPassword(!showPassword)
											}
											className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
										>
											{showPassword ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</button>
									</div>
								</div>

								<div className="flex items-center justify-between">
									<label className="flex items-center space-x-2">
										<input
											type="checkbox"
											className="rounded"
										/>
										<span className="text-sm text-muted-foreground">
											Remember me
										</span>
									</label>
									<Link
										to="/forgot-password"
										className="text-sm text-primary hover:underline"
									>
										Forgot password?
									</Link>
								</div>

								<Button
									type="submit"
									className="btn-gradient w-full"
									disabled={isLoading}
								>
									{isLoading ? (
										"Signing in..."
									) : (
										<>
											Sign In
											<ArrowRight className="ml-2 w-4 h-4" />
										</>
									)}
								</Button>
							</form>

							<div className="mt-6 text-center">
								<p className="text-sm text-muted-foreground">
									Don't have an account?{" "}
									<Link
										to="/register"
										className="text-primary hover:underline font-medium"
									>
										Sign up
									</Link>
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Email Verification Resend */}
					<Card className="card-fashion">
						<CardContent className="pt-6">
							<div className="text-center space-y-3">
								<h3 className="font-medium">
									Need to verify your email?
								</h3>
								<p className="text-sm text-muted-foreground">
									If you haven't received your verification
									email, you can request a new one.
								</p>
								<Button
									variant="outline"
									size="sm"
									asChild
									className="mt-2"
								>
									<Link to="/email-verification-required">
										Resend Verification Email
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
