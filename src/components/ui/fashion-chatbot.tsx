import React, { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fashionAPI } from "@/services/api";
import { ChatbotRequest } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { useChatbotStore, type Message } from "@/stores/chatbotStore";

const FashionChatbot = () => {
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
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const { toast } = useToast();

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSendMessage = async () => {
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
				className="fixed right-6 bottom-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg z-50 p-0"
				aria-label="Open fashion chatbot"
			>
				<Bot className="h-6 w-6" />
			</Button>
		);
	}

	return (
		<div className="fixed right-6 bottom-6 w-80 h-96 bg-background border border-border rounded-lg shadow-xl z-50 flex flex-col">
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b border-border">
				<div className="flex items-center gap-2">
					<Bot className="h-5 w-5 text-primary" />
					<div className="flex flex-col">
						<h3 className="font-semibold text-sm">
							Fashion Assistant
						</h3>
						{remainingMessages !== null && (
							<span className="text-xs text-muted-foreground">
								{remainingMessages} messages left
							</span>
						)}
					</div>
				</div>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						onClick={handleClearChat}
						className="h-6 w-6"
						title="Clear conversation"
					>
						<Trash2 className="h-3 w-3" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsOpen(false)}
						className="h-6 w-6"
						title="Close chat"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Messages */}
			<ScrollArea className="flex-1 p-4">
				<div className="space-y-4">
					{messages.map((message) => (
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
									"max-w-[80%] rounded-lg p-3 text-sm",
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
							</div>
						</div>
					))}

					{/* Loading indicator */}
					{isLoading && (
						<div className="flex justify-start">
							<div className="bg-muted rounded-lg p-3 text-sm flex items-center gap-2">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>Thinking...</span>
							</div>
						</div>
					)}
				</div>
				<div ref={messagesEndRef} />
			</ScrollArea>

			{/* Input */}
			<div className="p-4 border-t border-border">
				<div className="flex gap-2">
					<Input
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Ask about fashion..."
						className="flex-1"
						disabled={isLoading}
					/>
					<Button
						onClick={handleSendMessage}
						size="icon"
						disabled={!inputValue.trim() || isLoading}
					>
						{isLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Send className="h-4 w-4" />
						)}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default FashionChatbot;
