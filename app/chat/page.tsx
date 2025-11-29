"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { SparklesIcon } from "lucide-react"
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message"
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input"

export default function ChatPage() {
  const { messages, status, sendMessage, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  // Handle form submission
  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text.trim()) return
    await sendMessage({ text: message.text })
  }

  const isLoading = status === "submitted" || status === "streaming"

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        {/* Messages area */}
        <Conversation className="flex-1">
          {messages.length === 0 ? (
            <ConversationEmptyState
              title="Gemini 助手"
              description="有什么我可以帮你的吗？"
              icon={<SparklesIcon className="size-8" />}
            />
          ) : (
            <ConversationContent>
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} />
              ))}
            </ConversationContent>
          )}
          <ConversationScrollButton />
        </Conversation>

        {/* Error display */}
        {error && (
          <div className="px-4 py-2 text-center text-red-500 text-sm">
            出错了，请稍后重试
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea placeholder="输入消息..." />
            </PromptInputBody>
            <PromptInputFooter>
              <div /> {/* Spacer */}
              <PromptInputSubmit status={status} disabled={isLoading} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </main>
    </div>
  )
}

// Internal component for rendering a single message
function ChatMessage({
  message,
}: {
  message: {
    id: string
    role: string
    parts?: Array<{ type: string; text?: string }>
  }
}) {
  // Extract text content from message parts
  const textContent =
    message.parts
      ?.filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("") ?? ""

  return (
    <Message from={message.role as "user" | "assistant"}>
      <MessageContent>
        {message.role === "assistant" ? (
          <MessageResponse>{textContent}</MessageResponse>
        ) : (
          textContent
        )}
      </MessageContent>
    </Message>
  )
}
