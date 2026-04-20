"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatInterface({ companyId }: { companyId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/apex/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          messages: [...messages, userMsg],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${data.error}` },
        ]);
        return;
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error de conexion: ${(e as Error).message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#1a1a35] border border-[#2a2a4d] rounded-xl overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="bg-gradient-to-br from-[#c9a84c] to-[#9e8139] rounded-2xl p-4 mb-4">
              <Sparkles size={32} className="text-[#0a0a18]" />
            </div>
            <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#f1f1f5] mb-2">
              Hola, soy APEX
            </h3>
            <p className="text-[#8b8ba7] max-w-md">
              Puedo ayudarte con estrategia, analisis de mercado, diagnostico, ideas creativas y mucho mas.
              Hazme una pregunta o pedime que analice algo.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#9e8139] flex items-center justify-center shrink-0">
                  <Sparkles size={14} className="text-[#0a0a18]" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-[#c9a84c] text-[#0a0a18]"
                    : "bg-[#0a0a18] text-[#f1f1f5] border border-[#2a2a4d]"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#9e8139] flex items-center justify-center">
              <Sparkles size={14} className="text-[#0a0a18]" />
            </div>
            <div className="bg-[#0a0a18] border border-[#2a2a4d] rounded-xl px-4 py-3">
              <Loader2 size={16} className="animate-spin text-[#c9a84c]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#2a2a4d]">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Escribe tu mensaje..."
            disabled={loading}
            className="flex-1 bg-[#0a0a18] border border-[#2a2a4d] rounded-lg px-4 py-3 text-[#f1f1f5] focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] outline-none disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-[#c9a84c] to-[#9e8139] text-[#0a0a18] px-5 rounded-lg hover:from-[#e3c670] hover:to-[#c9a84c] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
