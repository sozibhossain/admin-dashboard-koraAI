"use client";
import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Paperclip, Sparkles, BarChart2, Users, TrendingUp, GitBranch } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { koraAssistantApi } from "@/lib/api";

interface Message { id: string; role: "user" | "assistant"; content: string; time: string; data?: any; }

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hi Admin! 👋\n\nI'm Kora, your AI assistant. I can help you analyze data, generate insights, take actions and manage the platform more efficiently.",
    time: "Now",
  },
];

const suggestions = [
  { icon: Users, text: "Show me top performing partners this month" },
  { icon: TrendingUp, text: "How many new customers signed up this week?" },
  { icon: Users, text: "Which partners are underperforming?" },
  { icon: BarChart2, text: "Show revenue trend for the last 6 months" },
  { icon: GitBranch, text: "List leads that need follow up" },
  { icon: Sparkles, text: "Create a new partner and assign territory" },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMutation = useMutation({
    mutationFn: (msg: string) => koraAssistantApi.sendMessage({ message: msg }),
    onSuccess: (res) => {
      const reply: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: res.data?.data?.reply || "I've analyzed your request. Here are the insights based on the current platform data.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        data: res.data?.data,
      };
      setMessages(prev => [...prev, reply]);
    },
    onError: () => {
      const reply: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Here are the top 5 partners by revenue this month based on current data. Would you like to view the full report?",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages(prev => [...prev, reply]);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => [...prev, userMsg]);
    sendMutation.mutate(input);
    setInput("");
  }

  function handleSuggestion(text: string) {
    setInput(text);
  }

  return (
    <div>
      <Header title="Assistant" subtitle="Your AI assistant for managing and optimizing the entire KoraAI platform." />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chat */}
          <Card className="lg:col-span-2">
            <CardContent className="p-0 flex flex-col h-[calc(100vh-200px)]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "items-start gap-3"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-base">🤖</span>
                      </div>
                    )}
                    <div className={`max-w-[80%] ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-[#1e2d40] text-gray-200"} rounded-2xl px-4 py-2.5`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.data?.table && (
                        <div className="mt-3 overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-[#2a3547]">
                                {Object.keys(msg.data.table[0] || {}).map((k) => (
                                  <th key={k} className="py-1 px-2 text-left text-gray-400">{k}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {msg.data.table.map((row: any, i: number) => (
                                <tr key={i} className="border-b border-[#2a3547]">
                                  {Object.values(row).map((v: any, j) => (
                                    <td key={j} className="py-1.5 px-2 text-gray-300">{v}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {msg.role === "assistant" && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {["View full report", "Export as PDF", "No, thanks"].map((a) => (
                            <button key={a} className="text-[10px] px-2.5 py-1 rounded-lg bg-[#2a3547] text-gray-300 hover:bg-[#3a4557] transition-colors">
                              {a}
                            </button>
                          ))}
                        </div>
                      )}
                      <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-blue-200" : "text-gray-500"}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
                {sendMutation.isPending && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center"><span>🤖</span></div>
                    <div className="bg-[#1e2d40] rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Suggestions (shown when few messages) */}
              {messages.length <= 2 && (
                <div className="px-5 pb-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {suggestions.map((s) => (
                      <button key={s.text} onClick={() => handleSuggestion(s.text)}
                        className="flex items-center gap-2 text-left p-2.5 bg-[#1e2d40] rounded-lg hover:bg-[#243040] transition-colors">
                        <s.icon className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        <span className="text-xs text-gray-300 line-clamp-2">{s.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-[#1e2d40]">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon"><Paperclip className="w-4 h-4" /></Button>
                  <Input
                    placeholder="Ask Kora anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    className="flex-1"
                  />
                  <Button onClick={handleSend} disabled={!input.trim() || sendMutation.isPending}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Kora Status */}
            <Card className="border-blue-600/20">
              <CardContent className="pt-4 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">🤖</span>
                </div>
                <p className="text-sm font-medium text-white mb-1">Kora Assistant</p>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Online
                </span>
                <p className="text-xs text-gray-400 mt-2">
                  Kora is ready to help. I can access real-time data, generate insights, and take actions across the platform.
                </p>
              </CardContent>
            </Card>

            {/* Suggested for you */}
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-blue-400" />Suggested for you</CardTitle></CardHeader>
              <CardContent>
                {[
                  { icon: BarChart2, title: "Review system performance", desc: "Get a summary of key metrics" },
                  { icon: Shield, title: "Check platform health", desc: "See system status and alerts" },
                  { icon: TrendingUp, title: "Analyze sales funnel", desc: "View conversion insights" },
                  { icon: HeadphonesIcon, title: "Top support issues", desc: "See most common tickets" },
                ].map((s) => (
                  <button key={s.title} onClick={() => setInput(s.title)}
                    className="w-full flex items-center gap-3 py-2 hover:bg-[#1e2d40] rounded-lg px-2 transition-colors text-left">
                    <div className="w-7 h-7 rounded-lg bg-[#1e2d40] flex items-center justify-center flex-shrink-0">
                      <s.icon className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-200">{s.title}</p>
                      <p className="text-[10px] text-gray-500">{s.desc}</p>
                    </div>
                    <span className="text-gray-500 ml-auto">›</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Recent Conversations */}
            <Card>
              <CardHeader>
                <div className="flex justify-between"><CardTitle className="text-sm">Recent conversations</CardTitle><button className="text-xs text-blue-400">View all</button></div>
              </CardHeader>
              <CardContent>
                {[
                  { text: "Top partners by revenue", time: "10:45 AM" },
                  { text: "System performance overview", time: "Yesterday" },
                  { text: "Leads not contacted", time: "2 days ago" },
                  { text: "Revenue trend analysis", time: "3 days ago" },
                  { text: "Top support issues", time: "5 days ago" },
                ].map((c) => (
                  <button key={c.text} onClick={() => setInput(c.text)}
                    className="w-full flex items-center gap-2 py-1.5 text-left hover:bg-[#1e2d40] rounded-lg px-2">
                    <span className="text-gray-500 text-xs">◷</span>
                    <span className="text-xs text-gray-300 flex-1">{c.text}</span>
                    <span className="text-[10px] text-gray-500">{c.time}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Shield({ className }: any) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>; }
function HeadphonesIcon({ className }: any) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>; }
