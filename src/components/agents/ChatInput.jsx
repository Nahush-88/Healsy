import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const content = text.trim();
    if (!content) return;
    onSend(content);
    setText("");
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Ask anything about diet, workout, sleep, mood... "
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        disabled={disabled}
        className="h-12"
      />
      <Button onClick={handleSend} disabled={disabled} className="h-12 bg-violet-600 hover:bg-violet-700">
        <Send className="w-4 h-4 mr-2" />
        Send
      </Button>
    </div>
  );
}