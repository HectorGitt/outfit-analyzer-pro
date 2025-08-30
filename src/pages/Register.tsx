import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
	Eye,
	EyeOff,
	Mail,
	Lock,
	User,
	ArrowRight,
	Check,
	AlertCircle,
	Globe,
	Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ErrorDisplay } from "@/components/ui/error-display";
import { useAuthStore } from "@/stores/authStore";

export default function Register() {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [agreed, setAgreed] = useState(false);
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
		firstName: "",
		lastName: "",
		country: "",
		gender: "",
	});
	const [validationErrors, setValidationErrors] = useState<string[]>([]);

	const navigate = useNavigate();
	const location = useLocation();
	const { register, isLoading, error, errorDetails, clearError } =
		useAuthStore();
	const { toast } = useToast();

	// Generate login URL with current page as next parameter
	const getLoginUrl = () => {
		const currentPath = location.pathname + location.search;
		return `/login?next=${encodeURIComponent(currentPath)}`;
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		// Clear any existing errors when user starts typing
		if (error) clearError();
		if (validationErrors.length > 0) setValidationErrors([]);
	};

	const handleSelectChange = (name: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		// Clear any existing errors when user makes selection
		if (error) clearError();
		if (validationErrors.length > 0) setValidationErrors([]);
	};

	const validateForm = () => {
		const errors: string[] = [];

		if (formData.password !== formData.confirmPassword) {
			errors.push("Passwords do not match");
		}

		if (formData.password.length < 6) {
			errors.push("Password must be at least 6 characters long");
		}

		if (!formData.username.trim()) {
			errors.push("Username is required");
		}

		if (!formData.email.trim()) {
			errors.push("Email is required");
		}

		if (!formData.firstName.trim() || !formData.lastName.trim()) {
			errors.push("First and last name are required");
		}

		return errors;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!agreed) return;

		// Validate form
		const errors = validateForm();
		if (errors.length > 0) {
			// Surface validation errors as toasts for immediate feedback
			errors.forEach((err) =>
				toast({
					title: "Validation",
					description: err,
					variant: "destructive",
				})
			);
			setValidationErrors(errors);
			return;
		}

		try {
			const success = await register({
				username: formData.username,
				email: formData.email,
				password: formData.password,
				confirmPassword: formData.confirmPassword,
				full_name: `${formData.firstName} ${formData.lastName}`.trim(),
				country: formData.country,
				gender: formData.gender,
			});

			if (success) {
				toast({
					title: "Account created",
					description: "Your account was created successfully.",
				});
				navigate("/profile");
			}
			// If not successful, error will be displayed via auth store
		} catch (err) {
			console.error("Registration failed:", err);
			toast({
				title: "Registration failed",
				description:
					err instanceof Error ? err.message : "Failed to register",
				variant: "destructive",
			});
		}
	};

	const benefits = [
		"Unlimited fashion analysis",
		"Personalized style recommendations",
		"Wardrobe planning tools",
		"Trend insights and updates",
		"Style history tracking",
	];

	return (
		<div className="min-h-screen bg-gradient-hero">
			<div className="flex items-center justify-center py-12 px-4">
				<div className="w-full max-w-4xl">
					{/* Enhanced Error Display */}
					<ErrorDisplay
						error={error}
						errorDetails={errorDetails}
						className="mb-6"
					/>

					{/* Validation Errors */}
					{validationErrors.length > 0 && (
						<div className="mb-6 space-y-2">
							{validationErrors.map((err, index) => (
								<Alert
									key={index}
									variant="destructive"
									className="animate-fade-up"
								>
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>{err}</AlertDescription>
								</Alert>
							))}
						</div>
					)}

					<div className="grid lg:grid-cols-2 gap-8 items-center">
						{/* Benefits Section */}
						<div className="space-y-8 animate-fade-up">
							<div>
								<h1 className="text-4xl font-bold mb-4">
									Join the Style Revolution
								</h1>
								<p className="text-xl text-muted-foreground">
									Unlock your fashion potential with
									AI-powered insights
								</p>
							</div>

							<div className="space-y-4">
								{benefits.map((benefit, index) => (
									<div
										key={index}
										className="flex items-center space-x-3"
									>
										<div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
											<Check className="w-4 h-4 text-white" />
										</div>
										<span className="text-muted-foreground">
											{benefit}
										</span>
									</div>
								))}
							</div>

							<div className="bg-gradient-card rounded-xl p-6 border border-border">
								<h3 className="font-semibold mb-2">
									Start Your Free Trial
								</h3>
								<p className="text-sm text-muted-foreground">
									Get 7 days of premium features, then
									continue with our free plan or upgrade
									anytime.
								</p>
							</div>
						</div>

						{/* Registration Form */}
						<Card className="glass-card animate-fade-up">
							<CardHeader>
								<CardTitle className="text-center">
									Create Account
								</CardTitle>
							</CardHeader>
							<CardContent>
								<form
									onSubmit={handleSubmit}
									className="space-y-6"
								>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="firstName">
												First Name
											</Label>
											<div className="relative">
												<User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
												<Input
													id="firstName"
													name="firstName"
													placeholder="John"
													className="pl-10 input-fashion"
													value={formData.firstName}
													onChange={handleInputChange}
													required
												/>
											</div>
										</div>
										<div className="space-y-2">
											<Label htmlFor="lastName">
												Last Name
											</Label>
											<Input
												id="lastName"
												name="lastName"
												placeholder="Doe"
												className="input-fashion"
												value={formData.lastName}
												onChange={handleInputChange}
												required
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="username">
											Username
										</Label>
										<div className="relative">
											<User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input
												id="username"
												name="username"
												placeholder="johndoe"
												className="pl-10 input-fashion"
												value={formData.username}
												onChange={handleInputChange}
												required
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
										<div className="relative">
											<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input
												id="email"
												name="email"
												type="email"
												placeholder="john@example.com"
												className="pl-10 input-fashion"
												value={formData.email}
												onChange={handleInputChange}
												required
											/>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="country">
												Country
											</Label>
											<div className="relative">
												<Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
												<Select
													value={formData.country}
													onValueChange={(value) =>
														handleSelectChange(
															"country",
															value
														)
													}
												>
													<SelectTrigger className="pl-10 input-fashion">
														<SelectValue placeholder="Select country" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="US">
															United States
														</SelectItem>
														<SelectItem value="CA">
															Canada
														</SelectItem>
														<SelectItem value="GB">
															United Kingdom
														</SelectItem>
														<SelectItem value="AU">
															Australia
														</SelectItem>
														<SelectItem value="DE">
															Germany
														</SelectItem>
														<SelectItem value="FR">
															France
														</SelectItem>
														<SelectItem value="IT">
															Italy
														</SelectItem>
														<SelectItem value="ES">
															Spain
														</SelectItem>
														<SelectItem value="NL">
															Netherlands
														</SelectItem>
														<SelectItem value="SE">
															Sweden
														</SelectItem>
														<SelectItem value="NO">
															Norway
														</SelectItem>
														<SelectItem value="DK">
															Denmark
														</SelectItem>
														<SelectItem value="JP">
															Japan
														</SelectItem>
														<SelectItem value="KR">
															South Korea
														</SelectItem>
														<SelectItem value="CN">
															China
														</SelectItem>
														<SelectItem value="IN">
															India
														</SelectItem>
														<SelectItem value="BR">
															Brazil
														</SelectItem>
														<SelectItem value="MX">
															Mexico
														</SelectItem>
														<SelectItem value="AR">
															Argentina
														</SelectItem>
														<SelectItem value="ZA">
															South Africa
														</SelectItem>
														<SelectItem value="EG">
															Egypt
														</SelectItem>
														<SelectItem value="NG">
															Nigeria
														</SelectItem>
														<SelectItem value="KE">
															Kenya
														</SelectItem>
														<SelectItem value="other">
															Other
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
										<div className="space-y-2">
											<Label htmlFor="gender">
												Gender
											</Label>
											<div className="relative">
												<Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
												<Select
													value={formData.gender}
													onValueChange={(value) =>
														handleSelectChange(
															"gender",
															value
														)
													}
												>
													<SelectTrigger className="pl-10 input-fashion">
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
														<SelectItem value="prefer-not-to-say">
															Prefer not to say
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="password">
											Password
										</Label>
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
												placeholder="Create a strong password"
												className="pl-10 pr-10 input-fashion"
												value={formData.password}
												onChange={handleInputChange}
												required
											/>
											<button
												type="button"
												onClick={() =>
													setShowPassword(
														!showPassword
													)
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

									<div className="space-y-2">
										<Label htmlFor="confirmPassword">
											Confirm Password
										</Label>
										<div className="relative">
											<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input
												id="confirmPassword"
												name="confirmPassword"
												type={
													showConfirmPassword
														? "text"
														: "password"
												}
												placeholder="Confirm your password"
												className="pl-10 pr-10 input-fashion"
												value={formData.confirmPassword}
												onChange={handleInputChange}
												required
											/>
											<button
												type="button"
												onClick={() =>
													setShowConfirmPassword(
														!showConfirmPassword
													)
												}
												className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
											>
												{showConfirmPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</button>
										</div>
									</div>

									<div className="flex items-start space-x-2">
										<input
											type="checkbox"
											id="terms"
											checked={agreed}
											onChange={(e) =>
												setAgreed(e.target.checked)
											}
											className="mt-1 rounded"
											required
										/>
										<label
											htmlFor="terms"
											className="text-sm text-muted-foreground"
										>
											I agree to the{" "}
											<Link
												to="/terms-of-service"
												className="text-primary hover:underline"
											>
												Terms of Service
											</Link>{" "}
											and{" "}
											<Link
												to="/privacy-policy"
												className="text-primary hover:underline"
											>
												Privacy Policy
											</Link>
										</label>
									</div>

									<Button
										type="submit"
										className="btn-gradient w-full"
										disabled={isLoading || !agreed}
									>
										{isLoading ? (
											"Creating Account..."
										) : (
											<>
												Create Account
												<ArrowRight className="ml-2 w-4 h-4" />
											</>
										)}
									</Button>
								</form>

								<div className="mt-6 text-center">
									<p className="text-sm text-muted-foreground">
										Already have an account?{" "}
										<Link
											to={getLoginUrl()}
											className="text-primary hover:underline font-medium"
										>
											Sign in
										</Link>
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
