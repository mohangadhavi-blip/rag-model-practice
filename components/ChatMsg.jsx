import React from "react";
import { handleCopy } from "@/utils/clipboard";

export default function ChatMsg({ msg }) {
  return msg.text.trim() ? (
    <div className={`mb-4 ${msg.role === "user" ? "text-right" : "text-left"} `}>
      <div
        className={`inline-block px-4 py-2 rounded-xl ${
          msg.role === "user"
            ? "bg-black text-white"
            : "bg-white border group hover:bg-gray-100"
        } transition-all duration-300 relative`}
      >
        {msg.text}
        {msg.role !== "user" && (
          <button
            className="bg-gray-white/20 hover:bg-gray-100 outline outline-gray-500/20 text-[10px] px-1 cursor-pointer rounded absolute -bottom-5 left-0"
            onClick={() => handleCopy(msg.text)}
          >
            Copy
          </button>
        )}
      </div>
    </div>
  ) : (
    <></>
  );
}
