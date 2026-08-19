import { createServer } from 'node:http2'
import type { Http2Server, ServerHttp2Stream, IncomingHttpHeaders } from 'node:http2'
import { create, fromBinary, toBinary } from '@bufbuild/protobuf'
import { CONNECT_END_STREAM_FLAG, frameConnectMessage, takeConnectFrames } from '../src/wire/connect.ts'
import {
  AgentClientMessageSchema,
  AgentServerMessageSchema,
  ConnectScmToolCallSchema,
  ExecServerMessageSchema,
  GetBlobArgsSchema,
  GetUsableModelsResponseSchema,
  InteractionUpdateSchema,
  KvServerMessageSchema,
  McpArgsSchema,
  McpToolCallSchema,
  ModelDetailsSchema,
  PartialToolCallUpdateSchema,
  ListMcpResourcesExecArgsSchema,
  RequestContextArgsSchema,
  ShellArgsSchema,
  TextDeltaUpdateSchema,
  ThinkingDeltaUpdateSchema,
  TokenDeltaUpdateSchema,
  ToolCallCompletedUpdateSchema,
  ToolCallSchema,
  ToolCallStartedUpdateSchema,
  TurnEndedUpdateSchema,
  UpdateTodosToolCallSchema,
  type AgentClientMessage,
  type AgentRunRequest,
} from '../src/wire/vendor/agent_pb.ts'

const servers: Http2Server[] = []

export async function closeFakeRunServers(): Promise<void> {
  await Promise.all(servers.splice(0).map(server => new Promise<void>((resolve) => {
    server.close(() => { resolve() })
    setTimeout(resolve, 200).unref?.()
  })))
}

export function sendServer(stream: ServerHttp2Stream, message: Parameters<typeof toBinary>[1]): void {
  stream.write(frameConnectMessage(toBinary(AgentServerMessageSchema, message)))
}

export function interaction(update: Parameters<typeof create<typeof InteractionUpdateSchema>>[1]) {
  return create(AgentServerMessageSchema, {
    message: { case: 'interactionUpdate', value: create(InteractionUpdateSchema, update) },
  })
}

export function textDelta(text: string) {
  return interaction({ message: { case: 'textDelta', value: create(TextDeltaUpdateSchema, { text }) } })
}

export function thinkingDelta(text: string) {
  return interaction({ message: { case: 'thinkingDelta', value: create(ThinkingDeltaUpdateSchema, { text }) } })
}

export function tokenDelta(tokens: number) {
  return interaction({ message: { case: 'tokenDelta', value: create(TokenDeltaUpdateSchema, { tokens }) } })
}

export function turnEnded() {
  return interaction({ message: { case: 'turnEnded', value: create(TurnEndedUpdateSchema, {}) } })
}

export function requestContext(id = 1) {
  return create(AgentServerMessageSchema, {
    message: {
      case: 'execServerMessage',
      value: create(ExecServerMessageSchema, {
        id,
        execId: 'ctx',
        message: { case: 'requestContextArgs', value: create(RequestContextArgsSchema, {}) },
      }),
    },
  })
}

export function getBlob(blobId: Uint8Array, id = 2) {
  return create(AgentServerMessageSchema, {
    message: {
      case: 'kvServerMessage',
      value: create(KvServerMessageSchema, {
        id,
        message: { case: 'getBlobArgs', value: create(GetBlobArgsSchema, { blobId }) },
      }),
    },
  })
}

export function mcpInvoke(name: string, toolCallId: string, id = 3) {
  return create(AgentServerMessageSchema, {
    message: {
      case: 'execServerMessage',
      value: create(ExecServerMessageSchema, {
        id,
        execId: `exec-${toolCallId}`,
        message: {
          case: 'mcpArgs',
          value: create(McpArgsSchema, {
            name,
            toolName: name,
            toolCallId,
            providerIdentifier: 'dsh-llm-cursor',
          }),
        },
      }),
    },
  })
}

export function mcpProbe(name: string, id = 4) {
  return create(AgentServerMessageSchema, {
    message: {
      case: 'execServerMessage',
      value: create(ExecServerMessageSchema, {
        id,
        execId: 'probe',
        message: {
          case: 'mcpArgs',
          value: create(McpArgsSchema, {
            name,
            toolName: name,
            toolCallId: 'probe',
            providerIdentifier: 'dsh-llm-cursor',
            smartModeApprovalOnly: true,
          }),
        },
      }),
    },
  })
}

export function bashExec(id = 5) {
  return create(AgentServerMessageSchema, {
    message: {
      case: 'execServerMessage',
      value: create(ExecServerMessageSchema, {
        id,
        execId: 'bash',
        message: { case: 'shellArgs', value: create(ShellArgsSchema, { command: 'echo hi' }) },
      }),
    },
  })
}

function mcpTool(name: string, toolCallId: string) {
  return create(ToolCallSchema, {
    tool: {
      case: 'mcpToolCall',
      value: create(McpToolCallSchema, {
        args: create(McpArgsSchema, {
          name,
          toolName: name,
          toolCallId,
          providerIdentifier: 'dsh-llm-cursor',
        }),
      }),
    },
    toolCallId,
  })
}

export function mcpStarted(envelopeCallId: string, name: string, toolCallId = envelopeCallId) {
  return interaction({
    message: {
      case: 'toolCallStarted',
      value: create(ToolCallStartedUpdateSchema, {
        callId: envelopeCallId,
        toolCall: mcpTool(name, toolCallId),
      }),
    },
  })
}

export function mcpPartial(envelopeCallId: string, snapshot: string, name: string, toolCallId = envelopeCallId) {
  return interaction({
    message: {
      case: 'partialToolCall',
      value: create(PartialToolCallUpdateSchema, {
        callId: envelopeCallId,
        argsTextDelta: snapshot,
        toolCall: mcpTool(name, toolCallId),
      }),
    },
  })
}

export function mcpCompleted(envelopeCallId: string, name: string, toolCallId = envelopeCallId) {
  return interaction({
    message: {
      case: 'toolCallCompleted',
      value: create(ToolCallCompletedUpdateSchema, {
        callId: envelopeCallId,
        toolCall: mcpTool(name, toolCallId),
      }),
    },
  })
}

export function listMcpResources(id = 6) {
  return create(AgentServerMessageSchema, {
    message: {
      case: 'execServerMessage',
      value: create(ExecServerMessageSchema, {
        id,
        execId: 'mcp-resources',
        message: {
          case: 'listMcpResourcesExecArgs',
          value: create(ListMcpResourcesExecArgsSchema, {}),
        },
      }),
    },
  })
}

export function serverOwnedTool(envelopeCallId: string, tool: 'todo' | 'scm') {
  return interaction({
    message: {
      case: 'toolCallStarted',
      value: create(ToolCallStartedUpdateSchema, {
        callId: envelopeCallId,
        toolCall: create(ToolCallSchema, {
          tool: tool === 'todo'
            ? { case: 'updateTodosToolCall', value: create(UpdateTodosToolCallSchema, {}) }
            : { case: 'connectScmToolCall', value: create(ConnectScmToolCallSchema, {}) },
        }),
      }),
    },
  })
}

export function connectError(code: string, message: string): Buffer {
  return frameConnectMessage(
    Buffer.from(JSON.stringify({ error: { code, message } })),
    CONNECT_END_STREAM_FLAG,
  )
}

export function connectExhausted(): Buffer {
  return connectError('resource_exhausted', 'conversation poisoned')
}

export interface FakeRunCapture {
  headers: IncomingHttpHeaders
  messages: AgentClientMessage[]
  runRequest?: AgentRunRequest
}

export async function fakeRunServer(handler: (
  stream: ServerHttp2Stream,
  capture: FakeRunCapture,
) => Promise<void> | void,
): Promise<{ origin: string, captures: FakeRunCapture[] }> {
  const captures: FakeRunCapture[] = []
  const server = createServer()
  server.on('stream', (stream, headers) => {
    const capture: FakeRunCapture = { headers, messages: [] }
    captures.push(capture)
    let rest = Buffer.alloc(0)
    const path = headers[':path']
    if (path === '/agent.v1.AgentService/GetUsableModels') {
      const payload = toBinary(GetUsableModelsResponseSchema, create(GetUsableModelsResponseSchema, {
        models: [create(ModelDetailsSchema, {
          modelId: 'composer-2.5',
          displayName: 'Composer 2.5',
          maxMode: true,
        })],
      }))
      stream.respond({ ':status': 200, 'content-type': 'application/proto' })
      stream.end(payload)
      return
    }
    stream.on('data', (chunk: Buffer) => {
      rest = Buffer.concat([rest, chunk])
      const taken = takeConnectFrames(rest)
      rest = taken.rest
      for (const frame of taken.frames) {
        if ((frame.flags & CONNECT_END_STREAM_FLAG) !== 0) continue
        const message = fromBinary(AgentClientMessageSchema, frame.payload)
        capture.messages.push(message)
        if (message.message.case === 'runRequest') capture.runRequest = message.message.value
      }
    })
    void Promise.resolve(handler(stream, capture)).catch((error: unknown) => {
      stream.destroy(error instanceof Error ? error : new Error(String(error)))
    })
  })
  servers.push(server)
  await new Promise<void>((resolve) => { server.listen(0, '127.0.0.1', resolve) })
  const address = server.address()
  if (address === null || typeof address === 'string') throw new Error('no listen port')
  return { origin: `http://127.0.0.1:${String(address.port)}`, captures }
}
