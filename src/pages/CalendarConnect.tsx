import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, CheckCircle, ExternalLink, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/navigation/navbar";

const CalendarConnect = () => {
	const [connectedServices, setConnectedServices] = useState<string[]>([]);
	const [isConnecting, setIsConnecting] = useState<string | null>(null);
	const navigate = useNavigate();
	const { toast } = useToast();

	// Check for existing connections on component mount
	useEffect(() => {
		const googleToken = localStorage.getItem("google_calendar_token");
		if (googleToken) {
			setConnectedServices((prev) => [...prev, "google"]);
		}
	}, []);

	// Check for OAuth callback on component mount
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get("code");
		const state = urlParams.get("state");

		if (code && state === "google_calendar_auth") {
			handleOAuthCallback(code);
		}
	}, []);

	const handleOAuthCallback = async (code: string) => {
		setIsConnecting("google");

		try {
			// Exchange code for access token
			const tokenResponse = await fetch(
				"https://oauth2.googleapis.com/token",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					body: new URLSearchParams({
						client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
						client_secret:
							import.meta.env.VITE_GOOGLE_CLIENT_SECRET || "", // Note: In production, this should be handled server-side
						code: code,
						grant_type: "authorization_code",
						redirect_uri: `${window.location.origin}/calendar-connect`,
					}),
				}
			);

			if (!tokenResponse.ok) {
				throw new Error("Failed to exchange code for token");
			}

			const tokenData = await tokenResponse.json();
			console.log("OAuth token data:", tokenData);

			// Store the access token (in production, store securely)
			localStorage.setItem(
				"google_calendar_token",
				tokenData.access_token
			);
			if (tokenData.refresh_token) {
				localStorage.setItem(
					"google_calendar_refresh_token",
					tokenData.refresh_token
				);
			}

			// Update UI
			setConnectedServices((prev) =>
				prev.includes("google") ? prev : [...prev, "google"]
			);

			toast({
				title: "Connected Successfully",
				description:
					"Google Calendar has been connected to your account.",
			});

			// Clean up URL
			window.history.replaceState(
				{},
				document.title,
				window.location.pathname
			);
		} catch (error: any) {
			console.error("OAuth callback error:", error);
			toast({
				title: "Connection Failed",
				description: "Failed to complete Google Calendar connection.",
				variant: "destructive",
			});
		} finally {
			setIsConnecting(null);
		}
	};

	const handleGoogleConnect = async () => {
		setIsConnecting("google");

		try {
			// Google OAuth configuration
			const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
			const redirectUri = `${window.location.origin}/calendar-connect`;
			const scope = "https://www.googleapis.com/auth/calendar.readonly";

			if (!clientId) {
				throw new Error(
					"Google Calendar integration not configured. Please add VITE_GOOGLE_CLIENT_ID to your environment variables."
				);
			}

			// Build OAuth URL
			const authUrl = new URL(
				"https://accounts.google.com/o/oauth2/v2/auth"
			);
			authUrl.searchParams.append("client_id", clientId);
			authUrl.searchParams.append("redirect_uri", redirectUri);
			authUrl.searchParams.append("response_type", "code");
			authUrl.searchParams.append("scope", scope);
			authUrl.searchParams.append("access_type", "offline");
			authUrl.searchParams.append("prompt", "consent");
			authUrl.searchParams.append("state", "google_calendar_auth");

			// Redirect to Google OAuth
			window.location.href = authUrl.toString();
		} catch (error: any) {
			console.error("Google Calendar connection error:", error);
			toast({
				title: "Connection Failed",
				description:
					error.message || "Failed to connect to Google Calendar",
				variant: "destructive",
			});
			setIsConnecting(null);
		}
	};

	const handleConnect = (service: string) => {
		if (service === "google") {
			handleGoogleConnect();
		} else {
			// For other services, show coming soon message
			toast({
				title: "Coming Soon",
				description: `${service} integration will be available soon.`,
			});

			// Simulate connection for UI demo
			setConnectedServices((prev) => [...prev, service]);
			setIsConnecting(null);
		}
	};

	const isConnected = (service: string) =>
		connectedServices.includes(service);

	return (
		<div className="min-h-screen bg-gradient-hero">
			<Navbar />
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-2xl mx-auto">
					<div className="text-center mb-8">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
							<Calendar className="w-8 h-8 text-primary" />
						</div>
						<h1 className="text-4xl font-bold mb-4">
							Connect Your Calendar
						</h1>
						<p className="text-xl text-muted-foreground">
							Sync your calendar to get outfit suggestions for
							your events
						</p>
					</div>

					{!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
						<Alert className="mb-6">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								<strong>Setup Required:</strong> To enable
								Google Calendar integration, add your Google
								OAuth client ID to your environment variables as
								VITE_GOOGLE_CLIENT_ID.
								<br />
								<a
									href="https://console.cloud.google.com/apis/credentials"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline mt-1 inline-block"
								>
									Get your Google Client ID →
								</a>
							</AlertDescription>
						</Alert>
					)}

					<div className="space-y-6">
						{/* Google Calendar Card */}
						<Card className="card-fashion">
							<CardHeader>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
											<Calendar className="w-6 h-6 text-red-600" />
										</div>
										<div>
											<CardTitle className="text-foreground">
												Google Calendar
											</CardTitle>
											<CardDescription>
												Connect to sync your Google
												Calendar events
											</CardDescription>
										</div>
									</div>
									{isConnected("google") && (
										<Badge
											variant="secondary"
											className="bg-green-100 text-green-800"
										>
											<CheckCircle className="w-3 h-3 mr-1" />
											Connected
										</Badge>
									)}
								</div>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between">
									<div className="text-sm text-muted-foreground">
										Access your events and get outfit
										recommendations
									</div>
									<Button
										onClick={() => handleConnect("google")}
										disabled={
											isConnected("google") ||
											isConnecting === "google"
										}
										className="flex items-center gap-2"
									>
										{isConnecting === "google" ? (
											"Connecting..."
										) : isConnected("google") ? (
											"Connected"
										) : (
											<>
												<ExternalLink className="w-4 h-4" />
												Connect
											</>
										)}
									</Button>
								</div>
							</CardContent>
						</Card>

						{/* Microsoft Outlook Card */}
						<Card className="card-fashion">
							<CardHeader>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
											<Calendar className="w-6 h-6 text-blue-600" />
										</div>
										<div>
											<CardTitle className="text-foreground">
												Microsoft Outlook
											</CardTitle>
											<CardDescription>
												Connect to sync your Outlook
												Calendar events
											</CardDescription>
										</div>
									</div>
									{isConnected("outlook") && (
										<Badge
											variant="secondary"
											className="bg-green-100 text-green-800"
										>
											<CheckCircle className="w-3 h-3 mr-1" />
											Connected
										</Badge>
									)}
								</div>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between">
									<div className="text-sm text-muted-foreground">
										Access your Outlook events and get
										outfit recommendations
									</div>
									<Button
										onClick={() => handleConnect("outlook")}
										disabled={true}
										variant="outline"
										className="flex items-center gap-2 opacity-50 cursor-not-allowed"
									>
										Coming Soon
									</Button>
								</div>
							</CardContent>
						</Card>

						{/* Continue Button */}
						<div className="text-center pt-6">
							<Button
								onClick={() => navigate("/calendar-view")}
								size="lg"
								disabled={connectedServices.length === 0}
								className="btn-gradient px-8"
							>
								Continue to Calendar View
							</Button>
							{connectedServices.length === 0 && (
								<p className="text-sm text-muted-foreground mt-2">
									Connect at least one calendar service to
									continue
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default CalendarConnect;
