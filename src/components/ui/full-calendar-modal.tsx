import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Calendar as CalendarIcon,
	Clock,
	MapPin,
	Shirt,
	X,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
	events: CalendarEvent[];
	onPopulateOutfit: (eventId: string, eventTitle: string) => void;
	onSaveOutfit: (eventId: string, eventTitle: string) => void;
	onRetryOutfit: (eventId: string, eventTitle: string) => void;
	children: React.ReactNode;
}

export function FullCalendarModal({
	events,
	onPopulateOutfit,
	onSaveOutfit,
	onRetryOutfit,
	children,
}: FullCalendarModalProps) {
	const [selectedDate, setSelectedDate] = useState<Date | undefined>();
	const [isOpen, setIsOpen] = useState(false);

	const getEventTypeColor = (type: string) => {
		const colors = {
			work: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
			casual: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
			formal: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
			social: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
			fitness:
				"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
		};
		return (
			colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
		);
	};

	const getEventsForDate = (date: Date) => {
		const dateString = date.toISOString().split("T")[0];
		return events.filter((event) => {
			if (event.start.date) {
				// All-day event
				return event.start.date.startsWith(dateString);
			}
			if (event.start.dateTime) {
				// Timed event
				return event.start.dateTime.startsWith(dateString);
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

	const hasEventsOnDate = (date: Date) => {
		return getEventsForDate(date).length > 0;
	};

	const selectedDateEvents = selectedDate
		? getEventsForDate(selectedDate)
		: [];

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<CalendarIcon className="w-5 h-5" />
						Calendar View
					</DialogTitle>
				</DialogHeader>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Calendar */}
					<div className="lg:col-span-2">
						<Calendar
							mode="single"
							selected={selectedDate}
							onSelect={setSelectedDate}
							className="rounded-md border p-3 pointer-events-auto"
							modifiers={{
								hasEvents: (date) => hasEventsOnDate(date),
							}}
							modifiersStyles={{
								hasEvents: {
									backgroundColor:
										"hsl(var(--primary) / 0.1)",
									color: "hsl(var(--primary))",
									fontWeight: "bold",
								},
							}}
						/>
						<div className="mt-4 text-sm text-muted-foreground">
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded-full bg-primary/20"></div>
								<span>Days with events</span>
							</div>
						</div>
					</div>

					{/* Event Details */}
					<div className="space-y-4">
						{selectedDate ? (
							<>
								<div>
									<h3 className="font-semibold text-lg mb-2">
										{selectedDate.toLocaleDateString(
											"en-US",
											{
												weekday: "long",
												month: "long",
												day: "numeric",
											}
										)}
									</h3>
									{selectedDateEvents.length === 0 ? (
										<p className="text-muted-foreground">
											No events on this date
										</p>
									) : (
										<div className="space-y-3">
											{selectedDateEvents.map((event) => (
												<Card
													key={event.id}
													className="border-border"
												>
													<CardHeader className="pb-2">
														<div className="flex items-start justify-between">
															<CardTitle className="text-sm font-medium">
																{event.summary}
															</CardTitle>
															<Badge
																className={cn(
																	"text-xs",
																	getEventTypeColor(
																		event.eventType ||
																			"casual"
																	)
																)}
															>
																{event.eventType ||
																	"casual"}
															</Badge>
														</div>
													</CardHeader>
													<CardContent className="pt-0 space-y-3">
														<div className="space-y-1 text-xs text-muted-foreground">
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
															{event.hasOutfit && (
																<div className="flex items-center gap-1 text-green-600">
																	<Shirt className="w-3 h-3" />
																	Outfit Ready
																</div>
															)}
														</div>

														<div className="flex flex-col gap-2">
															<Button
																variant="default"
																size="sm"
																onClick={() =>
																	onPopulateOutfit(
																		event.id,
																		event.summary
																	)
																}
																className="w-full text-xs h-8"
															>
																<Shirt className="w-3 h-3 mr-1" />
																{event.hasOutfit
																	? "View Outfit"
																	: "Generate"}
															</Button>

															{event.hasOutfit && (
																<div className="flex gap-1">
																	<Button
																		variant="outline"
																		size="sm"
																		onClick={() =>
																			onSaveOutfit(
																				event.id,
																				event.summary
																			)
																		}
																		className="flex-1 text-xs h-7"
																	>
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
																		className="flex-1 text-xs h-7"
																	>
																		Retry
																	</Button>
																</div>
															)}
														</div>
													</CardContent>
												</Card>
											))}
										</div>
									)}
								</div>
							</>
						) : (
							<div className="text-center py-8">
								<CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
								<p className="text-muted-foreground">
									Select a date to view events
								</p>
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
