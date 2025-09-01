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
	Maximize2,
	Minimize2,
	Sparkles,
	Settings,
	ThumbsUp,
	ThumbsDown,
	HelpCircle,
	Heart,
	Zap,
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
import { useUserPricingTier, useFeatureAccess } from "@/hooks/usePricing";
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

// Enhanced typing indicator with better design
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
			<div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 text-sm flex items-center gap-3 border border-primary/20 shadow-sm">
				<div className="relative">
					<Bot className="h-5 w-5 text-primary animate-pulse" />
					<div className="absolute -top-1 -right-1 w-3 h-3 bg-primary/30 rounded-full animate-ping"></div>
				</div>
				<div className="flex items-center gap-1">
					<span className="text-primary font-medium">Thinking</span>
					<span className="text-primary/70">{dots}</span>
				</div>
			</div>
		</div>
	);
};

// Welcome message component with enhanced design
const WelcomeMessage = ({
	onSuggestionClick,
}: {
	onSuggestionClick: (text: string) => void;
}) => {
	const quickActions = [
		{
			text: "What should I wear to a wedding?",
			icon: Heart,
			color: "from-pink-500 to-rose-500",
		},
		{
			text: "Help me style this outfit",
			icon: Sparkles,
			color: "from-purple-500 to-indigo-500",
		},
		{
			text: "What's trending this season?",
			icon: Zap,
			color: "from-yellow-500 to-orange-500",
		},
		{
			text: "How to mix patterns?",
			icon: Settings,
			color: "from-blue-500 to-cyan-500",
		},
	];

	return (
		<div className="flex justify-start">
			<div className="max-w-[90%] bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 rounded-2xl p-6 text-sm space-y-4 border border-primary/20 shadow-lg">
				<div className="flex items-center gap-3 mb-4">
					<div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
						<Bot className="h-6 w-6 text-white" />
					</div>
					<div>
						<h4 className="font-bold text-base bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							Fashion Assistant
						</h4>
						<p className="text-xs text-muted-foreground">
							Ready to help with your style!
						</p>
					</div>
				</div>

				<div className="space-y-3">
					<p className="text-muted-foreground leading-relaxed">
						Hi there! 👋 I'm your personal fashion stylist. I can
						help you with outfit suggestions, styling tips, trend
						advice, and much more. What would you like to explore
						today?
					</p>

					<div className="grid grid-cols-1 gap-2">
						{quickActions.map((action, index) => (
							<Button
								key={index}
								variant="outline"
								size="sm"
								className="w-full justify-start text-xs h-10 border-2 hover:border-primary/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
								onClick={() => onSuggestionClick(action.text)}
							>
								<div
									className={`w-6 h-6 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mr-3 flex-shrink-0`}
								>
									<action.icon className="h-3 w-3 text-white" />
								</div>
								<span className="truncate">{action.text}</span>
							</Button>
						))}
					</div>

					<div className="pt-2 border-t border-border/50">
						<p className="text-xs text-muted-foreground/70 text-center">
							Try asking about your wardrobe, upcoming events, or
							fashion trends!
						</p>
					</div>
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
	const { data: userTier } = useUserPricingTier();
	const isPro = userTier?.tier !== "free";
	const hasVoiceAccess = useFeatureAccess("voice_integration");
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
	const [isFullscreen, setIsFullscreen] = useState(false);

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

	const handleMessageReaction = async (
		messageId: string,
		reaction: "thumbs_up" | "thumbs_down"
	) => {
		// Here you could implement message feedback functionality
		toast({
			title:
				reaction === "thumbs_up"
					? "Thanks for the feedback!"
					: "We'll work on improving!",
			description: "Your feedback helps us get better.",
			variant: "default",
		});
	};

	const handleClearChat = () => {
		resetConversation();
		setShowWelcome(true);
		toast({
			title: "Chat Cleared",
			description: "Your conversation has been cleared.",
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
		if (!hasVoiceAccess) {
			toast({
				title: "Premium Feature",
				description: `Voice chat is available for Icons
					 only. Upgrade to access this feature!`,
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
		<div
			className={cn(
				"fixed z-50 flex flex-col animate-in slide-in-from-bottom-4 duration-300",
				isFullscreen
					? "inset-4 w-auto h-auto bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl"
					: "right-4 bottom-4 sm:right-6 sm:bottom-6 w-[calc(100vw-2rem)] sm:w-80 h-[calc(100vh-8rem)] sm:h-96 bg-background border border-border rounded-xl shadow-xl max-w-sm"
			)}
		>
			{/* Header with enhanced design */}
			<div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 backdrop-blur-sm">
				<div className="flex items-center gap-3">
					<div className="relative">
						<div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
							{isVoiceMode ? (
								<Mic className="h-5 w-5 text-white" />
							) : (
								<Bot className="h-5 w-5 text-white" />
							)}
						</div>
						{isAuthenticated && (
							<div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse border-2 border-background"></div>
						)}
						{isVoiceMode && (
							<div className="absolute -bottom-1 -right-1 h-3 w-3 bg-blue-500 rounded-full animate-pulse border-2 border-background">
								<div className="w-full h-full bg-blue-400 rounded-full animate-ping"></div>
							</div>
						)}
					</div>
					<div className="flex flex-col min-w-0 flex-1">
						<h3 className="font-bold text-sm sm:text-base truncate bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							{isVoiceMode
								? "Voice Assistant"
								: "Fashion Assistant"}
						</h3>
						<div className="flex items-center gap-2">
							{isAuthenticated && remainingMessages !== null && (
								<span
									className={cn(
										"text-xs truncate flex items-center gap-1",
										remainingMessages <= 3
											? "text-orange-600"
											: "text-muted-foreground"
									)}
								>
									<Sparkles className="h-3 w-3" />
									{remainingMessages} messages left
								</span>
							)}
							{!isAuthenticated && (
								<span className="text-xs text-blue-600 dark:text-blue-400 truncate flex items-center gap-1">
									<Lock className="h-3 w-3" />
									Login required
								</span>
							)}
							{isAuthenticated && !isPro && (
								<span className="text-xs text-amber-600 dark:text-amber-400 truncate flex items-center gap-1">
									<Zap className="h-3 w-3" />
									{userTier?.name || "Free"}
								</span>
							)}
							{isAuthenticated && isPro && (
								<span className="text-xs text-green-600 dark:text-green-400 truncate flex items-center gap-1">
									<Zap className="h-3 w-3" />
									{userTier?.name || "Pro"}
								</span>
							)}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-1 flex-shrink-0">
					{/* Fullscreen toggle button */}
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsFullscreen(!isFullscreen)}
						className="h-8 w-8 hover:bg-primary/10 transition-colors"
						title={
							isFullscreen
								? "Exit fullscreen"
								: "Enter fullscreen"
						}
						aria-label={
							isFullscreen
								? "Exit fullscreen"
								: "Enter fullscreen"
						}
					>
						{isFullscreen ? (
							<Minimize2 className="h-4 w-4" />
						) : (
							<Maximize2 className="h-4 w-4" />
						)}
					</Button>
					{isAuthenticated && (
						<Button
							variant="ghost"
							size="icon"
							onClick={handleClearChat}
							className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors"
							title="Clear conversation"
							aria-label="Clear conversation"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					)}
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsOpen(false)}
						className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
						title="Close chat"
						aria-label="Close chat"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Messages with enhanced design */}
			<ScrollArea className={cn("flex-1 p-4", isFullscreen ? "p-6" : "")}>
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
								<div
									className={cn(
										"max-w-[85%] space-y-2",
										isFullscreen ? "max-w-[90%]" : ""
									)}
								>
									<div
										className={cn(
											"rounded-2xl p-4 text-sm relative group shadow-sm border transition-all duration-200",
											message.sender === "user"
												? "bg-gradient-to-r from-primary to-accent text-white border-primary/20"
												: message.isError
												? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
												: "bg-gradient-to-r from-muted/50 to-muted/30 text-foreground border-muted/50"
										)}
									>
										{message.isError && (
											<div className="flex items-center gap-2 mb-2">
												<AlertCircle className="h-4 w-4" />
												<span className="text-xs font-medium">
													Error
												</span>
											</div>
										)}
										<div className="whitespace-pre-wrap leading-relaxed">
											{message.text}
										</div>

										{/* Enhanced action buttons */}
										<div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
											{message.sender === "bot" &&
												!message.isError && (
													<>
														<Button
															variant="ghost"
															size="icon"
															className="h-6 w-6 hover:bg-white/20"
															onClick={() =>
																handleCopyMessage(
																	message.text
																)
															}
															title="Copy message"
														>
															<Copy className="h-3 w-3" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															className="h-6 w-6 hover:bg-green-500/20 hover:text-green-600"
															onClick={() =>
																handleMessageReaction(
																	message.id,
																	"thumbs_up"
																)
															}
															title="Helpful"
														>
															<ThumbsUp className="h-3 w-3" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															className="h-6 w-6 hover:bg-red-500/20 hover:text-red-600"
															onClick={() =>
																handleMessageReaction(
																	message.id,
																	"thumbs_down"
																)
															}
															title="Not helpful"
														>
															<ThumbsDown className="h-3 w-3" />
														</Button>
													</>
												)}
											{message.sender === "user" && (
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6 hover:bg-white/20"
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
									</div>

									{/* Enhanced timestamp */}
									<div
										className={cn(
											"text-xs text-muted-foreground/70 px-2 flex items-center gap-1",
											message.sender === "user"
												? "justify-end"
												: "justify-start"
										)}
									>
										<div className="w-1 h-1 bg-current rounded-full opacity-50"></div>
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
										• Voice chat: {userTier?.name || "Free"}{" "}
										only
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
								!hasVoiceAccess && "opacity-60 hover:opacity-80"
							)}
							title={
								!hasVoiceAccess
									? `Voice chat requires ${
											userTier?.name || "Pro"
									  } plan`
									: isVoiceMode
									? "Switch to text mode"
									: "Switch to voice mode"
							}
							aria-label={
								!hasVoiceAccess
									? `Voice chat requires ${
											userTier?.name || "Pro"
									  } plan`
									: isVoiceMode
									? "Switch to text mode"
									: "Switch to voice mode"
							}
						>
							{isVoiceLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : !hasVoiceAccess ? (
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
