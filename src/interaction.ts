/**
 * Map Cursor interactionUpdate frames onto DSH StreamChunks.
 * args_text_delta is a cumulative snapshot; only the unmatched suffix is emitted.
 */

import type { ContentBlock, StreamChunk, TokenUsage, ToolCallBlock, ToolCallId } from '@deepseek-ai/dsh-llm'
import type { InteractionUpdate, ToolCall } from './wire/vendor/agent_pb.ts'

const SERVER_OWNED_CASES = new Set([
  'updateTodosToolCall',
  'readTodosToolCall',
  'connectScmToolCall',
])

function toolCallId(id: string): ToolCallId {
  return id as ToolCallId
}

export function isMcpToolCall(toolCall: ToolCall | undefined): boolean {
  return toolCall?.tool.case === 'mcpToolCall'
}

export function isIgnoredToolCall(toolCall: ToolCall | undefined): boolean {
  const toolCase = toolCall?.tool.case
  if (toolCase === undefined) return true
  if (toolCase === 'mcpToolCall') return false
  return true
}

export function mcpToolName(toolCall: ToolCall | undefined): string | undefined {
  if (toolCall?.tool.case !== 'mcpToolCall') return undefined
  const args = toolCall.tool.value.args
  const name = args?.toolName || args?.name
  return name === undefined || name.length === 0 ? undefined : name
}

export function snapshotDelta(previous: string, snapshot: string): string {
  if (snapshot.startsWith(previous)) return snapshot.slice(previous.length)
  return snapshot
}

export interface OpenMcpBlock {
  envelopeCallId: string
  toolCallId: string
  index: number
  name: string
  arguments: string
  completed: boolean
}

export class InteractionMapper {
  private nextIndex = 0
  private textIndex: number | undefined
  private text = ''
  private reasoningIndex: number | undefined
  private reasoning = ''
  private readonly mcp = new Map<string, OpenMcpBlock>()
  private outputTokens = 0
  private inputTokens = 0
  sawTokenDelta = false
  turnEnded = false

  chunks: StreamChunk[] = []

  constructor(private readonly ignoredMcpCallIds: ReadonlySet<string> = new Set()) {}

  take(): StreamChunk[] {
    const out = this.chunks
    this.chunks = []
    return out
  }

  /** Return known token usage, or `undefined` when the protocol supplied neither counter. */
  usage(): TokenUsage | undefined {
    if (this.inputTokens === 0 && this.outputTokens === 0) return undefined
    return { inputTokens: this.inputTokens, outputTokens: this.outputTokens }
  }

  /** Return whether the provider reported any generated tokens. */
  hasOutputTokens(): boolean {
    return this.outputTokens !== 0
  }

  openMcpBlocks(): OpenMcpBlock[] {
    return [...this.mcp.values()]
  }

  completedMcpBlocks(): OpenMcpBlock[] {
    return [...this.mcp.values()].filter(block => block.completed)
  }

  hasIncompleteMcp(): boolean {
    return [...this.mcp.values()].some(block => !block.completed)
  }

  applyCheckpointUsedTokens(used: number): void {
    if (!this.sawTokenDelta) this.inputTokens = used
  }

  handle(update: InteractionUpdate): void {
    const msgCase = update.message.case
    if (msgCase === 'textDelta') {
      this.ensureText()
      const text = update.message.value.text
      this.text += text
      this.chunks.push({ type: 'text-delta', index: this.textIndex!, text })
      return
    }
    if (msgCase === 'thinkingDelta') {
      this.ensureReasoning()
      const text = update.message.value.text
      this.reasoning += text
      this.chunks.push({ type: 'reasoning-delta', index: this.reasoningIndex!, text })
      return
    }
    if (msgCase === 'thinkingCompleted') {
      this.closeReasoning()
      return
    }
    if (msgCase === 'tokenDelta') {
      this.sawTokenDelta = true
      this.outputTokens += update.message.value.tokens
      return
    }
    if (msgCase === 'turnEnded') {
      this.closeText()
      this.closeReasoning()
      this.turnEnded = true
      return
    }
    if (msgCase === 'toolCallStarted') {
      if (this.ignoredMcpCallIds.has(update.message.value.callId)) return
      this.openMcp(update.message.value.callId, update.message.value.toolCall)
      return
    }
    if (msgCase === 'partialToolCall') {
      if (this.ignoredMcpCallIds.has(update.message.value.callId)) return
      this.applyArgsSnapshot(update.message.value.callId, update.message.value.argsTextDelta, update.message.value.toolCall)
      return
    }
    if (msgCase === 'toolCallDelta') {
      return
    }
    if (msgCase === 'toolCallCompleted') {
      if (this.ignoredMcpCallIds.has(update.message.value.callId)) return
      this.completeMcp(update.message.value.callId, update.message.value.toolCall)
    }
  }

  completeMcpFromExec(toolCallIdValue: string, name: string, args: string): void {
    const block = [...this.mcp.values()].find(item => item.toolCallId === toolCallIdValue)
    if (block === undefined || block.completed) return
    block.name = name
    const delta = snapshotDelta(block.arguments, args)
    block.arguments = args
    if (delta.length > 0) {
      this.chunks.push({
        type: 'tool-call-delta',
        index: block.index,
        id: toolCallId(block.envelopeCallId),
        name,
        argumentsDelta: delta,
      })
    }
    this.finishMcp(block)
  }

  flushOpenText(): void {
    this.closeText()
    this.closeReasoning()
  }

  private ensureText(): void {
    if (this.textIndex !== undefined) return
    this.closeReasoning()
    this.textIndex = this.nextIndex++
    this.text = ''
    this.chunks.push({ type: 'block-start', index: this.textIndex, blockType: 'text' })
  }

  private closeText(): void {
    if (this.textIndex === undefined) return
    this.chunks.push({
      type: 'block-end',
      index: this.textIndex,
      block: { type: 'text', text: this.text },
    })
    this.textIndex = undefined
    this.text = ''
  }

  private ensureReasoning(): void {
    if (this.reasoningIndex !== undefined) return
    this.closeText()
    this.reasoningIndex = this.nextIndex++
    this.reasoning = ''
    this.chunks.push({ type: 'block-start', index: this.reasoningIndex, blockType: 'reasoning' })
  }

  private closeReasoning(): void {
    if (this.reasoningIndex === undefined) return
    this.chunks.push({
      type: 'block-end',
      index: this.reasoningIndex,
      block: { type: 'reasoning', text: this.reasoning },
    })
    this.reasoningIndex = undefined
    this.reasoning = ''
  }

  private openMcp(envelopeCallId: string, toolCall: ToolCall | undefined): void {
    if (isIgnoredToolCall(toolCall)) return
    const existing = this.mcp.get(envelopeCallId)
    if (existing !== undefined) {
      existing.name = mcpToolName(toolCall) ?? existing.name
      if (toolCall?.tool.case === 'mcpToolCall') {
        existing.toolCallId = toolCall.tool.value.args?.toolCallId || toolCall.toolCallId || existing.toolCallId
      }
      return
    }
    this.closeText()
    this.closeReasoning()
    const name = mcpToolName(toolCall) ?? 'tool'
    const index = this.nextIndex++
    const innerCallId = toolCall?.tool.case === 'mcpToolCall'
      ? toolCall.tool.value.args?.toolCallId || toolCall.toolCallId || envelopeCallId
      : envelopeCallId
    this.mcp.set(envelopeCallId, {
      envelopeCallId,
      toolCallId: innerCallId,
      index,
      name,
      arguments: '',
      completed: false,
    })
    this.chunks.push({ type: 'block-start', index, blockType: 'tool-call' })
    this.chunks.push({
      type: 'tool-call-delta',
      index,
      id: toolCallId(envelopeCallId),
      name,
      argumentsDelta: '',
    })
  }

  private applyArgsSnapshot(envelopeCallId: string, snapshot: string, toolCall: ToolCall | undefined): void {
    if (isIgnoredToolCall(toolCall) && !this.mcp.has(envelopeCallId)) return
    if (!this.mcp.has(envelopeCallId)) this.openMcp(envelopeCallId, toolCall)
    const block = this.mcp.get(envelopeCallId)
    if (block === undefined || block.completed) return
    const name = mcpToolName(toolCall)
    if (name !== undefined) block.name = name
    const delta = snapshotDelta(block.arguments, snapshot)
    block.arguments = snapshot.startsWith(block.arguments) ? snapshot : snapshot
    if (delta.length === 0) return
    this.chunks.push({
      type: 'tool-call-delta',
      index: block.index,
      id: toolCallId(envelopeCallId),
      name: block.name,
      argumentsDelta: delta,
    })
  }

  private completeMcp(envelopeCallId: string, toolCall: ToolCall | undefined): void {
    if (isIgnoredToolCall(toolCall) && !this.mcp.has(envelopeCallId)) return
    if (SERVER_OWNED_CASES.has(toolCall?.tool.case ?? '')) return
    if (!this.mcp.has(envelopeCallId)) this.openMcp(envelopeCallId, toolCall)
    const block = this.mcp.get(envelopeCallId)
    if (block === undefined || block.completed) return
    const name = mcpToolName(toolCall)
    if (name !== undefined) block.name = name
    if (toolCall?.tool.case === 'mcpToolCall') {
      const raw = toolCall.tool.value.args
      if (raw !== undefined && block.arguments.length === 0) {
        block.arguments = '{}'
      }
    }
    this.finishMcp(block)
  }

  private finishMcp(block: OpenMcpBlock): void {
    block.completed = true
    const finished: ToolCallBlock = {
      type: 'tool-call',
      id: toolCallId(block.envelopeCallId),
      name: block.name,
      arguments: block.arguments.length > 0 ? block.arguments : '{}',
    }
    this.chunks.push({ type: 'block-end', index: block.index, block: finished as ContentBlock })
  }
}
