/**
 * Rebuild Cursor conversationState from DSH messages.
 * Checkpoint history is not authoritative.
 */

import { createHash } from 'node:crypto'
import { create, fromJson, toBinary } from '@bufbuild/protobuf'
import { ValueSchema } from '@bufbuild/protobuf/wkt'
import type { AttachmentStore } from '@deepseek-ai/dsh-attachment'
import type { Message } from '@deepseek-ai/dsh-llm'
import { CURSOR_MCP_PROVIDER_ID } from './client-contract.ts'
import {
  AgentConversationTurnStructureSchema,
  AssistantMessageSchema,
  ConversationActionSchema,
  ConversationStateStructureSchema,
  ConversationStepSchema,
  ConversationTurnStructureSchema,
  McpArgsSchema,
  McpSuccessSchema,
  McpTextContentSchema,
  McpToolCallSchema,
  McpToolErrorSchema,
  McpToolResultContentItemSchema,
  McpToolResultSchema,
  ResumeActionSchema,
  SelectedContextSchema,
  SelectedImageSchema,
  SelectedImage_BlobIdWithDataSchema,
  SelectedImage_DimensionSchema,
  ThinkingMessageSchema,
  ToolCallSchema,
  UserMessageActionSchema,
  UserMessageSchema,
} from './wire/vendor/agent_pb.ts'

export type BlobStore = Map<string, Uint8Array>

/** Image bytes already loaded from the attachment store. */
export interface CursorResolvedImage {
  data: Uint8Array
  mediaType: string
  width: number
  height: number
}

export type CursorImageBytes = ReadonlyMap<string, CursorResolvedImage>

export async function loadCursorImages(
  messages: readonly Message[],
  store: AttachmentStore | undefined,
  signal?: AbortSignal,
): Promise<Map<string, CursorResolvedImage>> {
  const out = new Map<string, CursorResolvedImage>()
  if (store === undefined) return out
  for (const message of messages) {
    for (const block of message.content) {
      if (block.type !== 'image') continue
      const id = block.attachment.attachmentId
      if (out.has(id)) continue
      const stored = await store.readImage(block.attachment, signal)
      out.set(id, {
        data: stored.data,
        mediaType: stored.ref.mediaType,
        width: stored.ref.width,
        height: stored.ref.height,
      })
    }
  }
  return out
}

export function createBlobId(data: Uint8Array): Uint8Array {
  return new Uint8Array(createHash('sha256').update(data).digest())
}

export function storeCursorBlob(blobStore: BlobStore, data: Uint8Array): Uint8Array {
  const blobId = createBlobId(data)
  blobStore.set(Buffer.from(blobId).toString('hex'), data)
  return blobId
}

export function readCursorBlob(blobStore: BlobStore, blobId: Uint8Array): Uint8Array | undefined {
  return blobStore.get(Buffer.from(blobId).toString('hex'))
}

function isToolResult(message: Message): boolean {
  return message.role === 'user' && message.source.kind === 'tool'
}

function isUserTurn(message: Message): boolean {
  return message.role === 'user' && message.source.kind === 'user'
}

export function findLastUserMessageIndex(messages: readonly Message[]): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i]
    if (message !== undefined && isUserTurn(message)) return i
  }
  return -1
}

/** Active user only when the request ends on a new user turn; tool-result tails resume. */
export function findActiveUserMessageIndex(messages: readonly Message[]): number {
  const last = messages[messages.length - 1]
  if (last === undefined || !isUserTurn(last)) return -1
  return messages.length - 1
}

function assistantMatches(message: Message, provider: string, model: string): boolean {
  return message.role === 'assistant'
    && message.source.kind === 'model'
    && message.source.provider === provider
    && message.source.model === model
}

function textOf(message: Message): string {
  return message.content
    .filter((block): block is { type: 'text', text: string } => block.type === 'text')
    .map(block => block.text)
    .join('\n')
    .trim()
}

function imageIdsOf(message: Message): string[] {
  const ids: string[] = []
  for (const block of message.content) {
    if (block.type === 'image') ids.push(block.attachment.attachmentId)
  }
  return ids
}

function selectedImagesOf(
  message: Message,
  blobStore: BlobStore,
  images: CursorImageBytes | undefined,
) {
  if (images === undefined || images.size === 0) return []
  const selected = []
  for (const id of imageIdsOf(message)) {
    const bytes = images.get(id)
    if (bytes === undefined) continue
    const blobId = storeCursorBlob(blobStore, bytes.data)
    selected.push(create(SelectedImageSchema, {
      uuid: deterministicUuid(`img:${id}`),
      mimeType: bytes.mediaType,
      dimension: create(SelectedImage_DimensionSchema, {
        width: bytes.width,
        height: bytes.height,
      }),
      dataOrBlobId: {
        case: 'blobIdWithData',
        value: create(SelectedImage_BlobIdWithDataSchema, {
          blobId,
          data: bytes.data,
        }),
      },
    }))
  }
  return selected
}

function toolResultText(message: Message): string {
  const block = message.content[0]
  if (block?.type !== 'tool-result') return textOf(message)
  return block.content
    .filter((item): item is { type: 'text', text: string } => item.type === 'text')
    .map(item => item.text)
    .join('\n')
}

function deterministicUuid(seed: string): string {
  const hash = createHash('sha256').update(seed).digest()
  const bytes = Buffer.from(hash.subarray(0, 16))
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  const hex = bytes.toString('hex')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function systemPromptJsons(system: string | undefined): string[] {
  const trimmed = system?.trim() ?? ''
  if (trimmed.length === 0) return [JSON.stringify({ role: 'system', content: 'You are a helpful assistant.' })]
  return [JSON.stringify({ role: 'system', content: trimmed })]
}

export function buildRootPromptMessagesJson(
  messages: readonly Message[],
  system: string | undefined,
  blobStore: BlobStore,
  activeUserMessageIndex: number,
  provider: string,
  model: string,
): Uint8Array[] {
  const entries: Uint8Array[] = systemPromptJsons(system).map(json =>
    storeCursorBlob(blobStore, new TextEncoder().encode(json)),
  )
  const pushJson = (obj: unknown) => {
    entries.push(storeCursorBlob(blobStore, new TextEncoder().encode(JSON.stringify(obj))))
  }
  const paired = new Set<string>()
  for (const message of messages) {
    if (!assistantMatches(message, provider, model)) continue
    for (const block of message.content) {
      if (block.type === 'tool-call') paired.add(block.id)
    }
  }
  for (let i = 0; i < messages.length; i++) {
    if (i === activeUserMessageIndex) break
    const msg = messages[i]
    if (msg === undefined) continue
    if (isUserTurn(msg)) {
      const content = textOf(msg)
      if (content.length === 0) continue
      pushJson({ role: 'user', content })
    } else if (msg.role === 'assistant') {
      const parts: unknown[] = []
      for (const block of msg.content) {
        if (block.type === 'text' && block.text.length > 0) parts.push({ type: 'text', text: block.text })
        if (block.type === 'reasoning' && assistantMatches(msg, provider, model) && block.text.length > 0) {
          parts.push({ type: 'thinking', thinking: block.text })
        }
        if (block.type === 'tool-call') {
          if (assistantMatches(msg, provider, model)) {
            parts.push({ type: 'tool-call', id: block.id, name: block.name, arguments: block.arguments })
          } else {
            const args = block.arguments.trim()
            parts.push({ type: 'text', text: args.length > 0 ? `[${block.name}] ${args}` : `[${block.name}]` })
          }
        }
      }
      if (parts.length === 0) continue
      pushJson({ role: 'assistant', content: parts })
    } else if (isToolResult(msg) && msg.source.kind === 'tool') {
      const resultBlock = msg.content[0]
      const isError = resultBlock?.type === 'tool-result' ? resultBlock.isError === true : false
      const text = toolResultText(msg)
      if (!paired.has(msg.source.callId)) {
        pushJson({
          role: 'assistant',
          content: [{ type: 'text', text: `${isError ? '[Tool Error]' : '[Tool Result]'}\n${text}` }],
        })
        continue
      }
      pushJson({
        role: 'tool',
        id: msg.source.callId,
        content: [{
          type: 'tool-result',
          toolCallId: msg.source.callId,
          result: text,
          ...isError ? { isError: true } : {},
        }],
      })
    }
  }
  return entries
}

function encodeMcpArguments(raw: string): Record<string, Uint8Array> {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw) as unknown
  } catch {
    parsed = {}
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
  const encoded: Record<string, Uint8Array> = {}
  for (const [name, value] of Object.entries(parsed)) {
    if (value === undefined) continue
    encoded[name] = toBinary(ValueSchema, fromJson(ValueSchema, value as never))
  }
  return encoded
}

function mcpResultFor(message: Message | undefined) {
  if (message === undefined) return undefined
  const text = toolResultText(message)
  const isError = message.content[0]?.type === 'tool-result' && message.content[0].isError === true
  if (isError) {
    return create(McpToolResultSchema, {
      result: { case: 'error', value: create(McpToolErrorSchema, { error: text }) },
    })
  }
  return create(McpToolResultSchema, {
    result: {
      case: 'success',
      value: create(McpSuccessSchema, {
        content: [create(McpToolResultContentItemSchema, {
          content: { case: 'text', value: create(McpTextContentSchema, { text }) },
        })],
      }),
    },
  })
}

export function buildConversationTurns(
  messages: readonly Message[],
  blobStore: BlobStore,
  activeUserMessageIndex: number,
  provider: string,
  model: string,
  images?: CursorImageBytes,
): Uint8Array[] {
  const turns: Uint8Array[] = []
  const historyEnd = activeUserMessageIndex >= 0 ? activeUserMessageIndex : messages.length
  const toolResults = new Map<string, Message>()
  const paired = new Set<string>()
  for (let i = 0; i < historyEnd; i++) {
    const message = messages[i]
    if (message === undefined) continue
    if (isToolResult(message) && message.source.kind === 'tool') {
      toolResults.set(message.source.callId, message)
    } else if (message.role === 'assistant' && assistantMatches(message, provider, model)) {
      for (const block of message.content) {
        if (block.type === 'tool-call') paired.add(block.id)
      }
    }
  }

  let i = 0
  while (i < messages.length) {
    const msg = messages[i]
    if (msg === undefined || !isUserTurn(msg)) {
      i++
      continue
    }
    if (i === activeUserMessageIndex) break
    const userText = textOf(msg)
    const selectedImages = selectedImagesOf(msg, blobStore, images)
    if (userText.length === 0 && selectedImages.length === 0) {
      i++
      continue
    }
    const userMessage = create(UserMessageSchema, {
      text: userText,
      messageId: deterministicUuid(`u:${String(turns.length)}:${userText}`),
      ...selectedImages.length > 0
        ? { selectedContext: create(SelectedContextSchema, { selectedImages }) }
        : {},
    })
    const userMessageBlobId = storeCursorBlob(blobStore, toBinary(UserMessageSchema, userMessage))
    const stepBlobIds: Uint8Array[] = []
    i++
    while (i < messages.length) {
      const stepMsg = messages[i]
      if (stepMsg === undefined || isUserTurn(stepMsg)) break
      if (stepMsg.role === 'assistant') {
        for (const item of stepMsg.content) {
          if (item.type === 'text' && item.text.length > 0) {
            stepBlobIds.push(storeCursorBlob(blobStore, toBinary(ConversationStepSchema, create(ConversationStepSchema, {
              message: { case: 'assistantMessage', value: create(AssistantMessageSchema, { text: item.text }) },
            }))))
          } else if (item.type === 'reasoning' && assistantMatches(stepMsg, provider, model) && item.text.length > 0) {
            stepBlobIds.push(storeCursorBlob(blobStore, toBinary(ConversationStepSchema, create(ConversationStepSchema, {
              message: { case: 'thinkingMessage', value: create(ThinkingMessageSchema, { text: item.text }) },
            }))))
          } else if (item.type === 'tool-call') {
            if (!assistantMatches(stepMsg, provider, model)) {
              const args = item.arguments.trim()
              const text = args.length > 0 ? `[${item.name}] ${args}` : `[${item.name}]`
              stepBlobIds.push(storeCursorBlob(blobStore, toBinary(ConversationStepSchema, create(ConversationStepSchema, {
                message: { case: 'assistantMessage', value: create(AssistantMessageSchema, { text }) },
              }))))
              continue
            }
            const result = toolResults.get(item.id)
            const mcpCall = create(McpToolCallSchema, {
              args: create(McpArgsSchema, {
                name: item.name,
                args: encodeMcpArguments(item.arguments),
                toolCallId: item.id,
                providerIdentifier: CURSOR_MCP_PROVIDER_ID,
                toolName: item.name,
              }),
              ...result === undefined ? {} : { result: mcpResultFor(result) },
            })
            stepBlobIds.push(storeCursorBlob(blobStore, toBinary(ConversationStepSchema, create(ConversationStepSchema, {
              message: {
                case: 'toolCall',
                value: create(ToolCallSchema, {
                  tool: { case: 'mcpToolCall', value: mcpCall },
                  toolCallId: item.id,
                }),
              },
            }))))
          }
        }
      } else if (isToolResult(stepMsg) && stepMsg.source.kind === 'tool' && !paired.has(stepMsg.source.callId)) {
        const text = toolResultText(stepMsg)
        const prefix = stepMsg.content[0]?.type === 'tool-result' && stepMsg.content[0].isError === true
          ? '[Tool Error]'
          : '[Tool Result]'
        stepBlobIds.push(storeCursorBlob(blobStore, toBinary(ConversationStepSchema, create(ConversationStepSchema, {
          message: {
            case: 'assistantMessage',
            value: create(AssistantMessageSchema, { text: `${prefix}\n${text}` }),
          },
        }))))
      }
      i++
    }
    const agentTurn = create(AgentConversationTurnStructureSchema, {
      userMessage: userMessageBlobId,
      steps: stepBlobIds,
    })
    turns.push(storeCursorBlob(blobStore, toBinary(ConversationTurnStructureSchema, create(ConversationTurnStructureSchema, {
      turn: { case: 'agentConversationTurn', value: agentTurn },
    }))))
  }
  return turns
}

export function buildRunAction(
  messages: readonly Message[],
  activeUserMessageIndex: number,
  blobStore: BlobStore,
  images?: CursorImageBytes,
) {
  const active = activeUserMessageIndex >= 0 ? messages[activeUserMessageIndex] : undefined
  const userText = active !== undefined && isUserTurn(active) ? textOf(active) : ''
  const selectedImages = active !== undefined ? selectedImagesOf(active, blobStore, images) : []
  if (active !== undefined && isUserTurn(active) && (userText.length > 0 || selectedImages.length > 0)) {
    return create(ConversationActionSchema, {
      action: {
        case: 'userMessageAction',
        value: create(UserMessageActionSchema, {
          userMessage: create(UserMessageSchema, {
            text: userText,
            messageId: deterministicUuid(`active:${userText}`),
            ...selectedImages.length > 0
              ? { selectedContext: create(SelectedContextSchema, { selectedImages }) }
              : {},
          }),
        }),
      },
    })
  }
  return create(ConversationActionSchema, {
    action: { case: 'resumeAction', value: create(ResumeActionSchema, {}) },
  })
}

export function buildConversationState(
  messages: readonly Message[],
  system: string | undefined,
  blobStore: BlobStore,
  provider: string,
  model: string,
  images?: CursorImageBytes,
) {
  const activeUserMessageIndex = findActiveUserMessageIndex(messages)
  return {
    conversationState: create(ConversationStateStructureSchema, {
      rootPromptMessagesJson: buildRootPromptMessagesJson(
        messages,
        system,
        blobStore,
        activeUserMessageIndex,
        provider,
        model,
      ),
      turns: buildConversationTurns(messages, blobStore, activeUserMessageIndex, provider, model, images),
      todos: [],
      pendingToolCalls: [],
      previousWorkspaceUris: [],
      fileStates: {},
      fileStatesV2: {},
      summaryArchives: [],
    }),
    action: buildRunAction(messages, activeUserMessageIndex, blobStore, images),
    activeUserMessageIndex,
  }
}
