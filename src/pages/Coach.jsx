import React, { useEffect, useMemo, useRef, useState } from "react";
import { agentSDK } from "@/agents";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Heart, Flame, Droplet, Moon, Smile, Plus, Loader2, RefreshCw, NotebookPen, Brain, Wind, Send } from "lucide-react";
import MessageBubble from "@/components/agents/MessageBubble";
import ChatInput from "@/components/agents/ChatInput";
import ContentCard from "@/components/ContentCard";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function Coach() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [creating, setCreating] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [starter, setStarter] = useState(null);
  const subRef = useRef(null);

  const suggestions = useMemo(() => ([
    { icon: Wind, text: "Guide me through a 2-min breath to reduce stress" },
    { icon: Droplet, text: "Set my water goal for today and keep me accountable" },
    { icon: Moon, text: "Help me plan a better sleep tonight" },
    { icon: Smile, text: "I'm feeling low, give me a tiny uplifting plan" },
    { icon: Brain, text: "I have 20 minutes. Suggest a quick workout or yoga flow" },
    { icon: NotebookPen, text: "Summarize my last week’s wellness and one improvement" }
  ]), []);

  useEffect(() => {
    // Create a new conversation on mount
    const conv = agentSDK.createConversation({
      agent_name: "ai_coach",
      metadata: {
        name: "AI Coach",
        description: "Personal wellness coaching"
      }
    });
    setConversation(conv);
    setMessages(conv.messages || []);
    setCreating(false);

    // Subscribe to streaming updates
    subRef.current = agentSDK.subscribeToConversation(conv.id, (data) => {
      setMessages([...data.messages]);
    });

    return () => {
      if (subRef.current) subRef.current();
    };
  }, []);

  const handleSend = async (content) => {
    if (!conversation || !content?.trim()) return;
    setSending(true);
    try {
      await agentSDK.addMessage(conversation, { role: "user", content });
      setInput("");
    } finally {
      setSending(false);
    }
  };

  const startWith = async (text) => {
    setStarter(text);
    await handleSend(text);
    setStarter(null);
  };

  const newChat = async () => {
    if (subRef.current) subRef.current();
    setCreating(true);
    const conv = agentSDK.createConversation({
      agent_name: "ai_coach",
      metadata: {
        name: "AI Coach",
        description: "Personal wellness coaching"
      }
    });
    setConversation(conv);
    setMessages(conv.messages || []);
    subRef.current = agentSDK.subscribeToConversation(conv.id, (data) => {
      setMessages([...data.messages]);
    });
    setCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-violet-200/60 dark:border-violet-900/40 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-indigo-500/10 dark:from-violet-900/20 dark:via-fuchsia-900/20 dark:to-indigo-900/20 p-6 sm:p-8"
      >
        <div className="absolute -top-20 -right-24 h-64 w-64 rounded-full bg-fuchsia-400/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-400/30 blur-3xl" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              AI Coach <Sparkles className="w-5 h-5 text-violet-500" />
            </h1>
            <p className="text-slate-600 dark:text-slate-300">Personal, kind, and action-focused wellness guidance—anytime.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 inline-flex items-center gap-1"><Flame className="w-3 h-3" /> Micro-actions</span>
              <span className="px-3 py-1 rounded-full text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 inline-flex items-center gap-1"><Droplet className="w-3 h-3" /> Hydration</span>
              <span className="px-3 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 inline-flex items-center gap-1"><Moon className="w-3 h-3" /> Better Sleep</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={newChat} className="gap-2">
              <RefreshCw className="w-4 h-4" /> New Chat
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Suggestions */}
      <ContentCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Quick Suggestions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => startWith(s.text)}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow transition"
            >
              <s.icon className="w-5 h-5 text-violet-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{s.text}</span>
            </button>
          ))}
        </div>
      </ContentCard>

      {/* Chat Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-4 sm:p-6 bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl">
          <div className="h-[56vh] sm:h-[60vh] overflow-y-auto pr-1 space-y-4">
            {creating ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Starting your coach...
              </div>
            ) : (
              <>
                {messages.length === 0 ? (
                  <div className="text-center text-slate-500 mt-10">
                    Ask anything about your wellness, or pick a suggestion above.
                  </div>
                ) : (
                  messages.map((m) => (
                    <MessageBubble key={m.id || m.created_at || Math.random()} message={m} />
                  ))
                )}
              </>
            )}
          </div>
          <Separator className="my-4" />
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              className="flex-1"
            />
            <Button onClick={() => handleSend(input)} disabled={sending || !input.trim()} className="gap-2">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send
            </Button>
          </div>
        </Card>

        {/* Right Panel */}
        <div className="space-y-4">
          <ContentCard className="hover:shadow-xl">
            <h4 className="font-bold mb-2">Fast Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild className="justify-start gap-2">
                <Link to={createPageUrl("Water")}><Droplet className="w-4 h-4" /> Log water</Link>
              </Button>
              <Button variant="outline" asChild className="justify-start gap-2">
                <Link to={createPageUrl("Mood")}><Smile className="w-4 h-4" /> Mood check-in</Link>
              </Button>
              <Button variant="outline" asChild className="justify-start gap-2">
                <Link to={createPageUrl("Sleep")}><Moon className="w-4 h-4" /> Log sleep</Link>
              </Button>
              <Button variant="outline" asChild className="justify-start gap-2">
                <Link to={createPageUrl("Mind")}><NotebookPen className="w-4 h-4" /> Quick journal</Link>
              </Button>
            </div>
          </ContentCard>
          <ContentCard>
            <h4 className="font-bold mb-2">Tips for best results</h4>
            <ul className="list-disc ml-4 text-sm text-slate-600 dark:text-slate-300 space-y-1">
              <li>Describe your mood or energy in a sentence for tailored advice.</li>
              <li>Mention time and constraints: “I have 10 minutes, at desk.”</li>
              <li>Ask for micro-steps: breath, sip, stretch, and one action.</li>
            </ul>
          </ContentCard>
        </div>
      </div>
    </div>
  );
}