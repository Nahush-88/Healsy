
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, AlertCircle, Loader2, ChevronRight, Bot, User as UserIcon } from "lucide-react";

export default function MessageBubble({ message }) {
  const safeMsg = message || {};
  const isUser = safeMsg.role === "user";
  const rawToolCalls = safeMsg.tool_calls;
  const toolCalls = Array.isArray(rawToolCalls) ? rawToolCalls : []; // hardened

  // normalize content to string for safe rendering
  const contentStr = (() => {
    const c = safeMsg.content;
    if (typeof c === "string") return c;
    if (Array.isArray(c)) return c.join("");
    if (c == null) return "";
    try { return String(c); } catch { return ""; }
  })();

  const [copied, setCopied] = useState(false);
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch {
      /* noop */
    }
  };

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="h-8 w-8 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center mt-0.5 shadow">
          <Bot className="h-4 w-4 text-violet-600 dark:text-violet-300" />
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? "flex flex-col items-end" : ""}`}>
        {contentStr && (
          <div className={`rounded-2xl px-4 py-2.5 shadow ${isUser ? "bg-slate-800 text-white" : "bg-white border border-slate-200 dark:bg-slate-800/70 dark:border-slate-700"}`}>
            {isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{contentStr}</p>
            ) : (
              <div className="relative">
                <ReactMarkdown className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                  {contentStr}
                </ReactMarkdown>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute -top-2 -right-2 h-7 w-7"
                  onClick={() => copy(contentStr)}
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
                </Button>
              </div>
            )}
          </div>
        )}

        {toolCalls.length > 0 && (
          <div className="mt-2 space-y-1">
            {toolCalls.map((tc, i) => {
              const status = (tc?.status || "pending").toLowerCase();
              const isError = status === "failed" || status === "error";
              const name = (tc?.name || "tool").split(".").slice(-1)[0];
              return (
                <div key={i} className="text-xs">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isError ? "border-red-300 bg-red-50/60" : "border-slate-200 bg-slate-50"}`}>
                    {status === "pending" || status === "in_progress" ? (
                      <Loader2 className="h-3.5 w-3.5 text-slate-500 animate-spin" />
                    ) : isError ? (
                      <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    )}
                    <span className="text-slate-700 truncate">
                      {name} {status && "•"} {status}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400 ml-auto" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {isUser && (
        <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mt-0.5 shadow">
          <UserIcon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </div>
      )}
    </div>
  );
}
