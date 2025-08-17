import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
	id: string;
	text: string;
	sender: "user" | "bot";
	timestamp: Date;
	isError?: boolean;
}

interface ChatbotState {
	messages: Message[];
	conversationId: string | undefined;
	remainingMessages: number | null;
	isOpen: boolean;
}

interface ChatbotActions {
	addMessage: (message: Message) => void;
	addMessages: (messages: Message[]) => void;
	clearMessages: () => void;
	setConversationId: (id: string) => void;
	setRemainingMessages: (count: number) => void;
	setIsOpen: (isOpen: boolean) => void;
	resetConversation: () => void;
	getMessageCount: () => number;
	getLastMessage: () => Message | undefined;
}

const initialMessage: Message = {
	id: "welcome",
	text: "Hi! I'm your personal fashion assistant. Ask me about outfits, style tips, or fashion trends!",
	sender: "bot",
	timestamp: new Date(),
};

// Helper function to handle Date serialization for messages
const serializeMessages = (messages: Message[]) => {
	return messages.map((msg) => ({
		...msg,
		timestamp: msg.timestamp.toISOString(),
	}));
};

const deserializeMessages = (messages: any[]): Message[] => {
	return messages.map((msg) => ({
		...msg,
		timestamp: new Date(msg.timestamp),
	}));
};

export const useChatbotStore = create<ChatbotState & ChatbotActions>()(
	persist(
		(set, get) => ({
			// State
			messages: [initialMessage],
			conversationId: undefined,
			remainingMessages: null,
			isOpen: false,

			// Actions
			addMessage: (message: Message) => {
				set((state) => ({
					messages: [...state.messages, message],
				}));
			},

			addMessages: (newMessages: Message[]) => {
				set((state) => ({
					messages: [...state.messages, ...newMessages],
				}));
			},

			clearMessages: () => {
				set({
					messages: [initialMessage],
				});
			},

			setConversationId: (id: string) => {
				set({ conversationId: id });
			},

			setRemainingMessages: (count: number) => {
				set({ remainingMessages: count });
			},

			setIsOpen: (isOpen: boolean) => {
				set({ isOpen });
			},

			resetConversation: () => {
				set({
					messages: [initialMessage],
					conversationId: undefined,
					remainingMessages: null,
				});
			},

			getMessageCount: () => {
				return get().messages.length;
			},

			getLastMessage: () => {
				const messages = get().messages;
				return messages.length > 0
					? messages[messages.length - 1]
					: undefined;
			},
		}),
		{
			name: "chatbot-storage",
			partialize: (state) => ({
				messages: state.messages,
				conversationId: state.conversationId,
				remainingMessages: state.remainingMessages,
				// Don't persist isOpen state - let it default to false on page load
			}),
		}
	)
);
