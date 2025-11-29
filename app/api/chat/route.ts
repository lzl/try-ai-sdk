import { convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: "google/gemini-2.5-flash-lite",
    system:
      "You are a helpful assistant that can answer questions and help with tasks.",
    messages: convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  })
}
