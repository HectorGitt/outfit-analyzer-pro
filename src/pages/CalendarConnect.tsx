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
import {
	Calendar,
	CheckCircle,
	ExternalLink,
	AlertCircle,
	RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/navigation/navbar";
import {
	useGoogleCalendarStatus,
	useGoogleCalendarConnect,
	useGoogleCalendarDisconnect,
} from "@/hooks/useCalendar";
import googleCalendarService from "@/services/googleCalendar";

const CalendarConnect = () => {
	const [isConnecting, setIsConnecting] = useState<string | null>(null);
	const [isHandlingCallback, setIsHandlingCallback] = useState(false);
	const navigate = useNavigate();
	const { toast } = useToast();

	// Use backend connection status instead of localStorage
	const {
		data: backendStatus,
		isLoading: statusLoading,
		error: statusError,
		refetch: refetchStatus,
	} = useGoogleCalendarStatus();

	// Use new Google Calendar hooks
	const connectMutation = useGoogleCalendarConnect();
	const disconnectMutation = useGoogleCalendarDisconnect();

	// Check if Google Calendar is connected via backend
	const isGoogleConnected = backendStatus?.data?.connected || false;

	// Handle OAuth callback on component mount
	useEffect(() => {
		const handleOAuthCallback = async () => {
			if (googleCalendarService.isHandlingOAuthCallback()) {
				setIsHandlingCallback(true);
				try {
					//console.log("Handling OAuth callback...");
					const token =
						await googleCalendarService.handleOAuthCallbackIfPresent();

					if (token) {
						toast({
							title: "Success!",
							description:
								"Google Calendar connected successfully.",
						});

						// Refresh the connection status
						refetchStatus();
					}
				} catch (error) {
					console.error("OAuth callback failed:", error);
					toast({
						title: "Connection Failed",
						description:
							error instanceof Error
								? error.message
								: "Failed to connect Google Calendar",
						variant: "destructive",
					});
				} finally {
					setIsHandlingCallback(false);
				}
			}
		};

		handleOAuthCallback();
	}, [toast, refetchStatus]);

	// Handle Google Calendar connection using redirect flow
	const handleGoogleConnect = async () => {
		setIsConnecting("google");
		try {
			// This will redirect to Google OAuth
			await googleCalendarService.signIn();
		} catch (error) {
			console.error(
				"Failed to initiate Google Calendar connection:",
				error
			);

			// Only show error if it's not a redirect
			if (!error.message.includes("Redirecting")) {
				toast({
					title: "Connection Failed",
					description:
						error instanceof Error
							? error.message
							: "Failed to connect Google Calendar",
					variant: "destructive",
				});
			}
		} finally {
			setIsConnecting(null);
		}
	};

	// Handle disconnection
	const handleGoogleDisconnect = async () => {
		try {
			await disconnectMutation.mutateAsync();
			// Disconnection success is handled by the hook's onSuccess callback
		} catch (error) {
			console.error("Google Calendar disconnection failed:", error);
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
		}
	};

	return (
		<div className="min-h-screen bg-gradient-hero pt-16">
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

					{statusError && (
						<Alert className="mb-6">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								<strong>Connection Error:</strong> Unable to
								check backend connection status. Please ensure
								the backend is running and try again.
								<Button
									variant="link"
									onClick={() => refetchStatus()}
									className="p-0 h-auto ml-2"
								>
									<RefreshCw className="w-4 h-4 mr-1" />
									Retry
								</Button>
							</AlertDescription>
						</Alert>
					)}

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
									<div className="flex items-center gap-2">
										{statusLoading ? (
											<Badge
												variant="secondary"
												className="bg-gray-100 text-gray-600"
											>
												<RefreshCw className="w-3 h-3 mr-1 animate-spin" />
												Checking...
											</Badge>
										) : isGoogleConnected ? (
											<>
												<Badge
													variant="secondary"
													className="bg-green-100 text-green-800"
												>
													<CheckCircle className="w-3 h-3 mr-1" />
													Connected
												</Badge>
												{backendStatus?.data
													?.user_email && (
													<span className="text-xs text-muted-foreground">
														{
															backendStatus.data
																.user_email
														}
													</span>
												)}
											</>
										) : (
											<Badge
												variant="secondary"
												className="bg-red-100 text-red-800"
											>
												Not Connected
											</Badge>
										)}
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between">
									<div className="text-sm text-muted-foreground">
										Access your events and get outfit
										recommendations
									</div>
									<div className="flex gap-2">
										{isGoogleConnected ? (
											<Button
												onClick={handleGoogleDisconnect}
												disabled={
													disconnectMutation.isPending
												}
												variant="outline"
												className="flex items-center gap-2"
											>
												{disconnectMutation.isPending
													? "Disconnecting..."
													: "Disconnect"}
											</Button>
										) : (
											<Button
												onClick={handleGoogleConnect}
												disabled={
													connectMutation.isPending ||
													isConnecting === "google" ||
													isHandlingCallback
												}
												className="flex items-center gap-2 bg-primary-dark"
											>
												{connectMutation.isPending ||
												isConnecting === "google" ||
												isHandlingCallback ? (
													isHandlingCallback ? (
														"Processing..."
													) : (
														"Connecting..."
													)
												) : (
													<>
														<ExternalLink className="w-4 h-4" />
														Connect
													</>
												)}
											</Button>
										)}
									</div>
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
									<Badge
										variant="secondary"
										className="bg-gray-100 text-gray-600"
									>
										Coming Soon
									</Badge>
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
								disabled={!isGoogleConnected}
								className="btn-gradient px-8"
							>
								Continue to Calendar View
							</Button>
							{!isGoogleConnected && (
								<p className="text-sm text-muted-foreground mt-2">
									Connect Google Calendar to continue
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
