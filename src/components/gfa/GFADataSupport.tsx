import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Loader2, Bot, User, Trash2 } from "lucide-react";
import { Customer, Product, DistributionCenter, OptimizationSettings } from "@/types/gfa";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface GFADataSupportProps {
  customers: Customer[];
  products: Product[];
  dcs: DistributionCenter[];
  settings: OptimizationSettings;
  costBreakdown?: { totalCost: number; transportationCost: number; facilityCost: number; numSites: number };
}

export function GFADataSupport({
  customers,
  products,
  dcs,
  settings,
  costBreakdown,
}: GFADataSupportProps) {
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your GFA Data Assistant. I can help you understand your input data, explain what's required for optimization, and analyze your results. Ask me anything like:\n\n• How many customers are loaded?\n• What columns are required in my data?\n• Which customers have demand greater than X?\n• How many customers are in a specific country?\n• What are my optimization results?\n• Explain the GFA model to me"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const scrollRef = useRef<HTMLDivElement>(null);
  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gfa-chat`;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load conversation history on mount
  useEffect(() => {
    loadConversationHistory();
  }, [session]);

  const loadConversationHistory = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from("gfa_chat_messages")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedMessages = data
          .filter(msg => msg.role !== "system")
          .map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content
          }));
        
        // Add welcome message if there are loaded messages
        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
        }
      }
    } catch (error) {
      console.error("Error loading conversation history:", error);
    }
  };

  const saveMessage = async (role: string, content: string) => {
    if (!session?.user?.id) return;

    try {
      await supabase.from("gfa_chat_messages").insert({
        user_id: session.user.id,
        scenario_id: null,
        role,
        content,
        model: selectedModel
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const clearHistory = async () => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from("gfa_chat_messages")
        .delete()
        .eq("user_id", session.user.id);

      if (error) throw error;

      setMessages([
        {
          role: "assistant",
          content: "Hello! I'm your GFA Data Assistant. I can help you understand your input data, explain what's required for optimization, and analyze your results. Ask me anything!"
        }
      ]);
      toast.success("Conversation history cleared");
    } catch (error) {
      console.error("Error clearing history:", error);
      toast.error("Failed to clear history");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Save user message
    await saveMessage("user", input);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          gfaContext: {
            customers,
            products,
            dcs,
            settings,
            costBreakdown,
          },
          model: selectedModel
        }),
      });

      if (resp.status === 429) {
        toast.error("Rate limit exceeded. Please try again in a moment.");
        setIsLoading(false);
        return;
      }

      if (resp.status === 402) {
        toast.error("AI usage limit reached. Please check your OpenAI account.");
        setIsLoading(false);
        return;
      }

      if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let assistantContent = "";

      // Add placeholder message
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantContent
                };
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save assistant message after streaming completes
      if (assistantContent) {
        await saveMessage("assistant", assistantContent);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response. Please try again.");
      setMessages(prev => prev.slice(0, -1));
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-[calc(100vh-16rem)] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Data Support Assistant
            </CardTitle>
            <CardDescription>
              Ask questions about your data, required columns, statistics, and optimization results
            </CardDescription>
          </div>
          <div className="flex gap-2 items-center">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
              </SelectContent>
            </Select>
            {messages.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 gap-4 min-h-0">
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "assistant" && messages[messages.length - 1]?.content === "" && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your data... (e.g., 'How many customers are there?')"
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
