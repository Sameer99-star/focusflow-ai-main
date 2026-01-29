import { useState } from "react";
import { Send, Sparkles, Bot, User, Lightbulb, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const quickActions = [
  {
    icon: Target,
    label: "What should I focus on?",
    message: "What should I focus on today?",
  },
  {
    icon: Calendar,
    label: "I missed a day",
    message: "I missed yesterday's sessions. How should I catch up?",
  },
  {
    icon: Lightbulb,
    label: "Adjust schedule",
    message: "I'm feeling overwhelmed. Can you adjust my schedule?",
  },
];

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hi! I'm your AI learning mentor. I can help you stay on track, adjust your schedule, and provide personalized guidance. What would you like to work on today?",
  },
];

export default function Mentor() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        "What should I focus on today?": 
          "Based on your progress, I recommend completing the **useEffect Hook** session today. It's a crucial concept that builds on what you learned yesterday about State Management. You're making excellent progress! After this session, you'll be 29% through the course. 🎯",
        "I missed yesterday's sessions. How should I catch up?":
          "No worries! Missing a day happens to everyone. Here's my suggestion:\n\n1. **Today**: Complete yesterday's remaining session (useEffect Hook) - it's only 25 minutes\n2. **Tomorrow**: Do today's scheduled sessions at a relaxed pace\n\nYou'll be back on track by Day 4. Remember, consistency beats perfection. Would you like me to adjust your schedule automatically?",
        "I'm feeling overwhelmed. Can you adjust my schedule?":
          "I hear you, and it's smart to recognize when you need to slow down. Let me suggest a few options:\n\n1. **Reduce daily limit** from 90 to 60 minutes (extends course by 3 days)\n2. **Add rest days** on weekends\n3. **Pause for 2-3 days** without losing progress\n\nWhich option feels right for you? Your mental wellbeing matters more than speed.",
      };

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responses[text] || 
          "That's a great question! Based on your learning pattern, I'd recommend breaking this into smaller sessions. Would you like me to create a custom mini-roadmap for this topic?",
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-8 pb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-glow-pulse">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Mentor</h1>
            <p className="text-muted-foreground">Your personal learning guide</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleSend(action.message)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 hover:bg-secondary text-sm text-foreground transition-all duration-200 hover:scale-[1.02]"
            >
              <action.icon className="w-4 h-4 text-primary" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-4 animate-fade-in",
              message.role === "user" && "flex-row-reverse"
            )}
          >
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                message.role === "assistant"
                  ? "bg-primary/10"
                  : "bg-accent/10"
              )}
            >
              {message.role === "assistant" ? (
                <Bot className="w-5 h-5 text-primary" />
              ) : (
                <User className="w-5 h-5 text-accent" />
              )}
            </div>

            <div
              className={cn(
                "max-w-[70%] p-4 rounded-2xl",
                message.role === "assistant"
                  ? "bg-card border border-border"
                  : "bg-accent text-accent-foreground"
              )}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 animate-fade-in">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="bg-card border border-border p-4 rounded-2xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-8 pt-4 border-t border-border bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your learning journey..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
