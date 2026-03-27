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

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: userMsg, history: chat }),
    });

    // 🛑 ERROR HANDLING: Check if the backend threw a 400 or 500 error
    if (!res.ok) {
      let errorMessage = "Whoops! The AI server seems to be down.";
      
      // Try to extract the specific error message your route.ts sent
      try {
        const errorData = await res.json();
        if (errorData.error) errorMessage = `Error: ${errorData.error}`;
      } catch (e) {
        // If it's not JSON (like a server crash), stick to the default message
      }

      setChat((prev) => [...prev, { role: "assistant", text: errorMessage }]);
      setLoading(false);
      return; // Stop execution so it doesn't try to read the stream
    }

    // ✅ SUCCESS: Set up the empty placeholder and start streaming
    let aiMessage = "";
    setChat((prev) => [...prev, { role: "assistant", text: "" }]);

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error("No reader available from response");

    while (true) {
      const { done, value } = await reader.read();
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
  } catch (error: any) {
    // 🛑 CATCH-ALL: Handles network errors or frontend crashes
    console.error("Fetch Error:", error);
    setChat((prev) => [
      ...prev,
      { role: "assistant", text: "Network error. Please make sure your backend is running." },
    ]);
  } finally {
    setLoading(false); // Always turn off the loading state!
  }
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