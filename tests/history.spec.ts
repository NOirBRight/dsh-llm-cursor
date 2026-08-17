import { describe, expect, it } from 'vitest'
import { buildConversationState, readCursorBlob } from '../src/history.ts'
import { assistantText, assistantToolCall, toolResult, userText } from './helpers.ts'

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
    const system = readCursorBlob(blobStore, built.conversationState.rootPromptMessagesJson[0]!)
    expect(new TextDecoder().decode(system)).toContain('Be brief.')
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
  })
})
