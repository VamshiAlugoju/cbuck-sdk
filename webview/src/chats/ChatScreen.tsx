import React, { useEffect, useState, useRef, use } from "react";
import type { Socket } from "socket.io-client";
import { translateText, type Message } from "./chatsLib";

type ChatScreenProps = {
  receiverId: string;
  myId: string;
  setIsChatScreen: React.Dispatch<React.SetStateAction<boolean>>;
  socket: Socket | null;
};

const ChatScreen = (props: ChatScreenProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const socket = props.socket;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket]);

  const handleSend = () => {
    if (!socket || !input.trim()) return;

    const message: Message = {
      sender: props.myId,
      receiver: props.receiverId,
      text: input.trim(),
    };

    socket.emit("send_message", message);
    setMessages((prev) => [...prev, message]);
    setInput("");
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full max-w-[500px] mx-auto flex flex-col">
      <div className="absolute top-0 left-0 w-full bg-gray-100 shadow-2xs">
        <p className="font-bold text-sm py-1">My id: {props.myId}</p>
      </div>
      {/* Header */}
      <div className="flex justify-between items-center p-2 border-b border-gray-100 shadow-2xs">
        <button
          onClick={() => props.setIsChatScreen(false)}
          className="font-semibold rounded !bg-transparent hover:underline text-sm"
        >
          Back
        </button>
        <p className="text-sm text-gray-600 font-bold">
          Chatting with {props.receiverId}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-t from-white to-gray-50">
        {messages.map((msg, idx) => (
          <MessageComp key={idx} message={msg} selfId={props.myId} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 p-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded p-2 outline-none shadow-2xl shadow-gray-300"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="!bg-blue-500 text-white px-4 py-2 font-semibold rounded hover:bg-blue-600 shadow-2xl"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatScreen;

type MessageCompProps = {
  message: Message;
  selfId: string;
};

export const MessageComp = ({ message, selfId }: MessageCompProps) => {
  const isOwnMessage = message.sender === selfId;
  const [translatedText, setTranslatedText] = useState<string | undefined>();
  const [showOriginal, setShowOriginal] = useState(false);

  const fetchTranslatedText = async (text: string) => {
    try {
      const translated = await translateText(text, "eng");
      setTranslatedText(translated);
    } catch (err) {
      console.error("Translation failed", err);
    }
  };

  useEffect(() => {
    if (!isOwnMessage) {
      fetchTranslatedText(message.text);
    }
  }, [message.text]);

  return (
    <div
      className={`flex relative gap-2 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[70%] shadow-sm py-1 px-2 rounded ${
          isOwnMessage ? "bg-blue-100 self-end" : "bg-gray-200 self-start mb-2"
        }`}
      >
        <p className="text-sm break-words">
          {showOriginal || !translatedText ? message.text : translatedText}
        </p>
        {!isOwnMessage && translatedText && (
          <div className="flex gap-2 mt-1 absolute w-2 h-2">
            {showOriginal ? (
              <button
                style={{ outline: "none" }}
                onClick={() => setShowOriginal(false)}
                className="text-xs aspect-square bg-green-300 outline-none"
              >
                T
              </button>
            ) : (
              <button
                style={{ outline: "none" }}
                onClick={() => setShowOriginal(true)}
                className="text-xs aspect-square bg-red-300 outline-none"
              >
                O
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
