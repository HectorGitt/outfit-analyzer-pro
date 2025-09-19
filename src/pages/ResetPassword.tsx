import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
	Lock,
	ArrowLeft,
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
import { authAPI } from "@/services/api";

export default function ResetPassword() {
	const [searchParams] = useSearchParams();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const navigate = useNavigate();
	const { toast } = useToast();

	const token = searchParams.get("token") || "";

	useEffect(() => {
		if (!token) {
			setError("Invalid or missing reset token");
		}
	}, [token]);

	const passwordValid = password.length >= 8;
	const passwordsMatch = password === confirmPassword;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!token) {
			setError("Invalid or missing reset token");
			return;
		}
		if (!passwordValid) {
			setError("Password must be at least 8 characters long");
			return;
		}
		if (!passwordsMatch) {
			setError("Passwords do not match");
			return;
		}

		setIsSubmitting(true);
		try {
			const res = await authAPI.resetPassword({ token, password });
			if (res?.data?.reset) {
				setSuccess("Your password has been reset successfully.");
				toast({
					title: "Password reset",
					description: "You can now log in with your new password.",
				});
				setTimeout(() => navigate("/login"), 1200);
			} else {
				setError(res?.data?.message || "Failed to reset password");
			}
		} catch (err: any) {
			console.error("Password reset failed:", err);
			setError(
				err?.response?.data?.detail ||
					err?.message ||
					"Failed to reset password"
			);
			toast({
				title: "Reset failed",
				description: "Please try again or request a new link.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-hero">
			<div className="flex items-center justify-center py-12 px-4">
				<div className="w-full max-w-md">
					<Card className="glass-card animate-fade-up">
						<CardHeader className="text-center">
							<div className="mx-auto w-16 h-16 bg-violet-100 dark:bg-violet-900/20 rounded-full flex items-center justify-center mb-4">
								<Lock className="w-8 h-8 text-violet-600" />
							</div>
							<CardTitle className="text-2xl">
								Reset Password
							</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="space-y-2">
									<Label htmlFor="password">
										New password
									</Label>
									<Input
										id="password"
										type="password"
										placeholder="Enter a new password"
										value={password}
										onChange={(e) =>
											setPassword(e.target.value)
										}
										autoComplete="new-password"
									/>
									<p className="text-xs text-muted-foreground">
										Use at least 8 characters.
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="confirmPassword">
										Confirm password
									</Label>
									<Input
										id="confirmPassword"
										type="password"
										placeholder="Re-enter your new password"
										value={confirmPassword}
										onChange={(e) =>
											setConfirmPassword(e.target.value)
										}
										autoComplete="new-password"
									/>
								</div>

								{error && (
									<Alert variant="destructive">
										<AlertCircle className="h-4 w-4" />
										<AlertDescription>
											{error}
										</AlertDescription>
									</Alert>
								)}

								{success && (
									<Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<AlertDescription className="text-green-800 dark:text-green-200">
											{success}
										</AlertDescription>
									</Alert>
								)}

								<Button
									type="submit"
									className="btn-gradient w-full"
									disabled={
										isSubmitting ||
										!passwordValid ||
										!passwordsMatch ||
										!token
									}
								>
									{isSubmitting ? (
										<RefreshCw className="w-4 h-4 animate-spin" />
									) : (
										"Reset password"
									)}
								</Button>

								<div className="flex items-center justify-between text-sm">
									<Link
										to="/login"
										className="text-muted-foreground hover:text-primary flex items-center gap-1"
									>
										<ArrowLeft className="w-4 h-4" /> Back
										to login
									</Link>
									<Link
										to="/forgot-password"
										className="text-muted-foreground hover:text-primary"
									>
										Request a new link
									</Link>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
