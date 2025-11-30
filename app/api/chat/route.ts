import type { GoogleGenerativeAIProviderOptions } from "@ai-sdk/google"
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai"
import { z } from "zod"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: "google/gemini-2.5-flash-lite",
    system:
      "You are a helpful assistant that can answer questions and help with tasks.",
    // system:
    //   "You are a helpful assistant that can answer questions and help with tasks. When the user asks for the current date or time, use the get_current_datetime tool.",
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(2),
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: 1024,
          includeThoughts: true,
        },
      } satisfies GoogleGenerativeAIProviderOptions,
    },
    // tools: {
    //   get_current_datetime: {
    //     description:
    //       "Get the current server date and time. Use this when the user asks for the current date, time, or datetime.",
    //     inputSchema: z.object({}),
    //     execute: async () => {
    //       const now = new Date()
    //       return {
    //         iso: now.toISOString(),
    //         localeString: now.toLocaleString("en-US", {
    //           timeZone: "America/New_York",
    //         }),
    //         timezone: "America/New_York",
    //       }
    //     },
    //   },
    // },
  })

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  })
}
