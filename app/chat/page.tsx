"use client"

import { useChat } from "@ai-sdk/react"
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
  const { messages, status, sendMessage, regenerate } = useChat()

  // Handle form submission
  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text?.trim()) return
    setInput("")
    await sendMessage({ text: message.text })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-screen">
      <div className="flex flex-col h-full">
        {/* Messages area */}
        <Conversation className="h-full">
          {messages.length === 0 && (
            <ConversationEmptyState
              title="Assistant"
              description="How can I help you?"
              icon={<SparklesIcon className="size-8" />}
            />
          )}
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
                              key={`${message.id}-${i}`}
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
                            i === messages.length - 1 && (
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
          <ConversationScrollButton />
        </Conversation>

        {/* Input area */}
        <PromptInput onSubmit={handleSubmit} className="mt-4">
          <PromptInputBody>
            <PromptInputTextarea
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <div /> {/* Spacer */}
            <PromptInputSubmit
              status={status}
              disabled={!(input.trim() || status) || status === "streaming"}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  )
}
