import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { userAPI } from "@/services/api";

type VerificationStatus = "loading" | "success" | "error" | "already-verified";

export default function EmailVerification() {
	const [status, setStatus] = useState<VerificationStatus>("loading");
	const [message, setMessage] = useState("");
	const [email, setEmail] = useState("");
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { toast } = useToast();

	useEffect(() => {
		const verifyEmail = async () => {
			const token = searchParams.get("token");

			if (!token) {
				setStatus("error");
				setMessage("Verification token is missing from the URL.");
				return;
			}

			try {
				const response = await userAPI.verifyEmail(token);

				if (response.data.success) {
					setStatus("success");
					setEmail(response.data.email);
					setMessage(response.data.message);
					// Clear the stored email from localStorage after successful verification
					localStorage.removeItem("verificationEmail");
					toast({
						title: "Email verified successfully!",
						description: "Your account is now active.",
					});
				} else {
					setStatus("already-verified");
					setEmail(response.data.email);
					setMessage(response.data.message);
				}
			} catch (error: any) {
				console.error("Email verification failed:", error);
				setStatus("error");

				const errorMessage =
					error?.response?.data?.detail ||
					error?.message ||
					"Failed to verify email. The link may be expired or invalid.";

				setMessage(errorMessage);

				toast({
					title: "Verification failed",
					description: errorMessage,
					variant: "destructive",
				});
			}
		};

		verifyEmail();
	}, [searchParams, toast]);

	const handleContinueToLogin = () => {
		// Store username in localStorage for login page

		navigate("/login", {
			state: {
				message:
					status === "success"
						? "Your email has been verified! Please sign in to continue."
						: "Please sign in to access your account.",
				username: email,
			},
		});
	};

	const handleGoHome = () => {
		navigate("/");
	};

	const renderContent = () => {
		switch (status) {
			case "loading":
				return (
					<div className="text-center space-y-4">
						<div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
							<Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
						</div>
						<div>
							<h2 className="text-xl font-semibold mb-2">
								Verifying your email...
							</h2>
							<p className="text-muted-foreground">
								Please wait while we verify your email address.
							</p>
						</div>
					</div>
				);

			case "success":
				return (
					<div className="text-center space-y-4">
						<div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
							<CheckCircle className="w-8 h-8 text-green-600" />
						</div>
						<div>
							<h2 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">
								Email Verified Successfully!
							</h2>
							<p className="text-muted-foreground mb-4">
								{message}
							</p>
							{email && (
								<div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mb-4">
									<p className="text-sm text-green-800 dark:text-green-200">
										<strong>Verified Email:</strong> {email}
									</p>
								</div>
							)}
						</div>
						<Button
							onClick={handleContinueToLogin}
							className="btn-gradient"
						>
							Continue to Login
							<ArrowRight className="ml-2 w-4 h-4" />
						</Button>
					</div>
				);

			case "already-verified":
				return (
					<div className="text-center space-y-4">
						<div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
							<CheckCircle className="w-8 h-8 text-blue-600" />
						</div>
						<div>
							<h2 className="text-xl font-semibold mb-2 text-blue-800 dark:text-blue-200">
								Email Already Verified
							</h2>
							<p className="text-muted-foreground mb-4">
								{message}
							</p>
							{email && (
								<div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
									<p className="text-sm text-blue-800 dark:text-blue-200">
										<strong>Email:</strong> {email}
									</p>
								</div>
							)}
						</div>
						<Button
							onClick={handleContinueToLogin}
							className="btn-gradient"
						>
							Continue to Login
							<ArrowRight className="ml-2 w-4 h-4" />
						</Button>
					</div>
				);

			case "error":
				return (
					<div className="text-center space-y-4">
						<div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
							<XCircle className="w-8 h-8 text-red-600" />
						</div>
						<div>
							<h2 className="text-xl font-semibold mb-2 text-red-800 dark:text-red-200">
								Verification Failed
							</h2>
							<p className="text-muted-foreground mb-4">
								{message}
							</p>
						</div>
						<Alert className="text-left">
							<AlertDescription>
								<strong>What to do next:</strong>
								<ul className="list-disc list-inside mt-2 space-y-1">
									<li>
										Request a new verification email from
										the login page
									</li>
									<li>
										Check if the link has expired (links are
										valid for 24 hours)
									</li>
									<li>
										Make sure you're using the correct link
										from your email
									</li>
									<li>
										Contact support if the problem persists
									</li>
								</ul>
							</AlertDescription>
						</Alert>
						<div className="flex gap-3 justify-center mt-6">
							<Button
								onClick={handleContinueToLogin}
								variant="outline"
							>
								Go to Login
							</Button>
							<Button onClick={handleGoHome} variant="ghost">
								<Home className="w-4 h-4 mr-2" />
								Go Home
							</Button>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-gradient-hero">
			<div className="flex items-center justify-center py-12 px-4">
				<div className="w-full max-w-md">
					<Card className="glass-card animate-fade-up">
						<CardHeader className="text-center">
							<CardTitle className="text-2xl">
								Email Verification
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							{renderContent()}

							{/* Footer links */}
							<div className="text-center pt-4 border-t">
								<div className="flex justify-center gap-4 text-sm">
									<Link
										to="/login"
										className="text-muted-foreground hover:text-primary"
									>
										Sign In
									</Link>
									<Link
										to="/register"
										className="text-muted-foreground hover:text-primary"
									>
										Create Account
									</Link>
									<Link
										to="/"
										className="text-muted-foreground hover:text-primary"
									>
										Home
									</Link>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
