"use client";

import { useState } from "react";
import ChatMsg from "@/components/ChatMsg";;

export default function Home() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!message.trim()) return;

    const userMsg = message;
    setChat((prev) => [...prev, { role: "user", text: userMsg }]);
    setMessage("");
    setLoading(true);

    // placeholder for streaming response
    let aiMessage = "";
    setChat((prev) => [...prev, { role: "assistant", text: "" }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: userMsg }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value);
      aiMessage += chunk;

      setChat((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          text: aiMessage,
        };
        return updated;
      });
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
        {chat.map((msg, i) => (
          <ChatMsg msg={msg} 
            key={i} />
        ))}
        {loading && <p className="text-sm text-gray-500">Thinking...</p>}
      </div>

      <div className="p-4 border-t bg-white">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            className="flex-1 border rounded-xl px-4 py-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask anything..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage(); // ✅ submit on Enter
              }
            }}
          />
          <button
            onClick={sendMessage}
            className="bg-black text-white px-6 py-2 rounded-xl cursor-pointer"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}