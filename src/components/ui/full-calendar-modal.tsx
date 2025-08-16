import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, CalendarProps } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Calendar as CalendarIcon,
	Clock,
	MapPin,
	Shirt,
	Save,
	RefreshCw,
} from "lucide-react";

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

interface FullCalendarModalProps {
	children: React.ReactNode;
	events: CalendarEvent[];
	onPopulateOutfit: (eventId: string, eventTitle: string) => void;
	onSaveOutfit: (eventId: string, eventTitle: string) => void;
	onRetryOutfit: (eventId: string, eventTitle: string) => void;
}

export function FullCalendarModal({
	children,
	events,
	onPopulateOutfit,
	onSaveOutfit,
	onRetryOutfit,
}: FullCalendarModalProps) {
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(
		new Date()
	);

	// Get events for the selected date
	const getEventsForDate = (date: Date | undefined) => {
		if (!date) return [];

		const dateStr = date.toISOString().split("T")[0];
		return events.filter((event) => {
			if (event.start.date) {
				return event.start.date.startsWith(dateStr);
			}
			if (event.start.dateTime) {
				return event.start.dateTime.startsWith(dateStr);
			}
			return false;
		});
	};

	const formatEventTime = (event: CalendarEvent): string => {
		if (event.start.dateTime) {
			const startDate = new Date(event.start.dateTime);
			return startDate.toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "2-digit",
				hour12: true,
			});
		} else if (event.start.date) {
			return "All day";
		}
		return "No time specified";
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

	const selectedEvents = getEventsForDate(selectedDate);

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<CalendarIcon className="w-5 h-5" />
						Calendar View
					</DialogTitle>
				</DialogHeader>

				<div className="flex gap-6 flex-1 overflow-hidden">
					{/* Calendar */}
					<div className="flex-shrink-0">
						<Calendar
							mode="single"
							selected={selectedDate}
							onSelect={setSelectedDate}
							className="rounded-md border"
						/>
					</div>

					{/* Events for selected date */}
					<div className="flex-1 overflow-y-auto">
						<div className="space-y-4">
							<h3 className="font-semibold text-lg">
								Events for{" "}
								{selectedDate?.toLocaleDateString("en-US", {
									weekday: "long",
									month: "long",
									day: "numeric",
									year: "numeric",
								})}
							</h3>

							{selectedEvents.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
									<p>No events scheduled for this date</p>
								</div>
							) : (
								<div className="space-y-3">
									{selectedEvents.map((event) => (
										<Card
											key={event.id}
											className="border-border"
										>
											<CardHeader className="pb-3">
												<div className="flex items-start justify-between">
													<div className="flex items-start gap-3">
														<div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
															<CalendarIcon className="w-5 h-5 text-primary" />
														</div>
														<div>
															<CardTitle className="text-base mb-1">
																{event.summary}
															</CardTitle>
															<div className="flex items-center gap-3 text-sm text-muted-foreground">
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
																Ready
															</Badge>
														)}
													</div>
												</div>
											</CardHeader>

											{event.hasOutfit &&
												event.outfitSuggestion && (
													<CardContent className="pt-0 pb-3">
														<div className="p-3 bg-muted/50 rounded-lg mb-3">
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
													</CardContent>
												)}

											<CardContent className="pt-0">
												<div className="flex items-center gap-2">
													<Button
														variant="default"
														size="sm"
														onClick={() =>
															onPopulateOutfit(
																event.id,
																event.summary
															)
														}
														className="flex items-center gap-1"
													>
														<Shirt className="w-3 h-3" />
														{event.hasOutfit
															? "View"
															: "Generate"}
													</Button>

													{event.hasOutfit && (
														<>
															<Button
																variant="outline"
																size="sm"
																onClick={() =>
																	onSaveOutfit(
																		event.id,
																		event.summary
																	)
																}
																className="flex items-center gap-1"
															>
																<Save className="w-3 h-3" />
																Save
															</Button>

															<Button
																variant="outline"
																size="sm"
																onClick={() =>
																	onRetryOutfit(
																		event.id,
																		event.summary
																	)
																}
																className="flex items-center gap-1"
															>
																<RefreshCw className="w-3 h-3" />
																Retry
															</Button>
														</>
													)}
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
