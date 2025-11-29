"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { CopyIcon, RefreshCcwIcon, SparklesIcon } from "lucide-react"
import { useState } from "react"
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { Loader } from "@/components/ai-elements/loader"
import {
  Message,
  MessageAction,
  MessageActions,
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
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning"
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources"

export default function ChatPage() {
  const [input, setInput] = useState("")
  const { messages, status, sendMessage, regenerate, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  // Handle form submission
  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text?.trim()) return
    await sendMessage({ text: message.text })
    setInput("")
  }

  return (
    <div className="mx-auto flex h-screen w-full max-w-4xl flex-col p-6">
      {/* Messages area */}
      <Conversation className="h-full flex-1">
        {messages.length === 0 ? (
          <ConversationEmptyState
            title="Gemini 助手"
            description="有什么我可以帮你的吗？"
            icon={<SparklesIcon className="size-8" />}
          />
        ) : (
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {/* Sources UI - render before message parts for assistant messages */}
                {message.role === "assistant" &&
                  message.parts.filter((part) => part.type === "source-url")
                    .length > 0 && (
                    <Sources>
                      <SourcesTrigger
                        count={
                          message.parts.filter(
                            (part) => part.type === "source-url",
                          ).length
                        }
                      />
                      <SourcesContent>
                        {message.parts
                          .filter((part) => part.type === "source-url")
                          .map((part, i) => (
                            <Source
                              key={`${message.id}-source-${i}`}
                              href={part.url}
                              title={part.url}
                            />
                          ))}
                      </SourcesContent>
                    </Sources>
                  )}

                {/* Message parts */}
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <Message key={`${message.id}-${i}`} from={message.role}>
                          <MessageContent>
                            {message.role === "assistant" ? (
                              <MessageResponse>{part.text}</MessageResponse>
                            ) : (
                              part.text
                            )}
                          </MessageContent>
                          {/* Message actions for the last assistant message */}
                          {message.role === "assistant" &&
                            message.id === messages.at(-1)?.id && (
                              <MessageActions>
                                <MessageAction
                                  onClick={() => regenerate()}
                                  label="Retry"
                                  tooltip="Retry"
                                >
                                  <RefreshCcwIcon className="size-3" />
                                </MessageAction>
                                <MessageAction
                                  onClick={() =>
                                    navigator.clipboard.writeText(
                                      part.text ?? "",
                                    )
                                  }
                                  label="Copy"
                                  tooltip="Copy"
                                >
                                  <CopyIcon className="size-3" />
                                </MessageAction>
                              </MessageActions>
                            )}
                        </Message>
                      )
                    case "reasoning":
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={
                            status === "streaming" &&
                            i === message.parts.length - 1 &&
                            message.id === messages.at(-1)?.id
                          }
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      )
                    default:
                      return null
                  }
                })}
              </div>
            ))}
            {/* Loader when waiting for response */}
            {status === "submitted" && <Loader />}
          </ConversationContent>
        )}
        <ConversationScrollButton />
      </Conversation>

      {/* Error display */}
      {error && (
        <div className="px-4 py-2 text-center text-sm text-destructive">
          出错了，请稍后重试
        </div>
      )}

      {/* Input area */}
      <PromptInput onSubmit={handleSubmit} className="mt-4">
        <PromptInputBody>
          <PromptInputTextarea
            placeholder="输入消息..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </PromptInputBody>
        <PromptInputFooter>
          <div /> {/* Spacer */}
          <PromptInputSubmit
            status={status}
            disabled={!input.trim() && status !== "streaming"}
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  )
}
