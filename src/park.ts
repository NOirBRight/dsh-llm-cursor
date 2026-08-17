/**
 * Park an unfinished HTTP/2 Run until the next DSH turn writes mcpResult.
 * Heartbeats continue; silence is local wait and does not trip stream idle.
 */

import type { ClientHttp2Session, ClientHttp2Stream } from 'node:http2'
import type { Message } from '@deepseek-ai/dsh-llm'
import type { PendingMcpInvocation } from './exec.ts'
import type { BlobStore } from './history.ts'
import type { InteractionMapper, OpenMcpBlock } from './interaction.ts'

export interface ParkedMcpCall {
  envelopeCallId: string
  pending: PendingMcpInvocation
}

export interface ParkedRun {
  sessionKey: string
  conversationId: string
  session: ClientHttp2Session
  stream: ClientHttp2Stream
  blobStore: BlobStore
  calls: ParkedMcpCall[]
  mapper: InteractionMapper
  localWork: boolean
  closed: boolean
  heartbeat: ReturnType<typeof setInterval> | undefined
  pendingWork: Promise<void>[]
  push: (chunk: Buffer) => void
  waitChunk: () => Promise<Buffer | undefined>
  trailers: Record<string, string>
  getHttpStatus: () => number
  inbox: Buffer
}

const parks = new Map<string, ParkedRun>()

export function sessionKeyOf(sessionId: string | undefined): string {
  return sessionId ?? '__default__'
}

export function getParkedRun(sessionId: string | undefined): ParkedRun | undefined {
  return parks.get(sessionKeyOf(sessionId))
}

export function setParkedRun(parked: ParkedRun): void {
  parks.set(parked.sessionKey, parked)
}

export function trailingToolResults(messages: readonly Message[]): Array<{
  callId: string
  text: string
  isError: boolean
}> {
  const out: Array<{ callId: string, text: string, isError: boolean }> = []
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i]
    if (message === undefined || message.role !== 'user' || message.source.kind !== 'tool') break
    const block = message.content[0]
    const text = block?.type === 'tool-result'
      ? block.content.filter((item): item is { type: 'text', text: string } => item.type === 'text').map(item => item.text).join('\n')
      : ''
    const isError = block?.type === 'tool-result' && block.isError === true
    out.unshift({ callId: message.source.callId, text, isError })
  }
  return out
}

export function parkMatches(parked: ParkedRun, messages: readonly Message[]): boolean {
  const results = trailingToolResults(messages)
  if (results.length === 0 || parked.calls.length === 0) return false
  const have = new Set(results.map(result => result.callId))
  return parked.calls.every(call => have.has(call.envelopeCallId))
}

export function pairParkResults(parked: ParkedRun, messages: readonly Message[]): Array<{
  call: ParkedMcpCall
  text: string
  isError: boolean
}> {
  const results = trailingToolResults(messages)
  const byId = new Map(results.map(result => [result.callId, result]))
  return parked.calls.flatMap((call) => {
    const result = byId.get(call.envelopeCallId)
    if (result === undefined) return []
    return [{ call, text: result.text, isError: result.isError }]
  })
}

export function closeParkedRun(parked: ParkedRun): void {
  if (parked.closed) return
  parked.closed = true
  if (parked.heartbeat !== undefined) clearInterval(parked.heartbeat)
  parked.heartbeat = undefined
  try { parked.stream.destroy() } catch { /* already closed */ }
  try { parked.session.destroy() } catch { /* already closed */ }
  if (parks.get(parked.sessionKey) === parked) parks.delete(parked.sessionKey)
}

export function clearPark(sessionId: string | undefined): void {
  const parked = getParkedRun(sessionId)
  if (parked !== undefined) closeParkedRun(parked)
}

export function parkCompletedMcp(parked: ParkedRun, completed: OpenMcpBlock[], pending: PendingMcpInvocation[]): void {
  const unused = [...pending]
  parked.calls = completed.map((block) => {
    const matchIndex = unused.findIndex(item => item.name === block.name || item.toolCallId === block.envelopeCallId)
    const match = matchIndex >= 0 ? unused.splice(matchIndex, 1)[0] : unused.shift()
    return {
      envelopeCallId: block.envelopeCallId,
      pending: match ?? {
        execId: block.envelopeCallId,
        execMessageId: 0,
        toolCallId: block.envelopeCallId,
        name: block.name,
      },
    }
  })
  setParkedRun(parked)
}
