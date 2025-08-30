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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fashionAPI } from "@/services/api";
import { ChatbotRequest } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { useChatbotStore, type Message } from "@/stores/chatbotStore";
import { useAuthStore } from "@/stores/authStore";

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
					<Input
						value={inputValue}
						onChange={(e) => {
							if (e.target.value.length <= 500) {
								setInputValue(e.target.value);
								setShowWelcome(false);
							}
						}}
						onKeyPress={handleKeyPress}
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
							isAuthenticated ? "Send message" : "Log in to chat"
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
				</div>
			</div>
		</div>
	);
};

export default FashionChatbot;
