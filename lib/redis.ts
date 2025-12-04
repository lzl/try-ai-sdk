import { Redis } from "@upstash/redis"
import type { UIMessage } from "ai"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const CHAT_HISTORY_PREFIX = "chat:history:"
const WORKFLOW_RUN_PREFIX = "chat:workflow:"

/**
 * Store chat history for a session
 */
export async function storeChatHistory(
  sessionId: string,
  messages: UIMessage[],
): Promise<void> {
  const key = `${CHAT_HISTORY_PREFIX}${sessionId}`
  await redis.set(key, JSON.stringify(messages), { ex: 86400 }) // 24 hours TTL
}

/**
 * Retrieve chat history for a session
 */
export async function getChatHistory(
  sessionId: string,
): Promise<UIMessage[] | null> {
  const key = `${CHAT_HISTORY_PREFIX}${sessionId}`
  const data = await redis.get<string>(key)
  if (!data) return null
  return JSON.parse(data) as UIMessage[]
}

/**
 * Store workflow run ID for a session
 */
export async function storeWorkflowRunId(
  sessionId: string,
  runId: string,
): Promise<void> {
  const key = `${WORKFLOW_RUN_PREFIX}${sessionId}`
  await redis.set(key, runId, { ex: 86400 }) // 24 hours TTL
}

/**
 * Retrieve workflow run ID for a session
 */
export async function getWorkflowRunId(
  sessionId: string,
): Promise<string | null> {
  const key = `${WORKFLOW_RUN_PREFIX}${sessionId}`
  return await redis.get<string>(key)
}

/**
 * Delete workflow run ID for a session
 */
export async function deleteWorkflowRunId(sessionId: string): Promise<void> {
  const key = `${WORKFLOW_RUN_PREFIX}${sessionId}`
  await redis.del(key)
}

/**
 * Generate a session ID from request headers or create a new one
 */
export function getSessionId(request: Request): string {
  // Try to get session ID from header (could be set by client)
  const sessionId = request.headers.get("x-session-id")
  if (sessionId) return sessionId

  // Generate a new session ID
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
