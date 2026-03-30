import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Trash2, Sparkles } from "lucide-react";
import { aiAPI } from "../services/api";

export function AIAgentScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await aiAPI.getChatHistory();
        setMessages(Array.isArray(history) ? history : []);
      } catch {} finally { setHistoryLoading(false); }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg = { role: "user", content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await aiAPI.chat({ message: text });
      const aiMsg = {
        role: "assistant",
        content: response?.reply || response?.message || response?.content || "I couldn't process that request.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again.", timestamp: new Date().toISOString() },
      ]);
    } finally { setLoading(false); }
  };

  const handleClear = async () => {
    if (!confirm("Clear chat history?")) return;
    try { await aiAPI.clearChat(); setMessages([]); } catch {}
  };

  const suggestions = [
    "How much did I spend this month?",
    "What's my top spending category?",
    "Show my savings progress",
    "Compare this month to last month",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#7C5CFF]" />
          <span className="text-sm font-semibold text-white">Finly AI</span>
        </div>
        {messages.length > 0 && (
          <button onClick={handleClear} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5">
            <Trash2 className="w-4 h-4 text-white/40" />
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {historyLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-[#7C5CFF] animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="space-y-4 pt-8">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#7C5CFF] to-[#4CC9F0] flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ask me anything</h3>
              <p className="text-sm text-white/50">I can help analyze your finances</p>
            </div>
            <div className="space-y-2 pt-4">
              {suggestions.map((s) => (
                <button key={s} onClick={() => { setInput(s); }}
                  className="w-full text-left px-4 py-3 bg-[#1B2130] border border-white/5 rounded-xl text-sm text-white/70 hover:border-[#7C5CFF]/30 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                msg.role === "user"
                  ? "bg-[#7C5CFF] text-white rounded-br-sm"
                  : "bg-[#1B2130] text-white border border-white/5 rounded-bl-sm"
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 bg-[#1B2130] rounded-2xl rounded-bl-sm border border-white/5">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#7C5CFF] animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-[#7C5CFF] animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-[#7C5CFF] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your finances..."
            className="flex-1 px-4 py-3 bg-[#1B2130] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-[#7C5CFF] focus:outline-none text-sm"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-xl bg-[#7C5CFF] flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
