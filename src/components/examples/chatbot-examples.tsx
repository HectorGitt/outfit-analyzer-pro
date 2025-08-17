// Example usage of the Chatbot Store
// This file demonstrates how other components can interact with the chatbot state

import { useChatbotStore } from "@/stores/chatbotStore";

// Example: Component that shows chatbot status
export const ChatbotStatus = () => {
	const {
		messages,
		conversationId,
		remainingMessages,
		getMessageCount,
		getLastMessage,
	} = useChatbotStore();

	return (
		<div className="p-4 border rounded-lg">
			<h3 className="font-semibold mb-2">Chatbot Status</h3>
			<div className="space-y-1 text-sm">
				<p>Messages: {getMessageCount()}</p>
				<p>Conversation ID: {conversationId || "None"}</p>
				<p>Remaining Messages: {remainingMessages ?? "Unknown"}</p>
				<p>
					Last Message: {getLastMessage()?.text.substring(0, 50)}...
				</p>
			</div>
		</div>
	);
};

// Example: Component that can programmatically add messages
export const ChatbotController = () => {
	const { addMessage, resetConversation, setIsOpen } = useChatbotStore();

	const addSystemMessage = () => {
		addMessage({
			id: Date.now().toString(),
			text: "System: This is an automated message.",
			sender: "bot",
			timestamp: new Date(),
		});
	};

	const openChatWithMessage = () => {
		setIsOpen(true);
		addMessage({
			id: Date.now().toString(),
			text: "Welcome back! How can I help you today?",
			sender: "bot",
			timestamp: new Date(),
		});
	};

	return (
		<div className="p-4 border rounded-lg space-y-2">
			<h3 className="font-semibold mb-2">Chatbot Controls</h3>
			<button
				onClick={addSystemMessage}
				className="block w-full p-2 bg-blue-500 text-white rounded"
			>
				Add System Message
			</button>
			<button
				onClick={openChatWithMessage}
				className="block w-full p-2 bg-green-500 text-white rounded"
			>
				Open Chat with Welcome
			</button>
			<button
				onClick={resetConversation}
				className="block w-full p-2 bg-red-500 text-white rounded"
			>
				Reset Conversation
			</button>
		</div>
	);
};

// Example: Hook for other components to easily interact with chatbot
export const useChatbotActions = () => {
	const { addMessage, setIsOpen, resetConversation } = useChatbotStore();

	const sendSystemNotification = (message: string) => {
		addMessage({
			id: `system-${Date.now()}`,
			text: message,
			sender: "bot",
			timestamp: new Date(),
		});
	};

	const openChatWithContext = (contextMessage: string) => {
		setIsOpen(true);
		addMessage({
			id: `context-${Date.now()}`,
			text: contextMessage,
			sender: "bot",
			timestamp: new Date(),
		});
	};

	return {
		sendSystemNotification,
		openChatWithContext,
		resetConversation,
	};
};
