/**
 * Cursor exec / KV handshake. DSH never executes native tools.
 */

import { create, fromJson, toBinary } from '@bufbuild/protobuf'
import { ValueSchema } from '@bufbuild/protobuf/wkt'
import type { ToolSchema } from '@deepseek-ai/dsh-llm'
import { CURSOR_MCP_PROVIDER_ID } from './client-contract.ts'
import type { BlobStore } from './history.ts'
import { readCursorBlob } from './history.ts'
import { frameConnectMessage } from './wire/connect.ts'
import type { ClientHttp2Stream } from 'node:http2'
import {
  AgentClientMessageSchema,
  DeleteRejectedSchema,
  DeleteResultSchema,
  ExecClientMessageSchema,
  GetBlobResultSchema,
  GrepErrorSchema,
  GrepResultSchema,
  KvClientMessageSchema,
  ListMcpResourcesExecResultSchema,
  ListMcpResourcesSuccessSchema,
  LsRejectedSchema,
  LsResultSchema,
  McpApprovedSchema,
  McpErrorSchema,
  McpRejectedSchema,
  McpResultSchema,
  McpSuccessSchema,
  McpTextContentSchema,
  McpToolDefinitionSchema,
  McpToolResultContentItemSchema,
  PiBashExecErrorSchema,
  PiBashExecResultSchema,
  ReadRejectedSchema,
  ReadResultSchema,
  RequestContextResultSchema,
  RequestContextSchema,
  RequestContextSuccessSchema,
  SetBlobResultSchema,
  ShellRejectedSchema,
  ShellResultSchema,
  WriteRejectedSchema,
  WriteResultSchema,
  type AgentServerMessage,
  type ExecServerMessage,
  type KvServerMessage,
} from './wire/vendor/agent_pb.ts'

const NATIVE_TOOL_NAMES = new Set(['bash', 'read', 'write', 'delete', 'ls', 'grep', 'lsp', 'todo'])
const REJECT_REASON = 'Tools are executed by DeepSeek Harness. Use the provided tools.'

export interface PendingMcpInvocation {
  execId: string
  execMessageId: number
  toolCallId: string
  name: string
}

export function buildMcpToolDefinitions(tools: readonly ToolSchema[] | undefined) {
  if (tools === undefined || tools.length === 0) return []
  return tools
    .filter(tool => !NATIVE_TOOL_NAMES.has(tool.name))
    .map((tool) => {
      const schema = tool.parameters
      const inputSchema = toBinary(ValueSchema, fromJson(ValueSchema, schema as never))
      return create(McpToolDefinitionSchema, {
        name: tool.name,
        description: tool.description,
        providerIdentifier: CURSOR_MCP_PROVIDER_ID,
        toolName: tool.name,
        inputSchema,
      })
    })
}

function writeClient(stream: ClientHttp2Stream, message: ReturnType<typeof create<typeof AgentClientMessageSchema>>): void {
  stream.write(frameConnectMessage(toBinary(AgentClientMessageSchema, message)))
}

export function handleKvServerMessage(
  kvMsg: KvServerMessage,
  blobStore: BlobStore,
  stream: ClientHttp2Stream,
): void {
  const kvCase = kvMsg.message.case
  if (kvCase === 'getBlobArgs') {
    const blobId = kvMsg.message.value.blobId
    const blobData = readCursorBlob(blobStore, blobId)
    writeClient(stream, create(AgentClientMessageSchema, {
      message: {
        case: 'kvClientMessage',
        value: create(KvClientMessageSchema, {
          id: kvMsg.id,
          message: {
            case: 'getBlobResult',
            value: create(GetBlobResultSchema, blobData === undefined ? {} : { blobData }),
          },
        }),
      },
    }))
    return
  }
  if (kvCase === 'setBlobArgs') {
    const { blobId, blobData } = kvMsg.message.value
    blobStore.set(Buffer.from(blobId).toString('hex'), blobData)
    writeClient(stream, create(AgentClientMessageSchema, {
      message: {
        case: 'kvClientMessage',
        value: create(KvClientMessageSchema, {
          id: kvMsg.id,
          message: { case: 'setBlobResult', value: create(SetBlobResultSchema, {}) },
        }),
      },
    }))
  }
}

function rejectNative(stream: ClientHttp2Stream, execMsg: ExecServerMessage, caseName: string): void {
  const reason = REJECT_REASON
  const result = (() => {
    switch (caseName) {
      case 'shellArgs':
      case 'shellStreamArgs':
        return { case: 'shellResult' as const, value: create(ShellResultSchema, {
          result: { case: 'rejected', value: create(ShellRejectedSchema, { reason }) },
        }) }
      case 'readArgs':
        return { case: 'readResult' as const, value: create(ReadResultSchema, {
          result: { case: 'rejected', value: create(ReadRejectedSchema, { reason }) },
        }) }
      case 'writeArgs':
        return { case: 'writeResult' as const, value: create(WriteResultSchema, {
          result: { case: 'rejected', value: create(WriteRejectedSchema, { reason }) },
        }) }
      case 'deleteArgs':
        return { case: 'deleteResult' as const, value: create(DeleteResultSchema, {
          result: { case: 'rejected', value: create(DeleteRejectedSchema, { reason }) },
        }) }
      case 'lsArgs':
        return { case: 'lsResult' as const, value: create(LsResultSchema, {
          result: { case: 'rejected', value: create(LsRejectedSchema, { reason }) },
        }) }
      case 'grepArgs':
        return { case: 'grepResult' as const, value: create(GrepResultSchema, {
          result: { case: 'error', value: create(GrepErrorSchema, { error: reason }) },
        }) }
      case 'piBashArgs':
        return { case: 'piBashResult' as const, value: create(PiBashExecResultSchema, {
          result: { case: 'error', value: create(PiBashExecErrorSchema, { error: reason }) },
        }) }
      default:
        return undefined
    }
  })()
  if (result === undefined) return
  writeClient(stream, create(AgentClientMessageSchema, {
    message: {
      case: 'execClientMessage',
      value: create(ExecClientMessageSchema, {
        id: execMsg.id,
        execId: execMsg.execId,
        message: result,
      }),
    },
  }))
}

export function handleExecServerMessage(
  execMsg: ExecServerMessage,
  stream: ClientHttp2Stream,
  tools: readonly ToolSchema[] | undefined,
  pending: PendingMcpInvocation[],
): 'context' | 'mcp-probe' | 'mcp-invoke' | 'native-reject' | 'ignored' {
  const execCase = execMsg.message.case
  if (execCase === 'requestContextArgs') {
    writeClient(stream, create(AgentClientMessageSchema, {
      message: {
        case: 'execClientMessage',
        value: create(ExecClientMessageSchema, {
          id: execMsg.id,
          execId: execMsg.execId,
          message: {
            case: 'requestContextResult',
            value: create(RequestContextResultSchema, {
              result: {
                case: 'success',
                value: create(RequestContextSuccessSchema, {
                  requestContext: create(RequestContextSchema, {
                    tools: buildMcpToolDefinitions(tools),
                  }),
                }),
              },
            }),
          },
        }),
      },
    }))
    return 'context'
  }
  if (execCase === 'mcpArgs') {
    const args = execMsg.message.value
    const name = args.toolName || args.name
    if (args.smartModeApprovalOnly) {
      const allowed = (tools ?? []).some(tool => tool.name === name)
      writeClient(stream, create(AgentClientMessageSchema, {
        message: {
          case: 'execClientMessage',
          value: create(ExecClientMessageSchema, {
            id: execMsg.id,
            execId: execMsg.execId,
            message: {
              case: 'mcpResult',
              value: create(McpResultSchema, {
                result: allowed
                  ? { case: 'approved', value: create(McpApprovedSchema, {}) }
                  : { case: 'rejected', value: create(McpRejectedSchema, { reason: `Tool "${name}" is not advertised.` }) },
              }),
            },
          }),
        },
      }))
      return 'mcp-probe'
    }
    pending.push({
      execId: execMsg.execId,
      execMessageId: execMsg.id,
      toolCallId: args.toolCallId || crypto.randomUUID(),
      name,
    })
    return 'mcp-invoke'
  }
  if (execCase === 'listMcpResourcesExecArgs' || execCase === 'readMcpResourceExecArgs') {
    writeClient(stream, create(AgentClientMessageSchema, {
      message: {
        case: 'execClientMessage',
        value: create(ExecClientMessageSchema, {
          id: execMsg.id,
          execId: execMsg.execId,
          message: {
            case: 'listMcpResourcesExecResult',
            value: create(ListMcpResourcesExecResultSchema, {
              result: { case: 'success', value: create(ListMcpResourcesSuccessSchema, { resources: [] }) },
            }),
          },
        }),
      },
    }))
    return 'ignored'
  }
  if (execCase !== undefined) {
    rejectNative(stream, execMsg, execCase)
    return 'native-reject'
  }
  return 'ignored'
}

export function writeMcpResult(
  stream: ClientHttp2Stream,
  pending: PendingMcpInvocation,
  text: string,
  isError: boolean,
): void {
  writeClient(stream, create(AgentClientMessageSchema, {
    message: {
      case: 'execClientMessage',
      value: create(ExecClientMessageSchema, {
        id: pending.execMessageId,
        execId: pending.execId,
        message: {
          case: 'mcpResult',
          value: create(McpResultSchema, {
            result: isError
              ? { case: 'error', value: create(McpErrorSchema, { error: text }) }
              : {
                case: 'success',
                value: create(McpSuccessSchema, {
                  content: [create(McpToolResultContentItemSchema, {
                    content: { case: 'text', value: create(McpTextContentSchema, { text }) },
                  })],
                  isError: false,
                }),
              },
          }),
        },
      }),
    },
  }))
}

export function handleServerSideChannel(
  message: AgentServerMessage,
  blobStore: BlobStore,
  stream: ClientHttp2Stream,
  tools: readonly ToolSchema[] | undefined,
  pending: PendingMcpInvocation[],
): 'interaction' | 'exec' | 'kv' | 'checkpoint' | 'other' {
  const msgCase = message.message.case
  if (msgCase === 'kvServerMessage') {
    handleKvServerMessage(message.message.value, blobStore, stream)
    return 'kv'
  }
  if (msgCase === 'execServerMessage') {
    handleExecServerMessage(message.message.value, stream, tools, pending)
    return 'exec'
  }
  if (msgCase === 'conversationCheckpointUpdate') return 'checkpoint'
  if (msgCase === 'interactionUpdate') return 'interaction'
  return 'other'
}
