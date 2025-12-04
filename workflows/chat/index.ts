import { DurableAgent } from "@workflow/ai/agent"
import { convertToModelMessages, type UIMessage, type UIMessageChunk } from "ai"
import { getWritable } from "workflow"
import { FLIGHT_ASSISTANT_PROMPT, flightBookingTools } from "./steps/tools"

/**
 * The main chat workflow
 */
export async function chat(messages: UIMessage[]) {
  "use workflow"

  console.log("Starting workflow")

  const writable = getWritable<UIMessageChunk>()

  const agent = new DurableAgent({
    model: "google/gemini-2.5-flash-preview-09-2025",
    system: FLIGHT_ASSISTANT_PROMPT,
    tools: flightBookingTools,
  })

  await agent.stream({
    messages: convertToModelMessages(messages),
    writable,
  })

  console.log("Finished workflow")
}
