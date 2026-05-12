import { useState, useRef, useEffect } from "react";
import { X, Sparkles, Send, Bot, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useProjectSummary } from "@/hooks/useProjectSummary.hook.js";
import { useSendChatMessage } from "@/hooks/useSendChatMessage.hook.js";

const markdownComponents = {
  h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="text-sm font-bold mt-3 mb-1 first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-0.5 first:mt-0">{children}</h3>,
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 last:mb-0 space-y-0.5 pl-4 list-disc">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 last:mb-0 space-y-0.5 pl-4 list-decimal">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  pre: ({ children }) => (
    <pre className="bg-black/20 rounded-lg p-3 text-xs font-mono overflow-x-auto my-2">{children}</pre>
  ),
  code: ({ children, className }) => (
    <code className={`bg-black/20 rounded px-1 py-0.5 text-xs font-mono ${className ?? ""}`}>{children}</code>
  ),
  hr: () => <hr className="border-border my-2" />,
};

function AiMessage({ content, isError }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="shrink-0 w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mt-0.5">
        {isError ? (
          <AlertCircle className="h-3.5 w-3.5 text-red-400" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-violet-400" />
        )}
      </div>
      <div
        className={`max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed ${
          isError
            ? "bg-red-500/10 text-red-300 border border-red-500/20"
            : "bg-muted text-foreground"
        }`}
      >
        {isError ? (
          content
        ) : (
          <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}

function UserMessage({ content }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed bg-violet-600 text-white">
        {content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5">
      <div className="shrink-0 w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
        <Bot className="h-3.5 w-3.5 text-violet-400" />
      </div>
      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "ai",
  content: "Hi! I'm your project AI assistant. Ask me anything about this project, or use the quick action below to get started.",
};

export function AiPanel({ isOpen, onClose, projectId, projectName }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [summarized, setSummarized] = useState(false);
  const [strategy, setStrategy] = useState("chunked"); // "chunked" | "single"
  // conversation history sent to the API — excludes the welcome message
  const [apiHistory, setApiHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { mutate: summarize, isPending: isSummarizing } = useProjectSummary();
  const { mutate: sendMessage, isPending: isChatPending } = useSendChatMessage();
  const isPending = isSummarizing || isChatPending;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isPending]);

  // Reset when a different project is opened
  useEffect(() => {
    setMessages([WELCOME_MESSAGE]);
    setApiHistory([]);
    setSummarized(false);
  }, [projectId]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isPending) return;

    const userDisplayMsg = { id: Date.now().toString(), role: "user", content: text };
    const updatedHistory = [...apiHistory, { role: "user", content: text }];

    setMessages((prev) => [...prev, userDisplayMsg]);
    setApiHistory(updatedHistory);
    setInputValue("");

    sendMessage(
      { projectId, messages: updatedHistory, strategy },
      {
        onSuccess: (data) => {
          const reply = data?.message || "No response received.";
setMessages((prev) => [...prev, { id: Date.now().toString(), role: "ai", content: reply }]);
          setApiHistory((prev) => [...prev, { role: "assistant", content: reply }]);
        },
        onError: (error) => {
          const msg =
            error?.response?.status === 403
              ? "You don't have permission to use AI chat in this project."
              : "Something went wrong. Please try again.";
          setMessages((prev) => [...prev, { id: Date.now().toString(), role: "ai", content: msg, isError: true }]);
        },
      }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSummarize = () => {
    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: "Summarize this project for me.",
    };
    setMessages((prev) => [...prev, userMsg]);
    setSummarized(true);

    summarize(projectId, {
      onSuccess: (data) => {
        const summary = data?.data?.summary || data?.summary || data?.data || "Summary generated successfully.";
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: "ai", content: summary },
        ]);
        // add to apiHistory so follow-up questions have context
        setApiHistory((prev) => [
          ...prev,
          { role: "user", content: "Summarize this project for me." },
          { role: "assistant", content: summary },
        ]);
      },
      onError: (error) => {
        const msg =
          error?.response?.status === 403
            ? "You don't have permission to generate a summary for this project."
            : "Something went wrong while generating the summary. Please try again.";
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: "ai", content: msg, isError: true },
        ]);
        setSummarized(false);
      },
    });
  };

  return (
    <>
      {/* Backdrop (mobile) */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[380px] flex flex-col bg-background border-l border-border shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">AI Assistant</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[220px]">
                {projectName || "Project"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
          {messages.map((msg) =>
            msg.role === "ai" ? (
              <AiMessage key={msg.id} content={msg.content} isError={msg.isError} />
            ) : (
              <UserMessage key={msg.id} content={msg.content} />
            )
          )}

          {isPending && <TypingIndicator />}

          {/* Quick action chip */}
          {!summarized && !isPending && (
            <div className="flex justify-center pt-2">
              <button
                onClick={handleSummarize}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/40 bg-violet-600/10 text-violet-300 text-sm hover:bg-violet-600/20 hover:border-violet-500/60 transition-all duration-150"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Summarize this project
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 px-4 py-3 border-t border-border">
          {/* Strategy toggle */}
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs text-muted-foreground mr-1">RAG:</span>
            {["chunked", "single"].map((s) => (
              <button
                key={s}
                onClick={() => setStrategy(s)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  strategy === s
                    ? "bg-violet-600/30 text-violet-300 border border-violet-500/40"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message AI assistant…"
              disabled={isPending}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isPending}
              className="shrink-0 p-1.5 rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
