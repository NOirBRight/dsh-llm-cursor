import { createUserMessage, createAssistantMessage, createToolResultMessage, CallId } from '@deepseek-ai/dsh-llm'
import type { GenerateOptions, StreamChunk } from '@deepseek-ai/dsh-llm'
import { AttachmentId } from '@deepseek-ai/dsh-attachment'
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'

export function jwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${header}.${body}.sig`
}

export async function collect(stream: AsyncIterable<StreamChunk>): Promise<StreamChunk[]> {
  const out: StreamChunk[] = []
  for await (const chunk of stream) out.push(chunk)
  return out
}

export function userText(text: string) {
  return createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } })
}

export function assistantText(text: string, model = 'composer-2.5') {
  return createAssistantMessage({
    content: [{ type: 'text', text }],
    source: { provider: 'cursor', model },
  })
}

export function assistantToolCall(id: string, name: string, args: string, model = 'composer-2.5') {
  return createAssistantMessage({
    content: [{ type: 'tool-call', id: CallId(id), name, arguments: args }],
    source: { provider: 'cursor', model },
  })
}

export function toolResult(id: string, text: string, isError = false) {
  return createToolResultMessage({
    callId: CallId(id),
    content: [{ type: 'text', text }],
    isError,
  })
}

export function assistantReasoning(text: string, visible: string, model = 'composer-2.5') {
  return createAssistantMessage({
    content: [
      { type: 'reasoning', text },
      { type: 'text', text: visible },
    ],
    source: { provider: 'cursor', model },
  })
}

export function userImage(text: string, attachment: ImageAttachmentRef) {
  return createUserMessage({
    content: [
      ...text.length > 0 ? [{ type: 'text' as const, text }] : [],
      { type: 'image', attachment },
    ],
    source: { kind: 'user' },
  })
}

export function pngRef(id = 'img-1'): ImageAttachmentRef {
  return {
    attachmentId: AttachmentId(id),
    mediaType: 'image/png',
    bytes: 8,
    width: 1,
    height: 1,
  }
}

export function request(overrides: Partial<GenerateOptions> = {}): GenerateOptions {
  return {
    provider: 'cursor',
    model: 'composer-2.5',
    messages: [userText('hi')],
    ...overrides,
  }
}
