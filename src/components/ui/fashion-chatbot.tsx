import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const FashionChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your personal fashion assistant. Ask me about outfits, style tips, or fashion trends!",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateFashionResponse(inputValue),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);

    setInputValue('');
  };

  const generateFashionResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('outfit') || input.includes('what to wear')) {
      return "For outfit suggestions, I'd recommend checking your wardrobe analysis! Consider the weather, occasion, and your personal style. Would you like specific recommendations for a particular event?";
    }
    
    if (input.includes('color') || input.includes('colours')) {
      return "Color coordination is key! Consider your skin tone, the season, and current trends. Neutral colors are always safe, but don't be afraid to add a pop of color with accessories!";
    }
    
    if (input.includes('trend') || input.includes('fashion')) {
      return "Current fashion trends include sustainable fashion, oversized blazers, and statement accessories. Remember, the best trend is wearing what makes you feel confident!";
    }
    
    return "That's a great fashion question! I'd love to help you explore your style further. You can upload photos of your outfits for personalized analysis and recommendations.";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
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
          <h3 className="font-semibold text-sm">Fashion Assistant</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3 text-sm",
                  message.sender === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {message.text}
              </div>
            </div>
          ))}
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
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            disabled={!inputValue.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FashionChatbot;