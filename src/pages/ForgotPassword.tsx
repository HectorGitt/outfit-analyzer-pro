import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	Mail,
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
import { cn } from "@/lib/utils";

export default function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const { toast } = useToast();
	const navigate = useNavigate();

	const emailTrimmed = email.trim();
	const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		if (!emailTrimmed) {
			setError("Please enter your email address");
			return;
		}
		if (!isEmailValid) {
			setError("Please enter a valid email address");
			return;
		}

		setIsSubmitting(true);
		try {
			const res = await authAPI.requestPasswordReset(emailTrimmed);
			if (res?.data?.requested) {
				setSuccess(
					"If an account exists with that email, a reset link has been sent."
				);
				toast({
					title: "Email sent",
					description:
						"Check your inbox for the password reset link.",
				});
			} else {
				setSuccess(
					"If an account exists with that email, a reset link has been sent."
				);
			}
		} catch (err: any) {
			console.error("Password reset request failed:", err);
			setError(
				err?.response?.data?.detail ||
					err?.message ||
					"Failed to request password reset"
			);
			toast({
				title: "Request failed",
				description: "Please try again later.",
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
							<div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
								<Mail className="w-8 h-8 text-blue-600" />
							</div>
							<CardTitle className="text-2xl">
								Forgot Password
							</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="space-y-2">
									<Label htmlFor="email">Email address</Label>
									<Input
										id="email"
										type="email"
										placeholder="you@example.com"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										className={cn(
											isSubmitting ? "opacity-90" : "",
											emailTrimmed && !isEmailValid
												? "border-red-500 focus-visible:ring-red-500"
												: ""
										)}
										autoComplete="email"
									/>
									{emailTrimmed && !isEmailValid && (
										<p className="text-xs text-red-600">
											Please enter a valid email address
										</p>
									)}
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
										!emailTrimmed ||
										!isEmailValid
									}
								>
									{isSubmitting ? (
										<RefreshCw className="w-4 h-4 animate-spin" />
									) : (
										"Send reset link"
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
										to="/register"
										className="text-muted-foreground hover:text-primary"
									>
										Create an account
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
