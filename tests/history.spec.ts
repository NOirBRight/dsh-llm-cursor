import { describe, expect, it } from 'vitest'
import { fromBinary } from '@bufbuild/protobuf'
import { CallId, createAssistantMessage, createUserMessage } from '@deepseek-ai/dsh-llm'
import { buildConversationState, readCursorBlob } from '../src/history.ts'
import {
  ConversationStepSchema,
  ConversationTurnStructureSchema,
} from '../src/wire/vendor/agent_pb.ts'
import {
  assistantReasoning,
  assistantText,
  assistantToolCall,
  pngRef,
  toolResult,
  userImage,
  userText,
} from './helpers.ts'

const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

function decodeJsonBlobs(blobStore: Map<string, Uint8Array>, ids: readonly Uint8Array[]): unknown[] {
  return ids.map((id) => {
    const bytes = readCursorBlob(blobStore, id)
    if (bytes === undefined) throw new Error('missing blob')
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown
  })
}

function mcpCallsInTurns(blobStore: Map<string, Uint8Array>, turnIds: readonly Uint8Array[]) {
  const calls: Array<{ toolCallId: string, resultCase?: string }> = []
  for (const turnId of turnIds) {
    const turnBytes = readCursorBlob(blobStore, turnId)
    if (turnBytes === undefined) continue
    const turn = fromBinary(ConversationTurnStructureSchema, turnBytes)
    if (turn.turn.case !== 'agentConversationTurn') continue
    for (const stepId of turn.turn.value.steps) {
      const stepBytes = readCursorBlob(blobStore, stepId)
      if (stepBytes === undefined) continue
      const step = fromBinary(ConversationStepSchema, stepBytes)
      if (step.message.case !== 'toolCall') continue
      const tool = step.message.value
      if (tool.tool.case !== 'mcpToolCall') continue
      const mcp = tool.tool.value
      calls.push({
        toolCallId: mcp.args?.toolCallId ?? '',
        ...mcp.result === undefined ? {} : { resultCase: mcp.result.result.case },
      })
    }
  }
  return calls
}

describe('Cursor history rebuild', () => {
  it('puts system and prior turns in rootPrompt and uses userMessageAction for a new user', () => {
    const blobStore = new Map<string, Uint8Array>()
    const built = buildConversationState(
      [userText('one'), assistantText('two'), userText('three')],
      'Be brief.',
      blobStore,
      'cursor',
      'composer-2.5',
    )
    expect(built.action.action.case).toBe('userMessageAction')
    expect(built.conversationState.rootPromptMessagesJson.length).toBeGreaterThanOrEqual(3)
    const blobs = decodeJsonBlobs(blobStore, built.conversationState.rootPromptMessagesJson)
    expect(JSON.stringify(blobs[0])).toContain('Be brief.')
    expect(JSON.stringify(blobs)).toContain('two')
  })

  it('uses the default system prompt when system is empty', () => {
    const blobStore = new Map<string, Uint8Array>()
    const built = buildConversationState([userText('hi')], undefined, blobStore, 'cursor', 'composer-2.5')
    const system = decodeJsonBlobs(blobStore, built.conversationState.rootPromptMessagesJson.slice(0, 1))
    expect(system[0]).toEqual({ role: 'system', content: 'You are a helpful assistant.' })
  })

  it('uses resumeAction and keeps an empty tool result when the tail is tool results', () => {
    const blobStore = new Map<string, Uint8Array>()
    const built = buildConversationState(
      [userText('ask'), assistantToolCall('c1', 'get_weather', '{"city":"x"}'), toolResult('c1', '')],
      undefined,
      blobStore,
      'cursor',
      'composer-2.5',
    )
    expect(built.action.action.case).toBe('resumeAction')
    expect(built.conversationState.turns.length).toBe(1)
    expect(built.activeUserMessageIndex).toBe(-1)
    const calls = mcpCallsInTurns(blobStore, built.conversationState.turns)
    expect(calls).toEqual([{ toolCallId: 'c1', resultCase: 'success' }])
  })

  it('turns an unpaired tool result into assistant text', () => {
    const blobStore = new Map<string, Uint8Array>()
    const built = buildConversationState(
      [userText('ask'), toolResult('orphan', 'nope', true), userText('next')],
      undefined,
      blobStore,
      'cursor',
      'composer-2.5',
    )
    expect(built.conversationState.turns.length).toBe(1)
    const blobs = decodeJsonBlobs(blobStore, built.conversationState.rootPromptMessagesJson)
    expect(JSON.stringify(blobs)).toContain('[Tool Error]')
    expect(JSON.stringify(blobs)).toContain('nope')
  })

  it('flattens tool-calls from another provider instead of replaying them as Cursor MCP', () => {
    const blobStore = new Map<string, Uint8Array>()
    const foreign = createAssistantMessage({
      content: [{
        type: 'tool-call',
        id: CallId('call_codex|fc_1'),
        name: 'grok_image_gen',
        arguments: '{"path":"out.png"}',
      }, { type: 'text', text: 'done' }],
      source: { provider: 'codex', model: 'gpt-5.6-luna-1m' },
    })
    const built = buildConversationState(
      [userText('draw'), foreign, toolResult('call_codex|fc_1', 'wrote out.png'), userText('test')],
      undefined,
      blobStore,
      'cursor',
      'composer-2.5',
    )
    expect(mcpCallsInTurns(blobStore, built.conversationState.turns)).toEqual([])
    const blobs = JSON.stringify(decodeJsonBlobs(blobStore, built.conversationState.rootPromptMessagesJson))
    expect(blobs).not.toContain('"type":"tool-call"')
    expect(blobs).toContain('grok_image_gen')
    expect(blobs).toContain('done')
    expect(blobs).toContain('[Tool Result]')
  })

  it('replays thinking only when the assistant provider and model match', () => {
    const same = new Map<string, Uint8Array>()
    const sameBuilt = buildConversationState(
      [userText('ask'), assistantReasoning('secret', 'hi'), userText('next')],
      undefined,
      same,
      'cursor',
      'composer-2.5',
    )
    expect(JSON.stringify(decodeJsonBlobs(same, sameBuilt.conversationState.rootPromptMessagesJson))).toContain('secret')

    const other = new Map<string, Uint8Array>()
    const otherBuilt = buildConversationState(
      [userText('ask'), assistantReasoning('secret', 'hi', 'gpt-5.2'), userText('next')],
      undefined,
      other,
      'cursor',
      'composer-2.5',
    )
    expect(JSON.stringify(decodeJsonBlobs(other, otherBuilt.conversationState.rootPromptMessagesJson))).not.toContain('secret')
  })

  it('keeps a stable user messageId for the same active text', () => {
    const first = buildConversationState([userText('hello')], undefined, new Map(), 'cursor', 'composer-2.5')
    const second = buildConversationState([userText('hello')], undefined, new Map(), 'cursor', 'composer-2.5')
    const firstId = first.action.action.case === 'userMessageAction'
      ? first.action.action.value.userMessage?.messageId
      : undefined
    const secondId = second.action.action.case === 'userMessageAction'
      ? second.action.action.value.userMessage?.messageId
      : undefined
    expect(firstId).toEqual(secondId)
    expect(firstId).toMatch(/^[0-9a-f-]{36}$/u)
  })

  it('inlines image bytes and stores them for KV getBlob', () => {
    const blobStore = new Map<string, Uint8Array>()
    const ref = pngRef()
    const built = buildConversationState(
      [userImage('see', ref)],
      undefined,
      blobStore,
      'cursor',
      'composer-2.5',
      new Map([[ref.attachmentId, { data: png, mediaType: 'image/png', width: 1, height: 1 }]]),
    )
    expect(built.action.action.case).toBe('userMessageAction')
    const images = built.action.action.case === 'userMessageAction'
      ? built.action.action.value.userMessage?.selectedContext?.selectedImages ?? []
      : []
    expect(images).toHaveLength(1)
    expect(images[0]?.mimeType).toBe('image/png')
    expect(images[0]?.dataOrBlobId.case).toBe('blobIdWithData')
    const packed = images[0]?.dataOrBlobId.case === 'blobIdWithData' ? images[0].dataOrBlobId.value : undefined
    expect(packed?.data).toEqual(png)
    expect(readCursorBlob(blobStore, packed!.blobId)).toEqual(png)
  })

  it('keeps selected images on the active action for consecutive same-turn user messages', () => {
    const blobStore = new Map<string, Uint8Array>()
    const ref = pngRef()
    const built = buildConversationState(
      [userImage('see', ref), userText('same-turn follow-up')],
      undefined,
      blobStore,
      'cursor',
      'composer-2.5',
      new Map([[ref.attachmentId, { data: png, mediaType: 'image/png', width: 1, height: 1 }]]),
    )
    expect(built.activeUserMessageIndex).toBe(0)
    expect(built.action.action.case).toBe('userMessageAction')
    const action = built.action.action.case === 'userMessageAction' ? built.action.action.value.userMessage : undefined
    expect(action?.text).toContain('see')
    expect(action?.text).toContain('same-turn follow-up')
    const images = action?.selectedContext?.selectedImages ?? []
    expect(images).toHaveLength(1)
    expect(images[0]?.dataOrBlobId.case).toBe('blobIdWithData')
    const packed = images[0]?.dataOrBlobId.case === 'blobIdWithData' ? images[0].dataOrBlobId.value : undefined
    expect(packed?.data).toEqual(png)
    expect(built.conversationState.turns).toHaveLength(0)
    const blobs = JSON.stringify(decodeJsonBlobs(blobStore, built.conversationState.rootPromptMessagesJson))
    expect(blobs).not.toContain('see')
    expect(blobs).not.toContain('same-turn follow-up')
  })

  it('keeps the image active when rc.2 appends injected user-role context', () => {
    const blobStore = new Map<string, Uint8Array>()
    const ref = pngRef()
    const injected = (text: string, plugin: string) => createUserMessage({
      content: [{ type: 'text', text }],
      source: { kind: 'plugin', plugin },
    })
    const built = buildConversationState(
      [
        userImage('see', ref),
        injected('sandbox policy', '@deepseek-ai/dsh-system-prompt'),
        injected('skill catalog', '@deepseek-ai/dsh-skills'),
      ],
      undefined,
      blobStore,
      'cursor',
      'composer-2.5',
      new Map([[ref.attachmentId, { data: png, mediaType: 'image/png', width: 1, height: 1 }]]),
    )

    expect(built.activeUserMessageIndex).toBe(0)
    expect(built.action.action.case).toBe('userMessageAction')
    const action = built.action.action.case === 'userMessageAction' ? built.action.action.value.userMessage : undefined
    expect(action?.text).toContain('see')
    expect(action?.text).toContain('sandbox policy')
    expect(action?.text).toContain('skill catalog')
    expect(action?.selectedContext?.selectedImages).toHaveLength(1)
    expect(built.conversationState.turns).toHaveLength(0)
  })

  it('does not copy an earlier image turn onto a later consecutive composer submission', () => {
    const blobStore = new Map<string, Uint8Array>()
    const oldRef = pngRef('img-old')
    const newRef = pngRef('img-new')
    const images = new Map([
      [oldRef.attachmentId, { data: png, mediaType: 'image/png', width: 1, height: 1 }],
      [newRef.attachmentId, { data: png, mediaType: 'image/png', width: 1, height: 1 }],
    ])
    const built = buildConversationState(
      [userImage('old pic', oldRef), assistantText('saw it'), userImage('new pic', newRef), userText('what is this')],
      undefined,
      blobStore,
      'cursor',
      'composer-2.5',
      images,
    )
    expect(built.activeUserMessageIndex).toBe(2)
    expect(built.conversationState.turns).toHaveLength(1)
    const action = built.action.action.case === 'userMessageAction' ? built.action.action.value.userMessage : undefined
    expect(action?.text).toContain('new pic')
    expect(action?.text).toContain('what is this')
    expect(action?.text).not.toContain('old pic')
    expect(action?.selectedContext?.selectedImages).toHaveLength(1)
    const blobs = JSON.stringify(decodeJsonBlobs(blobStore, built.conversationState.rootPromptMessagesJson))
    expect(blobs).toContain('saw it')
    expect(blobs).not.toContain('new pic')
    expect(blobs).not.toContain('what is this')
  })
})
