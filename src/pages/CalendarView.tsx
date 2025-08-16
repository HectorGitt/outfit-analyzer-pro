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
	Clock,
	MapPin,
	RefreshCw,
	Save,
	Shirt,
	AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/navigation/navbar";

interface CalendarEvent {
	id: string;
	summary: string;
	start: {
		dateTime?: string;
		date?: string;
	};
	end: {
		dateTime?: string;
		date?: string;
	};
	location?: string;
	description?: string;
	eventType?: string;
	outfitSuggestion?: string;
	hasOutfit?: boolean;
}

const CalendarView = () => {
	const { toast } = useToast();
	const navigate = useNavigate();
	const [events, setEvents] = useState<CalendarEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchGoogleCalendarEvents();
	}, []);

	const fetchGoogleCalendarEvents = async () => {
		try {
			setLoading(true);
			setError(null);

			// Check if we have Google access token
			const accessToken = localStorage.getItem("google_calendar_token");
			if (!accessToken) {
				setError(
					"No calendar connection found. Please connect your Google Calendar first."
				);
				setLoading(false);
				return;
			}

			// Fetch events from Google Calendar API
			const timeMin = new Date().toISOString();
			const timeMax = new Date(
				Date.now() + 30 * 24 * 60 * 60 * 1000
			).toISOString(); // Next 30 days

			const response = await fetch(
				`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=20`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				if (response.status === 401) {
					// Token expired, redirect to reconnect
					localStorage.removeItem("google_calendar_token");
					localStorage.removeItem("google_calendar_refresh_token");
					setError(
						"Calendar access expired. Please reconnect your Google Calendar."
					);
					return;
				}
				throw new Error("Failed to fetch calendar events");
			}

			const data = await response.json();
			const eventsWithSuggestions =
				data.items?.map((event: any) => ({
					...event,
					eventType: determineEventType(event),
					outfitSuggestion: generateOutfitSuggestion(event),
					hasOutfit: Math.random() > 0.5, // Random for demo
				})) || [];

			setEvents(eventsWithSuggestions);
		} catch (err: any) {
			console.error("Error fetching calendar events:", err);
			setError(err.message || "Failed to load calendar events");
		} finally {
			setLoading(false);
		}
	};

	const determineEventType = (event: any): string => {
		const summary = event.summary?.toLowerCase() || "";
		const description = event.description?.toLowerCase() || "";
		const location = event.location?.toLowerCase() || "";

		if (
			summary.includes("meeting") ||
			summary.includes("conference") ||
			summary.includes("presentation") ||
			summary.includes("interview")
		) {
			return "work";
		} else if (
			summary.includes("dinner") ||
			summary.includes("party") ||
			summary.includes("social") ||
			summary.includes("friends")
		) {
			return "social";
		} else if (
			summary.includes("gym") ||
			summary.includes("workout") ||
			summary.includes("fitness") ||
			summary.includes("exercise")
		) {
			return "fitness";
		} else if (
			summary.includes("wedding") ||
			summary.includes("formal") ||
			summary.includes("gala")
		) {
			return "formal";
		} else if (
			location.includes("restaurant") ||
			location.includes("bar") ||
			location.includes("cafe")
		) {
			return "social";
		} else {
			return "casual";
		}
	};

	const generateOutfitSuggestion = (event: any): string => {
		const eventType = determineEventType(event);
		const timeOfDay = getTimeOfDay(
			event.start?.dateTime || event.start?.date
		);

		const suggestions = {
			work: [
				"Professional blazer with dress pants and closed-toe shoes",
				"Button-down shirt with tailored trousers and loafers",
				"Modest dress with cardigan and professional accessories",
			],
			social: [
				"Smart casual outfit with nice jeans and a stylish top",
				"Casual dress with comfortable yet fashionable shoes",
				"Trendy blouse with chinos and stylish sneakers",
			],
			fitness: [
				"Athletic wear with moisture-wicking fabric and supportive sneakers",
				"Gym clothes in breathable materials with proper sports shoes",
				"Activewear suitable for your workout type",
			],
			formal: [
				"Formal dress or suit with elegant accessories",
				"Evening wear appropriate for the occasion",
				"Sophisticated outfit with dress shoes and refined details",
			],
			casual: [
				"Comfortable and stylish everyday outfit",
				"Relaxed clothing appropriate for the activity",
				"Casual wear with personal style touches",
			],
		};

		const eventSuggestions =
			suggestions[eventType as keyof typeof suggestions] ||
			suggestions.casual;
		const randomSuggestion =
			eventSuggestions[
				Math.floor(Math.random() * eventSuggestions.length)
			];

		// Add time-specific recommendations
		if (timeOfDay === "evening") {
			return randomSuggestion + " (Consider darker colors for evening)";
		} else if (timeOfDay === "morning") {
			return (
				randomSuggestion +
				" (Opt for comfortable layers for morning events)"
			);
		}

		return randomSuggestion;
	};

	const getTimeOfDay = (dateTimeString: string): string => {
		const date = new Date(dateTimeString);
		const hour = date.getHours();

		if (hour < 12) return "morning";
		if (hour < 17) return "afternoon";
		return "evening";
	};

	const formatEventTime = (event: CalendarEvent): string => {
		if (event.start.dateTime) {
			const startDate = new Date(event.start.dateTime);

			const dateStr = startDate.toLocaleDateString("en-US", {
				weekday: "short",
				month: "short",
				day: "numeric",
			});

			const timeStr = startDate.toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "2-digit",
				hour12: true,
			});

			return `${dateStr} at ${timeStr}`;
		} else if (event.start.date) {
			const date = new Date(event.start.date);
			return (
				date.toLocaleDateString("en-US", {
					weekday: "long",
					month: "long",
					day: "numeric",
				}) + " (All day)"
			);
		}
		return "No date specified";
	};

	const handlePopulateOutfit = (eventId: string, eventTitle: string) => {
		const event = events.find((e) => e.id === eventId);
		if (event && !event.hasOutfit) {
			// Generate new outfit suggestion
			const newSuggestion = generateOutfitSuggestion(event);
			setEvents((prevEvents) =>
				prevEvents.map((e) =>
					e.id === eventId
						? {
								...e,
								outfitSuggestion: newSuggestion,
								hasOutfit: true,
						  }
						: e
				)
			);
		}

		toast({
			title: event?.hasOutfit ? "Viewing Outfit" : "Outfit Generated",
			description: event?.hasOutfit
				? `Showing outfit for "${eventTitle}"`
				: `Created outfit suggestion for "${eventTitle}"`,
		});
	};

	const handleSaveOutfit = (eventId: string, eventTitle: string) => {
		toast({
			title: "Outfit Saved",
			description: `Outfit for "${eventTitle}" saved to your wardrobe.`,
		});
	};

	const handleRetryOutfit = (eventId: string, eventTitle: string) => {
		const event = events.find((e) => e.id === eventId);
		if (event) {
			const newSuggestion = generateOutfitSuggestion(event);
			setEvents((prevEvents) =>
				prevEvents.map((e) =>
					e.id === eventId
						? { ...e, outfitSuggestion: newSuggestion }
						: e
				)
			);
		}

		toast({
			title: "New Outfit Generated",
			description: `Created new outfit suggestion for "${eventTitle}"`,
		});
	};

	const getEventTypeColor = (type: string) => {
		const colors = {
			work: "bg-blue-100 text-blue-800",
			casual: "bg-green-100 text-green-800",
			formal: "bg-purple-100 text-purple-800",
			social: "bg-orange-100 text-orange-800",
			fitness: "bg-red-100 text-red-800",
		};
		return (
			colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
		);
	};

	const handleReconnect = () => {
		navigate("/calendar-connect");
	};

	return (
		<div className="min-h-screen bg-gradient-hero">
			<Navbar />
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					<div className="flex items-center justify-between mb-8">
						<div>
							<h1 className="text-3xl font-bold text-foreground mb-2">
								Your Calendar & Outfits
							</h1>
							<p className="text-muted-foreground">
								AI-powered outfit recommendations for your
								upcoming events
							</p>
						</div>
						<Button
							onClick={fetchGoogleCalendarEvents}
							disabled={loading}
							variant="outline"
							className="gap-2"
						>
							<RefreshCw
								className={`w-4 h-4 ${
									loading ? "animate-spin" : ""
								}`}
							/>
							Refresh
						</Button>
					</div>

					{error && (
						<Alert variant="destructive" className="mb-6">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription className="flex items-center justify-between">
								<span>{error}</span>
								{error.includes("connect") && (
									<Button
										onClick={handleReconnect}
										size="sm"
										variant="outline"
									>
										Reconnect Calendar
									</Button>
								)}
							</AlertDescription>
						</Alert>
					)}

					{loading ? (
						<div className="space-y-4">
							{[1, 2, 3].map((i) => (
								<Card
									key={i}
									className="animate-pulse card-fashion"
								>
									<CardContent className="p-6">
										<div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
										<div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
										<div className="h-16 bg-muted rounded"></div>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<div className="space-y-4">
							{events.map((event) => (
								<Card key={event.id} className="card-fashion">
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="flex items-start gap-4">
												<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
													<Calendar className="w-6 h-6 text-primary" />
												</div>
												<div>
													<CardTitle className="text-foreground mb-1">
														{event.summary}
													</CardTitle>
													<div className="flex items-center gap-4 text-sm text-muted-foreground">
														<div className="flex items-center gap-1">
															<Clock className="w-3 h-3" />
															{formatEventTime(
																event
															)}
														</div>
														{event.location && (
															<div className="flex items-center gap-1">
																<MapPin className="w-3 h-3" />
																{event.location}
															</div>
														)}
													</div>
													{event.hasOutfit &&
														event.outfitSuggestion && (
															<div className="mt-3 p-3 bg-muted/50 rounded-lg">
																<div className="flex items-center gap-2 mb-1">
																	<Shirt className="w-3 h-3 text-primary" />
																	<span className="text-xs font-medium">
																		Outfit
																		Suggestion
																	</span>
																</div>
																<p className="text-xs text-muted-foreground">
																	{
																		event.outfitSuggestion
																	}
																</p>
															</div>
														)}
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Badge
													className={getEventTypeColor(
														event.eventType ||
															"casual"
													)}
												>
													{event.eventType ||
														"casual"}
												</Badge>
												{event.hasOutfit && (
													<Badge
														variant="secondary"
														className="bg-green-100 text-green-800"
													>
														<Shirt className="w-3 h-3 mr-1" />
														Outfit Ready
													</Badge>
												)}
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<div className="flex items-center gap-3">
											<Button
												variant="default"
												size="sm"
												onClick={() =>
													handlePopulateOutfit(
														event.id,
														event.summary
													)
												}
												className="flex items-center gap-2"
											>
												<Shirt className="w-4 h-4" />
												{event.hasOutfit
													? "View Outfit"
													: "Generate Outfit"}
											</Button>

											{event.hasOutfit && (
												<>
													<Button
														variant="outline"
														size="sm"
														onClick={() =>
															handleSaveOutfit(
																event.id,
																event.summary
															)
														}
														className="flex items-center gap-2"
													>
														<Save className="w-4 h-4" />
														Save Outfit
													</Button>

													<Button
														variant="outline"
														size="sm"
														onClick={() =>
															handleRetryOutfit(
																event.id,
																event.summary
															)
														}
														className="flex items-center gap-2"
													>
														<RefreshCw className="w-4 h-4" />
														Retry Outfit
													</Button>
												</>
											)}
										</div>
									</CardContent>
								</Card>
							))}

							{events.length === 0 && !loading && !error && (
								<Card className="card-fashion text-center p-8">
									<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
										<Calendar className="w-8 h-8 text-muted-foreground" />
									</div>
									<h3 className="text-lg font-medium mb-2">
										No Upcoming Events
									</h3>
									<p className="text-muted-foreground mb-4">
										You don't have any events in the next 30
										days, or your calendar is empty.
									</p>
									<div className="flex gap-2 justify-center">
										<Button
											onClick={fetchGoogleCalendarEvents}
											variant="outline"
										>
											Refresh Calendar
										</Button>
										<Button
											onClick={() =>
												navigate("/calendar-connect")
											}
										>
											Manage Connections
										</Button>
									</div>
								</Card>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CalendarView;
