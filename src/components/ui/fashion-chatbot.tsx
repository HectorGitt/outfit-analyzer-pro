import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	MessageCircle,
	X,
	Send,
	Bot,
	Loader2,
	AlertCircle,
	Trash2,
	Copy,
	RotateCcw,
	Keyboard,
	LogIn,
	Mic,
	MicOff,
	Volume2,
	VolumeX,
	PhoneOff,
	Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fashionAPI } from "@/services/api";
import {
	calendarAPI,
	wardrobeAPI,
	userAPI,
	outfitAPI,
	planningAPI,
} from "@/services/api";
import { ChatbotRequest } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { useChatbotStore, type Message } from "@/stores/chatbotStore";
import { useAuthStore } from "@/stores/authStore";
import { usePricingTier } from "@/hooks/useCalendar";
import { tool, RealtimeAgent, RealtimeSession } from "@openai/agents-realtime";
import { z } from "zod";

// Tool definitions for fashion assistant
const getCalendarEvents = tool({
	name: "get_calendar_events",
	description: "Get user calendar events for outfit planning and scheduling.",
	parameters: z.object({
		startDate: z
			.string()
			.nullable()
			.describe("Start date for events (ISO format)"),
		endDate: z
			.string()
			.nullable()
			.describe("End date for events (ISO format)"),
		eventType: z
			.string()
			.nullable()
			.describe("Type of events to filter (e.g., work, social, formal)"),
	}),
	async execute({ startDate, endDate, eventType }) {
		try {
			const response = await calendarAPI.getEvents({
				startDate,
				endDate,
				eventType,
			});
			return response;
		} catch (error) {
			console.error("Error fetching calendar events:", error);
			return { error: "Failed to fetch calendar events" };
		}
	},
});

const getWardrobeItems = tool({
	name: "get_wardrobe_items",
	description: "Get user wardrobe items for outfit suggestions.",
	parameters: z.object({
		category: z
			.string()
			.nullable()
			.describe("Category filter (tops, bottoms, shoes, etc.)"),
		occasion: z
			.string()
			.nullable()
			.describe("Occasion filter (casual, formal, work, etc.)"),
		season: z
			.string()
			.nullable()
			.describe("Season filter (spring, summer, fall, winter)"),
		limit: z
			.number()
			.nullable()
			.describe("Maximum number of items to return"),
	}),
	async execute({ category, occasion, season, limit = 20 }) {
		try {
			const response = await wardrobeAPI.getItems({
				category,
				occasion,
				season,
				limit,
			});
			return response.data;
		} catch (error) {
			console.error("Error fetching wardrobe items:", error);
			return { error: "Failed to fetch wardrobe items" };
		}
	},
});

const addWardrobeItem = tool({
	name: "add_wardrobe_item",
	description: "Add a new item to the user wardrobe.",
	parameters: z.object({
		name: z.string().describe("Item name"),
		category: z
			.string()
			.describe(
				"Item category (tops, bottoms, shoes, accessories, etc.)"
			),
		color: z.string().nullable().describe("Item color"),
		brand: z.string().nullable().describe("Item brand"),
		size: z.string().nullable().describe("Item size"),
		occasion: z.string().nullable().describe("Suitable occasions"),
		season: z.string().nullable().describe("Suitable seasons"),
		description: z.string().nullable().describe("Additional description"),
	}),
	async execute({
		name,
		category,
		color,
		brand,
		size,
		occasion,
		season,
		description,
	}) {
		try {
			const response = await wardrobeAPI.createItem({
				description: name,
				category: category as any,
				color_primary: color || "",
				brand,
				size,
				season: season as any,
				occasion: occasion ? [occasion] : [],
			});
			return response.data;
		} catch (error) {
			console.error("Error adding wardrobe item:", error);
			return { error: "Failed to add wardrobe item" };
		}
	},
});

const getUserPreferences = tool({
	name: "get_user_preferences",
	description: "Get user fashion preferences and style profile.",
	parameters: z.object({}),
	async execute() {
		try {
			const response = await userAPI.getPreferences();
			return response.data;
		} catch (error) {
			console.error("Error fetching user preferences:", error);
			return { error: "Failed to fetch user preferences" };
		}
	},
});

const generateOutfitSuggestion = tool({
	name: "generate_outfit_suggestion",
	description:
		"Generate outfit suggestions based on occasion, weather, and preferences.",
	parameters: z.object({
		eventId: z.string().describe("Calendar event ID for context"),
		title: z.string().describe("Event title"),
		startTime: z.string().describe("Event start time (ISO format)"),
		endTime: z.string().describe("Event end time (ISO format)"),
		description: z.string().nullable().describe("Event description"),
		weather: z.string().nullable().describe("Current weather conditions"),
		colors: z.array(z.string()).nullable().describe("Preferred colors"),
	}),
	async execute({
		eventId,
		title,
		startTime,
		endTime,
		description,
		weather,
		colors,
	}) {
		try {
			const response = await outfitAPI.generateSuggestion({
				id: eventId,
				title,
				start_time: startTime,
				end_time: endTime,
				description: description || "",
				weather: weather
					? {
							temperature: 20,
							condition: weather,
							humidity: 50,
							windSpeed: 5,
							precipitation: 0,
							location: "",
							date: new Date().toISOString().split("T")[0],
					  }
					: undefined,
				preferences: colors ? { colors } : undefined,
			});
			return response.data;
		} catch (error) {
			console.error("Error generating outfit suggestion:", error);
			return { error: "Failed to generate outfit suggestion" };
		}
	},
});

const getOutfitPlans = tool({
	name: "get_outfit_plans",
	description: "Get existing outfit plans and suggestions.",
	parameters: z.object({
		eventId: z.string().nullable().describe("Filter by calendar event ID"),
		status: z
			.string()
			.nullable()
			.describe("Filter by status (planned, completed, etc.)"),
		startDate: z.string().nullable().describe("Start date filter"),
		endDate: z.string().nullable().describe("End date filter"),
		limit: z
			.number()
			.nullable()
			.describe("Maximum number of plans to return"),
	}),
	async execute({ eventId, status, startDate, endDate, limit = 10 }) {
		try {
			const response = await planningAPI.getPlans({
				eventId,
				status,
				startDate,
				endDate,
				limit,
			});
			return response.data;
		} catch (error) {
			console.error("Error fetching outfit plans:", error);
			return { error: "Failed to fetch outfit plans" };
		}
	},
});

const createOutfitPlan = tool({
	name: "create_outfit_plan",
	description: "Create a new outfit plan for a specific event or occasion.",
	parameters: z.object({
		eventId: z.string().describe("Calendar event ID"),
		outfitId: z
			.string()
			.describe("Outfit suggestion ID to use for the plan"),
		notes: z
			.string()
			.nullable()
			.describe("Additional notes for the outfit plan"),
	}),
	async execute({ eventId, outfitId, notes }) {
		try {
			const response = await planningAPI.planOutfit({
				eventId,
				outfitId,
				notes,
			});
			return response.data;
		} catch (error) {
			console.error("Error creating outfit plan:", error);
			return { error: "Failed to create outfit plan" };
		}
	},
});

// Generate login URL with current page as next parameter
const getLoginUrl = () => {
	const currentPath = location.pathname + location.search;
	return `/login?next=${encodeURIComponent(currentPath)}`;
};

// Typing indicator component
const TypingIndicator = () => {
	const [dots, setDots] = useState("");

	useEffect(() => {
		const interval = setInterval(() => {
			setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
		}, 500);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="flex justify-start">
			<div className="bg-muted rounded-lg p-3 text-sm flex items-center gap-2">
				<Loader2 className="h-4 w-4 animate-spin" />
				<span>Thinking{dots}</span>
			</div>
		</div>
	);
};

// Welcome message component
const WelcomeMessage = ({
	onSuggestionClick,
}: {
	onSuggestionClick: (text: string) => void;
}) => {
	const suggestions = [
		"What should I wear to a wedding?",
		"Help me style this outfit",
		"What's trending this season?",
		"How to mix patterns?",
	];

	return (
		<div className="flex justify-start">
			<div className="max-w-[80%] bg-muted rounded-lg p-4 text-sm space-y-3">
				<div className="flex items-center gap-2 mb-2">
					<Bot className="h-4 w-4 text-primary" />
					<span className="font-medium">Fashion Assistant</span>
				</div>
				<p className="text-muted-foreground">
					Hi! I'm your fashion assistant. I can help you with outfit
					suggestions, styling tips, and fashion advice. Try asking me
					about:
				</p>
				<div className="space-y-2">
					{suggestions.map((suggestion, index) => (
						<Button
							key={index}
							variant="outline"
							size="sm"
							className="w-full justify-start text-xs h-8"
							onClick={() => onSuggestionClick(suggestion)}
						>
							{suggestion}
						</Button>
					))}
				</div>
			</div>
		</div>
	);
};

// Login required message component
const LoginRequiredMessage = ({
	onLoginClick,
}: {
	onLoginClick: () => void;
}) => {
	return (
		<div className="flex justify-start">
			<div className="max-w-[80%] bg-muted rounded-lg p-4 text-sm space-y-3">
				<div className="flex items-center gap-2 mb-2">
					<Bot className="h-4 w-4 text-primary" />
					<span className="font-medium">Fashion Assistant</span>
				</div>
				<div className="space-y-3">
					<p className="text-muted-foreground">
						Hi! I'm your fashion assistant, but I need you to be
						logged in to chat with me.
					</p>
					<div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
						<AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
						<p className="text-sm text-blue-800 dark:text-blue-200">
							Please log in to access personalized fashion advice
							and chat with me!
						</p>
					</div>
					<Button
						onClick={onLoginClick}
						className="w-full bg-primary hover:bg-primary/90"
						size="sm"
					>
						<LogIn className="h-4 w-4 mr-2" />
						Log In to Chat
					</Button>
				</div>
			</div>
		</div>
	);
};

const FashionChatbot = () => {
	// Check authentication status
	const { isAuthenticated } = useAuthStore();
	const { data: pricingData } = usePricingTier();
	const isPro = pricingData?.data?.is_pro ?? false;
	const navigate = useNavigate();

	// Zustand store state and actions
	const {
		messages,
		conversationId,
		remainingMessages,
		isOpen,
		addMessage,
		setConversationId,
		setRemainingMessages,
		setIsOpen,
		resetConversation,
	} = useChatbotStore();

	// Local component state
	const [inputValue, setInputValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [showWelcome, setShowWelcome] = useState(
		messages.length === 0 && isAuthenticated
	);
	const [showLoginRequired, setShowLoginRequired] = useState(
		!isAuthenticated
	);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const { toast } = useToast();

	// Voice functionality state
	const [isVoiceMode, setIsVoiceMode] = useState(false);
	const [realtimeSession, setRealtimeSession] = useState<any>(null);
	const [isVoiceLoading, setIsVoiceLoading] = useState(false);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, isOpen]);

	useEffect(() => {
		setShowWelcome(messages.length === 0 && isAuthenticated);
		setShowLoginRequired(!isAuthenticated);
	}, [messages.length, isAuthenticated]);

	const handleLoginClick = () => {
		// Navigate to login page - you might need to adjust this based on your routing setup
		navigate(getLoginUrl());
	};

	const handleSuggestionClick = (suggestion: string) => {
		if (!isAuthenticated) {
			handleLoginClick();
			return;
		}
		setInputValue(suggestion);
		setShowWelcome(false);
	};

	const handleCopyMessage = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toast({
				title: "Copied!",
				description: "Message copied to clipboard",
				variant: "default",
			});
		} catch (error) {
			toast({
				title: "Copy failed",
				description: "Could not copy message to clipboard",
				variant: "destructive",
			});
		}
	};

	const handleRetryMessage = async (messageId: string) => {
		const messageToRetry = messages.find((m) => m.id === messageId);
		if (!messageToRetry || messageToRetry.sender !== "user") return;

		setInputValue(messageToRetry.text);
		toast({
			title: "Message restored",
			description: "You can now edit and resend the message",
			variant: "default",
		});
	};

	const formatTimestamp = (timestamp: Date | string | undefined) => {
		try {
			const now = new Date();
			let timestampDate: Date;

			// Handle different timestamp formats
			if (timestamp instanceof Date) {
				timestampDate = timestamp;
			} else if (typeof timestamp === "string") {
				timestampDate = new Date(timestamp);
			} else {
				// Fallback to current time if timestamp is invalid
				return "Just now";
			}

			// Check if the date is valid
			if (isNaN(timestampDate.getTime())) {
				return "Just now";
			}

			const diff = now.getTime() - timestampDate.getTime();
			const minutes = Math.floor(diff / 60000);
			const hours = Math.floor(diff / 3600000);
			const days = Math.floor(diff / 86400000);

			if (minutes < 1) return "Just now";
			if (minutes < 60) return `${minutes}m ago`;
			if (hours < 24) return `${hours}h ago`;
			if (days < 7) return `${days}d ago`;
			return timestampDate.toLocaleDateString();
		} catch (error) {
			// Fallback in case of any parsing errors
			return "Just now";
		}
	};

	const handleSendMessage = async () => {
		if (!isAuthenticated) {
			handleLoginClick();
			return;
		}

		if (!inputValue.trim() || isLoading) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			text: inputValue,
			sender: "user",
			timestamp: new Date(),
		};

		addMessage(userMessage);
		const currentInput = inputValue;
		setInputValue("");
		setIsLoading(true);
		setShowWelcome(false);

		try {
			const request: ChatbotRequest = {
				message: currentInput,
				conversation_id: conversationId,
				include_wardrobe: true,
				include_preferences: true,
			};

			const apiResponse = await fashionAPI.chatbot(request);
			//console.log("Full API Response:", apiResponse);

			// The apiCall function returns ApiResponse<ChatbotResponse>
			// So the actual chatbot data is in apiResponse.data
			const response = apiResponse.data;
			//console.log("Chatbot Response:", response);

			// Update conversation state in store
			if (response.conversation_id) {
				setConversationId(response.conversation_id);
			}
			if (response.remaining_messages !== undefined) {
				setRemainingMessages(response.remaining_messages);
			}

			const botResponse: Message = {
				id: (Date.now() + 1).toString(),
				text:
					response.response ||
					"I'm sorry, I couldn't generate a response.",
				sender: "bot",
				timestamp: new Date(),
			};

			addMessage(botResponse);

			// Show message limit warning if running low
			if (
				response.remaining_messages !== undefined &&
				response.remaining_messages <= 3 &&
				response.remaining_messages > 0
			) {
				toast({
					title: "Message Limit Warning",
					description: `You have ${response.remaining_messages} messages remaining. Upgrade to Pro for unlimited chat!`,
					variant: "default",
				});
			}
		} catch (error: any) {
			console.error("Chatbot API error:", error);
			console.error("Error details:", {
				message: error.message,
				status: error.status,
				response: error.response?.data,
				stack: error.stack,
			});

			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				text:
					error.message ||
					"I'm sorry, I'm having trouble responding right now. Please try again later.",
				sender: "bot",
				timestamp: new Date(),
				isError: true,
			};

			addMessage(errorMessage);

			// Show user-friendly error toast
			toast({
				title: "Connection Error",
				description:
					"Failed to send message. Please check your connection and try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !isLoading) {
			handleSendMessage();
		}
	};

	const handleClearChat = () => {
		resetConversation();
		toast({
			title: "Chat Cleared",
			description: "Your conversation history has been cleared.",
			variant: "default",
		});
	};

	// Voice functionality functions
	const initializeRealtimeSession = async () => {
		try {
			setIsVoiceLoading(true);

			// First, fetch the ephemeral token from the backend
			const tokenResponse = await fashionAPI.getRealtimeClientSecret();
			const clientSecret = tokenResponse.data.client_secret;

			const agent = new RealtimeAgent({
				name: "Fashion Assistant",
				instructions: `
# Role & Objective
You are a helpful fashion assistant. Help users with outfit suggestions, styling tips, and fashion advice. 
You can access the user's calendar events, wardrobe items, preferences, and outfit plans to provide personalized recommendations. 
Success means providing clear, stylish, and practical guidance tailored to the user.

# Personality & Tone
- Friendly, confident, approachable
- Warm and concise
- Speak clearly and briefly, avoid over-explaining
- 2–3 sentences per turn
- Deliver audio quickly but do not sound rushed
- Vary phrasing to avoid robotic repetition

# Context
- Use calendar events to suggest outfits for specific occasions
- Use wardrobe items to mix and match clothing
- Use preferences and outfit plans to align with personal style
- Stay updated with current fashion trends

## Language
- The conversation will be only in English.
- Do not respond in any other language, even if the user asks.
- If the user speaks another language, politely explain that support is limited to English.

# Instructions / Rules
- IF AUDIO IS UNCLEAR, ask the user politely to repeat
- DO NOT provide financial, legal, or medical advice
- ESCALATE if repeated dissatisfaction, confusion, or safety concerns
- Provide varied suggestions, not identical repeats
- Keep suggestions practical: weather, season, event, and user preferences matter

# Conversation Flow
Greeting → Discover (event/occasion) → Outfit Suggestion → Confirm → Adjust (if needed) → Close

Greeting Examples:
- “Hi, ready to plan your look for today?”
- “Welcome back, do you want me to pick an outfit for your next event?”

Outfit Suggestion Examples:
- “For your dinner in Paris, I’d suggest a tailored navy blazer, white shirt, and loafers.”
- “It’s warm today, so light chinos with a linen shirt would be a great fit.”

Clarification Examples:
- “Sorry, I didn’t catch that—could you say it again?”
- “I only heard part of that. What did you say after…?”

Closing Examples:
- “Enjoy your evening, I’ll save this outfit in your plan.”
- “Perfect, I’ve added that to your calendar.”

# Safety & Escalation
Escalate if:
- User explicitly requests human help
- Severe dissatisfaction after 2 failed attempts
- Threats, harassment, or safety risk
Say: “Thanks for your patience—I’m connecting you with a specialist now.”

# Variety
- Do not repeat the same phrases
- Rotate expressions for greetings, confirmations, and suggestions
`,
				tools: [
					getCalendarEvents,
					getWardrobeItems,
					addWardrobeItem,
					getUserPreferences,
					generateOutfitSuggestion,
					getOutfitPlans,
					createOutfitPlan,
				],
			});

			const session = new RealtimeSession(agent);
			await session.connect({
				apiKey: clientSecret,
			});

			setRealtimeSession(session);
			return session;
		} catch (error) {
			console.error("Failed to initialize realtime session:", error);
			toast({
				title: "Voice Setup Failed",
				description:
					"Could not initialize voice functionality. Please try again later.",
				variant: "destructive",
			});
			return null;
		} finally {
			setIsVoiceLoading(false);
		}
	};

	const hangupCall = async () => {
		if (realtimeSession) {
			try {
				await realtimeSession.close();
				setRealtimeSession(null);
				setIsVoiceMode(false);
				setIsVoiceLoading(false);
				toast({
					title: "Call Ended",
					description: "Voice session has been disconnected.",
					variant: "default",
				});
			} catch (error) {
				console.error("Error disconnecting realtime session:", error);
				toast({
					title: "Disconnect Failed",
					description: "Could not properly end the voice session.",
					variant: "destructive",
				});
			}
		}
	};

	const toggleVoiceMode = async () => {
		if (!isAuthenticated || isVoiceLoading) {
			return;
		}

		// Check if user is pro before allowing voice functionality
		if (!isPro) {
			toast({
				title: "Pro Feature",
				description:
					"Voice chat is available for Pro users only. Upgrade to access this feature!",
				variant: "default",
				action: (
					<Button
						variant="outline"
						size="sm"
						onClick={() => navigate("/profile")}
					>
						Upgrade
					</Button>
				),
			});
			return;
		}

		if (!isVoiceMode) {
			// Switching to voice mode
			const session = await initializeRealtimeSession();
			console.log("Realtime session started:", session);
			if (session) {
				setIsVoiceMode(true);
				toast({
					title: "Voice Call Started",
					description:
						"You can now speak with the fashion assistant!",
					variant: "default",
				});
			}
		} else {
			// Switching back to text mode
			await hangupCall();
		}
	};

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (realtimeSession) {
				try {
					realtimeSession.close();
				} catch (error) {
					console.error(
						"Error disconnecting realtime session:",
						error
					);
				}
			}
		};
	}, [realtimeSession]);

	if (!isOpen) {
		return (
			<Button
				onClick={() => setIsOpen(true)}
				className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg z-50 p-0 transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95"
				aria-label="Open fashion chatbot"
			>
				<Bot className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200 hover:rotate-12" />
			</Button>
		);
	}

	return (
		<div className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 w-[calc(100vw-2rem)] sm:w-80 h-[calc(100vh-8rem)] sm:h-96 bg-background border border-border rounded-lg shadow-xl z-50 flex flex-col animate-in slide-in-from-bottom-4 duration-300 max-w-sm">
			{/* Header */}
			<div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
				<div className="flex items-center gap-2">
					<div className="relative">
						<Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
						{isAuthenticated && (
							<div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
						)}
					</div>
					<div className="flex flex-col min-w-0 flex-1">
						<h3 className="font-semibold text-xs sm:text-sm truncate">
							Fashion Assistant
						</h3>
						{isAuthenticated && remainingMessages !== null && (
							<span
								className={cn(
									"text-xs truncate",
									remainingMessages <= 3
										? "text-orange-600"
										: "text-muted-foreground"
								)}
							>
								{remainingMessages} messages left
							</span>
						)}
						{!isAuthenticated && (
							<span className="text-xs text-blue-600 dark:text-blue-400 truncate">
								Login required
							</span>
						)}
						{isAuthenticated && !isPro && (
							<span className="text-xs text-amber-600 dark:text-amber-400 truncate flex items-center gap-1">
								<Lock className="h-3 w-3" />
								Pro features available
							</span>
						)}
					</div>
				</div>
				<div className="flex items-center gap-1 flex-shrink-0">
					{isAuthenticated && (
						<Button
							variant="ghost"
							size="icon"
							onClick={handleClearChat}
							className="h-6 w-6 hover:bg-red-50 hover:text-red-600 transition-colors"
							title="Clear conversation"
							aria-label="Clear conversation"
						>
							<Trash2 className="h-3 w-3" />
						</Button>
					)}
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsOpen(false)}
						className="h-6 w-6 hover:bg-gray-100 transition-colors"
						title="Close chat"
						aria-label="Close chat"
					>
						<X className="h-3 w-3 sm:h-4 sm:w-4" />
					</Button>
				</div>
			</div>

			{/* Messages */}
			<ScrollArea className="flex-1 p-4">
				<div className="space-y-4">
					{showLoginRequired && (
						<LoginRequiredMessage onLoginClick={handleLoginClick} />
					)}

					{showWelcome && isAuthenticated && (
						<WelcomeMessage
							onSuggestionClick={handleSuggestionClick}
						/>
					)}

					{isAuthenticated &&
						messages.map((message) => (
							<div
								key={message.id}
								className={cn(
									"flex",
									message.sender === "user"
										? "justify-end"
										: "justify-start"
								)}
							>
								<div className="max-w-[85%] space-y-1">
									<div
										className={cn(
											"rounded-lg p-3 text-sm relative group",
											message.sender === "user"
												? "bg-primary text-primary-foreground"
												: message.isError
												? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
												: "bg-muted text-muted-foreground"
										)}
									>
										{message.isError && (
											<div className="flex items-center gap-2 mb-1">
												<AlertCircle className="h-3 w-3" />
												<span className="text-xs font-medium">
													Error
												</span>
											</div>
										)}
										{message.text}

										{/* Copy button for bot messages */}
										{message.sender === "bot" &&
											!message.isError && (
												<Button
													variant="ghost"
													size="icon"
													className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
													onClick={() =>
														handleCopyMessage(
															message.text
														)
													}
													title="Copy message"
												>
													<Copy className="h-3 w-3" />
												</Button>
											)}

										{/* Retry button for user messages */}
										{message.sender === "user" && (
											<Button
												variant="ghost"
												size="icon"
												className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
												onClick={() =>
													handleRetryMessage(
														message.id
													)
												}
												title="Retry message"
											>
												<RotateCcw className="h-3 w-3" />
											</Button>
										)}
									</div>

									{/* Timestamp */}
									<div
										className={cn(
											"text-xs text-muted-foreground px-1",
											message.sender === "user"
												? "text-right"
												: "text-left"
										)}
									>
										{formatTimestamp(message.timestamp)}
									</div>
								</div>
							</div>
						))}

					{/* Enhanced typing indicator */}
					{isLoading && isAuthenticated && <TypingIndicator />}
				</div>
				<div ref={messagesEndRef} />
			</ScrollArea>

			{/* Input */}
			<div className="p-3 sm:p-4 border-t border-border space-y-2">
				{/* Character counter and keyboard hint */}
				<div className="flex items-center justify-between text-xs text-muted-foreground">
					<div className="flex items-center gap-1">
						{isAuthenticated ? (
							<>
								<Keyboard className="h-3 w-3 hidden sm:block" />
								<span className="hidden sm:inline">
									Press Enter to send
								</span>
								<span className="sm:hidden">Tap to send</span>
								{!isPro && (
									<span className="ml-2 text-amber-600 dark:text-amber-400">
										• Voice chat: Pro only
									</span>
								)}
							</>
						) : (
							<span className="text-blue-600 dark:text-blue-400">
								Please log in to chat
							</span>
						)}
					</div>
					{isAuthenticated && (
						<span
							className={cn(
								"transition-colors font-medium",
								inputValue.length > 450
									? "text-orange-500"
									: "",
								inputValue.length > 500 ? "text-red-500" : ""
							)}
						>
							{inputValue.length}/500
						</span>
					)}
				</div>

				<div className="flex gap-2">
					{isAuthenticated && (
						<Button
							onClick={toggleVoiceMode}
							size="icon"
							variant={isVoiceMode ? "default" : "outline"}
							disabled={isVoiceLoading}
							className={cn(
								"transition-all duration-200",
								isVoiceMode
									? "bg-blue-500 hover:bg-blue-600"
									: "",
								!isPro && "opacity-60 hover:opacity-80"
							)}
							title={
								!isPro
									? "Voice chat is a Pro feature"
									: isVoiceMode
									? "Switch to text mode"
									: "Switch to voice mode"
							}
							aria-label={
								!isPro
									? "Voice chat is a Pro feature"
									: isVoiceMode
									? "Switch to text mode"
									: "Switch to voice mode"
							}
						>
							{isVoiceLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : !isPro ? (
								<div className="relative">
									<Mic className="h-4 w-4" />
								</div>
							) : isVoiceMode ? (
								<Keyboard className="h-4 w-4" />
							) : (
								<Mic className="h-4 w-4" />
							)}
						</Button>
					)}

					{isVoiceMode ? (
						// Voice mode controls
						<div className="flex gap-2 flex-1">
							<div className="flex-1 flex items-center justify-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
								<div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
									<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
									<span className="text-sm font-medium">
										Voice Active
									</span>
								</div>
							</div>
							<Button
								onClick={hangupCall}
								size="icon"
								variant="destructive"
								className="transition-all duration-200 hover:scale-105 active:scale-95"
								aria-label="Hang up voice call"
							>
								<PhoneOff className="h-4 w-4" />
							</Button>
						</div>
					) : (
						// Text mode controls
						<>
							<Input
								value={inputValue}
								onChange={(e) => {
									if (e.target.value.length <= 500) {
										setInputValue(e.target.value);
										setShowWelcome(false);
									}
								}}
								onKeyDown={handleKeyPress}
								placeholder={
									isAuthenticated
										? "Ask about fashion..."
										: "Log in to start chatting..."
								}
								className="flex-1 text-sm"
								disabled={isLoading || !isAuthenticated}
								maxLength={500}
								aria-label={
									isAuthenticated
										? "Type your fashion question"
										: "Please log in to chat"
								}
							/>
							<Button
								onClick={
									isAuthenticated
										? handleSendMessage
										: handleLoginClick
								}
								size="icon"
								disabled={
									(!isAuthenticated && false) ||
									(isAuthenticated &&
										(!inputValue.trim() ||
											isLoading ||
											inputValue.length > 500))
								}
								className="transition-all duration-200 hover:scale-105 active:scale-95"
								aria-label={
									isAuthenticated
										? "Send message"
										: "Log in to chat"
								}
							>
								{isAuthenticated && isLoading ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : isAuthenticated ? (
									<Send className="h-4 w-4" />
								) : (
									<LogIn className="h-4 w-4" />
								)}
							</Button>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default FashionChatbot;
