import { type UIMessage, convertToModelMessages, streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
	const { messages }: { messages: UIMessage[] } = await req.json()

	// Stream text using Vercel AI Gateway with Gemini model
	const result = streamText({
		model: "google/gemini-2.5-flash-lite",
		system:
			"You are a helpful assistant that can answer questions and help with tasks.",
		messages: convertToModelMessages(messages),
	})

	// Send sources and reasoning back to the client
	return result.toUIMessageStreamResponse({
		sendSources: true,
		sendReasoning: true,
	})
}

