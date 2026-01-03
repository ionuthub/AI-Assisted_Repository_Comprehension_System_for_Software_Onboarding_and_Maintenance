import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Send, User, Bot, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface ExplanationPanelProps {
  isLoading: boolean;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onRefactor?: () => void;
  skillLevel: string;
  hasSelection: boolean;
}

const ExplanationPanel = ({
  isLoading,
  messages,
  onSendMessage,
  onRefactor,
  skillLevel,
  hasSelection
}: ExplanationPanelProps) => {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h4 key={i} className="font-bold text-foreground mt-4 mb-2">{line.replace(/\*\*/g, '')}</h4>;
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return <li key={i} className="ml-4 list-disc text-sm opacity-90">{line.substring(2)}</li>;
      }
      return <p key={i} className="text-sm leading-relaxed opacity-90 mb-2">{line}</p>;
    });
  };

  return (
    <Card className="h-full flex flex-col bg-card border-border overflow-hidden">
      <div className="bg-secondary/50 px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Tutor AI</span>
        </div>
        <div className="flex items-center gap-2">
          {hasSelection && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[10px] gap-1 bg-primary/5 border-primary/20 hover:bg-primary/10"
              onClick={onRefactor}
            >
              <Sparkles className="w-3 h-3" /> Refactor
            </Button>
          )}
          <Badge variant="outline" className="text-[10px] capitalize bg-background">{skillLevel}</Badge>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-6 scroll-smooth"
      >
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            {!hasSelection ? (
              <>
                <h5 className="font-bold text-sm mb-2 text-foreground">Awaiting Input...</h5>
                <p className="text-xs text-muted-foreground max-w-[200px]">Click any line of code to start the interactive tutorial.</p>
              </>
            ) : (
              <div className="space-y-4">
                <h5 className="font-bold text-sm text-foreground">Code Selected!</h5>
                <p className="text-xs text-muted-foreground">The AI is ready. What would you like to do?</p>
                <div className="flex flex-col gap-2">
                  <Button size="sm" onClick={() => onSendMessage("Explain this code in detail and use an analogy.")} className="text-xs">
                    Explain Selection
                  </Button>
                  <Button size="sm" variant="outline" onClick={onRefactor} className="text-xs">
                    Refactor for quality
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary' : 'bg-secondary'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-primary-foreground" /> : <Bot className="w-4 h-4 text-foreground" />}
            </div>
            <div className={`group relative max-w-[85%] p-3 rounded-2xl ${msg.role === 'user'
              ? 'bg-primary text-primary-foreground rounded-tr-none'
              : 'bg-secondary/40 text-foreground rounded-tl-none border border-border'
              }`}>
              {renderContent(msg.content)}

              <button
                onClick={() => handleCopy(msg.content, idx)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-background/50 rounded-md"
              >
                {copiedIndex === idx ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border bg-background/50">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2"
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="flex-1 bg-secondary/30"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!inputValue.trim() || isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-[10px] text-muted-foreground mt-2 text-center opacity-70">
          Powered by Gemini 2.0. Context-aware AI tutoring.
        </p>
      </div>
    </Card>
  );
};

export default ExplanationPanel;

