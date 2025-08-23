import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
	Calendar,
	Clock,
	MapPin,
	Shirt,
	Save,
	RefreshCw,
	CalendarDays,
	AlertCircle,
	Sparkles,
	Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { FullCalendarModal } from "@/components/ui/full-calendar-modal";
import { Navbar } from "@/components/navigation/navbar";
import { toast } from "sonner";
import {
	useEvents,
	useSyncGoogleCalendarEvents,
	useGenerateOutfitSuggestions,
	useWardrobeItems,
	useCalendarDashboard,
	usePricingTier,
} from "@/hooks/useCalendar";
import {
	CalendarEvent as InternalCalendarEvent,
	GoogleCalendarEvent,
} from "@/types/api";

// Enhanced event interface for display
interface DisplayEvent extends InternalCalendarEvent {
	outfitSuggestion?: string;
	hasOutfit?: boolean;
	outfitPlan?: {
		id: number;
		outfit_description: string;
		wardrobe_item_ids: number[];
		alternatives: string[];
		weather_considerations: string;
		confidence_score: number;
	};
	outfitItems?: Array<{
		id: number;
		description: string;
		category: string;
		color_primary: string;
		subcategory?: string;
	}>;
	// Handle both snake_case and camelCase field names from different sources
	start_time?: string;
	end_time?: string;
}
const CalendarView = () => {
	const navigate = useNavigate();
	const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
	const [isConnected, setIsConnected] = useState(true); // Default to true to show backend data

	// API Hooks
	const { events, plans, wardrobe, isLoading, isError } =
		useCalendarDashboard();
	const syncGoogleEvents = useSyncGoogleCalendarEvents();
	const generateOutfits = useGenerateOutfitSuggestions();
	const { data: pricingData } = usePricingTier();

	// Get Pro user status
	const isPro = pricingData?.data?.is_pro ?? false;

	// Combine Google Calendar events with backend events for display
	const displayEvents = useMemo<DisplayEvent[]>(() => {
		////////console.log("Debug - events data:", events);
		//console.log("Debug - plans data:", plans);
		//console.log("Debug - wardrobe data:", wardrobe);

		// Handle actual API response structures based on your data
		// API returns: { success: true, data: { events: [...] } }
		const backendEventsData = (events?.data as any)?.events || [];
		// API returns: { outfit_plans: [...] }
		const plansData = (plans?.data?.data as any)?.outfit_plans || [];
		// API returns: { data: { wardrobe: [...] } }
		const wardrobeData = (wardrobe?.data as any)?.data?.wardrobe || [];
		const combinedEvents: DisplayEvent[] = [];

		//console.log("Debug - backendEventsData:", backendEventsData);
		//console.log("Debug - plansData:", plansData);
		//console.log("Debug - wardrobeData:", wardrobeData);

		// Add backend events (handle both snake_case and camelCase field names)
		if (Array.isArray(backendEventsData)) {
			backendEventsData.forEach((event) => {
				// Find matching outfit plan for this event
				const matchingPlan = Array.isArray(plansData)
					? plansData.find((plan) => {
							// Match by event title and date using timezone-safe comparison
							let planDate = null;
							let eventDate = null;

							if (plan.date) {
								const planDateObj = new Date(plan.date);
								const year = planDateObj.getFullYear();
								const month = String(
									planDateObj.getMonth() + 1
								).padStart(2, "0");
								const day = String(
									planDateObj.getDate()
								).padStart(2, "0");
								planDate = `${year}-${month}-${day}`;
							}

							if (event.start_time) {
								const eventDateObj = new Date(event.start_time);
								const year = eventDateObj.getFullYear();
								const month = String(
									eventDateObj.getMonth() + 1
								).padStart(2, "0");
								const day = String(
									eventDateObj.getDate()
								).padStart(2, "0");
								eventDate = `${year}-${month}-${day}`;
							}

							return (
								plan.event_title === event.title &&
								planDate === eventDate
							);
					  })
					: null;

				// Get wardrobe items for this outfit plan
				const outfitItems =
					matchingPlan && Array.isArray(wardrobeData)
						? wardrobeData.filter((item) =>
								matchingPlan.wardrobe_item_ids.includes(item.id)
						  )
						: [];

				combinedEvents.push({
					...event,
					// Handle field name conversion from snake_case to camelCase
					startTime: event.startTime || event.start_time,
					endTime: event.endTime || event.end_time,
					hasOutfit: !!matchingPlan,
					outfitPlan: matchingPlan || undefined,
					outfitItems:
						outfitItems.length > 0 ? outfitItems : undefined,
				});
			});
		}

		// Add Google Calendar events that aren't synced yet
		googleEvents.forEach((googleEvent) => {
			const isAlreadySynced =
				Array.isArray(backendEventsData) &&
				backendEventsData.some(
					(event) => event.googleEventId === googleEvent.id
				);

			if (!isAlreadySynced) {
				const startTime =
					googleEvent.start.dateTime || googleEvent.start.date || "";
				const endTime =
					googleEvent.end.dateTime || googleEvent.end.date || "";

				combinedEvents.push({
					id: `google_${googleEvent.id}`,
					googleEventId: googleEvent.id,
					title: googleEvent.summary || "Untitled Event",
					description: googleEvent.description,
					startTime,
					endTime,
					location: googleEvent.location,
					eventType: classifyEventType(googleEvent.summary || ""),
					userId: "current-user", // This would come from auth context
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					hasOutfit: false,
				});
			}
		});

		return combinedEvents.sort(
			(a, b) =>
				new Date(a.startTime).getTime() -
				new Date(b.startTime).getTime()
		);
	}, [events?.data, googleEvents, plans?.data]);

	// Enhanced outfit generation for all events
	const handleGenerateWardrobeSuggestions = async () => {
		if (!isPro) {
			toast.error(
				"Outfit generation is only available for Pro users. Please upgrade your account."
			);
			return;
		}

		if (displayEvents.length === 0) {
			toast.info("No events found to generate outfit suggestions for");
			return;
		}

		try {
			const upcomingEvents = displayEvents.filter(
				(event) => new Date(event.startTime) > new Date()
			);

			for (const event of upcomingEvents.slice(0, 5)) {
				// Limit to next 5 events
				await generateOutfits.mutateAsync({
					eventId: event.id,
					eventType: event.eventType,
					preferences: {
						colors: [], // Would come from user preferences
						brands: [], // Would come from user preferences
					},
				});
			}

			toast.success(
				`Generated outfit suggestions for ${Math.min(
					upcomingEvents.length,
					5
				)} upcoming events`
			);
		} catch (error) {
			console.error("Failed to generate outfit suggestions:", error);
			toast.error("Failed to generate outfit suggestions");
		}
	};

	// Single event outfit generation
	const handleGenerateOutfitForEvent = async (event: DisplayEvent) => {
		if (!isPro) {
			toast.error(
				"Outfit generation is only available for Pro users. Please upgrade your account."
			);
			return;
		}

		try {
			await generateOutfits.mutateAsync({
				eventId: event.id,
				eventType: event.eventType,
			});

			toast.success(`Generated outfit suggestion for "${event.title}"`);
		} catch (error) {
			console.error("Failed to generate outfit for event:", error);
			toast.error("Failed to generate outfit suggestion");
		}
	};

	// Classify event type based on title/description
	const classifyEventType = (
		title: string
	): InternalCalendarEvent["eventType"] => {
		const titleLower = title.toLowerCase();

		if (
			titleLower.includes("meeting") ||
			titleLower.includes("work") ||
			titleLower.includes("office")
		) {
			return "business";
		}
		if (
			titleLower.includes("dinner") ||
			titleLower.includes("date") ||
			titleLower.includes("romantic")
		) {
			return "date";
		}
		if (
			titleLower.includes("party") ||
			titleLower.includes("celebration") ||
			titleLower.includes("birthday")
		) {
			return "party";
		}
		if (
			titleLower.includes("gym") ||
			titleLower.includes("workout") ||
			titleLower.includes("fitness")
		) {
			return "workout";
		}
		if (
			titleLower.includes("wedding") ||
			titleLower.includes("gala") ||
			titleLower.includes("formal")
		) {
			return "formal";
		}
		if (
			titleLower.includes("travel") ||
			titleLower.includes("flight") ||
			titleLower.includes("trip")
		) {
			return "travel";
		}

		return "casual";
	};

	// Format event time for display
	const formatEventTime = (event: DisplayEvent) => {
		try {
			const start = new Date(event.startTime);
			const end = new Date(event.endTime);

			const startTime = start.toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "2-digit",
				hour12: true,
			});

			const endTime = end.toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "2-digit",
				hour12: true,
			});

			const isToday = start.toDateString() === new Date().toDateString();
			const isTomorrow = (() => {
				const tomorrow = new Date();
				tomorrow.setDate(tomorrow.getDate() + 1);
				return start.toDateString() === tomorrow.toDateString();
			})();

			let dateStr = "";
			if (isToday) {
				dateStr = "Today";
			} else if (isTomorrow) {
				dateStr = "Tomorrow";
			} else {
				dateStr = start.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				});
			}

			return `${dateStr}, ${startTime} - ${endTime}`;
		} catch {
			return "Invalid date";
		}
	};

	// Get event type color
	const getEventTypeColor = (eventType: string) => {
		const colors = {
			business: "bg-blue-100 text-blue-800",
			casual: "bg-green-100 text-green-800",
			formal: "bg-purple-100 text-purple-800",
			workout: "bg-orange-100 text-orange-800",
			date: "bg-pink-100 text-pink-800",
			party: "bg-yellow-100 text-yellow-800",
			travel: "bg-indigo-100 text-indigo-800",
			other: "bg-gray-100 text-gray-800",
		};
		return colors[eventType as keyof typeof colors] || colors.other;
	};

	// Convert DisplayEvent to CalendarEvent format for FullCalendarModal
	const convertToModalEvents = (events: DisplayEvent[]): any[] => {
		return events.map((event) => ({
			id: event.id,
			summary: event.title,
			start: {
				dateTime: event.startTime,
			},
			end: {
				dateTime: event.endTime,
			},
			location: event.location,
			description: event.description,
			eventType: event.eventType,
			hasOutfit: event.hasOutfit,
		}));
	};

	// Refresh calendar data
	const refreshCalendar = async () => {
		// Force refresh of backend data by invalidating queries
		window.location.reload(); // Simple refresh for now
	};

	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-6xl mx-auto space-y-6">
					{/* Header Section */}
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<div>
							<div className="flex items-center gap-3">
								<h1 className="text-3xl font-bold">
									Calendar & Outfits
								</h1>
								{!isPro && (
									<Badge
										variant="outline"
										className="text-blue-600 border-blue-200"
									>
										<Lock className="w-3 h-3 mr-1" />
										Pro Feature
									</Badge>
								)}
							</div>
							<p className="text-muted-foreground mt-1">
								{isPro
									? "AI-powered outfit suggestions for your upcoming events"
									: "AI-powered outfit suggestions for your upcoming events • Upgrade to Pro to generate outfits"}
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button
								onClick={handleGenerateWardrobeSuggestions}
								disabled={
									generateOutfits.isPending ||
									(displayEvents.length > 0 && !isPro)
								}
								className={`flex items-center gap-2 ${
									displayEvents.length > 0 && !isPro
										? "opacity-60 cursor-not-allowed"
										: ""
								}`}
							>
								{displayEvents.length > 0 && !isPro ? (
									<Lock className="w-4 h-4" />
								) : (
									<Sparkles className="w-4 h-4" />
								)}
								{displayEvents.length === 0
									? generateOutfits.isPending
										? "Generating..."
										: "Generate All Outfits"
									: !isPro
									? "Pro Only - Generate All Outfits"
									: generateOutfits.isPending
									? "Generating..."
									: "Generate All Outfits"}
							</Button>
							<Button
								onClick={refreshCalendar}
								variant="outline"
								disabled={!isConnected}
								className="flex items-center gap-2"
							>
								<RefreshCw className="w-4 h-4" />
								Refresh Calendar
							</Button>
						</div>
					</div>

					{/* Loading State */}
					{isLoading && (
						<div className="space-y-4">
							{[...Array(3)].map((_, i) => (
								<Card key={i} className="card-fashion">
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="flex items-start gap-4">
												<Skeleton className="w-12 h-12 rounded-lg" />
												<div className="space-y-2">
													<Skeleton className="h-4 w-32" />
													<Skeleton className="h-3 w-24" />
												</div>
											</div>
											<div className="flex gap-2">
												<Skeleton className="h-6 w-16" />
												<Skeleton className="h-6 w-20" />
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<div className="flex gap-2">
											<Skeleton className="h-8 w-24" />
											<Skeleton className="h-8 w-20" />
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}

					{/* Error State */}
					{isError && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								Failed to load calendar data. Please try again
								later.
							</AlertDescription>
						</Alert>
					)}

					{/* Events List */}
					{!isLoading && !isError && (
						<>
							{/* Full Calendar Modal */}
							<div className="flex justify-center">
								<FullCalendarModal
									events={convertToModalEvents(displayEvents)}
									onPopulateOutfit={(
										eventId: string,
										eventTitle: string
									) => {
										const event = displayEvents.find(
											(e) => e.id === eventId
										);
										if (event)
											handleGenerateOutfitForEvent(event);
									}}
									onSaveOutfit={(
										eventId: string,
										eventTitle: string
									) => {
										navigate(`/wardrobe?event=${eventId}`);
									}}
									onRetryOutfit={(
										eventId: string,
										eventTitle: string
									) => {
										const event = displayEvents.find(
											(e) => e.id === eventId
										);
										if (event)
											handleGenerateOutfitForEvent(event);
									}}
								>
									<Button
										variant="outline"
										className="flex items-center gap-2"
									>
										<CalendarDays className="w-4 h-4" />
										Open Calendar View
									</Button>
								</FullCalendarModal>
							</div>

							<div className="space-y-4">
								{displayEvents.map((event) => (
									<Card
										key={event.id}
										className="card-fashion"
									>
										<CardHeader>
											<div className="flex items-start justify-between">
												<div className="flex items-start gap-4">
													<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
														<Calendar className="w-6 h-6 text-primary" />
													</div>
													<div>
														<CardTitle className="text-foreground mb-1">
															{event.title}
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
																	{
																		event.location
																	}
																</div>
															)}
														</div>
														{event.description && (
															<p className="text-sm text-muted-foreground mt-2 line-clamp-2">
																{
																	event.description
																}
															</p>
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
											{/* Show outfit details if available */}
											{event.hasOutfit &&
												event.outfitPlan && (
													<div className="mb-4 p-4 bg-gray-50 rounded-lg">
														<div className="flex items-center gap-2 mb-3">
															<Shirt className="w-4 h-4 text-primary" />
															<h4 className="font-medium text-foreground">
																Outfit Plan
															</h4>
															<Badge
																variant="secondary"
																className="bg-blue-100 text-blue-800 text-xs"
															>
																{
																	event
																		.outfitPlan
																		.confidence_score
																}
																% confidence
															</Badge>
														</div>

														{/* Outfit Description */}
														<p className="text-sm text-muted-foreground mb-3">
															{
																event.outfitPlan
																	.outfit_description
															}
														</p>

														{/* Wardrobe Items */}
														{event.outfitItems &&
															event.outfitItems
																.length > 0 && (
																<div className="mb-3">
																	<h5 className="text-xs font-medium text-muted-foreground mb-2">
																		OUTFIT
																		ITEMS
																	</h5>
																	<div className="flex flex-wrap gap-2">
																		{event.outfitItems.map(
																			(
																				item
																			) => (
																				<Badge
																					key={
																						item.id
																					}
																					variant="outline"
																					className="bg-white text-xs"
																				>
																					{
																						item.color_primary
																					}{" "}
																					{item.subcategory ||
																						item.category}
																				</Badge>
																			)
																		)}
																	</div>
																</div>
															)}

														{/* Weather Considerations */}
														{event.outfitPlan
															.weather_considerations && (
															<div className="mb-3">
																<h5 className="text-xs font-medium text-muted-foreground mb-1">
																	WEATHER
																	NOTES
																</h5>
																<p className="text-xs text-muted-foreground">
																	{
																		event
																			.outfitPlan
																			.weather_considerations
																	}
																</p>
															</div>
														)}

														{/* Alternatives */}
														{event.outfitPlan
															.alternatives &&
															event.outfitPlan
																.alternatives
																.length > 0 && (
																<div>
																	<h5 className="text-xs font-medium text-muted-foreground mb-1">
																		ALTERNATIVES
																	</h5>
																	<ul className="text-xs text-muted-foreground">
																		{event.outfitPlan.alternatives.map(
																			(
																				alt,
																				index
																			) => (
																				<li
																					key={
																						index
																					}
																					className="flex items-start gap-1"
																				>
																					<span className="text-primary">
																						•
																					</span>
																					<span>
																						{
																							alt
																						}
																					</span>
																				</li>
																			)
																		)}
																	</ul>
																</div>
															)}
													</div>
												)}

											{/* Action Buttons */}
											<div className="flex items-center gap-3">
												{event.hasOutfit && (
													<>
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																navigate(
																	`/wardrobe?event=${event.id}`
																)
															}
															className="flex items-center gap-2"
														>
															<Save className="w-4 h-4" />
															View Wardrobe
														</Button>

														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																handleGenerateOutfitForEvent(
																	event
																)
															}
															disabled={
																generateOutfits.isPending ||
																!isPro
															}
															className={`flex items-center gap-2 ${
																!isPro
																	? "opacity-60 cursor-not-allowed"
																	: ""
															}`}
														>
															{!isPro ? (
																<Lock className="w-4 h-4" />
															) : (
																<RefreshCw className="w-4 h-4" />
															)}
															{!isPro
																? "Pro Only"
																: "Regenerate"}
														</Button>
													</>
												)}
											</div>
										</CardContent>
									</Card>
								))}

								{displayEvents.length === 0 && (
									<Card className="card-fashion text-center p-8">
										<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
											<Calendar className="w-8 h-8 text-muted-foreground" />
										</div>
										<h3 className="text-lg font-medium mb-2">
											No Upcoming Events
										</h3>
										<p className="text-muted-foreground mb-4">
											{isConnected
												? "You don't have any events in the next 30 days."
												: "Connect your Google Calendar to see your events and get outfit suggestions."}
										</p>
										<div className="flex gap-2 justify-center">
											<Button
												onClick={refreshCalendar}
												variant="outline"
												disabled={!isConnected}
											>
												{isConnected
													? "Refresh Calendar"
													: "Connect Calendar"}
											</Button>
											{!isConnected && (
												<Button
													onClick={() =>
														navigate(
															"/calendar-connect"
														)
													}
												>
													Connect Google Calendar
												</Button>
											)}
										</div>
									</Card>
								)}
							</div>
						</>
					)}

					{/* Quick Stats */}
					{!isLoading && displayEvents.length > 0 && (
						<Card className="border-dashed">
							<CardContent className="pt-6">
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
									<div>
										<p className="text-2xl font-bold text-primary">
											{displayEvents.length}
										</p>
										<p className="text-sm text-muted-foreground">
											Total Events
										</p>
									</div>
									<div>
										<p className="text-2xl font-bold text-green-600">
											{
												displayEvents.filter(
													(e) => e.hasOutfit
												).length
											}
										</p>
										<p className="text-sm text-muted-foreground">
											Outfits Ready
										</p>
									</div>
									<div>
										<p className="text-2xl font-bold text-blue-600">
											{(wardrobe?.data as any)?.data
												?.wardrobe?.length || 0}
										</p>
										<p className="text-sm text-muted-foreground">
											Wardrobe Items
										</p>
									</div>
									<div>
										<p className="text-2xl font-bold text-purple-600">
											{(plans?.data as any)?.outfit_plans
												?.length || 0}
										</p>
										<p className="text-sm text-muted-foreground">
											Planned Outfits
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
};

export default CalendarView;
