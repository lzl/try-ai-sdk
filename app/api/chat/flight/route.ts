import { createUIMessageStreamResponse, type UIMessage } from "ai"
import { start } from "workflow/api"
import { getSessionId, storeChatHistory, storeWorkflowRunId } from "@/lib/redis"
import { chat } from "@/workflows/chat"

// Uncomment to simulate a long running Vercel Function timing
// out due to a long running agent. The client-side will
// automatically reconnect to the stream.
// export const maxDuration = 8;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const sessionId = getSessionId(req)

  // Store chat history in Redis
  await storeChatHistory(sessionId, messages)

  const run = await start(chat, [messages])
  const workflowStream = run.readable

  // Store workflow run ID in Redis
  await storeWorkflowRunId(sessionId, run.runId)

  return createUIMessageStreamResponse({
    stream: workflowStream,
    headers: {
      // The workflow run ID is stored into `localStorage` on the client side,
      // which influences the `resume` flag in the `useChat` hook.
      "x-workflow-run-id": run.runId,
      "x-session-id": sessionId,
    },
  })
}

