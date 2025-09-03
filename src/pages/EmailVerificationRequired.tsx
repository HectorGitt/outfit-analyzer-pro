import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
	Mail,
	ArrowRight,
	RefreshCw,
	CheckCircle,
	AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { userAPI } from "@/services/api";

export default function EmailVerificationRequired() {
	const [email, setEmail] = useState("");
	const [isResending, setIsResending] = useState(false);
	const [resendSuccess, setResendSuccess] = useState(false);
	const [resendError, setResendError] = useState("");
	const [emailSent, setEmailSent] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const { toast } = useToast();

	// Get email from location state (passed from registration)
	useEffect(() => {
		// First try to get from location state
		if (location.state?.email) {
			setEmail(location.state.email);
			setEmailSent(true); // Email was sent during registration
			// Store in localStorage as backup
			localStorage.setItem("verificationEmail", location.state.email);
		} else {
			// Try to get from localStorage as fallback
			const storedEmail = localStorage.getItem("verificationEmail");
			if (storedEmail) {
				setEmail(storedEmail);
				// Don't set emailSent to true here since we don't know if it was actually sent
			}
		}
	}, [location.state]);

	const handleResendVerification = async () => {
		if (!email.trim()) {
			setResendError("Please enter your email address");
			return;
		}

		setIsResending(true);
		setResendError("");
		setResendSuccess(false);

		try {
			const response = await userAPI.sendVerificationEmail(email);

			if (response.data.verification_sent) {
				setResendSuccess(true);
				setEmailSent(true); // Mark that email has been sent
				// Store email in localStorage for future use
				localStorage.setItem("verificationEmail", email);
				toast({
					title: "Verification email sent",
					description:
						"Please check your email for the verification link.",
				});
			} else {
				setResendError("Email already verified or user not found");
			}
		} catch (error: any) {
			console.error("Failed to resend verification email:", error);
			setResendError(
				error?.response?.data?.detail ||
					error?.message ||
					"Failed to send verification email"
			);
			toast({
				title: "Failed to send email",
				description: "Please try again later.",
				variant: "destructive",
			});
		} finally {
			setIsResending(false);
		}
	};

	const handleContinueToLogin = () => {
		// Store username in localStorage for login page
		navigate("/login", {
			state: {
				message:
					"Please check your email and verify your account before logging in.",
				username: email,
			},
		});
	};

	return (
		<div className="min-h-screen bg-gradient-hero">
			<div className="flex items-center justify-center py-12 px-4">
				<div className="w-full max-w-md">
					<Card className="glass-card animate-fade-up">
						<CardHeader className="text-center">
							<div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
								<Mail className="w-8 h-8 text-blue-600" />
							</div>
							<CardTitle className="text-2xl">
								Verify Your Email
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="text-center space-y-4">
								{email && emailSent ? (
									<>
										<p className="text-muted-foreground">
											We've sent a verification email to:
										</p>
										<div className="bg-muted p-3 rounded-lg">
											<p className="font-medium text-foreground">
												{email}
											</p>
										</div>
										<p className="text-sm text-muted-foreground">
											Please check your email and click
											the verification link to activate
											your account.
										</p>
									</>
								) : email ? (
									<>
										<p className="text-muted-foreground">
											Ready to send verification email to:
										</p>
										<div className="bg-muted p-3 rounded-lg">
											<p className="font-medium text-foreground">
												{email}
											</p>
										</div>
										<p className="text-sm text-muted-foreground">
											Click "Resend" below to send the
											verification email.
										</p>
									</>
								) : (
									<>
										<p className="text-muted-foreground">
											Please enter your email address to
											receive a verification link.
										</p>
										<p className="text-sm text-muted-foreground">
											We'll send you an email with a
											verification link to activate your
											account.
										</p>
									</>
								)}
							</div>

							{/* Email input for resending */}
							<div className="space-y-2">
								<Label htmlFor="resendEmail">
									{email && emailSent
										? "Didn't receive the email?"
										: "Send verification email"}
								</Label>
								<div className="flex gap-2">
									<Input
										id="resendEmail"
										type="email"
										placeholder="Enter your email"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										className="flex-1"
									/>
									<Button
										onClick={handleResendVerification}
										disabled={isResending}
										variant="outline"
									>
										{isResending ? (
											<RefreshCw className="w-4 h-4 animate-spin" />
										) : email && emailSent ? (
											"Resend"
										) : (
											"Send"
										)}
									</Button>
								</div>
							</div>

							{/* Success/Error messages */}
							{resendSuccess && (
								<Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
									<CheckCircle className="h-4 w-4 text-green-600" />
									<AlertDescription className="text-green-800 dark:text-green-200">
										Verification email sent successfully!
										Please check your inbox.
									</AlertDescription>
								</Alert>
							)}

							{resendError && (
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>
										{resendError}
									</AlertDescription>
								</Alert>
							)}

							{/* Action buttons */}
							<div className="space-y-3">
								<Button
									onClick={handleContinueToLogin}
									className="btn-gradient w-full"
								>
									Continue to Login
									<ArrowRight className="ml-2 w-4 h-4" />
								</Button>

								<div className="text-center">
									<Link
										to="/login"
										className="text-sm text-muted-foreground hover:text-primary"
									>
										Already verified? Sign in here
									</Link>
								</div>
							</div>

							{/* Additional help */}
							<div className="text-center pt-4 border-t">
								<p className="text-xs text-muted-foreground">
									Can't find the email? Check your spam folder
									or contact support if you need help.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
