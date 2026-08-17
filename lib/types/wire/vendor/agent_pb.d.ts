import type { GenEnum, GenFile, GenMessage, GenService } from "@bufbuild/protobuf/codegenv2";
import type { Message } from "@bufbuild/protobuf";
/**
 * Describes the file agent.proto.
 */
export declare const file_agent: GenFile;
/**
 * @generated from message agent.v1.GlobToolResult
 */
export type GlobToolResult = Message<"agent.v1.GlobToolResult"> & {
    /**
     * @generated from oneof agent.v1.GlobToolResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.GlobToolSuccess success = 1;
         */
        value: GlobToolSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.GlobToolError error = 2;
         */
        value: GlobToolError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.GlobToolResult.
 * Use `create(GlobToolResultSchema)` to create a new message.
 */
export declare const GlobToolResultSchema: GenMessage<GlobToolResult>;
/**
 * @generated from message agent.v1.GlobToolError
 */
export type GlobToolError = Message<"agent.v1.GlobToolError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.GlobToolError.
 * Use `create(GlobToolErrorSchema)` to create a new message.
 */
export declare const GlobToolErrorSchema: GenMessage<GlobToolError>;
/**
 * Only file results are needed for this tool
 *
 * @generated from message agent.v1.GlobToolSuccess
 */
export type GlobToolSuccess = Message<"agent.v1.GlobToolSuccess"> & {
    /**
     * @generated from field: string pattern = 1;
     */
    pattern: string;
    /**
     * @generated from field: string path = 2;
     */
    path: string;
    /**
     * @generated from field: repeated string files = 3;
     */
    files: string[];
    /**
     * @generated from field: int32 total_files = 4;
     */
    totalFiles: number;
    /**
     * @generated from field: bool client_truncated = 5;
     */
    clientTruncated: boolean;
    /**
     * @generated from field: bool ripgrep_truncated = 6;
     */
    ripgrepTruncated: boolean;
};
/**
 * Describes the message agent.v1.GlobToolSuccess.
 * Use `create(GlobToolSuccessSchema)` to create a new message.
 */
export declare const GlobToolSuccessSchema: GenMessage<GlobToolSuccess>;
/**
 * @generated from message agent.v1.GlobToolCall
 */
export type GlobToolCall = Message<"agent.v1.GlobToolCall"> & {
    /**
     * @generated from field: bytes args = 1;
     */
    args: Uint8Array;
    /**
     * @generated from field: agent.v1.GlobToolResult result = 2;
     */
    result?: GlobToolResult | undefined;
};
/**
 * Describes the message agent.v1.GlobToolCall.
 * Use `create(GlobToolCallSchema)` to create a new message.
 */
export declare const GlobToolCallSchema: GenMessage<GlobToolCall>;
/**
 * @generated from message agent.v1.ReadLintsToolCall
 */
export type ReadLintsToolCall = Message<"agent.v1.ReadLintsToolCall"> & {
    /**
     * @generated from field: agent.v1.ReadLintsToolArgs args = 1;
     */
    args?: ReadLintsToolArgs | undefined;
    /**
     * @generated from field: agent.v1.ReadLintsToolResult result = 2;
     */
    result?: ReadLintsToolResult | undefined;
};
/**
 * Describes the message agent.v1.ReadLintsToolCall.
 * Use `create(ReadLintsToolCallSchema)` to create a new message.
 */
export declare const ReadLintsToolCallSchema: GenMessage<ReadLintsToolCall>;
/**
 * @generated from message agent.v1.ReadLintsToolArgs
 */
export type ReadLintsToolArgs = Message<"agent.v1.ReadLintsToolArgs"> & {
    /**
     * @generated from field: repeated string paths = 1;
     */
    paths: string[];
};
/**
 * Describes the message agent.v1.ReadLintsToolArgs.
 * Use `create(ReadLintsToolArgsSchema)` to create a new message.
 */
export declare const ReadLintsToolArgsSchema: GenMessage<ReadLintsToolArgs>;
/**
 * @generated from message agent.v1.ReadLintsToolResult
 */
export type ReadLintsToolResult = Message<"agent.v1.ReadLintsToolResult"> & {
    /**
     * @generated from oneof agent.v1.ReadLintsToolResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.ReadLintsToolSuccess success = 1;
         */
        value: ReadLintsToolSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.ReadLintsToolError error = 2;
         */
        value: ReadLintsToolError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ReadLintsToolResult.
 * Use `create(ReadLintsToolResultSchema)` to create a new message.
 */
export declare const ReadLintsToolResultSchema: GenMessage<ReadLintsToolResult>;
/**
 * @generated from message agent.v1.ReadLintsToolSuccess
 */
export type ReadLintsToolSuccess = Message<"agent.v1.ReadLintsToolSuccess"> & {
    /**
     * @generated from field: repeated agent.v1.FileDiagnostics file_diagnostics = 1;
     */
    fileDiagnostics: FileDiagnostics[];
    /**
     * @generated from field: int32 total_files = 2;
     */
    totalFiles: number;
    /**
     * @generated from field: int32 total_diagnostics = 3;
     */
    totalDiagnostics: number;
};
/**
 * Describes the message agent.v1.ReadLintsToolSuccess.
 * Use `create(ReadLintsToolSuccessSchema)` to create a new message.
 */
export declare const ReadLintsToolSuccessSchema: GenMessage<ReadLintsToolSuccess>;
/**
 * @generated from message agent.v1.FileDiagnostics
 */
export type FileDiagnostics = Message<"agent.v1.FileDiagnostics"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: repeated agent.v1.DiagnosticItem diagnostics = 2;
     */
    diagnostics: DiagnosticItem[];
    /**
     * @generated from field: int32 diagnostics_count = 3;
     */
    diagnosticsCount: number;
};
/**
 * Describes the message agent.v1.FileDiagnostics.
 * Use `create(FileDiagnosticsSchema)` to create a new message.
 */
export declare const FileDiagnosticsSchema: GenMessage<FileDiagnostics>;
/**
 * @generated from message agent.v1.DiagnosticItem
 */
export type DiagnosticItem = Message<"agent.v1.DiagnosticItem"> & {
    /**
     * @generated from field: agent.v1.DiagnosticSeverity severity = 1;
     */
    severity: DiagnosticSeverity;
    /**
     * @generated from field: agent.v1.DiagnosticRange range = 2;
     */
    range?: DiagnosticRange | undefined;
    /**
     * @generated from field: string message = 3;
     */
    message: string;
    /**
     * @generated from field: string source = 4;
     */
    source: string;
    /**
     * @generated from field: string code = 5;
     */
    code: string;
    /**
     * @generated from field: bool is_stale = 6;
     */
    isStale: boolean;
};
/**
 * Describes the message agent.v1.DiagnosticItem.
 * Use `create(DiagnosticItemSchema)` to create a new message.
 */
export declare const DiagnosticItemSchema: GenMessage<DiagnosticItem>;
/**
 * @generated from message agent.v1.DiagnosticRange
 */
export type DiagnosticRange = Message<"agent.v1.DiagnosticRange"> & {
    /**
     * @generated from field: agent.v1.Position start = 1;
     */
    start?: Position | undefined;
    /**
     * @generated from field: agent.v1.Position end = 2;
     */
    end?: Position | undefined;
};
/**
 * Describes the message agent.v1.DiagnosticRange.
 * Use `create(DiagnosticRangeSchema)` to create a new message.
 */
export declare const DiagnosticRangeSchema: GenMessage<DiagnosticRange>;
/**
 * @generated from message agent.v1.ReadLintsToolError
 */
export type ReadLintsToolError = Message<"agent.v1.ReadLintsToolError"> & {
    /**
     * @generated from field: string error_message = 1;
     */
    errorMessage: string;
};
/**
 * Describes the message agent.v1.ReadLintsToolError.
 * Use `create(ReadLintsToolErrorSchema)` to create a new message.
 */
export declare const ReadLintsToolErrorSchema: GenMessage<ReadLintsToolError>;
/**
 * @generated from message agent.v1.McpToolError
 */
export type McpToolError = Message<"agent.v1.McpToolError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
    /**
     * @generated from field: string read_tool_def_reminder = 2;
     */
    readToolDefReminder: string;
};
/**
 * Describes the message agent.v1.McpToolError.
 * Use `create(McpToolErrorSchema)` to create a new message.
 */
export declare const McpToolErrorSchema: GenMessage<McpToolError>;
/**
 * Result for MCP tool calls (separate from exec results)
 *
 * @generated from message agent.v1.McpToolResult
 */
export type McpToolResult = Message<"agent.v1.McpToolResult"> & {
    /**
     * @generated from oneof agent.v1.McpToolResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.McpSuccess success = 1;
         */
        value: McpSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.McpToolError error = 2;
         */
        value: McpToolError;
        case: "error";
    } | {
        /**
         * @generated from field: agent.v1.McpRejected rejected = 3;
         */
        value: McpRejected;
        case: "rejected";
    } | {
        /**
         * @generated from field: agent.v1.McpPermissionDenied permission_denied = 4;
         */
        value: McpPermissionDenied;
        case: "permissionDenied";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.McpToolResult.
 * Use `create(McpToolResultSchema)` to create a new message.
 */
export declare const McpToolResultSchema: GenMessage<McpToolResult>;
/**
 * @generated from message agent.v1.McpToolCall
 */
export type McpToolCall = Message<"agent.v1.McpToolCall"> & {
    /**
     * @generated from field: agent.v1.McpArgs args = 1;
     */
    args?: McpArgs | undefined;
    /**
     * @generated from field: agent.v1.McpToolResult result = 2;
     */
    result?: McpToolResult | undefined;
    /**
     * @generated from field: optional string description = 3;
     */
    description?: string | undefined;
};
/**
 * Describes the message agent.v1.McpToolCall.
 * Use `create(McpToolCallSchema)` to create a new message.
 */
export declare const McpToolCallSchema: GenMessage<McpToolCall>;
/**
 * @generated from message agent.v1.SemSearchToolCall
 */
export type SemSearchToolCall = Message<"agent.v1.SemSearchToolCall"> & {
    /**
     * @generated from field: agent.v1.SemSearchToolArgs args = 1;
     */
    args?: SemSearchToolArgs | undefined;
    /**
     * @generated from field: agent.v1.SemSearchToolResult result = 2;
     */
    result?: SemSearchToolResult | undefined;
};
/**
 * Describes the message agent.v1.SemSearchToolCall.
 * Use `create(SemSearchToolCallSchema)` to create a new message.
 */
export declare const SemSearchToolCallSchema: GenMessage<SemSearchToolCall>;
/**
 * @generated from message agent.v1.SemSearchToolArgs
 */
export type SemSearchToolArgs = Message<"agent.v1.SemSearchToolArgs"> & {
    /**
     * @generated from field: string query = 1;
     */
    query: string;
    /**
     * @generated from field: repeated string target_directories = 2;
     */
    targetDirectories: string[];
    /**
     * @generated from field: string explanation = 3;
     */
    explanation: string;
};
/**
 * Describes the message agent.v1.SemSearchToolArgs.
 * Use `create(SemSearchToolArgsSchema)` to create a new message.
 */
export declare const SemSearchToolArgsSchema: GenMessage<SemSearchToolArgs>;
/**
 * @generated from message agent.v1.SemSearchToolResult
 */
export type SemSearchToolResult = Message<"agent.v1.SemSearchToolResult"> & {
    /**
     * @generated from oneof agent.v1.SemSearchToolResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.SemSearchToolSuccess success = 1;
         */
        value: SemSearchToolSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.SemSearchToolError error = 2;
         */
        value: SemSearchToolError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.SemSearchToolResult.
 * Use `create(SemSearchToolResultSchema)` to create a new message.
 */
export declare const SemSearchToolResultSchema: GenMessage<SemSearchToolResult>;
/**
 * @generated from message agent.v1.SemSearchToolSuccess
 */
export type SemSearchToolSuccess = Message<"agent.v1.SemSearchToolSuccess"> & {
    /**
     * @generated from field: string results = 1;
     */
    results: string;
    /**
     * @generated from field: repeated bytes code_results = 2;
     */
    codeResults: Uint8Array[];
};
/**
 * Describes the message agent.v1.SemSearchToolSuccess.
 * Use `create(SemSearchToolSuccessSchema)` to create a new message.
 */
export declare const SemSearchToolSuccessSchema: GenMessage<SemSearchToolSuccess>;
/**
 * @generated from message agent.v1.SemSearchToolError
 */
export type SemSearchToolError = Message<"agent.v1.SemSearchToolError"> & {
    /**
     * @generated from field: string error_message = 1;
     */
    errorMessage: string;
};
/**
 * Describes the message agent.v1.SemSearchToolError.
 * Use `create(SemSearchToolErrorSchema)` to create a new message.
 */
export declare const SemSearchToolErrorSchema: GenMessage<SemSearchToolError>;
/**
 * @generated from message agent.v1.ListMcpResourcesToolCall
 */
export type ListMcpResourcesToolCall = Message<"agent.v1.ListMcpResourcesToolCall"> & {
    /**
     * @generated from field: agent.v1.ListMcpResourcesExecArgs args = 1;
     */
    args?: ListMcpResourcesExecArgs | undefined;
    /**
     * @generated from field: agent.v1.ListMcpResourcesExecResult result = 2;
     */
    result?: ListMcpResourcesExecResult | undefined;
};
/**
 * Describes the message agent.v1.ListMcpResourcesToolCall.
 * Use `create(ListMcpResourcesToolCallSchema)` to create a new message.
 */
export declare const ListMcpResourcesToolCallSchema: GenMessage<ListMcpResourcesToolCall>;
/**
 * @generated from message agent.v1.ReadMcpResourceToolCall
 */
export type ReadMcpResourceToolCall = Message<"agent.v1.ReadMcpResourceToolCall"> & {
    /**
     * @generated from field: agent.v1.ReadMcpResourceExecArgs args = 1;
     */
    args?: ReadMcpResourceExecArgs | undefined;
    /**
     * @generated from field: agent.v1.ReadMcpResourceExecResult result = 2;
     */
    result?: ReadMcpResourceExecResult | undefined;
};
/**
 * Describes the message agent.v1.ReadMcpResourceToolCall.
 * Use `create(ReadMcpResourceToolCallSchema)` to create a new message.
 */
export declare const ReadMcpResourceToolCallSchema: GenMessage<ReadMcpResourceToolCall>;
/**
 * @generated from message agent.v1.FetchToolCall
 */
export type FetchToolCall = Message<"agent.v1.FetchToolCall"> & {
    /**
     * @generated from field: agent.v1.FetchArgs args = 1;
     */
    args?: FetchArgs | undefined;
    /**
     * @generated from field: agent.v1.FetchResult result = 2;
     */
    result?: FetchResult | undefined;
};
/**
 * Describes the message agent.v1.FetchToolCall.
 * Use `create(FetchToolCallSchema)` to create a new message.
 */
export declare const FetchToolCallSchema: GenMessage<FetchToolCall>;
/**
 * @generated from message agent.v1.RecordScreenToolCall
 */
export type RecordScreenToolCall = Message<"agent.v1.RecordScreenToolCall"> & {
    /**
     * @generated from field: agent.v1.RecordScreenArgs args = 1;
     */
    args?: RecordScreenArgs | undefined;
    /**
     * @generated from field: agent.v1.RecordScreenResult result = 2;
     */
    result?: RecordScreenResult | undefined;
};
/**
 * Describes the message agent.v1.RecordScreenToolCall.
 * Use `create(RecordScreenToolCallSchema)` to create a new message.
 */
export declare const RecordScreenToolCallSchema: GenMessage<RecordScreenToolCall>;
/**
 * @generated from message agent.v1.WriteShellStdinToolCall
 */
export type WriteShellStdinToolCall = Message<"agent.v1.WriteShellStdinToolCall"> & {
    /**
     * @generated from field: agent.v1.WriteShellStdinArgs args = 1;
     */
    args?: WriteShellStdinArgs | undefined;
    /**
     * @generated from field: agent.v1.WriteShellStdinResult result = 2;
     */
    result?: WriteShellStdinResult | undefined;
};
/**
 * Describes the message agent.v1.WriteShellStdinToolCall.
 * Use `create(WriteShellStdinToolCallSchema)` to create a new message.
 */
export declare const WriteShellStdinToolCallSchema: GenMessage<WriteShellStdinToolCall>;
/**
 * @generated from message agent.v1.ReflectArgs
 */
export type ReflectArgs = Message<"agent.v1.ReflectArgs"> & {
    /**
     * @generated from field: string unexpected_action_outcomes = 1;
     */
    unexpectedActionOutcomes: string;
    /**
     * @generated from field: string relevant_instructions = 2;
     */
    relevantInstructions: string;
    /**
     * @generated from field: string scenario_analysis = 3;
     */
    scenarioAnalysis: string;
    /**
     * @generated from field: string critical_synthesis = 4;
     */
    criticalSynthesis: string;
    /**
     * @generated from field: string next_steps = 5;
     */
    nextSteps: string;
    /**
     * @generated from field: string tool_call_id = 6;
     */
    toolCallId: string;
};
/**
 * Describes the message agent.v1.ReflectArgs.
 * Use `create(ReflectArgsSchema)` to create a new message.
 */
export declare const ReflectArgsSchema: GenMessage<ReflectArgs>;
/**
 * @generated from message agent.v1.ReflectResult
 */
export type ReflectResult = Message<"agent.v1.ReflectResult"> & {
    /**
     * @generated from oneof agent.v1.ReflectResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.ReflectSuccess success = 1;
         */
        value: ReflectSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.ReflectError error = 2;
         */
        value: ReflectError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ReflectResult.
 * Use `create(ReflectResultSchema)` to create a new message.
 */
export declare const ReflectResultSchema: GenMessage<ReflectResult>;
/**
 * @generated from message agent.v1.ReflectSuccess
 */
export type ReflectSuccess = Message<"agent.v1.ReflectSuccess"> & {};
/**
 * Describes the message agent.v1.ReflectSuccess.
 * Use `create(ReflectSuccessSchema)` to create a new message.
 */
export declare const ReflectSuccessSchema: GenMessage<ReflectSuccess>;
/**
 * @generated from message agent.v1.ReflectError
 */
export type ReflectError = Message<"agent.v1.ReflectError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.ReflectError.
 * Use `create(ReflectErrorSchema)` to create a new message.
 */
export declare const ReflectErrorSchema: GenMessage<ReflectError>;
/**
 * @generated from message agent.v1.ReflectToolCall
 */
export type ReflectToolCall = Message<"agent.v1.ReflectToolCall"> & {
    /**
     * @generated from field: agent.v1.ReflectArgs args = 1;
     */
    args?: ReflectArgs | undefined;
    /**
     * @generated from field: agent.v1.ReflectResult result = 2;
     */
    result?: ReflectResult | undefined;
};
/**
 * Describes the message agent.v1.ReflectToolCall.
 * Use `create(ReflectToolCallSchema)` to create a new message.
 */
export declare const ReflectToolCallSchema: GenMessage<ReflectToolCall>;
/**
 * @generated from message agent.v1.StartGrindExecutionArgs
 */
export type StartGrindExecutionArgs = Message<"agent.v1.StartGrindExecutionArgs"> & {
    /**
     * Optional explanation for why the agent is requesting to begin executing.
     *
     * @generated from field: optional string explanation = 1;
     */
    explanation?: string | undefined;
    /**
     * @generated from field: string tool_call_id = 2;
     */
    toolCallId: string;
};
/**
 * Describes the message agent.v1.StartGrindExecutionArgs.
 * Use `create(StartGrindExecutionArgsSchema)` to create a new message.
 */
export declare const StartGrindExecutionArgsSchema: GenMessage<StartGrindExecutionArgs>;
/**
 * @generated from message agent.v1.StartGrindExecutionResult
 */
export type StartGrindExecutionResult = Message<"agent.v1.StartGrindExecutionResult"> & {
    /**
     * @generated from oneof agent.v1.StartGrindExecutionResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.StartGrindExecutionSuccess success = 1;
         */
        value: StartGrindExecutionSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.StartGrindExecutionError error = 2;
         */
        value: StartGrindExecutionError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.StartGrindExecutionResult.
 * Use `create(StartGrindExecutionResultSchema)` to create a new message.
 */
export declare const StartGrindExecutionResultSchema: GenMessage<StartGrindExecutionResult>;
/**
 * @generated from message agent.v1.StartGrindExecutionSuccess
 */
export type StartGrindExecutionSuccess = Message<"agent.v1.StartGrindExecutionSuccess"> & {};
/**
 * Describes the message agent.v1.StartGrindExecutionSuccess.
 * Use `create(StartGrindExecutionSuccessSchema)` to create a new message.
 */
export declare const StartGrindExecutionSuccessSchema: GenMessage<StartGrindExecutionSuccess>;
/**
 * @generated from message agent.v1.StartGrindExecutionError
 */
export type StartGrindExecutionError = Message<"agent.v1.StartGrindExecutionError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.StartGrindExecutionError.
 * Use `create(StartGrindExecutionErrorSchema)` to create a new message.
 */
export declare const StartGrindExecutionErrorSchema: GenMessage<StartGrindExecutionError>;
/**
 * @generated from message agent.v1.StartGrindExecutionToolCall
 */
export type StartGrindExecutionToolCall = Message<"agent.v1.StartGrindExecutionToolCall"> & {
    /**
     * @generated from field: agent.v1.StartGrindExecutionArgs args = 1;
     */
    args?: StartGrindExecutionArgs | undefined;
    /**
     * @generated from field: agent.v1.StartGrindExecutionResult result = 2;
     */
    result?: StartGrindExecutionResult | undefined;
};
/**
 * Describes the message agent.v1.StartGrindExecutionToolCall.
 * Use `create(StartGrindExecutionToolCallSchema)` to create a new message.
 */
export declare const StartGrindExecutionToolCallSchema: GenMessage<StartGrindExecutionToolCall>;
/**
 * @generated from message agent.v1.StartGrindPlanningArgs
 */
export type StartGrindPlanningArgs = Message<"agent.v1.StartGrindPlanningArgs"> & {
    /**
     * Optional explanation for why the agent is requesting to return to planning.
     *
     * @generated from field: optional string explanation = 1;
     */
    explanation?: string | undefined;
    /**
     * @generated from field: string tool_call_id = 2;
     */
    toolCallId: string;
};
/**
 * Describes the message agent.v1.StartGrindPlanningArgs.
 * Use `create(StartGrindPlanningArgsSchema)` to create a new message.
 */
export declare const StartGrindPlanningArgsSchema: GenMessage<StartGrindPlanningArgs>;
/**
 * @generated from message agent.v1.StartGrindPlanningResult
 */
export type StartGrindPlanningResult = Message<"agent.v1.StartGrindPlanningResult"> & {
    /**
     * @generated from oneof agent.v1.StartGrindPlanningResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.StartGrindPlanningSuccess success = 1;
         */
        value: StartGrindPlanningSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.StartGrindPlanningError error = 2;
         */
        value: StartGrindPlanningError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.StartGrindPlanningResult.
 * Use `create(StartGrindPlanningResultSchema)` to create a new message.
 */
export declare const StartGrindPlanningResultSchema: GenMessage<StartGrindPlanningResult>;
/**
 * @generated from message agent.v1.StartGrindPlanningSuccess
 */
export type StartGrindPlanningSuccess = Message<"agent.v1.StartGrindPlanningSuccess"> & {};
/**
 * Describes the message agent.v1.StartGrindPlanningSuccess.
 * Use `create(StartGrindPlanningSuccessSchema)` to create a new message.
 */
export declare const StartGrindPlanningSuccessSchema: GenMessage<StartGrindPlanningSuccess>;
/**
 * @generated from message agent.v1.StartGrindPlanningError
 */
export type StartGrindPlanningError = Message<"agent.v1.StartGrindPlanningError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.StartGrindPlanningError.
 * Use `create(StartGrindPlanningErrorSchema)` to create a new message.
 */
export declare const StartGrindPlanningErrorSchema: GenMessage<StartGrindPlanningError>;
/**
 * @generated from message agent.v1.StartGrindPlanningToolCall
 */
export type StartGrindPlanningToolCall = Message<"agent.v1.StartGrindPlanningToolCall"> & {
    /**
     * @generated from field: agent.v1.StartGrindPlanningArgs args = 1;
     */
    args?: StartGrindPlanningArgs | undefined;
    /**
     * @generated from field: agent.v1.StartGrindPlanningResult result = 2;
     */
    result?: StartGrindPlanningResult | undefined;
};
/**
 * Describes the message agent.v1.StartGrindPlanningToolCall.
 * Use `create(StartGrindPlanningToolCallSchema)` to create a new message.
 */
export declare const StartGrindPlanningToolCallSchema: GenMessage<StartGrindPlanningToolCall>;
/**
 * var AgentMode; (function (AgentMode) { AgentMode[AgentMode["UNSPECIFIED"] = 0] = "UNSPECIFIED"; AgentMode[AgentMode["AGENT"] = 1] = "AGENT"; AgentMode[AgentMode["ASK"] = 2] = "ASK"; AgentMode[AgentMode["PLAN"] = 3] = "PLAN"; AgentMode[AgentMode["DEBUG"] = 4] = "DEBUG"; AgentMode[AgentMode["TRIAGE"] = 5] = "TRIAGE"; AgentMode[AgentMode["PROJECT"] = 6] = "PROJECT"; })(AgentMode || (AgentMode = {})); // Retrieve enum metadata with: proto3.getEnumType(AgentMode) proto3/* int32 *\/.C.util.setEnumType(AgentMode, "agent.v1.AgentMode", [ { no: 0, name: "AGENT_MODE_UNSPECIFIED" }, { no: 1, name: "AGENT_MODE_AGENT" }, { no: 2, name: "AGENT_MODE_ASK" }, { no: 3, name: "AGENT_MODE_PLAN" }, { no: 4, name: "AGENT_MODE_DEBUG" }, { no: 5, name: "AGENT_MODE_TRIAGE" }, { no: 6, name: "AGENT_MODE_PROJECT" }, ]);
 *
 * @generated from message agent.v1.TaskArgs
 */
export type TaskArgs = Message<"agent.v1.TaskArgs"> & {
    /**
     * @generated from field: string description = 1;
     */
    description: string;
    /**
     * @generated from field: string prompt = 2;
     */
    prompt: string;
    /**
     * @generated from field: agent.v1.SubagentType subagent_type = 3;
     */
    subagentType?: SubagentType | undefined;
    /**
     * @generated from field: optional string model = 4;
     */
    model?: string | undefined;
    /**
     * @generated from field: optional string resume = 5;
     */
    resume?: string | undefined;
};
/**
 * Describes the message agent.v1.TaskArgs.
 * Use `create(TaskArgsSchema)` to create a new message.
 */
export declare const TaskArgsSchema: GenMessage<TaskArgs>;
/**
 * @generated from message agent.v1.TaskSuccess
 */
export type TaskSuccess = Message<"agent.v1.TaskSuccess"> & {
    /**
     * @generated from field: repeated agent.v1.ConversationStep conversation_steps = 1;
     */
    conversationSteps: ConversationStep[];
    /**
     * @generated from field: optional string agent_id = 2;
     */
    agentId?: string | undefined;
    /**
     * @generated from field: bool is_background = 3;
     */
    isBackground: boolean;
    /**
     * @generated from field: optional uint64 duration_ms = 4;
     */
    durationMs?: bigint | undefined;
};
/**
 * Describes the message agent.v1.TaskSuccess.
 * Use `create(TaskSuccessSchema)` to create a new message.
 */
export declare const TaskSuccessSchema: GenMessage<TaskSuccess>;
/**
 * @generated from message agent.v1.TaskError
 */
export type TaskError = Message<"agent.v1.TaskError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.TaskError.
 * Use `create(TaskErrorSchema)` to create a new message.
 */
export declare const TaskErrorSchema: GenMessage<TaskError>;
/**
 * @generated from message agent.v1.TaskResult
 */
export type TaskResult = Message<"agent.v1.TaskResult"> & {
    /**
     * @generated from oneof agent.v1.TaskResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.TaskSuccess success = 1;
         */
        value: TaskSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.TaskError error = 2;
         */
        value: TaskError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.TaskResult.
 * Use `create(TaskResultSchema)` to create a new message.
 */
export declare const TaskResultSchema: GenMessage<TaskResult>;
/**
 * @generated from message agent.v1.TaskToolCall
 */
export type TaskToolCall = Message<"agent.v1.TaskToolCall"> & {
    /**
     * @generated from field: agent.v1.TaskArgs args = 1;
     */
    args?: TaskArgs | undefined;
    /**
     * @generated from field: agent.v1.TaskResult result = 2;
     */
    result?: TaskResult | undefined;
};
/**
 * Describes the message agent.v1.TaskToolCall.
 * Use `create(TaskToolCallSchema)` to create a new message.
 */
export declare const TaskToolCallSchema: GenMessage<TaskToolCall>;
/**
 * @generated from message agent.v1.TaskToolCallDelta
 */
export type TaskToolCallDelta = Message<"agent.v1.TaskToolCallDelta"> & {
    /**
     * @generated from field: agent.v1.InteractionUpdate interaction_update = 1;
     */
    interactionUpdate?: InteractionUpdate | undefined;
};
/**
 * Describes the message agent.v1.TaskToolCallDelta.
 * Use `create(TaskToolCallDeltaSchema)` to create a new message.
 */
export declare const TaskToolCallDeltaSchema: GenMessage<TaskToolCallDelta>;
/**
 * Tool messages (from tool.proto)
 *
 * @generated from message agent.v1.ToolCall
 */
export type ToolCall = Message<"agent.v1.ToolCall"> & {
    /**
     * @generated from oneof agent.v1.ToolCall.tool
     */
    tool: {
        /**
         * @generated from field: agent.v1.ShellToolCall shell_tool_call = 1;
         */
        value: ShellToolCall;
        case: "shellToolCall";
    } | {
        /**
         * @generated from field: agent.v1.DeleteToolCall delete_tool_call = 3;
         */
        value: DeleteToolCall;
        case: "deleteToolCall";
    } | {
        /**
         * @generated from field: agent.v1.GlobToolCall glob_tool_call = 4;
         */
        value: GlobToolCall;
        case: "globToolCall";
    } | {
        /**
         * @generated from field: agent.v1.GrepToolCall grep_tool_call = 5;
         */
        value: GrepToolCall;
        case: "grepToolCall";
    } | {
        /**
         * @generated from field: agent.v1.ReadToolCall read_tool_call = 8;
         */
        value: ReadToolCall;
        case: "readToolCall";
    } | {
        /**
         * @generated from field: agent.v1.UpdateTodosToolCall update_todos_tool_call = 9;
         */
        value: UpdateTodosToolCall;
        case: "updateTodosToolCall";
    } | {
        /**
         * @generated from field: agent.v1.ReadTodosToolCall read_todos_tool_call = 10;
         */
        value: ReadTodosToolCall;
        case: "readTodosToolCall";
    } | {
        /**
         * @generated from field: agent.v1.EditToolCall edit_tool_call = 12;
         */
        value: EditToolCall;
        case: "editToolCall";
    } | {
        /**
         * @generated from field: agent.v1.LsToolCall ls_tool_call = 13;
         */
        value: LsToolCall;
        case: "lsToolCall";
    } | {
        /**
         * @generated from field: agent.v1.ReadLintsToolCall read_lints_tool_call = 14;
         */
        value: ReadLintsToolCall;
        case: "readLintsToolCall";
    } | {
        /**
         * @generated from field: agent.v1.McpToolCall mcp_tool_call = 15;
         */
        value: McpToolCall;
        case: "mcpToolCall";
    } | {
        /**
         * @generated from field: agent.v1.SemSearchToolCall sem_search_tool_call = 16;
         */
        value: SemSearchToolCall;
        case: "semSearchToolCall";
    } | {
        /**
         * @generated from field: agent.v1.CreatePlanToolCall create_plan_tool_call = 17;
         */
        value: CreatePlanToolCall;
        case: "createPlanToolCall";
    } | {
        /**
         * @generated from field: agent.v1.WebSearchToolCall web_search_tool_call = 18;
         */
        value: WebSearchToolCall;
        case: "webSearchToolCall";
    } | {
        /**
         * @generated from field: agent.v1.TaskToolCall task_tool_call = 19;
         */
        value: TaskToolCall;
        case: "taskToolCall";
    } | {
        /**
         * @generated from field: agent.v1.ListMcpResourcesToolCall list_mcp_resources_tool_call = 20;
         */
        value: ListMcpResourcesToolCall;
        case: "listMcpResourcesToolCall";
    } | {
        /**
         * @generated from field: agent.v1.ReadMcpResourceToolCall read_mcp_resource_tool_call = 21;
         */
        value: ReadMcpResourceToolCall;
        case: "readMcpResourceToolCall";
    } | {
        /**
         * @generated from field: agent.v1.ApplyAgentDiffToolCall apply_agent_diff_tool_call = 22;
         */
        value: ApplyAgentDiffToolCall;
        case: "applyAgentDiffToolCall";
    } | {
        /**
         * @generated from field: agent.v1.AskQuestionToolCall ask_question_tool_call = 23;
         */
        value: AskQuestionToolCall;
        case: "askQuestionToolCall";
    } | {
        /**
         * @generated from field: agent.v1.FetchToolCall fetch_tool_call = 24;
         */
        value: FetchToolCall;
        case: "fetchToolCall";
    } | {
        /**
         * @generated from field: agent.v1.SwitchModeToolCall switch_mode_tool_call = 25;
         */
        value: SwitchModeToolCall;
        case: "switchModeToolCall";
    } | {
        /**
         * @generated from field: agent.v1.ExaSearchToolCall exa_search_tool_call = 26;
         */
        value: ExaSearchToolCall;
        case: "exaSearchToolCall";
    } | {
        /**
         * @generated from field: agent.v1.ExaFetchToolCall exa_fetch_tool_call = 27;
         */
        value: ExaFetchToolCall;
        case: "exaFetchToolCall";
    } | {
        /**
         * @generated from field: agent.v1.GenerateImageToolCall generate_image_tool_call = 28;
         */
        value: GenerateImageToolCall;
        case: "generateImageToolCall";
    } | {
        /**
         * @generated from field: agent.v1.RecordScreenToolCall record_screen_tool_call = 29;
         */
        value: RecordScreenToolCall;
        case: "recordScreenToolCall";
    } | {
        /**
         * @generated from field: agent.v1.ComputerUseToolCall computer_use_tool_call = 30;
         */
        value: ComputerUseToolCall;
        case: "computerUseToolCall";
    } | {
        /**
         * @generated from field: agent.v1.WriteShellStdinToolCall write_shell_stdin_tool_call = 31;
         */
        value: WriteShellStdinToolCall;
        case: "writeShellStdinToolCall";
    } | {
        /**
         * @generated from field: agent.v1.ReflectToolCall reflect_tool_call = 32;
         */
        value: ReflectToolCall;
        case: "reflectToolCall";
    } | {
        /**
         * @generated from field: agent.v1.SetupVmEnvironmentToolCall setup_vm_environment_tool_call = 33;
         */
        value: SetupVmEnvironmentToolCall;
        case: "setupVmEnvironmentToolCall";
    } | {
        /**
         * @generated from field: agent.v1.TruncatedToolCall truncated_tool_call = 34;
         */
        value: TruncatedToolCall;
        case: "truncatedToolCall";
    } | {
        /**
         * @generated from field: agent.v1.StartGrindExecutionToolCall start_grind_execution_tool_call = 35;
         */
        value: StartGrindExecutionToolCall;
        case: "startGrindExecutionToolCall";
    } | {
        /**
         * @generated from field: agent.v1.StartGrindPlanningToolCall start_grind_planning_tool_call = 36;
         */
        value: StartGrindPlanningToolCall;
        case: "startGrindPlanningToolCall";
    } | {
        /**
         * @generated from field: agent.v1.PiReadToolCall pi_read_tool_call = 61;
         */
        value: PiReadToolCall;
        case: "piReadToolCall";
    } | {
        /**
         * @generated from field: agent.v1.PiBashToolCall pi_bash_tool_call = 62;
         */
        value: PiBashToolCall;
        case: "piBashToolCall";
    } | {
        /**
         * @generated from field: agent.v1.PiEditToolCall pi_edit_tool_call = 63;
         */
        value: PiEditToolCall;
        case: "piEditToolCall";
    } | {
        /**
         * @generated from field: agent.v1.PiWriteToolCall pi_write_tool_call = 64;
         */
        value: PiWriteToolCall;
        case: "piWriteToolCall";
    } | {
        /**
         * @generated from field: agent.v1.PiGrepToolCall pi_grep_tool_call = 65;
         */
        value: PiGrepToolCall;
        case: "piGrepToolCall";
    } | {
        /**
         * @generated from field: agent.v1.PiFindToolCall pi_find_tool_call = 66;
         */
        value: PiFindToolCall;
        case: "piFindToolCall";
    } | {
        /**
         * @generated from field: agent.v1.PiLsToolCall pi_ls_tool_call = 67;
         */
        value: PiLsToolCall;
        case: "piLsToolCall";
    } | {
        /**
         * @generated from field: agent.v1.ConnectScmToolCall connect_scm_tool_call = 68;
         */
        value: ConnectScmToolCall;
        case: "connectScmToolCall";
    } | {
        /**
         * @generated from field: agent.v1.SearchConversationsToolCall search_conversations_tool_call = 69;
         */
        value: SearchConversationsToolCall;
        case: "searchConversationsToolCall";
    } | {
        case: undefined;
        value?: undefined;
    };
    /**
     * Modern builds carry the call id on the envelope instead of inside each
     * variant's args. Fields 37-53, 55, 56, 58 (further tool variants) and 54
     * (hook_additional_contexts), 59/60 (started_at_ms/completed_at_ms) are not
     * modelled and decode into unknown fields; do not reuse those numbers.
     *
     * @generated from field: optional string tool_call_id = 57;
     */
    toolCallId?: string | undefined;
};
/**
 * Describes the message agent.v1.ToolCall.
 * Use `create(ToolCallSchema)` to create a new message.
 */
export declare const ToolCallSchema: GenMessage<ToolCall>;
/**
 * @generated from message agent.v1.TruncatedToolCallArgs
 */
export type TruncatedToolCallArgs = Message<"agent.v1.TruncatedToolCallArgs"> & {};
/**
 * Describes the message agent.v1.TruncatedToolCallArgs.
 * Use `create(TruncatedToolCallArgsSchema)` to create a new message.
 */
export declare const TruncatedToolCallArgsSchema: GenMessage<TruncatedToolCallArgs>;
/**
 * @generated from message agent.v1.TruncatedToolCallSuccess
 */
export type TruncatedToolCallSuccess = Message<"agent.v1.TruncatedToolCallSuccess"> & {};
/**
 * Describes the message agent.v1.TruncatedToolCallSuccess.
 * Use `create(TruncatedToolCallSuccessSchema)` to create a new message.
 */
export declare const TruncatedToolCallSuccessSchema: GenMessage<TruncatedToolCallSuccess>;
/**
 * @generated from message agent.v1.TruncatedToolCallError
 */
export type TruncatedToolCallError = Message<"agent.v1.TruncatedToolCallError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.TruncatedToolCallError.
 * Use `create(TruncatedToolCallErrorSchema)` to create a new message.
 */
export declare const TruncatedToolCallErrorSchema: GenMessage<TruncatedToolCallError>;
/**
 * @generated from message agent.v1.TruncatedToolCallResult
 */
export type TruncatedToolCallResult = Message<"agent.v1.TruncatedToolCallResult"> & {
    /**
     * @generated from oneof agent.v1.TruncatedToolCallResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.TruncatedToolCallSuccess success = 1;
         */
        value: TruncatedToolCallSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.TruncatedToolCallError error = 2;
         */
        value: TruncatedToolCallError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.TruncatedToolCallResult.
 * Use `create(TruncatedToolCallResultSchema)` to create a new message.
 */
export declare const TruncatedToolCallResultSchema: GenMessage<TruncatedToolCallResult>;
/**
 * Placeholder for tool calls that were truncated due to size limits.
 *
 * @generated from message agent.v1.TruncatedToolCall
 */
export type TruncatedToolCall = Message<"agent.v1.TruncatedToolCall"> & {
    /**
     * @generated from field: bytes original_step_blob_id = 1;
     */
    originalStepBlobId: Uint8Array;
    /**
     * unused, just matches the discriminated union for other tool calls
     *
     * @generated from field: agent.v1.TruncatedToolCallArgs args = 2;
     */
    args?: TruncatedToolCallArgs | undefined;
    /**
     * @generated from field: agent.v1.TruncatedToolCallResult result = 3;
     */
    result?: TruncatedToolCallResult | undefined;
};
/**
 * Describes the message agent.v1.TruncatedToolCall.
 * Use `create(TruncatedToolCallSchema)` to create a new message.
 */
export declare const TruncatedToolCallSchema: GenMessage<TruncatedToolCall>;
/**
 * @generated from message agent.v1.ToolCallDelta
 */
export type ToolCallDelta = Message<"agent.v1.ToolCallDelta"> & {
    /**
     * @generated from oneof agent.v1.ToolCallDelta.delta
     */
    delta: {
        /**
         * @generated from field: agent.v1.ShellToolCallDelta shell_tool_call_delta = 1;
         */
        value: ShellToolCallDelta;
        case: "shellToolCallDelta";
    } | {
        /**
         * @generated from field: agent.v1.TaskToolCallDelta task_tool_call_delta = 2;
         */
        value: TaskToolCallDelta;
        case: "taskToolCallDelta";
    } | {
        /**
         * @generated from field: agent.v1.EditToolCallDelta edit_tool_call_delta = 3;
         */
        value: EditToolCallDelta;
        case: "editToolCallDelta";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ToolCallDelta.
 * Use `create(ToolCallDeltaSchema)` to create a new message.
 */
export declare const ToolCallDeltaSchema: GenMessage<ToolCallDelta>;
/**
 * @generated from message agent.v1.ConversationStep
 */
export type ConversationStep = Message<"agent.v1.ConversationStep"> & {
    /**
     * @generated from oneof agent.v1.ConversationStep.message
     */
    message: {
        /**
         * @generated from field: agent.v1.AssistantMessage assistant_message = 1;
         */
        value: AssistantMessage;
        case: "assistantMessage";
    } | {
        /**
         * @generated from field: agent.v1.ToolCall tool_call = 2;
         */
        value: ToolCall;
        case: "toolCall";
    } | {
        /**
         * @generated from field: agent.v1.ThinkingMessage thinking_message = 3;
         */
        value: ThinkingMessage;
        case: "thinkingMessage";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ConversationStep.
 * Use `create(ConversationStepSchema)` to create a new message.
 */
export declare const ConversationStepSchema: GenMessage<ConversationStep>;
/**
 * @generated from message agent.v1.ConversationAction
 */
export type ConversationAction = Message<"agent.v1.ConversationAction"> & {
    /**
     * @generated from oneof agent.v1.ConversationAction.action
     */
    action: {
        /**
         * @generated from field: agent.v1.UserMessageAction user_message_action = 1;
         */
        value: UserMessageAction;
        case: "userMessageAction";
    } | {
        /**
         * @generated from field: agent.v1.ResumeAction resume_action = 2;
         */
        value: ResumeAction;
        case: "resumeAction";
    } | {
        /**
         * @generated from field: agent.v1.CancelAction cancel_action = 3;
         */
        value: CancelAction;
        case: "cancelAction";
    } | {
        /**
         * @generated from field: agent.v1.SummarizeAction summarize_action = 4;
         */
        value: SummarizeAction;
        case: "summarizeAction";
    } | {
        /**
         * @generated from field: agent.v1.ShellCommandAction shell_command_action = 5;
         */
        value: ShellCommandAction;
        case: "shellCommandAction";
    } | {
        /**
         * @generated from field: agent.v1.StartPlanAction start_plan_action = 6;
         */
        value: StartPlanAction;
        case: "startPlanAction";
    } | {
        /**
         * @generated from field: agent.v1.ExecutePlanAction execute_plan_action = 7;
         */
        value: ExecutePlanAction;
        case: "executePlanAction";
    } | {
        /**
         * @generated from field: agent.v1.AsyncAskQuestionCompletionAction async_ask_question_completion_action = 8;
         */
        value: AsyncAskQuestionCompletionAction;
        case: "asyncAskQuestionCompletionAction";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ConversationAction.
 * Use `create(ConversationActionSchema)` to create a new message.
 */
export declare const ConversationActionSchema: GenMessage<ConversationAction>;
/**
 * @generated from message agent.v1.UserMessageAction
 */
export type UserMessageAction = Message<"agent.v1.UserMessageAction"> & {
    /**
     * @generated from field: agent.v1.UserMessage user_message = 1;
     */
    userMessage?: UserMessage | undefined;
    /**
     * @generated from field: agent.v1.RequestContext request_context = 2;
     */
    requestContext?: RequestContext | undefined;
    /**
     * @generated from field: optional bool send_to_interaction_listener = 3;
     */
    sendToInteractionListener?: boolean | undefined;
};
/**
 * Describes the message agent.v1.UserMessageAction.
 * Use `create(UserMessageActionSchema)` to create a new message.
 */
export declare const UserMessageActionSchema: GenMessage<UserMessageAction>;
/**
 * @generated from message agent.v1.CancelAction
 */
export type CancelAction = Message<"agent.v1.CancelAction"> & {};
/**
 * Describes the message agent.v1.CancelAction.
 * Use `create(CancelActionSchema)` to create a new message.
 */
export declare const CancelActionSchema: GenMessage<CancelAction>;
/**
 * @generated from message agent.v1.ResumeAction
 */
export type ResumeAction = Message<"agent.v1.ResumeAction"> & {
    /**
     * @generated from field: agent.v1.RequestContext request_context = 2;
     */
    requestContext?: RequestContext | undefined;
};
/**
 * Describes the message agent.v1.ResumeAction.
 * Use `create(ResumeActionSchema)` to create a new message.
 */
export declare const ResumeActionSchema: GenMessage<ResumeAction>;
/**
 * @generated from message agent.v1.AsyncAskQuestionCompletionAction
 */
export type AsyncAskQuestionCompletionAction = Message<"agent.v1.AsyncAskQuestionCompletionAction"> & {
    /**
     * Contains the original tool call ID and the result from the user
     *
     * @generated from field: string original_tool_call_id = 1;
     */
    originalToolCallId: string;
    /**
     * @generated from field: agent.v1.AskQuestionArgs original_args = 2;
     */
    originalArgs?: AskQuestionArgs | undefined;
    /**
     * @generated from field: agent.v1.AskQuestionResult result = 3;
     */
    result?: AskQuestionResult | undefined;
};
/**
 * Describes the message agent.v1.AsyncAskQuestionCompletionAction.
 * Use `create(AsyncAskQuestionCompletionActionSchema)` to create a new message.
 */
export declare const AsyncAskQuestionCompletionActionSchema: GenMessage<AsyncAskQuestionCompletionAction>;
/**
 * @generated from message agent.v1.SummarizeAction
 */
export type SummarizeAction = Message<"agent.v1.SummarizeAction"> & {};
/**
 * Describes the message agent.v1.SummarizeAction.
 * Use `create(SummarizeActionSchema)` to create a new message.
 */
export declare const SummarizeActionSchema: GenMessage<SummarizeAction>;
/**
 * @generated from message agent.v1.ShellCommandAction
 */
export type ShellCommandAction = Message<"agent.v1.ShellCommandAction"> & {
    /**
     * @generated from field: agent.v1.ShellCommand shell_command = 1;
     */
    shellCommand?: ShellCommand | undefined;
    /**
     * unique identifier for preemptive exec attachment
     *
     * @generated from field: string exec_id = 2;
     */
    execId: string;
};
/**
 * Describes the message agent.v1.ShellCommandAction.
 * Use `create(ShellCommandActionSchema)` to create a new message.
 */
export declare const ShellCommandActionSchema: GenMessage<ShellCommandAction>;
/**
 * @generated from message agent.v1.StartPlanAction
 */
export type StartPlanAction = Message<"agent.v1.StartPlanAction"> & {
    /**
     * @generated from field: agent.v1.UserMessage user_message = 1;
     */
    userMessage?: UserMessage | undefined;
    /**
     * @generated from field: agent.v1.RequestContext request_context = 2;
     */
    requestContext?: RequestContext | undefined;
    /**
     * @generated from field: bool is_spec = 3;
     */
    isSpec: boolean;
};
/**
 * Describes the message agent.v1.StartPlanAction.
 * Use `create(StartPlanActionSchema)` to create a new message.
 */
export declare const StartPlanActionSchema: GenMessage<StartPlanAction>;
/**
 * @generated from message agent.v1.ExecutePlanAction
 */
export type ExecutePlanAction = Message<"agent.v1.ExecutePlanAction"> & {
    /**
     * @generated from field: agent.v1.RequestContext request_context = 1;
     */
    requestContext?: RequestContext | undefined;
    /**
     * @generated from field: optional agent.v1.ConversationPlan plan = 2;
     */
    plan?: ConversationPlan | undefined;
    /**
     * e.g., "cursor-plan://composerId/plan.md"
     *
     * @generated from field: optional string plan_file_uri = 3;
     */
    planFileUri?: string | undefined;
    /**
     * The actual plan content from the file
     *
     * @generated from field: optional string plan_file_content = 4;
     */
    planFileContent?: string | undefined;
};
/**
 * Describes the message agent.v1.ExecutePlanAction.
 * Use `create(ExecutePlanActionSchema)` to create a new message.
 */
export declare const ExecutePlanActionSchema: GenMessage<ExecutePlanAction>;
/**
 * @generated from message agent.v1.UserMessage
 */
export type UserMessage = Message<"agent.v1.UserMessage"> & {
    /**
     * @generated from field: string text = 1;
     */
    text: string;
    /**
     * @generated from field: string message_id = 2;
     */
    messageId: string;
    /**
     * @generated from field: optional agent.v1.SelectedContext selected_context = 3;
     */
    selectedContext?: SelectedContext | undefined;
    /**
     * @generated from field: int32 mode = 4;
     */
    mode: number;
    /**
     * @generated from field: optional bool is_simulated_msg = 5;
     */
    isSimulatedMsg?: boolean | undefined;
    /**
     * @generated from field: optional string best_of_n_group_id = 6;
     */
    bestOfNGroupId?: string | undefined;
    /**
     * @generated from field: optional bool try_use_best_of_n_promotion = 7;
     */
    tryUseBestOfNPromotion?: boolean | undefined;
    /**
     * @generated from field: optional string rich_text = 8;
     */
    richText?: string | undefined;
};
/**
 * Describes the message agent.v1.UserMessage.
 * Use `create(UserMessageSchema)` to create a new message.
 */
export declare const UserMessageSchema: GenMessage<UserMessage>;
/**
 * @generated from message agent.v1.AssistantMessage
 */
export type AssistantMessage = Message<"agent.v1.AssistantMessage"> & {
    /**
     * @generated from field: string text = 1;
     */
    text: string;
};
/**
 * Describes the message agent.v1.AssistantMessage.
 * Use `create(AssistantMessageSchema)` to create a new message.
 */
export declare const AssistantMessageSchema: GenMessage<AssistantMessage>;
/**
 * @generated from message agent.v1.ThinkingMessage
 */
export type ThinkingMessage = Message<"agent.v1.ThinkingMessage"> & {
    /**
     * @generated from field: string text = 1;
     */
    text: string;
    /**
     * @generated from field: uint32 duration_ms = 2;
     */
    durationMs: number;
};
/**
 * Describes the message agent.v1.ThinkingMessage.
 * Use `create(ThinkingMessageSchema)` to create a new message.
 */
export declare const ThinkingMessageSchema: GenMessage<ThinkingMessage>;
/**
 * @generated from message agent.v1.ShellCommand
 */
export type ShellCommand = Message<"agent.v1.ShellCommand"> & {
    /**
     * @generated from field: string command = 1;
     */
    command: string;
};
/**
 * Describes the message agent.v1.ShellCommand.
 * Use `create(ShellCommandSchema)` to create a new message.
 */
export declare const ShellCommandSchema: GenMessage<ShellCommand>;
/**
 * @generated from message agent.v1.ShellOutput
 */
export type ShellOutput = Message<"agent.v1.ShellOutput"> & {
    /**
     * @generated from field: string stdout = 1;
     */
    stdout: string;
    /**
     * @generated from field: string stderr = 2;
     */
    stderr: string;
    /**
     * @generated from field: int32 exit_code = 3;
     */
    exitCode: number;
};
/**
 * Describes the message agent.v1.ShellOutput.
 * Use `create(ShellOutputSchema)` to create a new message.
 */
export declare const ShellOutputSchema: GenMessage<ShellOutput>;
/**
 * @generated from message agent.v1.ConversationTurn
 */
export type ConversationTurn = Message<"agent.v1.ConversationTurn"> & {
    /**
     * @generated from oneof agent.v1.ConversationTurn.turn
     */
    turn: {
        /**
         * @generated from field: agent.v1.AgentConversationTurn agent_conversation_turn = 1;
         */
        value: AgentConversationTurn;
        case: "agentConversationTurn";
    } | {
        /**
         * @generated from field: agent.v1.ShellConversationTurn shell_conversation_turn = 2;
         */
        value: ShellConversationTurn;
        case: "shellConversationTurn";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ConversationTurn.
 * Use `create(ConversationTurnSchema)` to create a new message.
 */
export declare const ConversationTurnSchema: GenMessage<ConversationTurn>;
/**
 * @generated from message agent.v1.ConversationPlan
 */
export type ConversationPlan = Message<"agent.v1.ConversationPlan"> & {
    /**
     * @generated from field: string plan = 1;
     */
    plan: string;
};
/**
 * Describes the message agent.v1.ConversationPlan.
 * Use `create(ConversationPlanSchema)` to create a new message.
 */
export declare const ConversationPlanSchema: GenMessage<ConversationPlan>;
/**
 * @generated from message agent.v1.ConversationTurnStructure
 */
export type ConversationTurnStructure = Message<"agent.v1.ConversationTurnStructure"> & {
    /**
     * @generated from oneof agent.v1.ConversationTurnStructure.turn
     */
    turn: {
        /**
         * @generated from field: agent.v1.AgentConversationTurnStructure agent_conversation_turn = 1;
         */
        value: AgentConversationTurnStructure;
        case: "agentConversationTurn";
    } | {
        /**
         * @generated from field: agent.v1.ShellConversationTurnStructure shell_conversation_turn = 2;
         */
        value: ShellConversationTurnStructure;
        case: "shellConversationTurn";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ConversationTurnStructure.
 * Use `create(ConversationTurnStructureSchema)` to create a new message.
 */
export declare const ConversationTurnStructureSchema: GenMessage<ConversationTurnStructure>;
/**
 * @generated from message agent.v1.AgentConversationTurn
 */
export type AgentConversationTurn = Message<"agent.v1.AgentConversationTurn"> & {
    /**
     * @generated from field: agent.v1.UserMessage user_message = 1;
     */
    userMessage?: UserMessage | undefined;
    /**
     * @generated from field: repeated agent.v1.ConversationStep steps = 2;
     */
    steps: ConversationStep[];
    /**
     * The request ID associated with this turn, used for analytics tracking
     *
     * @generated from field: optional string request_id = 3;
     */
    requestId?: string | undefined;
};
/**
 * Describes the message agent.v1.AgentConversationTurn.
 * Use `create(AgentConversationTurnSchema)` to create a new message.
 */
export declare const AgentConversationTurnSchema: GenMessage<AgentConversationTurn>;
/**
 * @generated from message agent.v1.AgentConversationTurnStructure
 */
export type AgentConversationTurnStructure = Message<"agent.v1.AgentConversationTurnStructure"> & {
    /**
     * @generated from field: bytes user_message = 1;
     */
    userMessage: Uint8Array;
    /**
     * @generated from field: repeated bytes steps = 2;
     */
    steps: Uint8Array[];
    /**
     * The request ID associated with this turn, used for analytics tracking
     *
     * @generated from field: optional string request_id = 3;
     */
    requestId?: string | undefined;
};
/**
 * Describes the message agent.v1.AgentConversationTurnStructure.
 * Use `create(AgentConversationTurnStructureSchema)` to create a new message.
 */
export declare const AgentConversationTurnStructureSchema: GenMessage<AgentConversationTurnStructure>;
/**
 * @generated from message agent.v1.ShellConversationTurn
 */
export type ShellConversationTurn = Message<"agent.v1.ShellConversationTurn"> & {
    /**
     * @generated from field: agent.v1.ShellCommand shell_command = 1;
     */
    shellCommand?: ShellCommand | undefined;
    /**
     * @generated from field: agent.v1.ShellOutput shell_output = 2;
     */
    shellOutput?: ShellOutput | undefined;
};
/**
 * Describes the message agent.v1.ShellConversationTurn.
 * Use `create(ShellConversationTurnSchema)` to create a new message.
 */
export declare const ShellConversationTurnSchema: GenMessage<ShellConversationTurn>;
/**
 * @generated from message agent.v1.ShellConversationTurnStructure
 */
export type ShellConversationTurnStructure = Message<"agent.v1.ShellConversationTurnStructure"> & {
    /**
     * @generated from field: bytes shell_command = 1;
     */
    shellCommand: Uint8Array;
    /**
     * @generated from field: bytes shell_output = 2;
     */
    shellOutput: Uint8Array;
};
/**
 * Describes the message agent.v1.ShellConversationTurnStructure.
 * Use `create(ShellConversationTurnStructureSchema)` to create a new message.
 */
export declare const ShellConversationTurnStructureSchema: GenMessage<ShellConversationTurnStructure>;
/**
 * @generated from message agent.v1.ConversationSummary
 */
export type ConversationSummary = Message<"agent.v1.ConversationSummary"> & {
    /**
     * @generated from field: string summary = 1;
     */
    summary: string;
};
/**
 * Describes the message agent.v1.ConversationSummary.
 * Use `create(ConversationSummarySchema)` to create a new message.
 */
export declare const ConversationSummarySchema: GenMessage<ConversationSummary>;
/**
 * @generated from message agent.v1.ConversationSummaryArchive
 */
export type ConversationSummaryArchive = Message<"agent.v1.ConversationSummaryArchive"> & {
    /**
     * @generated from field: repeated bytes summarized_messages = 1;
     */
    summarizedMessages: Uint8Array[];
    /**
     * @generated from field: string summary = 2;
     */
    summary: string;
    /**
     * @generated from field: uint32 window_tail = 3;
     */
    windowTail: number;
    /**
     * @generated from field: bytes summary_message = 4;
     */
    summaryMessage: Uint8Array;
};
/**
 * Describes the message agent.v1.ConversationSummaryArchive.
 * Use `create(ConversationSummaryArchiveSchema)` to create a new message.
 */
export declare const ConversationSummaryArchiveSchema: GenMessage<ConversationSummaryArchive>;
/**
 * @generated from message agent.v1.ConversationTokenDetails
 */
export type ConversationTokenDetails = Message<"agent.v1.ConversationTokenDetails"> & {
    /**
     * @generated from field: uint32 used_tokens = 1;
     */
    usedTokens: number;
    /**
     * @generated from field: uint32 max_tokens = 2;
     */
    maxTokens: number;
};
/**
 * Describes the message agent.v1.ConversationTokenDetails.
 * Use `create(ConversationTokenDetailsSchema)` to create a new message.
 */
export declare const ConversationTokenDetailsSchema: GenMessage<ConversationTokenDetails>;
/**
 * @generated from message agent.v1.FileState
 */
export type FileState = Message<"agent.v1.FileState"> & {
    /**
     * Optional content. If not set or undefined, the file is considered deleted.
     *
     * @generated from field: optional string content = 1;
     */
    content?: string | undefined;
    /**
     * Optional initial content captured when the file was first tracked. If not set or undefined, the file did not exist when tracking began.
     *
     * @generated from field: optional string initial_content = 2;
     */
    initialContent?: string | undefined;
};
/**
 * Describes the message agent.v1.FileState.
 * Use `create(FileStateSchema)` to create a new message.
 */
export declare const FileStateSchema: GenMessage<FileState>;
/**
 * @generated from message agent.v1.FileStateStructure
 */
export type FileStateStructure = Message<"agent.v1.FileStateStructure"> & {
    /**
     * Optional content. If not set or undefined, the file is considered deleted.
     *
     * @generated from field: optional bytes content = 1;
     */
    content?: Uint8Array | undefined;
    /**
     * Optional initial content captured when the file was first tracked. If not set or undefined, the file did not exist when tracking began.
     *
     * @generated from field: optional bytes initial_content = 2;
     */
    initialContent?: Uint8Array | undefined;
};
/**
 * Describes the message agent.v1.FileStateStructure.
 * Use `create(FileStateStructureSchema)` to create a new message.
 */
export declare const FileStateStructureSchema: GenMessage<FileStateStructure>;
/**
 * @generated from message agent.v1.StepTiming
 */
export type StepTiming = Message<"agent.v1.StepTiming"> & {
    /**
     * @generated from field: uint64 duration_ms = 1;
     */
    durationMs: bigint;
    /**
     * @generated from field: uint64 timestamp_ms = 2;
     */
    timestampMs: bigint;
};
/**
 * Describes the message agent.v1.StepTiming.
 * Use `create(StepTimingSchema)` to create a new message.
 */
export declare const StepTimingSchema: GenMessage<StepTiming>;
/**
 * @generated from message agent.v1.ConversationState
 */
export type ConversationState = Message<"agent.v1.ConversationState"> & {
    /**
     * @generated from field: repeated string root_prompt_messages_json = 1;
     */
    rootPromptMessagesJson: string[];
    /**
     * @generated from field: repeated agent.v1.ConversationTurn turns = 8;
     */
    turns: ConversationTurn[];
    /**
     * @generated from field: repeated agent.v1.TodoItem todos = 3;
     */
    todos: TodoItem[];
    /**
     * Raw JSON stringified tool-call content parts awaiting execution
     *
     * @generated from field: repeated string pending_tool_calls = 4;
     */
    pendingToolCalls: string[];
    /**
     * @generated from field: agent.v1.ConversationTokenDetails token_details = 5;
     */
    tokenDetails?: ConversationTokenDetails | undefined;
    /**
     * only for when the user explicitly asks for a summary through the summary action
     *
     * @generated from field: optional agent.v1.ConversationSummary summary = 6;
     */
    summary?: ConversationSummary | undefined;
    /**
     * @generated from field: optional agent.v1.ConversationPlan plan = 7;
     */
    plan?: ConversationPlan | undefined;
    /**
     * @generated from field: optional agent.v1.ConversationSummaryArchive summary_archive = 9;
     */
    summaryArchive?: ConversationSummaryArchive | undefined;
    /**
     * Deprecated, use summary_archives instead @deprecated summaryArchive;
     *
     * @generated from field: map<string, agent.v1.FileState> file_states = 10;
     */
    fileStates: {
        [key: string]: FileState;
    };
    /**
     * @generated from field: repeated agent.v1.ConversationSummaryArchive summary_archives = 11;
     */
    summaryArchives: ConversationSummaryArchive[];
};
/**
 * Describes the message agent.v1.ConversationState.
 * Use `create(ConversationStateSchema)` to create a new message.
 */
export declare const ConversationStateSchema: GenMessage<ConversationState>;
/**
 * @generated from message agent.v1.SubagentPersistedState
 */
export type SubagentPersistedState = Message<"agent.v1.SubagentPersistedState"> & {
    /**
     * The subagent's conversation state structure
     *
     * @generated from field: agent.v1.ConversationStateStructure conversation_state = 1;
     */
    conversationState?: ConversationStateStructure | undefined;
    /**
     * Timestamp when this subagent was first created
     *
     * @generated from field: uint64 created_timestamp_ms = 2;
     */
    createdTimestampMs: bigint;
    /**
     * Timestamp when this subagent was last used (by task tool call)
     *
     * @generated from field: uint64 last_used_timestamp_ms = 3;
     */
    lastUsedTimestampMs: bigint;
    /**
     * The subagent type (e.g., computerUse, custom with name)
     *
     * @generated from field: agent.v1.SubagentType subagent_type = 4;
     */
    subagentType?: SubagentType | undefined;
};
/**
 * Describes the message agent.v1.SubagentPersistedState.
 * Use `create(SubagentPersistedStateSchema)` to create a new message.
 */
export declare const SubagentPersistedStateSchema: GenMessage<SubagentPersistedState>;
/**
 * @generated from message agent.v1.ConversationStateStructure
 */
export type ConversationStateStructure = Message<"agent.v1.ConversationStateStructure"> & {
    /**
     * @generated from field: repeated bytes turns_old = 2;
     */
    turnsOld: Uint8Array[];
    /**
     * @deprecated turnsOld = [];
     *
     * @generated from field: repeated bytes root_prompt_messages_json = 1;
     */
    rootPromptMessagesJson: Uint8Array[];
    /**
     * @generated from field: repeated bytes turns = 8;
     */
    turns: Uint8Array[];
    /**
     * @generated from field: repeated bytes todos = 3;
     */
    todos: Uint8Array[];
    /**
     * Raw JSON stringified tool-call content parts awaiting execution
     *
     * @generated from field: repeated string pending_tool_calls = 4;
     */
    pendingToolCalls: string[];
    /**
     * @generated from field: agent.v1.ConversationTokenDetails token_details = 5;
     */
    tokenDetails?: ConversationTokenDetails | undefined;
    /**
     * only for when the user explicitly asks for a summary through the summary action
     *
     * @generated from field: optional bytes summary = 6;
     */
    summary?: Uint8Array | undefined;
    /**
     * @generated from field: optional bytes plan = 7;
     */
    plan?: Uint8Array | undefined;
    /**
     * @generated from field: repeated string previous_workspace_uris = 9;
     */
    previousWorkspaceUris: string[];
    /**
     * Current mode of the conversation
     *
     * @generated from field: optional int32 mode = 10;
     */
    mode?: number | undefined;
    /**
     * @generated from field: optional bytes summary_archive = 11;
     */
    summaryArchive?: Uint8Array | undefined;
    /**
     * @generated from field: map<string, bytes> file_states = 12;
     */
    fileStates: {
        [key: string]: Uint8Array;
    };
    /**
     * Deprecated, use summary_archives instead @deprecated summaryArchive; Map of file paths to their latest content (stored as blob IDs in the KV store) Each blob contains a serialized FileState message @deprecated fileStates = {}; Map of file paths to their latest content (stored as FileStateStructure)
     *
     * @generated from field: map<string, agent.v1.FileStateStructure> file_states_v2 = 15;
     */
    fileStatesV2: {
        [key: string]: FileStateStructure;
    };
    /**
     * @generated from field: repeated bytes summary_archives = 13;
     */
    summaryArchives: Uint8Array[];
    /**
     * @generated from field: repeated agent.v1.StepTiming turn_timings = 14;
     */
    turnTimings: StepTiming[];
    /**
     * Subagent resume tracking Map of subagent ID to the persisted subagent state (stored inline)
     *
     * @generated from field: map<string, agent.v1.SubagentPersistedState> subagent_states = 16;
     */
    subagentStates: {
        [key: string]: SubagentPersistedState;
    };
    /**
     * Count of self-summaries generated for this conversation
     *
     * @generated from field: uint32 self_summary_count = 17;
     */
    selfSummaryCount: number;
    /**
     * Set of file paths that have been read during this conversation
     *
     * @generated from field: repeated string read_paths = 18;
     */
    readPaths: string[];
};
/**
 * Describes the message agent.v1.ConversationStateStructure.
 * Use `create(ConversationStateStructureSchema)` to create a new message.
 */
export declare const ConversationStateStructureSchema: GenMessage<ConversationStateStructure>;
/**
 * @generated from message agent.v1.ThinkingDetails
 */
export type ThinkingDetails = Message<"agent.v1.ThinkingDetails"> & {};
/**
 * Describes the message agent.v1.ThinkingDetails.
 * Use `create(ThinkingDetailsSchema)` to create a new message.
 */
export declare const ThinkingDetailsSchema: GenMessage<ThinkingDetails>;
/**
 * @generated from message agent.v1.ApiKeyCredentials
 */
export type ApiKeyCredentials = Message<"agent.v1.ApiKeyCredentials"> & {
    /**
     * @generated from field: string api_key = 1;
     */
    apiKey: string;
    /**
     * For OpenAI-compatible endpoints
     *
     * @generated from field: optional string base_url = 2;
     */
    baseUrl?: string | undefined;
};
/**
 * Describes the message agent.v1.ApiKeyCredentials.
 * Use `create(ApiKeyCredentialsSchema)` to create a new message.
 */
export declare const ApiKeyCredentialsSchema: GenMessage<ApiKeyCredentials>;
/**
 * @generated from message agent.v1.AzureCredentials
 */
export type AzureCredentials = Message<"agent.v1.AzureCredentials"> & {
    /**
     * @generated from field: string api_key = 1;
     */
    apiKey: string;
    /**
     * @generated from field: string base_url = 2;
     */
    baseUrl: string;
    /**
     * @generated from field: string deployment = 3;
     */
    deployment: string;
};
/**
 * Describes the message agent.v1.AzureCredentials.
 * Use `create(AzureCredentialsSchema)` to create a new message.
 */
export declare const AzureCredentialsSchema: GenMessage<AzureCredentials>;
/**
 * @generated from message agent.v1.BedrockCredentials
 */
export type BedrockCredentials = Message<"agent.v1.BedrockCredentials"> & {
    /**
     * @generated from field: string access_key = 1;
     */
    accessKey: string;
    /**
     * @generated from field: string secret_key = 2;
     */
    secretKey: string;
    /**
     * @generated from field: string region = 3;
     */
    region: string;
    /**
     * @generated from field: optional string session_token = 4;
     */
    sessionToken?: string | undefined;
};
/**
 * Describes the message agent.v1.BedrockCredentials.
 * Use `create(BedrockCredentialsSchema)` to create a new message.
 */
export declare const BedrockCredentialsSchema: GenMessage<BedrockCredentials>;
/**
 * @generated from message agent.v1.ModelDetails
 */
export type ModelDetails = Message<"agent.v1.ModelDetails"> & {
    /**
     * @generated from field: string model_id = 1;
     */
    modelId: string;
    /**
     * @generated from field: string display_model_id = 3;
     */
    displayModelId: string;
    /**
     * @generated from field: string display_name = 4;
     */
    displayName: string;
    /**
     * @generated from field: string display_name_short = 5;
     */
    displayNameShort: string;
    /**
     * @generated from field: repeated string aliases = 6;
     */
    aliases: string[];
    /**
     * @generated from field: optional agent.v1.ThinkingDetails thinking_details = 2;
     */
    thinkingDetails?: ThinkingDetails | undefined;
    /**
     * @generated from field: optional bool max_mode = 7;
     */
    maxMode?: boolean | undefined;
    /**
     * @generated from oneof agent.v1.ModelDetails.credentials
     */
    credentials: {
        /**
         * @generated from field: agent.v1.ApiKeyCredentials api_key_credentials = 8;
         */
        value: ApiKeyCredentials;
        case: "apiKeyCredentials";
    } | {
        /**
         * @generated from field: agent.v1.AzureCredentials azure_credentials = 9;
         */
        value: AzureCredentials;
        case: "azureCredentials";
    } | {
        /**
         * @generated from field: agent.v1.BedrockCredentials bedrock_credentials = 10;
         */
        value: BedrockCredentials;
        case: "bedrockCredentials";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ModelDetails.
 * Use `create(ModelDetailsSchema)` to create a new message.
 */
export declare const ModelDetailsSchema: GenMessage<ModelDetails>;
/**
 * @generated from message agent.v1.RequestedModel
 */
export type RequestedModel = Message<"agent.v1.RequestedModel"> & {
    /**
     * @generated from field: string model_id = 1;
     */
    modelId: string;
    /**
     * @generated from field: bool max_mode = 2;
     */
    maxMode: boolean;
    /**
     * @generated from field: repeated agent.v1.RequestedModel_ModelParameterbytes parameters = 3;
     */
    parameters: RequestedModel_ModelParameterbytes[];
    /**
     * @generated from oneof agent.v1.RequestedModel.credentials
     */
    credentials: {
        /**
         * @generated from field: agent.v1.ApiKeyCredentials api_key_credentials = 4;
         */
        value: ApiKeyCredentials;
        case: "apiKeyCredentials";
    } | {
        /**
         * @generated from field: agent.v1.AzureCredentials azure_credentials = 5;
         */
        value: AzureCredentials;
        case: "azureCredentials";
    } | {
        /**
         * @generated from field: agent.v1.BedrockCredentials bedrock_credentials = 6;
         */
        value: BedrockCredentials;
        case: "bedrockCredentials";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.RequestedModel.
 * Use `create(RequestedModelSchema)` to create a new message.
 */
export declare const RequestedModelSchema: GenMessage<RequestedModel>;
/**
 * @generated from message agent.v1.RequestedModel_ModelParameterbytes
 */
export type RequestedModel_ModelParameterbytes = Message<"agent.v1.RequestedModel_ModelParameterbytes"> & {
    /**
     * @generated from field: string id = 1;
     */
    id: string;
    /**
     * All paramters are encoded as strings. For boolean parameters, the value is either "true" or "false". For enum parameters, the value is one of the values in the enum.
     *
     * @generated from field: string value = 2;
     */
    value: string;
};
/**
 * Describes the message agent.v1.RequestedModel_ModelParameterbytes.
 * Use `create(RequestedModel_ModelParameterbytesSchema)` to create a new message.
 */
export declare const RequestedModel_ModelParameterbytesSchema: GenMessage<RequestedModel_ModelParameterbytes>;
/**
 * @generated from message agent.v1.AgentRunRequest
 */
export type AgentRunRequest = Message<"agent.v1.AgentRunRequest"> & {
    /**
     * @generated from field: agent.v1.ConversationStateStructure conversation_state = 1;
     */
    conversationState?: ConversationStateStructure | undefined;
    /**
     * @generated from field: agent.v1.ConversationAction action = 2;
     */
    action?: ConversationAction | undefined;
    /**
     * TODO: Today we use model_details, but we are getting ready to deprecate that and use requested_model instead.
     *
     * @generated from field: agent.v1.ModelDetails model_details = 3;
     */
    modelDetails?: ModelDetails | undefined;
    /**
     * @generated from field: optional agent.v1.RequestedModel requested_model = 9;
     */
    requestedModel?: RequestedModel | undefined;
    /**
     * @generated from field: agent.v1.McpTools mcp_tools = 4;
     */
    mcpTools?: McpTools | undefined;
    /**
     * @generated from field: optional string conversation_id = 5;
     */
    conversationId?: string | undefined;
    /**
     * @generated from field: optional agent.v1.McpFileSystemOptions mcp_file_system_options = 6;
     */
    mcpFileSystemOptions?: McpFileSystemOptions | undefined;
    /**
     * Deprecated, use the one in RequestContext message in request_context_exec.proto instead
     *
     * @generated from field: optional agent.v1.SkillOptions skill_options = 7;
     */
    skillOptions?: SkillOptions | undefined;
    /**
     * Custom system prompt override. Allowlisted for specific teams only.
     *
     * @generated from field: optional string custom_system_prompt = 8;
     */
    customSystemPrompt?: string | undefined;
};
/**
 * Describes the message agent.v1.AgentRunRequest.
 * Use `create(AgentRunRequestSchema)` to create a new message.
 */
export declare const AgentRunRequestSchema: GenMessage<AgentRunRequest>;
/**
 * @generated from message agent.v1.TextDeltaUpdate
 */
export type TextDeltaUpdate = Message<"agent.v1.TextDeltaUpdate"> & {
    /**
     * @generated from field: string text = 1;
     */
    text: string;
};
/**
 * Describes the message agent.v1.TextDeltaUpdate.
 * Use `create(TextDeltaUpdateSchema)` to create a new message.
 */
export declare const TextDeltaUpdateSchema: GenMessage<TextDeltaUpdate>;
/**
 * @generated from message agent.v1.ToolCallStartedUpdate
 */
export type ToolCallStartedUpdate = Message<"agent.v1.ToolCallStartedUpdate"> & {
    /**
     * @generated from field: string call_id = 1;
     */
    callId: string;
    /**
     * @generated from field: agent.v1.ToolCall tool_call = 2;
     */
    toolCall?: ToolCall | undefined;
    /**
     * groups tool calls that originate from the same model provider call
     *
     * @generated from field: string model_call_id = 3;
     */
    modelCallId: string;
};
/**
 * Describes the message agent.v1.ToolCallStartedUpdate.
 * Use `create(ToolCallStartedUpdateSchema)` to create a new message.
 */
export declare const ToolCallStartedUpdateSchema: GenMessage<ToolCallStartedUpdate>;
/**
 * @generated from message agent.v1.ToolCallCompletedUpdate
 */
export type ToolCallCompletedUpdate = Message<"agent.v1.ToolCallCompletedUpdate"> & {
    /**
     * @generated from field: string call_id = 1;
     */
    callId: string;
    /**
     * @generated from field: agent.v1.ToolCall tool_call = 2;
     */
    toolCall?: ToolCall | undefined;
    /**
     * groups tool calls that originate from the same model provider call
     *
     * @generated from field: string model_call_id = 3;
     */
    modelCallId: string;
};
/**
 * Describes the message agent.v1.ToolCallCompletedUpdate.
 * Use `create(ToolCallCompletedUpdateSchema)` to create a new message.
 */
export declare const ToolCallCompletedUpdateSchema: GenMessage<ToolCallCompletedUpdate>;
/**
 * @generated from message agent.v1.ToolCallDeltaUpdate
 */
export type ToolCallDeltaUpdate = Message<"agent.v1.ToolCallDeltaUpdate"> & {
    /**
     * @generated from field: string call_id = 1;
     */
    callId: string;
    /**
     * @generated from field: agent.v1.ToolCallDelta tool_call_delta = 2;
     */
    toolCallDelta?: ToolCallDelta | undefined;
    /**
     * groups tool calls that originate from the same model provider call
     *
     * @generated from field: string model_call_id = 3;
     */
    modelCallId: string;
};
/**
 * Describes the message agent.v1.ToolCallDeltaUpdate.
 * Use `create(ToolCallDeltaUpdateSchema)` to create a new message.
 */
export declare const ToolCallDeltaUpdateSchema: GenMessage<ToolCallDeltaUpdate>;
/**
 * Streaming update for partial tool call arguments
 *
 * @generated from message agent.v1.PartialToolCallUpdate
 */
export type PartialToolCallUpdate = Message<"agent.v1.PartialToolCallUpdate"> & {
    /**
     * @generated from field: string call_id = 1;
     */
    callId: string;
    /**
     * @generated from field: agent.v1.ToolCall tool_call = 2;
     */
    toolCall?: ToolCall | undefined;
    /**
     * Aggregated args text so far (as JSON text). May be incomplete until final tool call.
     *
     * @generated from field: string args_text_delta = 3;
     */
    argsTextDelta: string;
    /**
     * groups tool calls that originate from the same model provider call
     *
     * @generated from field: string model_call_id = 4;
     */
    modelCallId: string;
};
/**
 * Describes the message agent.v1.PartialToolCallUpdate.
 * Use `create(PartialToolCallUpdateSchema)` to create a new message.
 */
export declare const PartialToolCallUpdateSchema: GenMessage<PartialToolCallUpdate>;
/**
 * @generated from message agent.v1.ThinkingDeltaUpdate
 */
export type ThinkingDeltaUpdate = Message<"agent.v1.ThinkingDeltaUpdate"> & {
    /**
     * @generated from field: string text = 1;
     */
    text: string;
};
/**
 * Describes the message agent.v1.ThinkingDeltaUpdate.
 * Use `create(ThinkingDeltaUpdateSchema)` to create a new message.
 */
export declare const ThinkingDeltaUpdateSchema: GenMessage<ThinkingDeltaUpdate>;
/**
 * @generated from message agent.v1.ThinkingCompletedUpdate
 */
export type ThinkingCompletedUpdate = Message<"agent.v1.ThinkingCompletedUpdate"> & {
    /**
     * @generated from field: int32 thinking_duration_ms = 1;
     */
    thinkingDurationMs: number;
};
/**
 * Describes the message agent.v1.ThinkingCompletedUpdate.
 * Use `create(ThinkingCompletedUpdateSchema)` to create a new message.
 */
export declare const ThinkingCompletedUpdateSchema: GenMessage<ThinkingCompletedUpdate>;
/**
 * @generated from message agent.v1.TokenDeltaUpdate
 */
export type TokenDeltaUpdate = Message<"agent.v1.TokenDeltaUpdate"> & {
    /**
     * @generated from field: int32 tokens = 1;
     */
    tokens: number;
};
/**
 * Describes the message agent.v1.TokenDeltaUpdate.
 * Use `create(TokenDeltaUpdateSchema)` to create a new message.
 */
export declare const TokenDeltaUpdateSchema: GenMessage<TokenDeltaUpdate>;
/**
 * @generated from message agent.v1.SummaryUpdate
 */
export type SummaryUpdate = Message<"agent.v1.SummaryUpdate"> & {
    /**
     * @generated from field: string summary = 1;
     */
    summary: string;
};
/**
 * Describes the message agent.v1.SummaryUpdate.
 * Use `create(SummaryUpdateSchema)` to create a new message.
 */
export declare const SummaryUpdateSchema: GenMessage<SummaryUpdate>;
/**
 * @generated from message agent.v1.SummaryStartedUpdate
 */
export type SummaryStartedUpdate = Message<"agent.v1.SummaryStartedUpdate"> & {};
/**
 * Describes the message agent.v1.SummaryStartedUpdate.
 * Use `create(SummaryStartedUpdateSchema)` to create a new message.
 */
export declare const SummaryStartedUpdateSchema: GenMessage<SummaryStartedUpdate>;
/**
 * @generated from message agent.v1.HeartbeatUpdate
 */
export type HeartbeatUpdate = Message<"agent.v1.HeartbeatUpdate"> & {};
/**
 * Describes the message agent.v1.HeartbeatUpdate.
 * Use `create(HeartbeatUpdateSchema)` to create a new message.
 */
export declare const HeartbeatUpdateSchema: GenMessage<HeartbeatUpdate>;
/**
 * @generated from message agent.v1.SummaryCompletedUpdate
 */
export type SummaryCompletedUpdate = Message<"agent.v1.SummaryCompletedUpdate"> & {};
/**
 * Describes the message agent.v1.SummaryCompletedUpdate.
 * Use `create(SummaryCompletedUpdateSchema)` to create a new message.
 */
export declare const SummaryCompletedUpdateSchema: GenMessage<SummaryCompletedUpdate>;
/**
 * @generated from message agent.v1.ShellOutputDeltaUpdate
 */
export type ShellOutputDeltaUpdate = Message<"agent.v1.ShellOutputDeltaUpdate"> & {
    /**
     * @generated from oneof agent.v1.ShellOutputDeltaUpdate.event
     */
    event: {
        /**
         * @generated from field: agent.v1.ShellStreamStdout stdout = 1;
         */
        value: ShellStreamStdout;
        case: "stdout";
    } | {
        /**
         * @generated from field: agent.v1.ShellStreamStderr stderr = 2;
         */
        value: ShellStreamStderr;
        case: "stderr";
    } | {
        /**
         * @generated from field: agent.v1.ShellStreamExit exit = 3;
         */
        value: ShellStreamExit;
        case: "exit";
    } | {
        /**
         * @generated from field: agent.v1.ShellStreamStart start = 4;
         */
        value: ShellStreamStart;
        case: "start";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ShellOutputDeltaUpdate.
 * Use `create(ShellOutputDeltaUpdateSchema)` to create a new message.
 */
export declare const ShellOutputDeltaUpdateSchema: GenMessage<ShellOutputDeltaUpdate>;
/**
 * @generated from message agent.v1.TurnEndedUpdate
 */
export type TurnEndedUpdate = Message<"agent.v1.TurnEndedUpdate"> & {};
/**
 * Describes the message agent.v1.TurnEndedUpdate.
 * Use `create(TurnEndedUpdateSchema)` to create a new message.
 */
export declare const TurnEndedUpdateSchema: GenMessage<TurnEndedUpdate>;
/**
 * Only: user message appended update
 *
 * @generated from message agent.v1.UserMessageAppendedUpdate
 */
export type UserMessageAppendedUpdate = Message<"agent.v1.UserMessageAppendedUpdate"> & {
    /**
     * @generated from field: agent.v1.UserMessage user_message = 1;
     */
    userMessage?: UserMessage | undefined;
};
/**
 * Describes the message agent.v1.UserMessageAppendedUpdate.
 * Use `create(UserMessageAppendedUpdateSchema)` to create a new message.
 */
export declare const UserMessageAppendedUpdateSchema: GenMessage<UserMessageAppendedUpdate>;
/**
 * @generated from message agent.v1.StepStartedUpdate
 */
export type StepStartedUpdate = Message<"agent.v1.StepStartedUpdate"> & {
    /**
     * @generated from field: uint64 step_id = 1;
     */
    stepId: bigint;
};
/**
 * Describes the message agent.v1.StepStartedUpdate.
 * Use `create(StepStartedUpdateSchema)` to create a new message.
 */
export declare const StepStartedUpdateSchema: GenMessage<StepStartedUpdate>;
/**
 * @generated from message agent.v1.StepCompletedUpdate
 */
export type StepCompletedUpdate = Message<"agent.v1.StepCompletedUpdate"> & {
    /**
     * @generated from field: uint64 step_id = 1;
     */
    stepId: bigint;
    /**
     * @generated from field: int64 step_duration_ms = 2;
     */
    stepDurationMs: bigint;
};
/**
 * Describes the message agent.v1.StepCompletedUpdate.
 * Use `create(StepCompletedUpdateSchema)` to create a new message.
 */
export declare const StepCompletedUpdateSchema: GenMessage<StepCompletedUpdate>;
/**
 * @generated from message agent.v1.InteractionUpdate
 */
export type InteractionUpdate = Message<"agent.v1.InteractionUpdate"> & {
    /**
     * @generated from oneof agent.v1.InteractionUpdate.message
     */
    message: {
        /**
         * @generated from field: agent.v1.TextDeltaUpdate text_delta = 1;
         */
        value: TextDeltaUpdate;
        case: "textDelta";
    } | {
        /**
         * @generated from field: agent.v1.PartialToolCallUpdate partial_tool_call = 7;
         */
        value: PartialToolCallUpdate;
        case: "partialToolCall";
    } | {
        /**
         * @generated from field: agent.v1.ToolCallDeltaUpdate tool_call_delta = 15;
         */
        value: ToolCallDeltaUpdate;
        case: "toolCallDelta";
    } | {
        /**
         * @generated from field: agent.v1.ToolCallStartedUpdate tool_call_started = 2;
         */
        value: ToolCallStartedUpdate;
        case: "toolCallStarted";
    } | {
        /**
         * @generated from field: agent.v1.ToolCallCompletedUpdate tool_call_completed = 3;
         */
        value: ToolCallCompletedUpdate;
        case: "toolCallCompleted";
    } | {
        /**
         * @generated from field: agent.v1.ThinkingDeltaUpdate thinking_delta = 4;
         */
        value: ThinkingDeltaUpdate;
        case: "thinkingDelta";
    } | {
        /**
         * @generated from field: agent.v1.ThinkingCompletedUpdate thinking_completed = 5;
         */
        value: ThinkingCompletedUpdate;
        case: "thinkingCompleted";
    } | {
        /**
         * @generated from field: agent.v1.UserMessageAppendedUpdate user_message_appended = 6;
         */
        value: UserMessageAppendedUpdate;
        case: "userMessageAppended";
    } | {
        /**
         * @generated from field: agent.v1.TokenDeltaUpdate token_delta = 8;
         */
        value: TokenDeltaUpdate;
        case: "tokenDelta";
    } | {
        /**
         * @generated from field: agent.v1.SummaryUpdate summary = 9;
         */
        value: SummaryUpdate;
        case: "summary";
    } | {
        /**
         * @generated from field: agent.v1.SummaryStartedUpdate summary_started = 10;
         */
        value: SummaryStartedUpdate;
        case: "summaryStarted";
    } | {
        /**
         * @generated from field: agent.v1.SummaryCompletedUpdate summary_completed = 11;
         */
        value: SummaryCompletedUpdate;
        case: "summaryCompleted";
    } | {
        /**
         * @generated from field: agent.v1.ShellOutputDeltaUpdate shell_output_delta = 12;
         */
        value: ShellOutputDeltaUpdate;
        case: "shellOutputDelta";
    } | {
        /**
         * @generated from field: agent.v1.HeartbeatUpdate heartbeat = 13;
         */
        value: HeartbeatUpdate;
        case: "heartbeat";
    } | {
        /**
         * @generated from field: agent.v1.TurnEndedUpdate turn_ended = 14;
         */
        value: TurnEndedUpdate;
        case: "turnEnded";
    } | {
        /**
         * @generated from field: agent.v1.StepStartedUpdate step_started = 16;
         */
        value: StepStartedUpdate;
        case: "stepStarted";
    } | {
        /**
         * @generated from field: agent.v1.StepCompletedUpdate step_completed = 17;
         */
        value: StepCompletedUpdate;
        case: "stepCompleted";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.InteractionUpdate.
 * Use `create(InteractionUpdateSchema)` to create a new message.
 */
export declare const InteractionUpdateSchema: GenMessage<InteractionUpdate>;
/**
 * Interaction query messages for bidirectional communication
 *
 * @generated from message agent.v1.InteractionQuery
 */
export type InteractionQuery = Message<"agent.v1.InteractionQuery"> & {
    /**
     * @generated from field: uint32 id = 1;
     */
    id: number;
    /**
     * @generated from oneof agent.v1.InteractionQuery.query
     */
    query: {
        /**
         * @generated from field: agent.v1.WebSearchRequestQuery web_search_request_query = 2;
         */
        value: WebSearchRequestQuery;
        case: "webSearchRequestQuery";
    } | {
        /**
         * @generated from field: agent.v1.AskQuestionInteractionQuery ask_question_interaction_query = 3;
         */
        value: AskQuestionInteractionQuery;
        case: "askQuestionInteractionQuery";
    } | {
        /**
         * @generated from field: agent.v1.SwitchModeRequestQuery switch_mode_request_query = 4;
         */
        value: SwitchModeRequestQuery;
        case: "switchModeRequestQuery";
    } | {
        /**
         * @generated from field: agent.v1.ExaSearchRequestQuery exa_search_request_query = 5;
         */
        value: ExaSearchRequestQuery;
        case: "exaSearchRequestQuery";
    } | {
        /**
         * @generated from field: agent.v1.ExaFetchRequestQuery exa_fetch_request_query = 6;
         */
        value: ExaFetchRequestQuery;
        case: "exaFetchRequestQuery";
    } | {
        /**
         * @generated from field: agent.v1.CreatePlanRequestQuery create_plan_request_query = 7;
         */
        value: CreatePlanRequestQuery;
        case: "createPlanRequestQuery";
    } | {
        /**
         * @generated from field: agent.v1.SetupVmEnvironmentArgs setup_vm_environment_args = 8;
         */
        value: SetupVmEnvironmentArgs;
        case: "setupVmEnvironmentArgs";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.InteractionQuery.
 * Use `create(InteractionQuerySchema)` to create a new message.
 */
export declare const InteractionQuerySchema: GenMessage<InteractionQuery>;
/**
 * @generated from message agent.v1.InteractionResponse
 */
export type InteractionResponse = Message<"agent.v1.InteractionResponse"> & {
    /**
     * @generated from field: uint32 id = 1;
     */
    id: number;
    /**
     * @generated from oneof agent.v1.InteractionResponse.result
     */
    result: {
        /**
         * @generated from field: agent.v1.WebSearchRequestResponse web_search_request_response = 2;
         */
        value: WebSearchRequestResponse;
        case: "webSearchRequestResponse";
    } | {
        /**
         * @generated from field: agent.v1.AskQuestionInteractionResponse ask_question_interaction_response = 3;
         */
        value: AskQuestionInteractionResponse;
        case: "askQuestionInteractionResponse";
    } | {
        /**
         * @generated from field: agent.v1.SwitchModeRequestResponse switch_mode_request_response = 4;
         */
        value: SwitchModeRequestResponse;
        case: "switchModeRequestResponse";
    } | {
        /**
         * @generated from field: agent.v1.ExaSearchRequestResponse exa_search_request_response = 5;
         */
        value: ExaSearchRequestResponse;
        case: "exaSearchRequestResponse";
    } | {
        /**
         * @generated from field: agent.v1.ExaFetchRequestResponse exa_fetch_request_response = 6;
         */
        value: ExaFetchRequestResponse;
        case: "exaFetchRequestResponse";
    } | {
        /**
         * @generated from field: agent.v1.CreatePlanRequestResponse create_plan_request_response = 7;
         */
        value: CreatePlanRequestResponse;
        case: "createPlanRequestResponse";
    } | {
        /**
         * @generated from field: agent.v1.SetupVmEnvironmentResult setup_vm_environment_result = 8;
         */
        value: SetupVmEnvironmentResult;
        case: "setupVmEnvironmentResult";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.InteractionResponse.
 * Use `create(InteractionResponseSchema)` to create a new message.
 */
export declare const InteractionResponseSchema: GenMessage<InteractionResponse>;
/**
 * @generated from message agent.v1.AskQuestionInteractionQuery
 */
export type AskQuestionInteractionQuery = Message<"agent.v1.AskQuestionInteractionQuery"> & {
    /**
     * @generated from field: agent.v1.AskQuestionArgs args = 1;
     */
    args?: AskQuestionArgs | undefined;
    /**
     * @generated from field: string tool_call_id = 2;
     */
    toolCallId: string;
};
/**
 * Describes the message agent.v1.AskQuestionInteractionQuery.
 * Use `create(AskQuestionInteractionQuerySchema)` to create a new message.
 */
export declare const AskQuestionInteractionQuerySchema: GenMessage<AskQuestionInteractionQuery>;
/**
 * @generated from message agent.v1.AskQuestionInteractionResponse
 */
export type AskQuestionInteractionResponse = Message<"agent.v1.AskQuestionInteractionResponse"> & {
    /**
     * @generated from field: agent.v1.AskQuestionResult result = 1;
     */
    result?: AskQuestionResult | undefined;
};
/**
 * Describes the message agent.v1.AskQuestionInteractionResponse.
 * Use `create(AskQuestionInteractionResponseSchema)` to create a new message.
 */
export declare const AskQuestionInteractionResponseSchema: GenMessage<AskQuestionInteractionResponse>;
/**
 * @generated from message agent.v1.ClientHeartbeat
 */
export type ClientHeartbeat = Message<"agent.v1.ClientHeartbeat"> & {};
/**
 * Describes the message agent.v1.ClientHeartbeat.
 * Use `create(ClientHeartbeatSchema)` to create a new message.
 */
export declare const ClientHeartbeatSchema: GenMessage<ClientHeartbeat>;
/**
 * Prewarm request - sent before the actual action to prepare the backend Contains all config needed for auth, model routing, and session building The actual ConversationAction is sent separately after prewarming completes
 *
 * @generated from message agent.v1.PrewarmRequest
 */
export type PrewarmRequest = Message<"agent.v1.PrewarmRequest"> & {
    /**
     * @generated from field: agent.v1.ModelDetails model_details = 1;
     */
    modelDetails?: ModelDetails | undefined;
    /**
     * @generated from field: optional agent.v1.RequestedModel requested_model = 9;
     */
    requestedModel?: RequestedModel | undefined;
    /**
     * @generated from field: optional string conversation_id = 2;
     */
    conversationId?: string | undefined;
    /**
     * @generated from field: agent.v1.ConversationStateStructure conversation_state = 3;
     */
    conversationState?: ConversationStateStructure | undefined;
    /**
     * @generated from field: agent.v1.McpTools mcp_tools = 4;
     */
    mcpTools?: McpTools | undefined;
    /**
     * @generated from field: optional agent.v1.McpFileSystemOptions mcp_file_system_options = 5;
     */
    mcpFileSystemOptions?: McpFileSystemOptions | undefined;
    /**
     * Best-of-N context for usage billing (same fields as UserMessage)
     *
     * @generated from field: optional string best_of_n_group_id = 6;
     */
    bestOfNGroupId?: string | undefined;
    /**
     * @generated from field: optional bool try_use_best_of_n_promotion = 7;
     */
    tryUseBestOfNPromotion?: boolean | undefined;
    /**
     * Custom system prompt override. Allowlisted for specific teams only.
     *
     * @generated from field: optional string custom_system_prompt = 8;
     */
    customSystemPrompt?: string | undefined;
};
/**
 * Describes the message agent.v1.PrewarmRequest.
 * Use `create(PrewarmRequestSchema)` to create a new message.
 */
export declare const PrewarmRequestSchema: GenMessage<PrewarmRequest>;
/**
 * @generated from message agent.v1.ExecServerAbort
 */
export type ExecServerAbort = Message<"agent.v1.ExecServerAbort"> & {
    /**
     * @generated from field: uint32 id = 1;
     */
    id: number;
};
/**
 * Describes the message agent.v1.ExecServerAbort.
 * Use `create(ExecServerAbortSchema)` to create a new message.
 */
export declare const ExecServerAbortSchema: GenMessage<ExecServerAbort>;
/**
 * @generated from message agent.v1.ExecServerControlMessage
 */
export type ExecServerControlMessage = Message<"agent.v1.ExecServerControlMessage"> & {
    /**
     * @generated from oneof agent.v1.ExecServerControlMessage.message
     */
    message: {
        /**
         * @generated from field: agent.v1.ExecServerAbort abort = 1;
         */
        value: ExecServerAbort;
        case: "abort";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ExecServerControlMessage.
 * Use `create(ExecServerControlMessageSchema)` to create a new message.
 */
export declare const ExecServerControlMessageSchema: GenMessage<ExecServerControlMessage>;
/**
 * @generated from message agent.v1.AgentClientMessage
 */
export type AgentClientMessage = Message<"agent.v1.AgentClientMessage"> & {
    /**
     * @generated from oneof agent.v1.AgentClientMessage.message
     */
    message: {
        /**
         * @generated from field: agent.v1.AgentRunRequest run_request = 1;
         */
        value: AgentRunRequest;
        case: "runRequest";
    } | {
        /**
         * @generated from field: agent.v1.ExecClientMessage exec_client_message = 2;
         */
        value: ExecClientMessage;
        case: "execClientMessage";
    } | {
        /**
         * @generated from field: agent.v1.ExecClientControlMessage exec_client_control_message = 5;
         */
        value: ExecClientControlMessage;
        case: "execClientControlMessage";
    } | {
        /**
         * @generated from field: agent.v1.KvClientMessage kv_client_message = 3;
         */
        value: KvClientMessage;
        case: "kvClientMessage";
    } | {
        /**
         * @generated from field: agent.v1.ConversationAction conversation_action = 4;
         */
        value: ConversationAction;
        case: "conversationAction";
    } | {
        /**
         * @generated from field: agent.v1.InteractionResponse interaction_response = 6;
         */
        value: InteractionResponse;
        case: "interactionResponse";
    } | {
        /**
         * @generated from field: agent.v1.ClientHeartbeat client_heartbeat = 7;
         */
        value: ClientHeartbeat;
        case: "clientHeartbeat";
    } | {
        /**
         * @generated from field: agent.v1.PrewarmRequest prewarm_request = 8;
         */
        value: PrewarmRequest;
        case: "prewarmRequest";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.AgentClientMessage.
 * Use `create(AgentClientMessageSchema)` to create a new message.
 */
export declare const AgentClientMessageSchema: GenMessage<AgentClientMessage>;
/**
 * @generated from message agent.v1.AgentServerMessage
 */
export type AgentServerMessage = Message<"agent.v1.AgentServerMessage"> & {
    /**
     * @generated from oneof agent.v1.AgentServerMessage.message
     */
    message: {
        /**
         * @generated from field: agent.v1.InteractionUpdate interaction_update = 1;
         */
        value: InteractionUpdate;
        case: "interactionUpdate";
    } | {
        /**
         * @generated from field: agent.v1.ExecServerMessage exec_server_message = 2;
         */
        value: ExecServerMessage;
        case: "execServerMessage";
    } | {
        /**
         * @generated from field: agent.v1.ExecServerControlMessage exec_server_control_message = 5;
         */
        value: ExecServerControlMessage;
        case: "execServerControlMessage";
    } | {
        /**
         * @generated from field: agent.v1.ConversationStateStructure conversation_checkpoint_update = 3;
         */
        value: ConversationStateStructure;
        case: "conversationCheckpointUpdate";
    } | {
        /**
         * @generated from field: agent.v1.KvServerMessage kv_server_message = 4;
         */
        value: KvServerMessage;
        case: "kvServerMessage";
    } | {
        /**
         * @generated from field: agent.v1.InteractionQuery interaction_query = 7;
         */
        value: InteractionQuery;
        case: "interactionQuery";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.AgentServerMessage.
 * Use `create(AgentServerMessageSchema)` to create a new message.
 */
export declare const AgentServerMessageSchema: GenMessage<AgentServerMessage>;
/**
 * New unary API for naming an agent from a user message
 *
 * @generated from message agent.v1.NameAgentRequest
 */
export type NameAgentRequest = Message<"agent.v1.NameAgentRequest"> & {
    /**
     * @generated from field: string user_message = 1;
     */
    userMessage: string;
};
/**
 * Describes the message agent.v1.NameAgentRequest.
 * Use `create(NameAgentRequestSchema)` to create a new message.
 */
export declare const NameAgentRequestSchema: GenMessage<NameAgentRequest>;
/**
 * @generated from message agent.v1.NameAgentResponse
 */
export type NameAgentResponse = Message<"agent.v1.NameAgentResponse"> & {
    /**
     * @generated from field: string name = 1;
     */
    name: string;
};
/**
 * Describes the message agent.v1.NameAgentResponse.
 * Use `create(NameAgentResponseSchema)` to create a new message.
 */
export declare const NameAgentResponseSchema: GenMessage<NameAgentResponse>;
/**
 * @generated from message agent.v1.GetUsableModelsRequest
 */
export type GetUsableModelsRequest = Message<"agent.v1.GetUsableModelsRequest"> & {
    /**
     * Not used right now, but can use to populate info about custom models the user passes in that we don't send down by default
     *
     * @generated from field: repeated string custom_model_ids = 1;
     */
    customModelIds: string[];
};
/**
 * Describes the message agent.v1.GetUsableModelsRequest.
 * Use `create(GetUsableModelsRequestSchema)` to create a new message.
 */
export declare const GetUsableModelsRequestSchema: GenMessage<GetUsableModelsRequest>;
/**
 * @generated from message agent.v1.GetUsableModelsResponse
 */
export type GetUsableModelsResponse = Message<"agent.v1.GetUsableModelsResponse"> & {
    /**
     * @generated from field: repeated agent.v1.ModelDetails models = 1;
     */
    models: ModelDetails[];
};
/**
 * Describes the message agent.v1.GetUsableModelsResponse.
 * Use `create(GetUsableModelsResponseSchema)` to create a new message.
 */
export declare const GetUsableModelsResponseSchema: GenMessage<GetUsableModelsResponse>;
/**
 * @generated from message agent.v1.GetDefaultModelForCliRequest
 */
export type GetDefaultModelForCliRequest = Message<"agent.v1.GetDefaultModelForCliRequest"> & {};
/**
 * Describes the message agent.v1.GetDefaultModelForCliRequest.
 * Use `create(GetDefaultModelForCliRequestSchema)` to create a new message.
 */
export declare const GetDefaultModelForCliRequestSchema: GenMessage<GetDefaultModelForCliRequest>;
/**
 * @generated from message agent.v1.GetDefaultModelForCliResponse
 */
export type GetDefaultModelForCliResponse = Message<"agent.v1.GetDefaultModelForCliResponse"> & {
    /**
     * @generated from field: agent.v1.ModelDetails model = 1;
     */
    model?: ModelDetails | undefined;
};
/**
 * Describes the message agent.v1.GetDefaultModelForCliResponse.
 * Use `create(GetDefaultModelForCliResponseSchema)` to create a new message.
 */
export declare const GetDefaultModelForCliResponseSchema: GenMessage<GetDefaultModelForCliResponse>;
/**
 * Internal endpoint: returns all allowed model intents for devs
 *
 * @generated from message agent.v1.GetAllowedModelIntentsRequest
 */
export type GetAllowedModelIntentsRequest = Message<"agent.v1.GetAllowedModelIntentsRequest"> & {};
/**
 * Describes the message agent.v1.GetAllowedModelIntentsRequest.
 * Use `create(GetAllowedModelIntentsRequestSchema)` to create a new message.
 */
export declare const GetAllowedModelIntentsRequestSchema: GenMessage<GetAllowedModelIntentsRequest>;
/**
 * @generated from message agent.v1.GetAllowedModelIntentsResponse
 */
export type GetAllowedModelIntentsResponse = Message<"agent.v1.GetAllowedModelIntentsResponse"> & {
    /**
     * @generated from field: repeated string model_intents = 1;
     */
    modelIntents: string[];
};
/**
 * Describes the message agent.v1.GetAllowedModelIntentsResponse.
 * Use `create(GetAllowedModelIntentsResponseSchema)` to create a new message.
 */
export declare const GetAllowedModelIntentsResponseSchema: GenMessage<GetAllowedModelIntentsResponse>;
/**
 * IDE state persistence for clients (CLI / VSCode integration) Mirrors a subset of aiserver.v1.ConversationMessage.IdeEditorsState, but only contains the recently viewed files and avoids any deprecated fields.
 *
 * @generated from message agent.v1.IdeEditorsStateFile
 */
export type IdeEditorsStateFile = Message<"agent.v1.IdeEditorsStateFile"> & {
    /**
     * @generated from field: string relative_path = 1;
     */
    relativePath: string;
    /**
     * @generated from field: string absolute_path = 2;
     */
    absolutePath: string;
    /**
     * @generated from field: optional bool is_currently_focused = 3;
     */
    isCurrentlyFocused?: boolean | undefined;
    /**
     * @generated from field: optional int32 current_line_number = 4;
     */
    currentLineNumber?: number | undefined;
    /**
     * @generated from field: optional string current_line_text = 5;
     */
    currentLineText?: string | undefined;
    /**
     * @generated from field: optional int32 line_count = 6;
     */
    lineCount?: number | undefined;
};
/**
 * Describes the message agent.v1.IdeEditorsStateFile.
 * Use `create(IdeEditorsStateFileSchema)` to create a new message.
 */
export declare const IdeEditorsStateFileSchema: GenMessage<IdeEditorsStateFile>;
/**
 * @generated from message agent.v1.IdeEditorsStateLite
 */
export type IdeEditorsStateLite = Message<"agent.v1.IdeEditorsStateLite"> & {
    /**
     * @generated from field: repeated agent.v1.IdeEditorsStateFile recently_viewed_files = 1;
     */
    recentlyViewedFiles: IdeEditorsStateFile[];
};
/**
 * Describes the message agent.v1.IdeEditorsStateLite.
 * Use `create(IdeEditorsStateLiteSchema)` to create a new message.
 */
export declare const IdeEditorsStateLiteSchema: GenMessage<IdeEditorsStateLite>;
/**
 * @generated from message agent.v1.ApplyAgentDiffToolCall
 */
export type ApplyAgentDiffToolCall = Message<"agent.v1.ApplyAgentDiffToolCall"> & {
    /**
     * @generated from field: agent.v1.ApplyAgentDiffArgs args = 1;
     */
    args?: ApplyAgentDiffArgs | undefined;
    /**
     * @generated from field: agent.v1.ApplyAgentDiffResult result = 2;
     */
    result?: ApplyAgentDiffResult | undefined;
};
/**
 * Describes the message agent.v1.ApplyAgentDiffToolCall.
 * Use `create(ApplyAgentDiffToolCallSchema)` to create a new message.
 */
export declare const ApplyAgentDiffToolCallSchema: GenMessage<ApplyAgentDiffToolCall>;
/**
 * @generated from message agent.v1.ApplyAgentDiffArgs
 */
export type ApplyAgentDiffArgs = Message<"agent.v1.ApplyAgentDiffArgs"> & {
    /**
     * @generated from field: string agent_id = 1;
     */
    agentId: string;
};
/**
 * Describes the message agent.v1.ApplyAgentDiffArgs.
 * Use `create(ApplyAgentDiffArgsSchema)` to create a new message.
 */
export declare const ApplyAgentDiffArgsSchema: GenMessage<ApplyAgentDiffArgs>;
/**
 * @generated from message agent.v1.ApplyAgentDiffResult
 */
export type ApplyAgentDiffResult = Message<"agent.v1.ApplyAgentDiffResult"> & {
    /**
     * @generated from oneof agent.v1.ApplyAgentDiffResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.ApplyAgentDiffSuccess success = 1;
         */
        value: ApplyAgentDiffSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.ApplyAgentDiffError error = 2;
         */
        value: ApplyAgentDiffError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ApplyAgentDiffResult.
 * Use `create(ApplyAgentDiffResultSchema)` to create a new message.
 */
export declare const ApplyAgentDiffResultSchema: GenMessage<ApplyAgentDiffResult>;
/**
 * @generated from message agent.v1.ApplyAgentDiffSuccess
 */
export type ApplyAgentDiffSuccess = Message<"agent.v1.ApplyAgentDiffSuccess"> & {
    /**
     * @generated from field: repeated agent.v1.AppliedAgentChange applied_changes = 1;
     */
    appliedChanges: AppliedAgentChange[];
};
/**
 * Describes the message agent.v1.ApplyAgentDiffSuccess.
 * Use `create(ApplyAgentDiffSuccessSchema)` to create a new message.
 */
export declare const ApplyAgentDiffSuccessSchema: GenMessage<ApplyAgentDiffSuccess>;
/**
 * @generated from message agent.v1.AppliedAgentChange
 */
export type AppliedAgentChange = Message<"agent.v1.AppliedAgentChange"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: int32 change_type = 2;
     */
    changeType: number;
    /**
     * @generated from field: optional string before_content = 3;
     */
    beforeContent?: string | undefined;
    /**
     * @generated from field: optional string after_content = 4;
     */
    afterContent?: string | undefined;
    /**
     * @generated from field: optional string error = 5;
     */
    error?: string | undefined;
    /**
     * Detailed result message from the execution (e.g., "Successfully deleted file: path (123 bytes)")
     *
     * @generated from field: optional string message_for_model = 6;
     */
    messageForModel?: string | undefined;
};
/**
 * Describes the message agent.v1.AppliedAgentChange.
 * Use `create(AppliedAgentChangeSchema)` to create a new message.
 */
export declare const AppliedAgentChangeSchema: GenMessage<AppliedAgentChange>;
/**
 * @generated from message agent.v1.ApplyAgentDiffError
 */
export type ApplyAgentDiffError = Message<"agent.v1.ApplyAgentDiffError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
    /**
     * @generated from field: repeated agent.v1.AppliedAgentChange applied_changes = 2;
     */
    appliedChanges: AppliedAgentChange[];
};
/**
 * Describes the message agent.v1.ApplyAgentDiffError.
 * Use `create(ApplyAgentDiffErrorSchema)` to create a new message.
 */
export declare const ApplyAgentDiffErrorSchema: GenMessage<ApplyAgentDiffError>;
/**
 * @generated from message agent.v1.AskQuestionToolCall
 */
export type AskQuestionToolCall = Message<"agent.v1.AskQuestionToolCall"> & {
    /**
     * @generated from field: agent.v1.AskQuestionArgs args = 1;
     */
    args?: AskQuestionArgs | undefined;
    /**
     * @generated from field: agent.v1.AskQuestionResult result = 2;
     */
    result?: AskQuestionResult | undefined;
};
/**
 * Describes the message agent.v1.AskQuestionToolCall.
 * Use `create(AskQuestionToolCallSchema)` to create a new message.
 */
export declare const AskQuestionToolCallSchema: GenMessage<AskQuestionToolCall>;
/**
 * @generated from message agent.v1.AskQuestionArgs
 */
export type AskQuestionArgs = Message<"agent.v1.AskQuestionArgs"> & {
    /**
     * optional form title
     *
     * @generated from field: string title = 1;
     */
    title: string;
    /**
     * 1+ questions
     *
     * @generated from field: repeated agent.v1.AskQuestionArgs_Question questions = 2;
     */
    questions: AskQuestionArgs_Question[];
    /**
     * if true, return immediately with async marker instead of blocking
     *
     * @generated from field: bool run_async = 5;
     */
    runAsync: boolean;
    /**
     * if set, indicates this is a synthetic completion for the original async tool call with this ID
     *
     * @generated from field: string async_original_tool_call_id = 6;
     */
    asyncOriginalToolCallId: string;
};
/**
 * Describes the message agent.v1.AskQuestionArgs.
 * Use `create(AskQuestionArgsSchema)` to create a new message.
 */
export declare const AskQuestionArgsSchema: GenMessage<AskQuestionArgs>;
/**
 * @generated from message agent.v1.AskQuestionArgs_Question
 */
export type AskQuestionArgs_Question = Message<"agent.v1.AskQuestionArgs_Question"> & {
    /**
     * unique, model-provided
     *
     * @generated from field: string id = 1;
     */
    id: string;
    /**
     * the question text
     *
     * @generated from field: string prompt = 2;
     */
    prompt: string;
    /**
     * choices
     *
     * @generated from field: repeated agent.v1.AskQuestionArgs_Option options = 3;
     */
    options: AskQuestionArgs_Option[];
    /**
     * multi-select vs single-select
     *
     * @generated from field: bool allow_multiple = 4;
     */
    allowMultiple: boolean;
};
/**
 * Describes the message agent.v1.AskQuestionArgs_Question.
 * Use `create(AskQuestionArgs_QuestionSchema)` to create a new message.
 */
export declare const AskQuestionArgs_QuestionSchema: GenMessage<AskQuestionArgs_Question>;
/**
 * @generated from message agent.v1.AskQuestionArgs_Option
 */
export type AskQuestionArgs_Option = Message<"agent.v1.AskQuestionArgs_Option"> & {
    /**
     * stable option id
     *
     * @generated from field: string id = 1;
     */
    id: string;
    /**
     * display text
     *
     * @generated from field: string label = 2;
     */
    label: string;
};
/**
 * Describes the message agent.v1.AskQuestionArgs_Option.
 * Use `create(AskQuestionArgs_OptionSchema)` to create a new message.
 */
export declare const AskQuestionArgs_OptionSchema: GenMessage<AskQuestionArgs_Option>;
/**
 * Marker indicating that questions have been sent asynchronously Answers will arrive later as a separate ask_question tool call
 *
 * @generated from message agent.v1.AskQuestionAsync
 */
export type AskQuestionAsync = Message<"agent.v1.AskQuestionAsync"> & {};
/**
 * Describes the message agent.v1.AskQuestionAsync.
 * Use `create(AskQuestionAsyncSchema)` to create a new message.
 */
export declare const AskQuestionAsyncSchema: GenMessage<AskQuestionAsync>;
/**
 * @generated from message agent.v1.AskQuestionResult
 */
export type AskQuestionResult = Message<"agent.v1.AskQuestionResult"> & {
    /**
     * @generated from oneof agent.v1.AskQuestionResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.AskQuestionSuccess success = 1;
         */
        value: AskQuestionSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.AskQuestionError error = 2;
         */
        value: AskQuestionError;
        case: "error";
    } | {
        /**
         * @generated from field: agent.v1.AskQuestionRejected rejected = 3;
         */
        value: AskQuestionRejected;
        case: "rejected";
    } | {
        /**
         * @generated from field: agent.v1.AskQuestionAsync async = 4;
         */
        value: AskQuestionAsync;
        case: "async";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.AskQuestionResult.
 * Use `create(AskQuestionResultSchema)` to create a new message.
 */
export declare const AskQuestionResultSchema: GenMessage<AskQuestionResult>;
/**
 * @generated from message agent.v1.AskQuestionSuccess
 */
export type AskQuestionSuccess = Message<"agent.v1.AskQuestionSuccess"> & {
    /**
     * @generated from field: repeated agent.v1.AskQuestionSuccess_Answer answers = 1;
     */
    answers: AskQuestionSuccess_Answer[];
};
/**
 * Describes the message agent.v1.AskQuestionSuccess.
 * Use `create(AskQuestionSuccessSchema)` to create a new message.
 */
export declare const AskQuestionSuccessSchema: GenMessage<AskQuestionSuccess>;
/**
 * @generated from message agent.v1.AskQuestionSuccess_Answer
 */
export type AskQuestionSuccess_Answer = Message<"agent.v1.AskQuestionSuccess_Answer"> & {
    /**
     * @generated from field: string question_id = 1;
     */
    questionId: string;
    /**
     * empty if unanswered
     *
     * @generated from field: repeated string selected_option_ids = 2;
     */
    selectedOptionIds: string[];
};
/**
 * Describes the message agent.v1.AskQuestionSuccess_Answer.
 * Use `create(AskQuestionSuccess_AnswerSchema)` to create a new message.
 */
export declare const AskQuestionSuccess_AnswerSchema: GenMessage<AskQuestionSuccess_Answer>;
/**
 * @generated from message agent.v1.AskQuestionError
 */
export type AskQuestionError = Message<"agent.v1.AskQuestionError"> & {
    /**
     * @generated from field: string error_message = 1;
     */
    errorMessage: string;
};
/**
 * Describes the message agent.v1.AskQuestionError.
 * Use `create(AskQuestionErrorSchema)` to create a new message.
 */
export declare const AskQuestionErrorSchema: GenMessage<AskQuestionError>;
/**
 * @generated from message agent.v1.AskQuestionRejected
 */
export type AskQuestionRejected = Message<"agent.v1.AskQuestionRejected"> & {
    /**
     * @generated from field: string reason = 1;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.AskQuestionRejected.
 * Use `create(AskQuestionRejectedSchema)` to create a new message.
 */
export declare const AskQuestionRejectedSchema: GenMessage<AskQuestionRejected>;
/**
 * @generated from message agent.v1.BackgroundShellSpawnArgs
 */
export type BackgroundShellSpawnArgs = Message<"agent.v1.BackgroundShellSpawnArgs"> & {
    /**
     * @generated from field: string command = 1;
     */
    command: string;
    /**
     * @generated from field: string working_directory = 2;
     */
    workingDirectory: string;
    /**
     * @generated from field: string tool_call_id = 3;
     */
    toolCallId: string;
    /**
     * @generated from field: agent.v1.ShellCommandParsingResult parsing_result = 4;
     */
    parsingResult?: ShellCommandParsingResult | undefined;
    /**
     * @generated from field: optional agent.v1.SandboxPolicy sandbox_policy = 5;
     */
    sandboxPolicy?: SandboxPolicy | undefined;
    /**
     * @generated from field: bool enable_write_shell_stdin_tool = 6;
     */
    enableWriteShellStdinTool: boolean;
    /**
     * @generated from field: optional string description = 7;
     */
    description?: string | undefined;
    /**
     * @generated from field: optional agent.v1.CommandClassifierResult classifier_result = 8;
     */
    classifierResult?: CommandClassifierResult | undefined;
    /**
     * @generated from field: optional agent.v1.ShellOutputNotificationConfig output_notification = 9;
     */
    outputNotification?: ShellOutputNotificationConfig | undefined;
    /**
     * @generated from field: optional agent.v1.SmartModeApproval smart_mode_approval = 10;
     */
    smartModeApproval?: SmartModeApproval | undefined;
    /**
     * @generated from field: optional agent.v1.ShellHookApprovalRequirement hook_approval_requirement = 11;
     */
    hookApprovalRequirement?: ShellHookApprovalRequirement | undefined;
    /**
     * @generated from field: bool skip_approval = 12;
     */
    skipApproval: boolean;
    /**
     * @generated from field: optional string conversation_id = 13;
     */
    conversationId?: string | undefined;
};
/**
 * Describes the message agent.v1.BackgroundShellSpawnArgs.
 * Use `create(BackgroundShellSpawnArgsSchema)` to create a new message.
 */
export declare const BackgroundShellSpawnArgsSchema: GenMessage<BackgroundShellSpawnArgs>;
/**
 * Result of spawning a background shell
 *
 * @generated from message agent.v1.BackgroundShellSpawnResult
 */
export type BackgroundShellSpawnResult = Message<"agent.v1.BackgroundShellSpawnResult"> & {
    /**
     * @generated from oneof agent.v1.BackgroundShellSpawnResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.BackgroundShellSpawnSuccess success = 1;
         */
        value: BackgroundShellSpawnSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.BackgroundShellSpawnError error = 2;
         */
        value: BackgroundShellSpawnError;
        case: "error";
    } | {
        /**
         * @generated from field: agent.v1.ShellRejected rejected = 3;
         */
        value: ShellRejected;
        case: "rejected";
    } | {
        /**
         * @generated from field: agent.v1.ShellPermissionDenied permission_denied = 4;
         */
        value: ShellPermissionDenied;
        case: "permissionDenied";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.BackgroundShellSpawnResult.
 * Use `create(BackgroundShellSpawnResultSchema)` to create a new message.
 */
export declare const BackgroundShellSpawnResultSchema: GenMessage<BackgroundShellSpawnResult>;
/**
 * @generated from message agent.v1.BackgroundShellSpawnSuccess
 */
export type BackgroundShellSpawnSuccess = Message<"agent.v1.BackgroundShellSpawnSuccess"> & {
    /**
     * @generated from field: uint32 shell_id = 1;
     */
    shellId: number;
    /**
     * @generated from field: string command = 2;
     */
    command: string;
    /**
     * @generated from field: string working_directory = 3;
     */
    workingDirectory: string;
    /**
     * Process ID of the spawned shell
     *
     * @generated from field: optional uint32 pid = 4;
     */
    pid?: number | undefined;
};
/**
 * Describes the message agent.v1.BackgroundShellSpawnSuccess.
 * Use `create(BackgroundShellSpawnSuccessSchema)` to create a new message.
 */
export declare const BackgroundShellSpawnSuccessSchema: GenMessage<BackgroundShellSpawnSuccess>;
/**
 * @generated from message agent.v1.BackgroundShellSpawnError
 */
export type BackgroundShellSpawnError = Message<"agent.v1.BackgroundShellSpawnError"> & {
    /**
     * @generated from field: string command = 1;
     */
    command: string;
    /**
     * @generated from field: string working_directory = 2;
     */
    workingDirectory: string;
    /**
     * @generated from field: string error = 3;
     */
    error: string;
};
/**
 * Describes the message agent.v1.BackgroundShellSpawnError.
 * Use `create(BackgroundShellSpawnErrorSchema)` to create a new message.
 */
export declare const BackgroundShellSpawnErrorSchema: GenMessage<BackgroundShellSpawnError>;
/**
 * @generated from message agent.v1.WriteShellStdinArgs
 */
export type WriteShellStdinArgs = Message<"agent.v1.WriteShellStdinArgs"> & {
    /**
     * @generated from field: uint32 shell_id = 1;
     */
    shellId: number;
    /**
     * @generated from field: string chars = 2;
     */
    chars: string;
};
/**
 * Describes the message agent.v1.WriteShellStdinArgs.
 * Use `create(WriteShellStdinArgsSchema)` to create a new message.
 */
export declare const WriteShellStdinArgsSchema: GenMessage<WriteShellStdinArgs>;
/**
 * @generated from message agent.v1.WriteShellStdinResult
 */
export type WriteShellStdinResult = Message<"agent.v1.WriteShellStdinResult"> & {
    /**
     * @generated from oneof agent.v1.WriteShellStdinResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.WriteShellStdinSuccess success = 1;
         */
        value: WriteShellStdinSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.WriteShellStdinError error = 2;
         */
        value: WriteShellStdinError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.WriteShellStdinResult.
 * Use `create(WriteShellStdinResultSchema)` to create a new message.
 */
export declare const WriteShellStdinResultSchema: GenMessage<WriteShellStdinResult>;
/**
 * @generated from message agent.v1.WriteShellStdinSuccess
 */
export type WriteShellStdinSuccess = Message<"agent.v1.WriteShellStdinSuccess"> & {
    /**
     * @generated from field: uint32 shell_id = 1;
     */
    shellId: number;
    /**
     * @generated from field: uint32 terminal_file_length_before_input_written = 2;
     */
    terminalFileLengthBeforeInputWritten: number;
};
/**
 * Describes the message agent.v1.WriteShellStdinSuccess.
 * Use `create(WriteShellStdinSuccessSchema)` to create a new message.
 */
export declare const WriteShellStdinSuccessSchema: GenMessage<WriteShellStdinSuccess>;
/**
 * @generated from message agent.v1.WriteShellStdinError
 */
export type WriteShellStdinError = Message<"agent.v1.WriteShellStdinError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.WriteShellStdinError.
 * Use `create(WriteShellStdinErrorSchema)` to create a new message.
 */
export declare const WriteShellStdinErrorSchema: GenMessage<WriteShellStdinError>;
/**
 * @generated from message agent.v1.Coordinate
 */
export type Coordinate = Message<"agent.v1.Coordinate"> & {
    /**
     * @generated from field: int32 x = 1;
     */
    x: number;
    /**
     * @generated from field: int32 y = 2;
     */
    y: number;
};
/**
 * Describes the message agent.v1.Coordinate.
 * Use `create(CoordinateSchema)` to create a new message.
 */
export declare const CoordinateSchema: GenMessage<Coordinate>;
/**
 * Arguments for the computer-use tool
 *
 * @generated from message agent.v1.ComputerUseArgs
 */
export type ComputerUseArgs = Message<"agent.v1.ComputerUseArgs"> & {
    /**
     * @generated from field: string tool_call_id = 1;
     */
    toolCallId: string;
    /**
     * @generated from field: repeated agent.v1.ComputerUseAction actions = 2;
     */
    actions: ComputerUseAction[];
};
/**
 * Describes the message agent.v1.ComputerUseArgs.
 * Use `create(ComputerUseArgsSchema)` to create a new message.
 */
export declare const ComputerUseArgsSchema: GenMessage<ComputerUseArgs>;
/**
 * A single computer-use action. This is our internal canonical representation. Provider-specific formats are converted to this by adapters.
 *
 * @generated from message agent.v1.ComputerUseAction
 */
export type ComputerUseAction = Message<"agent.v1.ComputerUseAction"> & {
    /**
     * @generated from oneof agent.v1.ComputerUseAction.action
     */
    action: {
        /**
         * @generated from field: agent.v1.MouseMoveAction mouse_move = 1;
         */
        value: MouseMoveAction;
        case: "mouseMove";
    } | {
        /**
         * @generated from field: agent.v1.ClickAction click = 2;
         */
        value: ClickAction;
        case: "click";
    } | {
        /**
         * @generated from field: agent.v1.MouseDownAction mouse_down = 3;
         */
        value: MouseDownAction;
        case: "mouseDown";
    } | {
        /**
         * @generated from field: agent.v1.MouseUpAction mouse_up = 4;
         */
        value: MouseUpAction;
        case: "mouseUp";
    } | {
        /**
         * @generated from field: agent.v1.DragAction drag = 5;
         */
        value: DragAction;
        case: "drag";
    } | {
        /**
         * @generated from field: agent.v1.ScrollAction scroll = 6;
         */
        value: ScrollAction;
        case: "scroll";
    } | {
        /**
         * @generated from field: agent.v1.TypeAction type = 7;
         */
        value: TypeAction;
        case: "type";
    } | {
        /**
         * @generated from field: agent.v1.KeyAction key = 8;
         */
        value: KeyAction;
        case: "key";
    } | {
        /**
         * @generated from field: agent.v1.WaitAction wait = 9;
         */
        value: WaitAction;
        case: "wait";
    } | {
        /**
         * @generated from field: agent.v1.ScreenshotAction screenshot = 10;
         */
        value: ScreenshotAction;
        case: "screenshot";
    } | {
        /**
         * @generated from field: agent.v1.CursorPositionAction cursor_position = 11;
         */
        value: CursorPositionAction;
        case: "cursorPosition";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ComputerUseAction.
 * Use `create(ComputerUseActionSchema)` to create a new message.
 */
export declare const ComputerUseActionSchema: GenMessage<ComputerUseAction>;
/**
 * Move mouse to coordinate (required)
 *
 * @generated from message agent.v1.MouseMoveAction
 */
export type MouseMoveAction = Message<"agent.v1.MouseMoveAction"> & {
    /**
     * @generated from field: agent.v1.Coordinate coordinate = 1;
     */
    coordinate?: Coordinate | undefined;
};
/**
 * Describes the message agent.v1.MouseMoveAction.
 * Use `create(MouseMoveActionSchema)` to create a new message.
 */
export declare const MouseMoveActionSchema: GenMessage<MouseMoveAction>;
/**
 * Unified click action - coordinate: optional, clicks at current cursor if omitted - button: which mouse button (default: LEFT) - count: click count (1=single, 2=double, 3=triple, default: 1) - modifier_keys: optional, held during click (e.g., "ctrl", "shift", "ctrl+shift")
 *
 * @generated from message agent.v1.ClickAction
 */
export type ClickAction = Message<"agent.v1.ClickAction"> & {
    /**
     * @generated from field: optional agent.v1.Coordinate coordinate = 1;
     */
    coordinate?: Coordinate | undefined;
    /**
     * @generated from field: int32 button = 2;
     */
    button: number;
    /**
     * @generated from field: int32 count = 3;
     */
    count: number;
    /**
     * @generated from field: optional string modifier_keys = 4;
     */
    modifierKeys?: string | undefined;
};
/**
 * Describes the message agent.v1.ClickAction.
 * Use `create(ClickActionSchema)` to create a new message.
 */
export declare const ClickActionSchema: GenMessage<ClickAction>;
/**
 * Press mouse button down (for fine-grained drag control)
 *
 * @generated from message agent.v1.MouseDownAction
 */
export type MouseDownAction = Message<"agent.v1.MouseDownAction"> & {
    /**
     * @generated from field: int32 button = 1;
     */
    button: number;
};
/**
 * Describes the message agent.v1.MouseDownAction.
 * Use `create(MouseDownActionSchema)` to create a new message.
 */
export declare const MouseDownActionSchema: GenMessage<MouseDownAction>;
/**
 * Release mouse button (for fine-grained drag control)
 *
 * @generated from message agent.v1.MouseUpAction
 */
export type MouseUpAction = Message<"agent.v1.MouseUpAction"> & {
    /**
     * @generated from field: int32 button = 1;
     */
    button: number;
};
/**
 * Describes the message agent.v1.MouseUpAction.
 * Use `create(MouseUpActionSchema)` to create a new message.
 */
export declare const MouseUpActionSchema: GenMessage<MouseUpAction>;
/**
 * Drag action - path of coordinates (at least 2 points: [start, ..., end])
 *
 * @generated from message agent.v1.DragAction
 */
export type DragAction = Message<"agent.v1.DragAction"> & {
    /**
     * @generated from field: repeated agent.v1.Coordinate path = 1;
     */
    path: Coordinate[];
    /**
     * @generated from field: int32 button = 2;
     */
    button: number;
};
/**
 * Describes the message agent.v1.DragAction.
 * Use `create(DragActionSchema)` to create a new message.
 */
export declare const DragActionSchema: GenMessage<DragAction>;
/**
 * Scroll action - coordinate: optional, scrolls at current cursor if omitted - direction: scroll direction (required) - amount: number of scroll "clicks" (default: 3) - modifier_keys: optional, held during scroll (e.g., "ctrl" for zoom)
 *
 * @generated from message agent.v1.ScrollAction
 */
export type ScrollAction = Message<"agent.v1.ScrollAction"> & {
    /**
     * @generated from field: optional agent.v1.Coordinate coordinate = 1;
     */
    coordinate?: Coordinate | undefined;
    /**
     * @generated from field: int32 direction = 2;
     */
    direction: number;
    /**
     * @generated from field: int32 amount = 3;
     */
    amount: number;
    /**
     * @generated from field: optional string modifier_keys = 4;
     */
    modifierKeys?: string | undefined;
};
/**
 * Describes the message agent.v1.ScrollAction.
 * Use `create(ScrollActionSchema)` to create a new message.
 */
export declare const ScrollActionSchema: GenMessage<ScrollAction>;
/**
 * Type text
 *
 * @generated from message agent.v1.TypeAction
 */
export type TypeAction = Message<"agent.v1.TypeAction"> & {
    /**
     * @generated from field: string text = 1;
     */
    text: string;
};
/**
 * Describes the message agent.v1.TypeAction.
 * Use `create(TypeActionSchema)` to create a new message.
 */
export declare const TypeActionSchema: GenMessage<TypeAction>;
/**
 * Press key or key combination (xdotool-style: "ctrl+a", "Return", "Alt+Left") If hold_duration_ms is set, holds the key for that duration
 *
 * @generated from message agent.v1.KeyAction
 */
export type KeyAction = Message<"agent.v1.KeyAction"> & {
    /**
     * @generated from field: string key = 1;
     */
    key: string;
    /**
     * @generated from field: optional int32 hold_duration_ms = 2;
     */
    holdDurationMs?: number | undefined;
};
/**
 * Describes the message agent.v1.KeyAction.
 * Use `create(KeyActionSchema)` to create a new message.
 */
export declare const KeyActionSchema: GenMessage<KeyAction>;
/**
 * Wait for a duration
 *
 * @generated from message agent.v1.WaitAction
 */
export type WaitAction = Message<"agent.v1.WaitAction"> & {
    /**
     * @generated from field: int32 duration_ms = 1;
     */
    durationMs: number;
};
/**
 * Describes the message agent.v1.WaitAction.
 * Use `create(WaitActionSchema)` to create a new message.
 */
export declare const WaitActionSchema: GenMessage<WaitAction>;
/**
 * Take a screenshot
 *
 * @generated from message agent.v1.ScreenshotAction
 */
export type ScreenshotAction = Message<"agent.v1.ScreenshotAction"> & {};
/**
 * Describes the message agent.v1.ScreenshotAction.
 * Use `create(ScreenshotActionSchema)` to create a new message.
 */
export declare const ScreenshotActionSchema: GenMessage<ScreenshotAction>;
/**
 * Get current cursor position
 *
 * @generated from message agent.v1.CursorPositionAction
 */
export type CursorPositionAction = Message<"agent.v1.CursorPositionAction"> & {};
/**
 * Describes the message agent.v1.CursorPositionAction.
 * Use `create(CursorPositionActionSchema)` to create a new message.
 */
export declare const CursorPositionActionSchema: GenMessage<CursorPositionAction>;
/**
 * Result of computer-use execution
 *
 * @generated from message agent.v1.ComputerUseResult
 */
export type ComputerUseResult = Message<"agent.v1.ComputerUseResult"> & {
    /**
     * @generated from oneof agent.v1.ComputerUseResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.ComputerUseSuccess success = 1;
         */
        value: ComputerUseSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.ComputerUseError error = 2;
         */
        value: ComputerUseError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ComputerUseResult.
 * Use `create(ComputerUseResultSchema)` to create a new message.
 */
export declare const ComputerUseResultSchema: GenMessage<ComputerUseResult>;
/**
 * @generated from message agent.v1.ComputerUseSuccess
 */
export type ComputerUseSuccess = Message<"agent.v1.ComputerUseSuccess"> & {
    /**
     * @generated from field: int32 action_count = 1;
     */
    actionCount: number;
    /**
     * @generated from field: int32 duration_ms = 2;
     */
    durationMs: number;
    /**
     * Base64 WebP at API resolution
     *
     * @generated from field: optional string screenshot = 3;
     */
    screenshot?: string | undefined;
    /**
     * @generated from field: optional string log = 4;
     */
    log?: string | undefined;
    /**
     * @generated from field: optional string screenshot_path = 5;
     */
    screenshotPath?: string | undefined;
    /**
     * In API resolution
     *
     * @generated from field: optional agent.v1.Coordinate cursor_position = 6;
     */
    cursorPosition?: Coordinate | undefined;
};
/**
 * Describes the message agent.v1.ComputerUseSuccess.
 * Use `create(ComputerUseSuccessSchema)` to create a new message.
 */
export declare const ComputerUseSuccessSchema: GenMessage<ComputerUseSuccess>;
/**
 * @generated from message agent.v1.ComputerUseError
 */
export type ComputerUseError = Message<"agent.v1.ComputerUseError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
    /**
     * @generated from field: int32 action_count = 2;
     */
    actionCount: number;
    /**
     * @generated from field: int32 duration_ms = 3;
     */
    durationMs: number;
    /**
     * @generated from field: optional string log = 4;
     */
    log?: string | undefined;
    /**
     * Base64 WebP of screen state at error time
     *
     * @generated from field: optional string screenshot = 5;
     */
    screenshot?: string | undefined;
    /**
     * Path where screenshot was saved
     *
     * @generated from field: optional string screenshot_path = 6;
     */
    screenshotPath?: string | undefined;
};
/**
 * Describes the message agent.v1.ComputerUseError.
 * Use `create(ComputerUseErrorSchema)` to create a new message.
 */
export declare const ComputerUseErrorSchema: GenMessage<ComputerUseError>;
/**
 * @generated from message agent.v1.ComputerUseToolCall
 */
export type ComputerUseToolCall = Message<"agent.v1.ComputerUseToolCall"> & {
    /**
     * @generated from field: agent.v1.ComputerUseArgs args = 1;
     */
    args?: ComputerUseArgs | undefined;
    /**
     * @generated from field: agent.v1.ComputerUseResult result = 2;
     */
    result?: ComputerUseResult | undefined;
};
/**
 * Describes the message agent.v1.ComputerUseToolCall.
 * Use `create(ComputerUseToolCallSchema)` to create a new message.
 */
export declare const ComputerUseToolCallSchema: GenMessage<ComputerUseToolCall>;
/**
 * @generated from message agent.v1.CreatePlanToolCall
 */
export type CreatePlanToolCall = Message<"agent.v1.CreatePlanToolCall"> & {
    /**
     * @generated from field: agent.v1.CreatePlanArgs args = 1;
     */
    args?: CreatePlanArgs | undefined;
    /**
     * @generated from field: agent.v1.CreatePlanResult result = 2;
     */
    result?: CreatePlanResult | undefined;
};
/**
 * Describes the message agent.v1.CreatePlanToolCall.
 * Use `create(CreatePlanToolCallSchema)` to create a new message.
 */
export declare const CreatePlanToolCallSchema: GenMessage<CreatePlanToolCall>;
/**
 * A phase groups related todos together for project-mode plans
 *
 * @generated from message agent.v1.Phase
 */
export type Phase = Message<"agent.v1.Phase"> & {
    /**
     * @generated from field: string name = 1;
     */
    name: string;
    /**
     * @generated from field: repeated agent.v1.TodoItem todos = 2;
     */
    todos: TodoItem[];
};
/**
 * Describes the message agent.v1.Phase.
 * Use `create(PhaseSchema)` to create a new message.
 */
export declare const PhaseSchema: GenMessage<Phase>;
/**
 * @generated from message agent.v1.CreatePlanArgs
 */
export type CreatePlanArgs = Message<"agent.v1.CreatePlanArgs"> & {
    /**
     * @generated from field: string plan = 1;
     */
    plan: string;
    /**
     * @generated from field: repeated agent.v1.TodoItem todos = 2;
     */
    todos: TodoItem[];
    /**
     * @generated from field: string overview = 3;
     */
    overview: string;
    /**
     * @generated from field: string name = 4;
     */
    name: string;
    /**
     * When true, uses phases instead of flat todos (mutually exclusive)
     *
     * @generated from field: bool is_project = 5;
     */
    isProject: boolean;
    /**
     * Implementation phases (only valid when is_project=true)
     *
     * @generated from field: repeated agent.v1.Phase phases = 6;
     */
    phases: Phase[];
};
/**
 * Describes the message agent.v1.CreatePlanArgs.
 * Use `create(CreatePlanArgsSchema)` to create a new message.
 */
export declare const CreatePlanArgsSchema: GenMessage<CreatePlanArgs>;
/**
 * @generated from message agent.v1.CreatePlanResult
 */
export type CreatePlanResult = Message<"agent.v1.CreatePlanResult"> & {
    /**
     * URI of the plan file (returned when file_based_plan_edits is enabled)
     *
     * @generated from field: string plan_uri = 3;
     */
    planUri: string;
    /**
     * @generated from oneof agent.v1.CreatePlanResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.CreatePlanSuccess success = 1;
         */
        value: CreatePlanSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.CreatePlanError error = 2;
         */
        value: CreatePlanError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.CreatePlanResult.
 * Use `create(CreatePlanResultSchema)` to create a new message.
 */
export declare const CreatePlanResultSchema: GenMessage<CreatePlanResult>;
/**
 * @generated from message agent.v1.CreatePlanSuccess
 */
export type CreatePlanSuccess = Message<"agent.v1.CreatePlanSuccess"> & {};
/**
 * Describes the message agent.v1.CreatePlanSuccess.
 * Use `create(CreatePlanSuccessSchema)` to create a new message.
 */
export declare const CreatePlanSuccessSchema: GenMessage<CreatePlanSuccess>;
/**
 * @generated from message agent.v1.CreatePlanError
 */
export type CreatePlanError = Message<"agent.v1.CreatePlanError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.CreatePlanError.
 * Use `create(CreatePlanErrorSchema)` to create a new message.
 */
export declare const CreatePlanErrorSchema: GenMessage<CreatePlanError>;
/**
 * Query sent from server to client to create a plan file
 *
 * @generated from message agent.v1.CreatePlanRequestQuery
 */
export type CreatePlanRequestQuery = Message<"agent.v1.CreatePlanRequestQuery"> & {
    /**
     * @generated from field: agent.v1.CreatePlanArgs args = 1;
     */
    args?: CreatePlanArgs | undefined;
    /**
     * @generated from field: string tool_call_id = 2;
     */
    toolCallId: string;
};
/**
 * Describes the message agent.v1.CreatePlanRequestQuery.
 * Use `create(CreatePlanRequestQuerySchema)` to create a new message.
 */
export declare const CreatePlanRequestQuerySchema: GenMessage<CreatePlanRequestQuery>;
/**
 * Response from client with the created plan URI
 *
 * @generated from message agent.v1.CreatePlanRequestResponse
 */
export type CreatePlanRequestResponse = Message<"agent.v1.CreatePlanRequestResponse"> & {
    /**
     * @generated from field: agent.v1.CreatePlanResult result = 1;
     */
    result?: CreatePlanResult | undefined;
};
/**
 * Describes the message agent.v1.CreatePlanRequestResponse.
 * Use `create(CreatePlanRequestResponseSchema)` to create a new message.
 */
export declare const CreatePlanRequestResponseSchema: GenMessage<CreatePlanRequestResponse>;
/**
 * @generated from message agent.v1.CursorRuleTypeGlobal
 */
export type CursorRuleTypeGlobal = Message<"agent.v1.CursorRuleTypeGlobal"> & {};
/**
 * Describes the message agent.v1.CursorRuleTypeGlobal.
 * Use `create(CursorRuleTypeGlobalSchema)` to create a new message.
 */
export declare const CursorRuleTypeGlobalSchema: GenMessage<CursorRuleTypeGlobal>;
/**
 * @generated from message agent.v1.CursorRuleTypeFileGlobs
 */
export type CursorRuleTypeFileGlobs = Message<"agent.v1.CursorRuleTypeFileGlobs"> & {
    /**
     * @generated from field: repeated string globs = 1;
     */
    globs: string[];
};
/**
 * Describes the message agent.v1.CursorRuleTypeFileGlobs.
 * Use `create(CursorRuleTypeFileGlobsSchema)` to create a new message.
 */
export declare const CursorRuleTypeFileGlobsSchema: GenMessage<CursorRuleTypeFileGlobs>;
/**
 * @generated from message agent.v1.CursorRuleTypeAgentFetched
 */
export type CursorRuleTypeAgentFetched = Message<"agent.v1.CursorRuleTypeAgentFetched"> & {
    /**
     * @generated from field: string description = 1;
     */
    description: string;
};
/**
 * Describes the message agent.v1.CursorRuleTypeAgentFetched.
 * Use `create(CursorRuleTypeAgentFetchedSchema)` to create a new message.
 */
export declare const CursorRuleTypeAgentFetchedSchema: GenMessage<CursorRuleTypeAgentFetched>;
/**
 * @generated from message agent.v1.CursorRuleTypeManuallyAttached
 */
export type CursorRuleTypeManuallyAttached = Message<"agent.v1.CursorRuleTypeManuallyAttached"> & {};
/**
 * Describes the message agent.v1.CursorRuleTypeManuallyAttached.
 * Use `create(CursorRuleTypeManuallyAttachedSchema)` to create a new message.
 */
export declare const CursorRuleTypeManuallyAttachedSchema: GenMessage<CursorRuleTypeManuallyAttached>;
/**
 * @generated from message agent.v1.CursorRuleType
 */
export type CursorRuleType = Message<"agent.v1.CursorRuleType"> & {
    /**
     * @generated from oneof agent.v1.CursorRuleType.type
     */
    type: {
        /**
         * @generated from field: agent.v1.CursorRuleTypeGlobal global = 1;
         */
        value: CursorRuleTypeGlobal;
        case: "global";
    } | {
        /**
         * @generated from field: agent.v1.CursorRuleTypeFileGlobs file_globbed = 2;
         */
        value: CursorRuleTypeFileGlobs;
        case: "fileGlobbed";
    } | {
        /**
         * @generated from field: agent.v1.CursorRuleTypeAgentFetched agent_fetched = 3;
         */
        value: CursorRuleTypeAgentFetched;
        case: "agentFetched";
    } | {
        /**
         * @generated from field: agent.v1.CursorRuleTypeManuallyAttached manually_attached = 4;
         */
        value: CursorRuleTypeManuallyAttached;
        case: "manuallyAttached";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.CursorRuleType.
 * Use `create(CursorRuleTypeSchema)` to create a new message.
 */
export declare const CursorRuleTypeSchema: GenMessage<CursorRuleType>;
/**
 * @generated from message agent.v1.CursorRule
 */
export type CursorRule = Message<"agent.v1.CursorRule"> & {
    /**
     * absolute path to the .mdc file
     *
     * @generated from field: string full_path = 1;
     */
    fullPath: string;
    /**
     * rule body, trimmed to reasonable size if needed by client
     *
     * @generated from field: string content = 2;
     */
    content: string;
    /**
     * classification of rule
     *
     * @generated from field: agent.v1.CursorRuleType type = 3;
     */
    type?: CursorRuleType | undefined;
    /**
     * source of the rule
     *
     * @generated from field: int32 source = 4;
     */
    source: number;
    /**
     * Git remote origin URL for the repository containing this rule, if available. Normalized to host/path format (e.g., "github.com/owner/repo").
     *
     * @generated from field: optional string git_remote_origin = 5;
     */
    gitRemoteOrigin?: string | undefined;
    /**
     * @generated from field: optional string parse_error = 6;
     */
    parseError?: string | undefined;
};
/**
 * Describes the message agent.v1.CursorRule.
 * Use `create(CursorRuleSchema)` to create a new message.
 */
export declare const CursorRuleSchema: GenMessage<CursorRule>;
/**
 * @generated from message agent.v1.DeleteArgs
 */
export type DeleteArgs = Message<"agent.v1.DeleteArgs"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string tool_call_id = 2;
     */
    toolCallId: string;
};
/**
 * Describes the message agent.v1.DeleteArgs.
 * Use `create(DeleteArgsSchema)` to create a new message.
 */
export declare const DeleteArgsSchema: GenMessage<DeleteArgs>;
/**
 * @generated from message agent.v1.DeleteResult
 */
export type DeleteResult = Message<"agent.v1.DeleteResult"> & {
    /**
     * @generated from oneof agent.v1.DeleteResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.DeleteSuccess success = 1;
         */
        value: DeleteSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.DeleteFileNotFound file_not_found = 2;
         */
        value: DeleteFileNotFound;
        case: "fileNotFound";
    } | {
        /**
         * @generated from field: agent.v1.DeleteNotFile not_file = 3;
         */
        value: DeleteNotFile;
        case: "notFile";
    } | {
        /**
         * @generated from field: agent.v1.DeletePermissionDenied permission_denied = 4;
         */
        value: DeletePermissionDenied;
        case: "permissionDenied";
    } | {
        /**
         * @generated from field: agent.v1.DeleteFileBusy file_busy = 5;
         */
        value: DeleteFileBusy;
        case: "fileBusy";
    } | {
        /**
         * @generated from field: agent.v1.DeleteRejected rejected = 6;
         */
        value: DeleteRejected;
        case: "rejected";
    } | {
        /**
         * @generated from field: agent.v1.DeleteError error = 7;
         */
        value: DeleteError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.DeleteResult.
 * Use `create(DeleteResultSchema)` to create a new message.
 */
export declare const DeleteResultSchema: GenMessage<DeleteResult>;
/**
 * @generated from message agent.v1.DeleteSuccess
 */
export type DeleteSuccess = Message<"agent.v1.DeleteSuccess"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string deleted_file = 2;
     */
    deletedFile: string;
    /**
     * @generated from field: int64 file_size = 3;
     */
    fileSize: bigint;
    /**
     * @generated from field: string prev_content = 4;
     */
    prevContent: string;
};
/**
 * Describes the message agent.v1.DeleteSuccess.
 * Use `create(DeleteSuccessSchema)` to create a new message.
 */
export declare const DeleteSuccessSchema: GenMessage<DeleteSuccess>;
/**
 * @generated from message agent.v1.DeleteFileNotFound
 */
export type DeleteFileNotFound = Message<"agent.v1.DeleteFileNotFound"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
};
/**
 * Describes the message agent.v1.DeleteFileNotFound.
 * Use `create(DeleteFileNotFoundSchema)` to create a new message.
 */
export declare const DeleteFileNotFoundSchema: GenMessage<DeleteFileNotFound>;
/**
 * @generated from message agent.v1.DeleteNotFile
 */
export type DeleteNotFile = Message<"agent.v1.DeleteNotFile"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * "directory" or "other"
     *
     * @generated from field: string actual_type = 2;
     */
    actualType: string;
};
/**
 * Describes the message agent.v1.DeleteNotFile.
 * Use `create(DeleteNotFileSchema)` to create a new message.
 */
export declare const DeleteNotFileSchema: GenMessage<DeleteNotFile>;
/**
 * @generated from message agent.v1.DeletePermissionDenied
 */
export type DeletePermissionDenied = Message<"agent.v1.DeletePermissionDenied"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string client_visible_error = 2;
     */
    clientVisibleError: string;
    /**
     * @generated from field: bool is_readonly = 3;
     */
    isReadonly: boolean;
};
/**
 * Describes the message agent.v1.DeletePermissionDenied.
 * Use `create(DeletePermissionDeniedSchema)` to create a new message.
 */
export declare const DeletePermissionDeniedSchema: GenMessage<DeletePermissionDenied>;
/**
 * @generated from message agent.v1.DeleteFileBusy
 */
export type DeleteFileBusy = Message<"agent.v1.DeleteFileBusy"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
};
/**
 * Describes the message agent.v1.DeleteFileBusy.
 * Use `create(DeleteFileBusySchema)` to create a new message.
 */
export declare const DeleteFileBusySchema: GenMessage<DeleteFileBusy>;
/**
 * @generated from message agent.v1.DeleteRejected
 */
export type DeleteRejected = Message<"agent.v1.DeleteRejected"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string reason = 2;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.DeleteRejected.
 * Use `create(DeleteRejectedSchema)` to create a new message.
 */
export declare const DeleteRejectedSchema: GenMessage<DeleteRejected>;
/**
 * @generated from message agent.v1.DeleteError
 */
export type DeleteError = Message<"agent.v1.DeleteError"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string error = 2;
     */
    error: string;
};
/**
 * Describes the message agent.v1.DeleteError.
 * Use `create(DeleteErrorSchema)` to create a new message.
 */
export declare const DeleteErrorSchema: GenMessage<DeleteError>;
/**
 * @generated from message agent.v1.DeleteToolCall
 */
export type DeleteToolCall = Message<"agent.v1.DeleteToolCall"> & {
    /**
     * @generated from field: agent.v1.DeleteArgs args = 1;
     */
    args?: DeleteArgs | undefined;
    /**
     * @generated from field: agent.v1.DeleteResult result = 2;
     */
    result?: DeleteResult | undefined;
};
/**
 * Describes the message agent.v1.DeleteToolCall.
 * Use `create(DeleteToolCallSchema)` to create a new message.
 */
export declare const DeleteToolCallSchema: GenMessage<DeleteToolCall>;
/**
 * @generated from message agent.v1.DiagnosticsArgs
 */
export type DiagnosticsArgs = Message<"agent.v1.DiagnosticsArgs"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string tool_call_id = 2;
     */
    toolCallId: string;
};
/**
 * Describes the message agent.v1.DiagnosticsArgs.
 * Use `create(DiagnosticsArgsSchema)` to create a new message.
 */
export declare const DiagnosticsArgsSchema: GenMessage<DiagnosticsArgs>;
/**
 * @generated from message agent.v1.DiagnosticsResult
 */
export type DiagnosticsResult = Message<"agent.v1.DiagnosticsResult"> & {
    /**
     * @generated from oneof agent.v1.DiagnosticsResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.DiagnosticsSuccess success = 1;
         */
        value: DiagnosticsSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.DiagnosticsError error = 2;
         */
        value: DiagnosticsError;
        case: "error";
    } | {
        /**
         * @generated from field: agent.v1.DiagnosticsRejected rejected = 3;
         */
        value: DiagnosticsRejected;
        case: "rejected";
    } | {
        /**
         * @generated from field: agent.v1.DiagnosticsFileNotFound file_not_found = 4;
         */
        value: DiagnosticsFileNotFound;
        case: "fileNotFound";
    } | {
        /**
         * @generated from field: agent.v1.DiagnosticsPermissionDenied permission_denied = 5;
         */
        value: DiagnosticsPermissionDenied;
        case: "permissionDenied";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.DiagnosticsResult.
 * Use `create(DiagnosticsResultSchema)` to create a new message.
 */
export declare const DiagnosticsResultSchema: GenMessage<DiagnosticsResult>;
/**
 * @generated from message agent.v1.DiagnosticsSuccess
 */
export type DiagnosticsSuccess = Message<"agent.v1.DiagnosticsSuccess"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: repeated agent.v1.Diagnostic diagnostics = 2;
     */
    diagnostics: Diagnostic[];
    /**
     * @generated from field: int32 total_diagnostics = 3;
     */
    totalDiagnostics: number;
};
/**
 * Describes the message agent.v1.DiagnosticsSuccess.
 * Use `create(DiagnosticsSuccessSchema)` to create a new message.
 */
export declare const DiagnosticsSuccessSchema: GenMessage<DiagnosticsSuccess>;
/**
 * @generated from message agent.v1.Diagnostic
 */
export type Diagnostic = Message<"agent.v1.Diagnostic"> & {
    /**
     * @generated from field: int32 severity = 1;
     */
    severity: number;
    /**
     * @generated from field: agent.v1.Range range = 2;
     */
    range?: Range | undefined;
    /**
     * @generated from field: string message = 3;
     */
    message: string;
    /**
     * @generated from field: string source = 4;
     */
    source: string;
    /**
     * @generated from field: string code = 5;
     */
    code: string;
    /**
     * @generated from field: bool is_stale = 6;
     */
    isStale: boolean;
};
/**
 * Describes the message agent.v1.Diagnostic.
 * Use `create(DiagnosticSchema)` to create a new message.
 */
export declare const DiagnosticSchema: GenMessage<Diagnostic>;
/**
 * @generated from message agent.v1.DiagnosticsError
 */
export type DiagnosticsError = Message<"agent.v1.DiagnosticsError"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string error = 2;
     */
    error: string;
};
/**
 * Describes the message agent.v1.DiagnosticsError.
 * Use `create(DiagnosticsErrorSchema)` to create a new message.
 */
export declare const DiagnosticsErrorSchema: GenMessage<DiagnosticsError>;
/**
 * @generated from message agent.v1.DiagnosticsRejected
 */
export type DiagnosticsRejected = Message<"agent.v1.DiagnosticsRejected"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string reason = 2;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.DiagnosticsRejected.
 * Use `create(DiagnosticsRejectedSchema)` to create a new message.
 */
export declare const DiagnosticsRejectedSchema: GenMessage<DiagnosticsRejected>;
/**
 * @generated from message agent.v1.DiagnosticsFileNotFound
 */
export type DiagnosticsFileNotFound = Message<"agent.v1.DiagnosticsFileNotFound"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
};
/**
 * Describes the message agent.v1.DiagnosticsFileNotFound.
 * Use `create(DiagnosticsFileNotFoundSchema)` to create a new message.
 */
export declare const DiagnosticsFileNotFoundSchema: GenMessage<DiagnosticsFileNotFound>;
/**
 * @generated from message agent.v1.DiagnosticsPermissionDenied
 */
export type DiagnosticsPermissionDenied = Message<"agent.v1.DiagnosticsPermissionDenied"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
};
/**
 * Describes the message agent.v1.DiagnosticsPermissionDenied.
 * Use `create(DiagnosticsPermissionDeniedSchema)` to create a new message.
 */
export declare const DiagnosticsPermissionDeniedSchema: GenMessage<DiagnosticsPermissionDenied>;
/**
 * @generated from message agent.v1.EditArgs
 */
export type EditArgs = Message<"agent.v1.EditArgs"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: optional string stream_content = 6;
     */
    streamContent?: string | undefined;
};
/**
 * Describes the message agent.v1.EditArgs.
 * Use `create(EditArgsSchema)` to create a new message.
 */
export declare const EditArgsSchema: GenMessage<EditArgs>;
/**
 * @generated from message agent.v1.EditResult
 */
export type EditResult = Message<"agent.v1.EditResult"> & {
    /**
     * @generated from oneof agent.v1.EditResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.EditSuccess success = 1;
         */
        value: EditSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.EditFileNotFound file_not_found = 2;
         */
        value: EditFileNotFound;
        case: "fileNotFound";
    } | {
        /**
         * @generated from field: agent.v1.EditReadPermissionDenied read_permission_denied = 3;
         */
        value: EditReadPermissionDenied;
        case: "readPermissionDenied";
    } | {
        /**
         * @generated from field: agent.v1.EditWritePermissionDenied write_permission_denied = 4;
         */
        value: EditWritePermissionDenied;
        case: "writePermissionDenied";
    } | {
        /**
         * @generated from field: agent.v1.EditRejected rejected = 6;
         */
        value: EditRejected;
        case: "rejected";
    } | {
        /**
         * @generated from field: agent.v1.EditError error = 7;
         */
        value: EditError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.EditResult.
 * Use `create(EditResultSchema)` to create a new message.
 */
export declare const EditResultSchema: GenMessage<EditResult>;
/**
 * @generated from message agent.v1.EditSuccess
 */
export type EditSuccess = Message<"agent.v1.EditSuccess"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: optional int32 lines_added = 3;
     */
    linesAdded?: number | undefined;
    /**
     * @generated from field: optional int32 lines_removed = 4;
     */
    linesRemoved?: number | undefined;
    /**
     * Concatenated chunk diff strings separated by "\n...\n"
     *
     * @generated from field: optional string diff_string = 5;
     */
    diffString?: string | undefined;
    /**
     * undefined if file didn't exist before the edit
     *
     * @generated from field: optional string before_full_file_content = 6;
     */
    beforeFullFileContent?: string | undefined;
    /**
     * @generated from field: string after_full_file_content = 7;
     */
    afterFullFileContent: string;
    /**
     * Formatted message for display to model (resultForModel from EditTransformResult)
     *
     * @generated from field: optional string message = 8;
     */
    message?: string | undefined;
};
/**
 * Describes the message agent.v1.EditSuccess.
 * Use `create(EditSuccessSchema)` to create a new message.
 */
export declare const EditSuccessSchema: GenMessage<EditSuccess>;
/**
 * @generated from message agent.v1.EditFileNotFound
 */
export type EditFileNotFound = Message<"agent.v1.EditFileNotFound"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
};
/**
 * Describes the message agent.v1.EditFileNotFound.
 * Use `create(EditFileNotFoundSchema)` to create a new message.
 */
export declare const EditFileNotFoundSchema: GenMessage<EditFileNotFound>;
/**
 * @generated from message agent.v1.EditReadPermissionDenied
 */
export type EditReadPermissionDenied = Message<"agent.v1.EditReadPermissionDenied"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
};
/**
 * Describes the message agent.v1.EditReadPermissionDenied.
 * Use `create(EditReadPermissionDeniedSchema)` to create a new message.
 */
export declare const EditReadPermissionDeniedSchema: GenMessage<EditReadPermissionDenied>;
/**
 * @generated from message agent.v1.EditWritePermissionDenied
 */
export type EditWritePermissionDenied = Message<"agent.v1.EditWritePermissionDenied"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string error = 2;
     */
    error: string;
    /**
     * @generated from field: bool is_readonly = 3;
     */
    isReadonly: boolean;
};
/**
 * Describes the message agent.v1.EditWritePermissionDenied.
 * Use `create(EditWritePermissionDeniedSchema)` to create a new message.
 */
export declare const EditWritePermissionDeniedSchema: GenMessage<EditWritePermissionDenied>;
/**
 * @generated from message agent.v1.EditRejected
 */
export type EditRejected = Message<"agent.v1.EditRejected"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string reason = 2;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.EditRejected.
 * Use `create(EditRejectedSchema)` to create a new message.
 */
export declare const EditRejectedSchema: GenMessage<EditRejected>;
/**
 * @generated from message agent.v1.EditError
 */
export type EditError = Message<"agent.v1.EditError"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string error = 2;
     */
    error: string;
    /**
     * @generated from field: optional string model_visible_error = 5;
     */
    modelVisibleError?: string | undefined;
};
/**
 * Describes the message agent.v1.EditError.
 * Use `create(EditErrorSchema)` to create a new message.
 */
export declare const EditErrorSchema: GenMessage<EditError>;
/**
 * @generated from message agent.v1.EditToolCall
 */
export type EditToolCall = Message<"agent.v1.EditToolCall"> & {
    /**
     * @generated from field: agent.v1.EditArgs args = 1;
     */
    args?: EditArgs | undefined;
    /**
     * @generated from field: agent.v1.EditResult result = 2;
     */
    result?: EditResult | undefined;
};
/**
 * Describes the message agent.v1.EditToolCall.
 * Use `create(EditToolCallSchema)` to create a new message.
 */
export declare const EditToolCallSchema: GenMessage<EditToolCall>;
/**
 * @generated from message agent.v1.EditToolCallDelta
 */
export type EditToolCallDelta = Message<"agent.v1.EditToolCallDelta"> & {
    /**
     * @generated from field: string stream_content_delta = 1;
     */
    streamContentDelta: string;
};
/**
 * Describes the message agent.v1.EditToolCallDelta.
 * Use `create(EditToolCallDeltaSchema)` to create a new message.
 */
export declare const EditToolCallDeltaSchema: GenMessage<EditToolCallDelta>;
/**
 * @generated from message agent.v1.ExaFetchArgs
 */
export type ExaFetchArgs = Message<"agent.v1.ExaFetchArgs"> & {
    /**
     * @generated from field: repeated string ids = 1;
     */
    ids: string[];
    /**
     * @generated from field: string tool_call_id = 2;
     */
    toolCallId: string;
};
/**
 * Describes the message agent.v1.ExaFetchArgs.
 * Use `create(ExaFetchArgsSchema)` to create a new message.
 */
export declare const ExaFetchArgsSchema: GenMessage<ExaFetchArgs>;
/**
 * @generated from message agent.v1.ExaFetchResult
 */
export type ExaFetchResult = Message<"agent.v1.ExaFetchResult"> & {
    /**
     * @generated from oneof agent.v1.ExaFetchResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.ExaFetchSuccess success = 1;
         */
        value: ExaFetchSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.ExaFetchError error = 2;
         */
        value: ExaFetchError;
        case: "error";
    } | {
        /**
         * @generated from field: agent.v1.ExaFetchRejected rejected = 3;
         */
        value: ExaFetchRejected;
        case: "rejected";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ExaFetchResult.
 * Use `create(ExaFetchResultSchema)` to create a new message.
 */
export declare const ExaFetchResultSchema: GenMessage<ExaFetchResult>;
/**
 * @generated from message agent.v1.ExaFetchSuccess
 */
export type ExaFetchSuccess = Message<"agent.v1.ExaFetchSuccess"> & {
    /**
     * @generated from field: repeated agent.v1.ExaFetchContent contents = 1;
     */
    contents: ExaFetchContent[];
};
/**
 * Describes the message agent.v1.ExaFetchSuccess.
 * Use `create(ExaFetchSuccessSchema)` to create a new message.
 */
export declare const ExaFetchSuccessSchema: GenMessage<ExaFetchSuccess>;
/**
 * @generated from message agent.v1.ExaFetchError
 */
export type ExaFetchError = Message<"agent.v1.ExaFetchError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.ExaFetchError.
 * Use `create(ExaFetchErrorSchema)` to create a new message.
 */
export declare const ExaFetchErrorSchema: GenMessage<ExaFetchError>;
/**
 * @generated from message agent.v1.ExaFetchRejected
 */
export type ExaFetchRejected = Message<"agent.v1.ExaFetchRejected"> & {
    /**
     * @generated from field: string reason = 1;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.ExaFetchRejected.
 * Use `create(ExaFetchRejectedSchema)` to create a new message.
 */
export declare const ExaFetchRejectedSchema: GenMessage<ExaFetchRejected>;
/**
 * @generated from message agent.v1.ExaFetchContent
 */
export type ExaFetchContent = Message<"agent.v1.ExaFetchContent"> & {
    /**
     * @generated from field: string title = 1;
     */
    title: string;
    /**
     * @generated from field: string url = 2;
     */
    url: string;
    /**
     * @generated from field: string text = 3;
     */
    text: string;
    /**
     * @generated from field: string published_date = 4;
     */
    publishedDate: string;
};
/**
 * Describes the message agent.v1.ExaFetchContent.
 * Use `create(ExaFetchContentSchema)` to create a new message.
 */
export declare const ExaFetchContentSchema: GenMessage<ExaFetchContent>;
/**
 * @generated from message agent.v1.ExaFetchToolCall
 */
export type ExaFetchToolCall = Message<"agent.v1.ExaFetchToolCall"> & {
    /**
     * @generated from field: agent.v1.ExaFetchArgs args = 1;
     */
    args?: ExaFetchArgs | undefined;
    /**
     * @generated from field: agent.v1.ExaFetchResult result = 2;
     */
    result?: ExaFetchResult | undefined;
};
/**
 * Describes the message agent.v1.ExaFetchToolCall.
 * Use `create(ExaFetchToolCallSchema)` to create a new message.
 */
export declare const ExaFetchToolCallSchema: GenMessage<ExaFetchToolCall>;
/**
 * @generated from message agent.v1.ExaFetchRequestQuery
 */
export type ExaFetchRequestQuery = Message<"agent.v1.ExaFetchRequestQuery"> & {
    /**
     * @generated from field: agent.v1.ExaFetchArgs args = 1;
     */
    args?: ExaFetchArgs | undefined;
};
/**
 * Describes the message agent.v1.ExaFetchRequestQuery.
 * Use `create(ExaFetchRequestQuerySchema)` to create a new message.
 */
export declare const ExaFetchRequestQuerySchema: GenMessage<ExaFetchRequestQuery>;
/**
 * @generated from message agent.v1.ExaFetchRequestResponse
 */
export type ExaFetchRequestResponse = Message<"agent.v1.ExaFetchRequestResponse"> & {
    /**
     * @generated from oneof agent.v1.ExaFetchRequestResponse.result
     */
    result: {
        /**
         * @generated from field: agent.v1.ExaFetchRequestResponse_Approved approved = 1;
         */
        value: ExaFetchRequestResponse_Approved;
        case: "approved";
    } | {
        /**
         * @generated from field: agent.v1.ExaFetchRequestResponse_Rejected rejected = 2;
         */
        value: ExaFetchRequestResponse_Rejected;
        case: "rejected";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ExaFetchRequestResponse.
 * Use `create(ExaFetchRequestResponseSchema)` to create a new message.
 */
export declare const ExaFetchRequestResponseSchema: GenMessage<ExaFetchRequestResponse>;
/**
 * @generated from message agent.v1.ExaFetchRequestResponse_Approved
 */
export type ExaFetchRequestResponse_Approved = Message<"agent.v1.ExaFetchRequestResponse_Approved"> & {};
/**
 * Describes the message agent.v1.ExaFetchRequestResponse_Approved.
 * Use `create(ExaFetchRequestResponse_ApprovedSchema)` to create a new message.
 */
export declare const ExaFetchRequestResponse_ApprovedSchema: GenMessage<ExaFetchRequestResponse_Approved>;
/**
 * @generated from message agent.v1.ExaFetchRequestResponse_Rejected
 */
export type ExaFetchRequestResponse_Rejected = Message<"agent.v1.ExaFetchRequestResponse_Rejected"> & {
    /**
     * @generated from field: string reason = 1;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.ExaFetchRequestResponse_Rejected.
 * Use `create(ExaFetchRequestResponse_RejectedSchema)` to create a new message.
 */
export declare const ExaFetchRequestResponse_RejectedSchema: GenMessage<ExaFetchRequestResponse_Rejected>;
/**
 * @generated from message agent.v1.ExaSearchArgs
 */
export type ExaSearchArgs = Message<"agent.v1.ExaSearchArgs"> & {
    /**
     * @generated from field: string query = 1;
     */
    query: string;
    /**
     * "auto", "neural", or "keyword"
     *
     * @generated from field: string type = 2;
     */
    type: string;
    /**
     * @generated from field: int32 num_results = 3;
     */
    numResults: number;
    /**
     * @generated from field: string tool_call_id = 4;
     */
    toolCallId: string;
};
/**
 * Describes the message agent.v1.ExaSearchArgs.
 * Use `create(ExaSearchArgsSchema)` to create a new message.
 */
export declare const ExaSearchArgsSchema: GenMessage<ExaSearchArgs>;
/**
 * @generated from message agent.v1.ExaSearchResult
 */
export type ExaSearchResult = Message<"agent.v1.ExaSearchResult"> & {
    /**
     * @generated from oneof agent.v1.ExaSearchResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.ExaSearchSuccess success = 1;
         */
        value: ExaSearchSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.ExaSearchError error = 2;
         */
        value: ExaSearchError;
        case: "error";
    } | {
        /**
         * @generated from field: agent.v1.ExaSearchRejected rejected = 3;
         */
        value: ExaSearchRejected;
        case: "rejected";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ExaSearchResult.
 * Use `create(ExaSearchResultSchema)` to create a new message.
 */
export declare const ExaSearchResultSchema: GenMessage<ExaSearchResult>;
/**
 * @generated from message agent.v1.ExaSearchSuccess
 */
export type ExaSearchSuccess = Message<"agent.v1.ExaSearchSuccess"> & {
    /**
     * @generated from field: repeated agent.v1.ExaSearchReference references = 1;
     */
    references: ExaSearchReference[];
};
/**
 * Describes the message agent.v1.ExaSearchSuccess.
 * Use `create(ExaSearchSuccessSchema)` to create a new message.
 */
export declare const ExaSearchSuccessSchema: GenMessage<ExaSearchSuccess>;
/**
 * @generated from message agent.v1.ExaSearchError
 */
export type ExaSearchError = Message<"agent.v1.ExaSearchError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.ExaSearchError.
 * Use `create(ExaSearchErrorSchema)` to create a new message.
 */
export declare const ExaSearchErrorSchema: GenMessage<ExaSearchError>;
/**
 * @generated from message agent.v1.ExaSearchRejected
 */
export type ExaSearchRejected = Message<"agent.v1.ExaSearchRejected"> & {
    /**
     * @generated from field: string reason = 1;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.ExaSearchRejected.
 * Use `create(ExaSearchRejectedSchema)` to create a new message.
 */
export declare const ExaSearchRejectedSchema: GenMessage<ExaSearchRejected>;
/**
 * @generated from message agent.v1.ExaSearchReference
 */
export type ExaSearchReference = Message<"agent.v1.ExaSearchReference"> & {
    /**
     * @generated from field: string title = 1;
     */
    title: string;
    /**
     * @generated from field: string url = 2;
     */
    url: string;
    /**
     * @generated from field: string text = 3;
     */
    text: string;
    /**
     * @generated from field: string published_date = 4;
     */
    publishedDate: string;
};
/**
 * Describes the message agent.v1.ExaSearchReference.
 * Use `create(ExaSearchReferenceSchema)` to create a new message.
 */
export declare const ExaSearchReferenceSchema: GenMessage<ExaSearchReference>;
/**
 * @generated from message agent.v1.ExaSearchToolCall
 */
export type ExaSearchToolCall = Message<"agent.v1.ExaSearchToolCall"> & {
    /**
     * @generated from field: agent.v1.ExaSearchArgs args = 1;
     */
    args?: ExaSearchArgs | undefined;
    /**
     * @generated from field: agent.v1.ExaSearchResult result = 2;
     */
    result?: ExaSearchResult | undefined;
};
/**
 * Describes the message agent.v1.ExaSearchToolCall.
 * Use `create(ExaSearchToolCallSchema)` to create a new message.
 */
export declare const ExaSearchToolCallSchema: GenMessage<ExaSearchToolCall>;
/**
 * @generated from message agent.v1.ExaSearchRequestQuery
 */
export type ExaSearchRequestQuery = Message<"agent.v1.ExaSearchRequestQuery"> & {
    /**
     * @generated from field: agent.v1.ExaSearchArgs args = 1;
     */
    args?: ExaSearchArgs | undefined;
};
/**
 * Describes the message agent.v1.ExaSearchRequestQuery.
 * Use `create(ExaSearchRequestQuerySchema)` to create a new message.
 */
export declare const ExaSearchRequestQuerySchema: GenMessage<ExaSearchRequestQuery>;
/**
 * @generated from message agent.v1.ExaSearchRequestResponse
 */
export type ExaSearchRequestResponse = Message<"agent.v1.ExaSearchRequestResponse"> & {
    /**
     * @generated from oneof agent.v1.ExaSearchRequestResponse.result
     */
    result: {
        /**
         * @generated from field: agent.v1.ExaSearchRequestResponse_Approved approved = 1;
         */
        value: ExaSearchRequestResponse_Approved;
        case: "approved";
    } | {
        /**
         * @generated from field: agent.v1.ExaSearchRequestResponse_Rejected rejected = 2;
         */
        value: ExaSearchRequestResponse_Rejected;
        case: "rejected";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ExaSearchRequestResponse.
 * Use `create(ExaSearchRequestResponseSchema)` to create a new message.
 */
export declare const ExaSearchRequestResponseSchema: GenMessage<ExaSearchRequestResponse>;
/**
 * @generated from message agent.v1.ExaSearchRequestResponse_Approved
 */
export type ExaSearchRequestResponse_Approved = Message<"agent.v1.ExaSearchRequestResponse_Approved"> & {};
/**
 * Describes the message agent.v1.ExaSearchRequestResponse_Approved.
 * Use `create(ExaSearchRequestResponse_ApprovedSchema)` to create a new message.
 */
export declare const ExaSearchRequestResponse_ApprovedSchema: GenMessage<ExaSearchRequestResponse_Approved>;
/**
 * @generated from message agent.v1.ExaSearchRequestResponse_Rejected
 */
export type ExaSearchRequestResponse_Rejected = Message<"agent.v1.ExaSearchRequestResponse_Rejected"> & {
    /**
     * @generated from field: string reason = 1;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.ExaSearchRequestResponse_Rejected.
 * Use `create(ExaSearchRequestResponse_RejectedSchema)` to create a new message.
 */
export declare const ExaSearchRequestResponse_RejectedSchema: GenMessage<ExaSearchRequestResponse_Rejected>;
/**
 * @generated from message agent.v1.ExecClientStreamClose
 */
export type ExecClientStreamClose = Message<"agent.v1.ExecClientStreamClose"> & {
    /**
     * @generated from field: uint32 id = 1;
     */
    id: number;
};
/**
 * Describes the message agent.v1.ExecClientStreamClose.
 * Use `create(ExecClientStreamCloseSchema)` to create a new message.
 */
export declare const ExecClientStreamCloseSchema: GenMessage<ExecClientStreamClose>;
/**
 * @generated from message agent.v1.ExecClientThrow
 */
export type ExecClientThrow = Message<"agent.v1.ExecClientThrow"> & {
    /**
     * @generated from field: uint32 id = 1;
     */
    id: number;
    /**
     * @generated from field: string error = 2;
     */
    error: string;
    /**
     * @generated from field: optional string stack_trace = 3;
     */
    stackTrace?: string | undefined;
    /**
     * @generated from field: optional string error_code = 4;
     */
    errorCode?: string | undefined;
};
/**
 * Describes the message agent.v1.ExecClientThrow.
 * Use `create(ExecClientThrowSchema)` to create a new message.
 */
export declare const ExecClientThrowSchema: GenMessage<ExecClientThrow>;
/**
 * @generated from message agent.v1.ExecClientHeartbeat
 */
export type ExecClientHeartbeat = Message<"agent.v1.ExecClientHeartbeat"> & {
    /**
     * @generated from field: uint32 id = 1;
     */
    id: number;
};
/**
 * Describes the message agent.v1.ExecClientHeartbeat.
 * Use `create(ExecClientHeartbeatSchema)` to create a new message.
 */
export declare const ExecClientHeartbeatSchema: GenMessage<ExecClientHeartbeat>;
/**
 * @generated from message agent.v1.ExecClientControlMessage
 */
export type ExecClientControlMessage = Message<"agent.v1.ExecClientControlMessage"> & {
    /**
     * @generated from oneof agent.v1.ExecClientControlMessage.message
     */
    message: {
        /**
         * @generated from field: agent.v1.ExecClientStreamClose stream_close = 1;
         */
        value: ExecClientStreamClose;
        case: "streamClose";
    } | {
        /**
         * @generated from field: agent.v1.ExecClientThrow throw = 2;
         */
        value: ExecClientThrow;
        case: "throw";
    } | {
        /**
         * @generated from field: agent.v1.ExecClientHeartbeat heartbeat = 3;
         */
        value: ExecClientHeartbeat;
        case: "heartbeat";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ExecClientControlMessage.
 * Use `create(ExecClientControlMessageSchema)` to create a new message.
 */
export declare const ExecClientControlMessageSchema: GenMessage<ExecClientControlMessage>;
/**
 * Simplified span context for tracing exec calls
 *
 * @generated from message agent.v1.SpanContext
 */
export type SpanContext = Message<"agent.v1.SpanContext"> & {
    /**
     * Trace identifier (128-bit as hex string, same for all spans in a trace)
     *
     * @generated from field: string trace_id = 1;
     */
    traceId: string;
    /**
     * Unique span identifier (64-bit as hex string)
     *
     * @generated from field: string span_id = 2;
     */
    spanId: string;
    /**
     * Trace flags bit field following OTEL SPAN_FLAGS_* semantics
     *
     * @generated from field: optional uint32 trace_flags = 3;
     */
    traceFlags?: number | undefined;
    /**
     * W3C trace-state header string (optional)
     *
     * @generated from field: optional string trace_state = 4;
     */
    traceState?: string | undefined;
};
/**
 * Describes the message agent.v1.SpanContext.
 * Use `create(SpanContextSchema)` to create a new message.
 */
export declare const SpanContextSchema: GenMessage<SpanContext>;
/**
 * Empty abort message for aborting running execs
 *
 * @generated from message agent.v1.AbortArgs
 */
export type AbortArgs = Message<"agent.v1.AbortArgs"> & {};
/**
 * Describes the message agent.v1.AbortArgs.
 * Use `create(AbortArgsSchema)` to create a new message.
 */
export declare const AbortArgsSchema: GenMessage<AbortArgs>;
/**
 * @generated from message agent.v1.AbortResult
 */
export type AbortResult = Message<"agent.v1.AbortResult"> & {};
/**
 * Describes the message agent.v1.AbortResult.
 * Use `create(AbortResultSchema)` to create a new message.
 */
export declare const AbortResultSchema: GenMessage<AbortResult>;
/**
 * @generated from message agent.v1.ExecServerMessage
 */
export type ExecServerMessage = Message<"agent.v1.ExecServerMessage"> & {
    /**
     * @generated from field: uint32 id = 1;
     */
    id: number;
    /**
     * Optional exec ID for attachable executions
     *
     * @generated from field: string exec_id = 15;
     */
    execId: string;
    /**
     * Optional parent span context for tracing
     *
     * @generated from field: optional agent.v1.SpanContext span_context = 19;
     */
    spanContext?: SpanContext | undefined;
    /**
     * @generated from oneof agent.v1.ExecServerMessage.message
     */
    message: {
        /**
         * @generated from field: agent.v1.ShellArgs shell_args = 2;
         */
        value: ShellArgs;
        case: "shellArgs";
    } | {
        /**
         * @generated from field: agent.v1.WriteArgs write_args = 3;
         */
        value: WriteArgs;
        case: "writeArgs";
    } | {
        /**
         * @generated from field: agent.v1.DeleteArgs delete_args = 4;
         */
        value: DeleteArgs;
        case: "deleteArgs";
    } | {
        /**
         * @generated from field: agent.v1.GrepArgs grep_args = 5;
         */
        value: GrepArgs;
        case: "grepArgs";
    } | {
        /**
         * @generated from field: agent.v1.ReadArgs read_args = 7;
         */
        value: ReadArgs;
        case: "readArgs";
    } | {
        /**
         * @generated from field: agent.v1.LsArgs ls_args = 8;
         */
        value: LsArgs;
        case: "lsArgs";
    } | {
        /**
         * @generated from field: agent.v1.DiagnosticsArgs diagnostics_args = 9;
         */
        value: DiagnosticsArgs;
        case: "diagnosticsArgs";
    } | {
        /**
         * @generated from field: agent.v1.RequestContextArgs request_context_args = 10;
         */
        value: RequestContextArgs;
        case: "requestContextArgs";
    } | {
        /**
         * @generated from field: agent.v1.McpArgs mcp_args = 11;
         */
        value: McpArgs;
        case: "mcpArgs";
    } | {
        /**
         * @generated from field: agent.v1.ShellArgs shell_stream_args = 14;
         */
        value: ShellArgs;
        case: "shellStreamArgs";
    } | {
        /**
         * @generated from field: agent.v1.BackgroundShellSpawnArgs background_shell_spawn_args = 16;
         */
        value: BackgroundShellSpawnArgs;
        case: "backgroundShellSpawnArgs";
    } | {
        /**
         * @generated from field: agent.v1.ListMcpResourcesExecArgs list_mcp_resources_exec_args = 17;
         */
        value: ListMcpResourcesExecArgs;
        case: "listMcpResourcesExecArgs";
    } | {
        /**
         * @generated from field: agent.v1.ReadMcpResourceExecArgs read_mcp_resource_exec_args = 18;
         */
        value: ReadMcpResourceExecArgs;
        case: "readMcpResourceExecArgs";
    } | {
        /**
         * @generated from field: agent.v1.FetchArgs fetch_args = 20;
         */
        value: FetchArgs;
        case: "fetchArgs";
    } | {
        /**
         * @generated from field: agent.v1.RecordScreenArgs record_screen_args = 21;
         */
        value: RecordScreenArgs;
        case: "recordScreenArgs";
    } | {
        /**
         * @generated from field: agent.v1.ComputerUseArgs computer_use_args = 22;
         */
        value: ComputerUseArgs;
        case: "computerUseArgs";
    } | {
        /**
         * @generated from field: agent.v1.WriteShellStdinArgs write_shell_stdin_args = 23;
         */
        value: WriteShellStdinArgs;
        case: "writeShellStdinArgs";
    } | {
        /**
         * @generated from field: agent.v1.ReadArgs redacted_read_args = 29;
         */
        value: ReadArgs;
        case: "redactedReadArgs";
    } | {
        /**
         * @generated from field: agent.v1.McpStateExecArgs mcp_state_exec_args = 36;
         */
        value: McpStateExecArgs;
        case: "mcpStateExecArgs";
    } | {
        /**
         * @generated from field: agent.v1.ExecuteHookArgs execute_hook_args = 27;
         */
        value: ExecuteHookArgs;
        case: "executeHookArgs";
    } | {
        /**
         * @generated from field: agent.v1.SubagentArgs subagent_args = 28;
         */
        value: SubagentArgs;
        case: "subagentArgs";
    } | {
        /**
         * @generated from field: agent.v1.ForceBackgroundShellArgs force_background_shell_args = 30;
         */
        value: ForceBackgroundShellArgs;
        case: "forceBackgroundShellArgs";
    } | {
        /**
         * @generated from field: agent.v1.ForceBackgroundSubagentArgs force_background_subagent_args = 31;
         */
        value: ForceBackgroundSubagentArgs;
        case: "forceBackgroundSubagentArgs";
    } | {
        /**
         * @generated from field: agent.v1.SubagentAwaitArgs subagent_await_args = 37;
         */
        value: SubagentAwaitArgs;
        case: "subagentAwaitArgs";
    } | {
        /**
         * @generated from field: agent.v1.SmartModeClassifierArgs smart_mode_classifier_args = 38;
         */
        value: SmartModeClassifierArgs;
        case: "smartModeClassifierArgs";
    } | {
        /**
         * @generated from field: agent.v1.CanvasDiagnosticsArgs canvas_diagnostics_args = 40;
         */
        value: CanvasDiagnosticsArgs;
        case: "canvasDiagnosticsArgs";
    } | {
        /**
         * @generated from field: agent.v1.ShellAllowlistPrecheckArgs shell_allowlist_precheck_args = 41;
         */
        value: ShellAllowlistPrecheckArgs;
        case: "shellAllowlistPrecheckArgs";
    } | {
        /**
         * @generated from field: agent.v1.McpAllowlistPrecheckArgs mcp_allowlist_precheck_args = 42;
         */
        value: McpAllowlistPrecheckArgs;
        case: "mcpAllowlistPrecheckArgs";
    } | {
        /**
         * @generated from field: agent.v1.WebFetchAllowlistPrecheckArgs web_fetch_allowlist_precheck_args = 43;
         */
        value: WebFetchAllowlistPrecheckArgs;
        case: "webFetchAllowlistPrecheckArgs";
    } | {
        /**
         * @generated from field: agent.v1.GetDiffRequest git_diff_request = 44;
         */
        value: GetDiffRequest;
        case: "gitDiffRequest";
    } | {
        /**
         * @generated from field: agent.v1.PiReadExecArgs pi_read_args = 45;
         */
        value: PiReadExecArgs;
        case: "piReadArgs";
    } | {
        /**
         * @generated from field: agent.v1.PiBashExecArgs pi_bash_args = 46;
         */
        value: PiBashExecArgs;
        case: "piBashArgs";
    } | {
        /**
         * @generated from field: agent.v1.PiEditExecArgs pi_edit_args = 47;
         */
        value: PiEditExecArgs;
        case: "piEditArgs";
    } | {
        /**
         * @generated from field: agent.v1.PiWriteExecArgs pi_write_args = 48;
         */
        value: PiWriteExecArgs;
        case: "piWriteArgs";
    } | {
        /**
         * @generated from field: agent.v1.PiGrepExecArgs pi_grep_args = 49;
         */
        value: PiGrepExecArgs;
        case: "piGrepArgs";
    } | {
        /**
         * @generated from field: agent.v1.PiFindExecArgs pi_find_args = 50;
         */
        value: PiFindExecArgs;
        case: "piFindArgs";
    } | {
        /**
         * @generated from field: agent.v1.PiLsExecArgs pi_ls_args = 51;
         */
        value: PiLsExecArgs;
        case: "piLsArgs";
    } | {
        /**
         * @generated from field: agent.v1.ShellArgs mini_swe_agent_bash_args = 52;
         */
        value: ShellArgs;
        case: "miniSweAgentBashArgs";
    } | {
        /**
         * @generated from field: agent.v1.ConversationSearchArgs conversation_search_args = 53;
         */
        value: ConversationSearchArgs;
        case: "conversationSearchArgs";
    } | {
        /**
         * @generated from field: agent.v1.AgentStoreConflictArgs agent_store_conflict_args = 54;
         */
        value: AgentStoreConflictArgs;
        case: "agentStoreConflictArgs";
    } | {
        case: undefined;
        value?: undefined;
    };
    /**
     * @generated from field: optional bool accept_hook_additional_contexts = 55;
     */
    acceptHookAdditionalContexts?: boolean | undefined;
};
/**
 * Describes the message agent.v1.ExecServerMessage.
 * Use `create(ExecServerMessageSchema)` to create a new message.
 */
export declare const ExecServerMessageSchema: GenMessage<ExecServerMessage>;
/**
 * @generated from message agent.v1.ExecClientMessage
 */
export type ExecClientMessage = Message<"agent.v1.ExecClientMessage"> & {
    /**
     * @generated from field: uint32 id = 1;
     */
    id: number;
    /**
     * Optional exec ID for attachable executions
     *
     * @generated from field: string exec_id = 15;
     */
    execId: string;
    /**
     * @generated from oneof agent.v1.ExecClientMessage.message
     */
    message: {
        /**
         * @generated from field: agent.v1.ShellResult shell_result = 2;
         */
        value: ShellResult;
        case: "shellResult";
    } | {
        /**
         * @generated from field: agent.v1.WriteResult write_result = 3;
         */
        value: WriteResult;
        case: "writeResult";
    } | {
        /**
         * @generated from field: agent.v1.DeleteResult delete_result = 4;
         */
        value: DeleteResult;
        case: "deleteResult";
    } | {
        /**
         * @generated from field: agent.v1.GrepResult grep_result = 5;
         */
        value: GrepResult;
        case: "grepResult";
    } | {
        /**
         * @generated from field: agent.v1.ReadResult read_result = 7;
         */
        value: ReadResult;
        case: "readResult";
    } | {
        /**
         * @generated from field: agent.v1.LsResult ls_result = 8;
         */
        value: LsResult;
        case: "lsResult";
    } | {
        /**
         * @generated from field: agent.v1.DiagnosticsResult diagnostics_result = 9;
         */
        value: DiagnosticsResult;
        case: "diagnosticsResult";
    } | {
        /**
         * @generated from field: agent.v1.RequestContextResult request_context_result = 10;
         */
        value: RequestContextResult;
        case: "requestContextResult";
    } | {
        /**
         * @generated from field: agent.v1.McpResult mcp_result = 11;
         */
        value: McpResult;
        case: "mcpResult";
    } | {
        /**
         * @generated from field: agent.v1.ShellStream shell_stream = 14;
         */
        value: ShellStream;
        case: "shellStream";
    } | {
        /**
         * @generated from field: agent.v1.BackgroundShellSpawnResult background_shell_spawn_result = 16;
         */
        value: BackgroundShellSpawnResult;
        case: "backgroundShellSpawnResult";
    } | {
        /**
         * @generated from field: agent.v1.ListMcpResourcesExecResult list_mcp_resources_exec_result = 17;
         */
        value: ListMcpResourcesExecResult;
        case: "listMcpResourcesExecResult";
    } | {
        /**
         * @generated from field: agent.v1.ReadMcpResourceExecResult read_mcp_resource_exec_result = 18;
         */
        value: ReadMcpResourceExecResult;
        case: "readMcpResourceExecResult";
    } | {
        /**
         * @generated from field: agent.v1.FetchResult fetch_result = 20;
         */
        value: FetchResult;
        case: "fetchResult";
    } | {
        /**
         * @generated from field: agent.v1.RecordScreenResult record_screen_result = 21;
         */
        value: RecordScreenResult;
        case: "recordScreenResult";
    } | {
        /**
         * @generated from field: agent.v1.ComputerUseResult computer_use_result = 22;
         */
        value: ComputerUseResult;
        case: "computerUseResult";
    } | {
        /**
         * @generated from field: agent.v1.WriteShellStdinResult write_shell_stdin_result = 23;
         */
        value: WriteShellStdinResult;
        case: "writeShellStdinResult";
    } | {
        /**
         * @generated from field: agent.v1.ReadResult redacted_read_result = 29;
         */
        value: ReadResult;
        case: "redactedReadResult";
    } | {
        /**
         * @generated from field: agent.v1.McpStateExecResult mcp_state_exec_result = 36;
         */
        value: McpStateExecResult;
        case: "mcpStateExecResult";
    } | {
        /**
         * @generated from field: agent.v1.ExecuteHookResult execute_hook_result = 27;
         */
        value: ExecuteHookResult;
        case: "executeHookResult";
    } | {
        /**
         * @generated from field: agent.v1.SubagentResult subagent_result = 28;
         */
        value: SubagentResult;
        case: "subagentResult";
    } | {
        /**
         * @generated from field: agent.v1.ForceBackgroundShellResult force_background_shell_result = 30;
         */
        value: ForceBackgroundShellResult;
        case: "forceBackgroundShellResult";
    } | {
        /**
         * @generated from field: agent.v1.ForceBackgroundSubagentResult force_background_subagent_result = 31;
         */
        value: ForceBackgroundSubagentResult;
        case: "forceBackgroundSubagentResult";
    } | {
        /**
         * @generated from field: agent.v1.SubagentAwaitResult subagent_await_result = 37;
         */
        value: SubagentAwaitResult;
        case: "subagentAwaitResult";
    } | {
        /**
         * @generated from field: agent.v1.SmartModeClassifierResult smart_mode_classifier_result = 38;
         */
        value: SmartModeClassifierResult;
        case: "smartModeClassifierResult";
    } | {
        /**
         * @generated from field: agent.v1.CanvasDiagnosticsResult canvas_diagnostics_result = 40;
         */
        value: CanvasDiagnosticsResult;
        case: "canvasDiagnosticsResult";
    } | {
        /**
         * @generated from field: agent.v1.ShellAllowlistPrecheckResult shell_allowlist_precheck_result = 41;
         */
        value: ShellAllowlistPrecheckResult;
        case: "shellAllowlistPrecheckResult";
    } | {
        /**
         * @generated from field: agent.v1.McpAllowlistPrecheckResult mcp_allowlist_precheck_result = 42;
         */
        value: McpAllowlistPrecheckResult;
        case: "mcpAllowlistPrecheckResult";
    } | {
        /**
         * @generated from field: agent.v1.WebFetchAllowlistPrecheckResult web_fetch_allowlist_precheck_result = 43;
         */
        value: WebFetchAllowlistPrecheckResult;
        case: "webFetchAllowlistPrecheckResult";
    } | {
        /**
         * @generated from field: agent.v1.GetDiffResponse git_diff_response = 44;
         */
        value: GetDiffResponse;
        case: "gitDiffResponse";
    } | {
        /**
         * @generated from field: agent.v1.PiReadExecResult pi_read_result = 46;
         */
        value: PiReadExecResult;
        case: "piReadResult";
    } | {
        /**
         * @generated from field: agent.v1.PiBashExecResult pi_bash_result = 47;
         */
        value: PiBashExecResult;
        case: "piBashResult";
    } | {
        /**
         * @generated from field: agent.v1.PiEditExecResult pi_edit_result = 48;
         */
        value: PiEditExecResult;
        case: "piEditResult";
    } | {
        /**
         * @generated from field: agent.v1.PiWriteExecResult pi_write_result = 49;
         */
        value: PiWriteExecResult;
        case: "piWriteResult";
    } | {
        /**
         * @generated from field: agent.v1.PiGrepExecResult pi_grep_result = 50;
         */
        value: PiGrepExecResult;
        case: "piGrepResult";
    } | {
        /**
         * @generated from field: agent.v1.PiFindExecResult pi_find_result = 51;
         */
        value: PiFindExecResult;
        case: "piFindResult";
    } | {
        /**
         * @generated from field: agent.v1.PiLsExecResult pi_ls_result = 52;
         */
        value: PiLsExecResult;
        case: "piLsResult";
    } | {
        /**
         * @generated from field: agent.v1.ConversationSearchResult conversation_search_result = 53;
         */
        value: ConversationSearchResult;
        case: "conversationSearchResult";
    } | {
        /**
         * @generated from field: agent.v1.AgentStoreConflictResult agent_store_conflict_result = 54;
         */
        value: AgentStoreConflictResult;
        case: "agentStoreConflictResult";
    } | {
        /**
         * @generated from field: agent.v1.ShellResult mini_swe_agent_bash_result = 55;
         */
        value: ShellResult;
        case: "miniSweAgentBashResult";
    } | {
        case: undefined;
        value?: undefined;
    };
    /**
     * @generated from field: optional int32 local_execution_time_ms = 39;
     */
    localExecutionTimeMs?: number | undefined;
    /**
     * @generated from field: repeated agent.v1.HookAdditionalContext hook_additional_contexts = 45;
     */
    hookAdditionalContexts: HookAdditionalContext[];
};
/**
 * Describes the message agent.v1.ExecClientMessage.
 * Use `create(ExecClientMessageSchema)` to create a new message.
 */
export declare const ExecClientMessageSchema: GenMessage<ExecClientMessage>;
/**
 * @generated from message agent.v1.FetchArgs
 */
export type FetchArgs = Message<"agent.v1.FetchArgs"> & {
    /**
     * @generated from field: string url = 1;
     */
    url: string;
    /**
     * @generated from field: string tool_call_id = 2;
     */
    toolCallId: string;
};
/**
 * Describes the message agent.v1.FetchArgs.
 * Use `create(FetchArgsSchema)` to create a new message.
 */
export declare const FetchArgsSchema: GenMessage<FetchArgs>;
/**
 * @generated from message agent.v1.FetchResult
 */
export type FetchResult = Message<"agent.v1.FetchResult"> & {
    /**
     * @generated from oneof agent.v1.FetchResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.FetchSuccess success = 1;
         */
        value: FetchSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.FetchError error = 2;
         */
        value: FetchError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.FetchResult.
 * Use `create(FetchResultSchema)` to create a new message.
 */
export declare const FetchResultSchema: GenMessage<FetchResult>;
/**
 * @generated from message agent.v1.FetchSuccess
 */
export type FetchSuccess = Message<"agent.v1.FetchSuccess"> & {
    /**
     * @generated from field: string url = 1;
     */
    url: string;
    /**
     * @generated from field: string content = 2;
     */
    content: string;
    /**
     * @generated from field: int32 status_code = 3;
     */
    statusCode: number;
    /**
     * @generated from field: string content_type = 4;
     */
    contentType: string;
};
/**
 * Describes the message agent.v1.FetchSuccess.
 * Use `create(FetchSuccessSchema)` to create a new message.
 */
export declare const FetchSuccessSchema: GenMessage<FetchSuccess>;
/**
 * @generated from message agent.v1.FetchError
 */
export type FetchError = Message<"agent.v1.FetchError"> & {
    /**
     * @generated from field: string url = 1;
     */
    url: string;
    /**
     * @generated from field: string error = 2;
     */
    error: string;
};
/**
 * Describes the message agent.v1.FetchError.
 * Use `create(FetchErrorSchema)` to create a new message.
 */
export declare const FetchErrorSchema: GenMessage<FetchError>;
/**
 * @generated from message agent.v1.GenerateImageArgs
 */
export type GenerateImageArgs = Message<"agent.v1.GenerateImageArgs"> & {
    /**
     * @generated from field: string description = 1;
     */
    description: string;
    /**
     * @generated from field: optional string file_path = 2;
     */
    filePath?: string | undefined;
    /**
     * Optional paths to reference images to use as input for image-to-image generation
     *
     * @generated from field: repeated string reference_image_paths = 5;
     */
    referenceImagePaths: string[];
};
/**
 * Describes the message agent.v1.GenerateImageArgs.
 * Use `create(GenerateImageArgsSchema)` to create a new message.
 */
export declare const GenerateImageArgsSchema: GenMessage<GenerateImageArgs>;
/**
 * @generated from message agent.v1.GenerateImageResult
 */
export type GenerateImageResult = Message<"agent.v1.GenerateImageResult"> & {
    /**
     * @generated from oneof agent.v1.GenerateImageResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.GenerateImageSuccess success = 1;
         */
        value: GenerateImageSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.GenerateImageError error = 2;
         */
        value: GenerateImageError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.GenerateImageResult.
 * Use `create(GenerateImageResultSchema)` to create a new message.
 */
export declare const GenerateImageResultSchema: GenMessage<GenerateImageResult>;
/**
 * @generated from message agent.v1.GenerateImageSuccess
 */
export type GenerateImageSuccess = Message<"agent.v1.GenerateImageSuccess"> & {
    /**
     * Actual file path where the image was saved (e.g., /path/to/project/assets/image.png)
     *
     * @generated from field: string file_path = 1;
     */
    filePath: string;
    /**
     * Base64-encoded image data
     *
     * @generated from field: string image_data = 2;
     */
    imageData: string;
};
/**
 * Describes the message agent.v1.GenerateImageSuccess.
 * Use `create(GenerateImageSuccessSchema)` to create a new message.
 */
export declare const GenerateImageSuccessSchema: GenMessage<GenerateImageSuccess>;
/**
 * @generated from message agent.v1.GenerateImageError
 */
export type GenerateImageError = Message<"agent.v1.GenerateImageError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.GenerateImageError.
 * Use `create(GenerateImageErrorSchema)` to create a new message.
 */
export declare const GenerateImageErrorSchema: GenMessage<GenerateImageError>;
/**
 * @generated from message agent.v1.GenerateImageToolCall
 */
export type GenerateImageToolCall = Message<"agent.v1.GenerateImageToolCall"> & {
    /**
     * @generated from field: agent.v1.GenerateImageArgs args = 1;
     */
    args?: GenerateImageArgs | undefined;
    /**
     * @generated from field: agent.v1.GenerateImageResult result = 2;
     */
    result?: GenerateImageResult | undefined;
};
/**
 * Describes the message agent.v1.GenerateImageToolCall.
 * Use `create(GenerateImageToolCallSchema)` to create a new message.
 */
export declare const GenerateImageToolCallSchema: GenMessage<GenerateImageToolCall>;
/**
 * @generated from message agent.v1.GrepArgs
 */
export type GrepArgs = Message<"agent.v1.GrepArgs"> & {
    /**
     * @generated from field: string pattern = 1;
     */
    pattern: string;
    /**
     * @generated from field: optional string path = 2;
     */
    path?: string | undefined;
    /**
     * @generated from field: optional string glob = 3;
     */
    glob?: string | undefined;
    /**
     * "content", "files_with_matches", "count"
     *
     * @generated from field: optional string output_mode = 4;
     */
    outputMode?: string | undefined;
    /**
     * @generated from field: optional int32 context_before = 5;
     */
    contextBefore?: number | undefined;
    /**
     * @generated from field: optional int32 context_after = 6;
     */
    contextAfter?: number | undefined;
    /**
     * @generated from field: optional int32 context = 7;
     */
    context?: number | undefined;
    /**
     * @generated from field: optional bool case_insensitive = 8;
     */
    caseInsensitive?: boolean | undefined;
    /**
     * --type
     *
     * @generated from field: optional string type = 9;
     */
    type?: string | undefined;
    /**
     * | head -N
     *
     * @generated from field: optional int32 head_limit = 10;
     */
    headLimit?: number | undefined;
    /**
     * -U --multiline-dotall
     *
     * @generated from field: optional bool multiline = 11;
     */
    multiline?: boolean | undefined;
    /**
     * --sort: "none", "path", "modified", "accessed", "created"
     *
     * @generated from field: optional string sort = 12;
     */
    sort?: string | undefined;
    /**
     * if false, use --sortr for reverse sort
     *
     * @generated from field: optional bool sort_ascending = 13;
     */
    sortAscending?: boolean | undefined;
    /**
     * @generated from field: string tool_call_id = 14;
     */
    toolCallId: string;
    /**
     * @generated from field: optional agent.v1.SandboxPolicy sandbox_policy = 15;
     */
    sandboxPolicy?: SandboxPolicy | undefined;
    /**
     * @generated from field: optional int32 offset = 16;
     */
    offset?: number | undefined;
};
/**
 * Describes the message agent.v1.GrepArgs.
 * Use `create(GrepArgsSchema)` to create a new message.
 */
export declare const GrepArgsSchema: GenMessage<GrepArgs>;
/**
 * @generated from message agent.v1.GrepResult
 */
export type GrepResult = Message<"agent.v1.GrepResult"> & {
    /**
     * @generated from oneof agent.v1.GrepResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.GrepSuccess success = 1;
         */
        value: GrepSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.GrepError error = 2;
         */
        value: GrepError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.GrepResult.
 * Use `create(GrepResultSchema)` to create a new message.
 */
export declare const GrepResultSchema: GenMessage<GrepResult>;
/**
 * @generated from message agent.v1.GrepError
 */
export type GrepError = Message<"agent.v1.GrepError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.GrepError.
 * Use `create(GrepErrorSchema)` to create a new message.
 */
export declare const GrepErrorSchema: GenMessage<GrepError>;
/**
 * @generated from message agent.v1.GrepSuccess
 */
export type GrepSuccess = Message<"agent.v1.GrepSuccess"> & {
    /**
     * @generated from field: string pattern = 1;
     */
    pattern: string;
    /**
     * @generated from field: string path = 2;
     */
    path: string;
    /**
     * "content", "files_with_matches", or "count"
     *
     * @generated from field: string output_mode = 3;
     */
    outputMode: string;
    /**
     * @generated from field: map<string, agent.v1.GrepUnionResult> workspace_results = 4;
     */
    workspaceResults: {
        [key: string]: GrepUnionResult;
    };
    /**
     * @generated from field: optional agent.v1.GrepUnionResult active_editor_result = 5;
     */
    activeEditorResult?: GrepUnionResult | undefined;
};
/**
 * Describes the message agent.v1.GrepSuccess.
 * Use `create(GrepSuccessSchema)` to create a new message.
 */
export declare const GrepSuccessSchema: GenMessage<GrepSuccess>;
/**
 * @generated from message agent.v1.GrepUnionResult
 */
export type GrepUnionResult = Message<"agent.v1.GrepUnionResult"> & {
    /**
     * @generated from oneof agent.v1.GrepUnionResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.GrepCountResult count = 1;
         */
        value: GrepCountResult;
        case: "count";
    } | {
        /**
         * @generated from field: agent.v1.GrepFilesResult files = 2;
         */
        value: GrepFilesResult;
        case: "files";
    } | {
        /**
         * @generated from field: agent.v1.GrepContentResult content = 3;
         */
        value: GrepContentResult;
        case: "content";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.GrepUnionResult.
 * Use `create(GrepUnionResultSchema)` to create a new message.
 */
export declare const GrepUnionResultSchema: GenMessage<GrepUnionResult>;
/**
 * @generated from message agent.v1.GrepCountResult
 */
export type GrepCountResult = Message<"agent.v1.GrepCountResult"> & {
    /**
     * ordered by relevance
     *
     * @generated from field: repeated agent.v1.GrepFileCount counts = 1;
     */
    counts: GrepFileCount[];
    /**
     * The total count of files that the client found from the ripgrep call This is a lower bound if we truncated the output from the ripgrep call itself, but is accurate if client_truncated is true (but may be more than the number of files returned to the server)
     *
     * @generated from field: int32 total_files = 2;
     */
    totalFiles: number;
    /**
     * The total count of matches that the client found from the ripgrep call This is a lower bound if we truncated the output from the ripgrep call itself, but is accurate if client_truncated is true (but may be more than the number of matches returned to the server)
     *
     * @generated from field: int32 total_matches = 3;
     */
    totalMatches: number;
    /**
     * true if the client truncated the output sent to the server
     *
     * @generated from field: bool client_truncated = 4;
     */
    clientTruncated: boolean;
    /**
     * true if we truncated the output from the ripgrep call itself
     *
     * @generated from field: bool ripgrep_truncated = 5;
     */
    ripgrepTruncated: boolean;
    /**
     * @generated from field: optional int32 head_limit_applied = 6;
     */
    headLimitApplied?: number | undefined;
    /**
     * @generated from field: optional int32 offset_applied = 7;
     */
    offsetApplied?: number | undefined;
};
/**
 * Describes the message agent.v1.GrepCountResult.
 * Use `create(GrepCountResultSchema)` to create a new message.
 */
export declare const GrepCountResultSchema: GenMessage<GrepCountResult>;
/**
 * @generated from message agent.v1.GrepFileCount
 */
export type GrepFileCount = Message<"agent.v1.GrepFileCount"> & {
    /**
     * @generated from field: string file = 1;
     */
    file: string;
    /**
     * @generated from field: int32 count = 2;
     */
    count: number;
};
/**
 * Describes the message agent.v1.GrepFileCount.
 * Use `create(GrepFileCountSchema)` to create a new message.
 */
export declare const GrepFileCountSchema: GenMessage<GrepFileCount>;
/**
 * @generated from message agent.v1.GrepFilesResult
 */
export type GrepFilesResult = Message<"agent.v1.GrepFilesResult"> & {
    /**
     * ordered by relevance
     *
     * @generated from field: repeated string files = 1;
     */
    files: string[];
    /**
     * The total count of files that the client found from the ripgrep call This is a lower bound if we truncated the output from the ripgrep call itself, but is accurate if client_truncated is true (but may be more than the number of files returned to the server)
     *
     * @generated from field: int32 total_files = 2;
     */
    totalFiles: number;
    /**
     * true if the client truncated the output sent to the server
     *
     * @generated from field: bool client_truncated = 3;
     */
    clientTruncated: boolean;
    /**
     * true if we truncated the output from the ripgrep call itself
     *
     * @generated from field: bool ripgrep_truncated = 4;
     */
    ripgrepTruncated: boolean;
    /**
     * @generated from field: optional int32 head_limit_applied = 5;
     */
    headLimitApplied?: number | undefined;
    /**
     * @generated from field: optional int32 offset_applied = 6;
     */
    offsetApplied?: number | undefined;
};
/**
 * Describes the message agent.v1.GrepFilesResult.
 * Use `create(GrepFilesResultSchema)` to create a new message.
 */
export declare const GrepFilesResultSchema: GenMessage<GrepFilesResult>;
/**
 * @generated from message agent.v1.GrepContentResult
 */
export type GrepContentResult = Message<"agent.v1.GrepContentResult"> & {
    /**
     * ordered by relevance
     *
     * @generated from field: repeated agent.v1.GrepFileMatch matches = 1;
     */
    matches: GrepFileMatch[];
    /**
     * The total count of lines that the client found from the ripgrep call This is a lower bound if we truncated the output from the ripgrep call itself, but is accurate if client_truncated is true (but may be more than the number of lines returned to the server)
     *
     * @generated from field: int32 total_lines = 2;
     */
    totalLines: number;
    /**
     * The total count of matches that the client found from the ripgrep call This is a lower bound if we truncated the output from the ripgrep call itself, but is accurate if client_truncated is true (but may be more than the number of matches returned to the server)
     *
     * @generated from field: int32 total_matched_lines = 3;
     */
    totalMatchedLines: number;
    /**
     * true if the client truncated the output sent to the server
     *
     * @generated from field: bool client_truncated = 4;
     */
    clientTruncated: boolean;
    /**
     * true if we truncated the output from the ripgrep call itself
     *
     * @generated from field: bool ripgrep_truncated = 5;
     */
    ripgrepTruncated: boolean;
    /**
     * @generated from field: optional int32 head_limit_applied = 6;
     */
    headLimitApplied?: number | undefined;
    /**
     * @generated from field: optional int32 offset_applied = 7;
     */
    offsetApplied?: number | undefined;
};
/**
 * Describes the message agent.v1.GrepContentResult.
 * Use `create(GrepContentResultSchema)` to create a new message.
 */
export declare const GrepContentResultSchema: GenMessage<GrepContentResult>;
/**
 * @generated from message agent.v1.GrepFileMatch
 */
export type GrepFileMatch = Message<"agent.v1.GrepFileMatch"> & {
    /**
     * @generated from field: string file = 1;
     */
    file: string;
    /**
     * @generated from field: repeated agent.v1.GrepContentMatch matches = 2;
     */
    matches: GrepContentMatch[];
};
/**
 * Describes the message agent.v1.GrepFileMatch.
 * Use `create(GrepFileMatchSchema)` to create a new message.
 */
export declare const GrepFileMatchSchema: GenMessage<GrepFileMatch>;
/**
 * @generated from message agent.v1.GrepContentMatch
 */
export type GrepContentMatch = Message<"agent.v1.GrepContentMatch"> & {
    /**
     * @generated from field: int32 line_number = 1;
     */
    lineNumber: number;
    /**
     * @generated from field: string content = 2;
     */
    content: string;
    /**
     * @generated from field: bool content_truncated = 3;
     */
    contentTruncated: boolean;
    /**
     * true for context lines (-A/B/C)
     *
     * @generated from field: bool is_context_line = 4;
     */
    isContextLine: boolean;
};
/**
 * Describes the message agent.v1.GrepContentMatch.
 * Use `create(GrepContentMatchSchema)` to create a new message.
 */
export declare const GrepContentMatchSchema: GenMessage<GrepContentMatch>;
/**
 * @generated from message agent.v1.GrepStream
 */
export type GrepStream = Message<"agent.v1.GrepStream"> & {
    /**
     * @generated from field: string pattern = 1;
     */
    pattern: string;
};
/**
 * Describes the message agent.v1.GrepStream.
 * Use `create(GrepStreamSchema)` to create a new message.
 */
export declare const GrepStreamSchema: GenMessage<GrepStream>;
/**
 * @generated from message agent.v1.GrepToolCall
 */
export type GrepToolCall = Message<"agent.v1.GrepToolCall"> & {
    /**
     * @generated from field: agent.v1.GrepArgs args = 1;
     */
    args?: GrepArgs | undefined;
    /**
     * @generated from field: agent.v1.GrepResult result = 2;
     */
    result?: GrepResult | undefined;
};
/**
 * Describes the message agent.v1.GrepToolCall.
 * Use `create(GrepToolCallSchema)` to create a new message.
 */
export declare const GrepToolCallSchema: GenMessage<GrepToolCall>;
/**
 * @generated from message agent.v1.GetBlobArgs
 */
export type GetBlobArgs = Message<"agent.v1.GetBlobArgs"> & {
    /**
     * @generated from field: bytes blob_id = 1;
     */
    blobId: Uint8Array;
};
/**
 * Describes the message agent.v1.GetBlobArgs.
 * Use `create(GetBlobArgsSchema)` to create a new message.
 */
export declare const GetBlobArgsSchema: GenMessage<GetBlobArgs>;
/**
 * @generated from message agent.v1.GetBlobResult
 */
export type GetBlobResult = Message<"agent.v1.GetBlobResult"> & {
    /**
     * @generated from field: optional bytes blob_data = 1;
     */
    blobData?: Uint8Array | undefined;
};
/**
 * Describes the message agent.v1.GetBlobResult.
 * Use `create(GetBlobResultSchema)` to create a new message.
 */
export declare const GetBlobResultSchema: GenMessage<GetBlobResult>;
/**
 * @generated from message agent.v1.SetBlobArgs
 */
export type SetBlobArgs = Message<"agent.v1.SetBlobArgs"> & {
    /**
     * @generated from field: bytes blob_id = 1;
     */
    blobId: Uint8Array;
    /**
     * @generated from field: bytes blob_data = 2;
     */
    blobData: Uint8Array;
};
/**
 * Describes the message agent.v1.SetBlobArgs.
 * Use `create(SetBlobArgsSchema)` to create a new message.
 */
export declare const SetBlobArgsSchema: GenMessage<SetBlobArgs>;
/**
 * @generated from message agent.v1.SetBlobResult
 */
export type SetBlobResult = Message<"agent.v1.SetBlobResult"> & {
    /**
     * @generated from field: optional agent.v1.Error error = 1;
     */
    error?: Error | undefined;
};
/**
 * Describes the message agent.v1.SetBlobResult.
 * Use `create(SetBlobResultSchema)` to create a new message.
 */
export declare const SetBlobResultSchema: GenMessage<SetBlobResult>;
/**
 * @generated from message agent.v1.KvServerMessage
 */
export type KvServerMessage = Message<"agent.v1.KvServerMessage"> & {
    /**
     * @generated from field: uint32 id = 1;
     */
    id: number;
    /**
     * Span context for distributed tracing
     *
     * @generated from field: optional agent.v1.SpanContext span_context = 4;
     */
    spanContext?: SpanContext | undefined;
    /**
     * @generated from oneof agent.v1.KvServerMessage.message
     */
    message: {
        /**
         * @generated from field: agent.v1.GetBlobArgs get_blob_args = 2;
         */
        value: GetBlobArgs;
        case: "getBlobArgs";
    } | {
        /**
         * @generated from field: agent.v1.SetBlobArgs set_blob_args = 3;
         */
        value: SetBlobArgs;
        case: "setBlobArgs";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.KvServerMessage.
 * Use `create(KvServerMessageSchema)` to create a new message.
 */
export declare const KvServerMessageSchema: GenMessage<KvServerMessage>;
/**
 * @generated from message agent.v1.KvClientMessage
 */
export type KvClientMessage = Message<"agent.v1.KvClientMessage"> & {
    /**
     * @generated from field: uint32 id = 1;
     */
    id: number;
    /**
     * @generated from oneof agent.v1.KvClientMessage.message
     */
    message: {
        /**
         * @generated from field: agent.v1.GetBlobResult get_blob_result = 2;
         */
        value: GetBlobResult;
        case: "getBlobResult";
    } | {
        /**
         * @generated from field: agent.v1.SetBlobResult set_blob_result = 3;
         */
        value: SetBlobResult;
        case: "setBlobResult";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.KvClientMessage.
 * Use `create(KvClientMessageSchema)` to create a new message.
 */
export declare const KvClientMessageSchema: GenMessage<KvClientMessage>;
/**
 * @generated from message agent.v1.LsArgs
 */
export type LsArgs = Message<"agent.v1.LsArgs"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: repeated string ignore = 2;
     */
    ignore: string[];
    /**
     * @generated from field: string tool_call_id = 3;
     */
    toolCallId: string;
    /**
     * @generated from field: optional agent.v1.SandboxPolicy sandbox_policy = 4;
     */
    sandboxPolicy?: SandboxPolicy | undefined;
    /**
     * defaults to 5000ms
     *
     * @generated from field: optional uint32 timeout_ms = 5;
     */
    timeoutMs?: number | undefined;
};
/**
 * Describes the message agent.v1.LsArgs.
 * Use `create(LsArgsSchema)` to create a new message.
 */
export declare const LsArgsSchema: GenMessage<LsArgs>;
/**
 * @generated from message agent.v1.LsResult
 */
export type LsResult = Message<"agent.v1.LsResult"> & {
    /**
     * @generated from oneof agent.v1.LsResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.LsSuccess success = 1;
         */
        value: LsSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.LsError error = 2;
         */
        value: LsError;
        case: "error";
    } | {
        /**
         * @generated from field: agent.v1.LsRejected rejected = 3;
         */
        value: LsRejected;
        case: "rejected";
    } | {
        /**
         * @generated from field: agent.v1.LsTimeout timeout = 4;
         */
        value: LsTimeout;
        case: "timeout";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.LsResult.
 * Use `create(LsResultSchema)` to create a new message.
 */
export declare const LsResultSchema: GenMessage<LsResult>;
/**
 * @generated from message agent.v1.LsSuccess
 */
export type LsSuccess = Message<"agent.v1.LsSuccess"> & {
    /**
     * @generated from field: agent.v1.LsDirectoryTreeNode directory_tree_root = 1;
     */
    directoryTreeRoot?: LsDirectoryTreeNode | undefined;
};
/**
 * Describes the message agent.v1.LsSuccess.
 * Use `create(LsSuccessSchema)` to create a new message.
 */
export declare const LsSuccessSchema: GenMessage<LsSuccess>;
/**
 * @generated from message agent.v1.LsDirectoryTreeNode
 */
export type LsDirectoryTreeNode = Message<"agent.v1.LsDirectoryTreeNode"> & {
    /**
     * @generated from field: string abs_path = 1;
     */
    absPath: string;
    /**
     * @generated from field: repeated agent.v1.LsDirectoryTreeNode children_dirs = 2;
     */
    childrenDirs: LsDirectoryTreeNode[];
    /**
     * @generated from field: repeated agent.v1.LsDirectoryTreeNode_File children_files = 3;
     */
    childrenFiles: LsDirectoryTreeNode_File[];
    /**
     * Proto doesn't allow repeated fields to be optional, so in case of empty children arrays, this fields indicates if it happens: `true` - because directory really doesn't have any children `false` - because we stopped traversal before getting to its children
     *
     * @generated from field: bool children_were_processed = 4;
     */
    childrenWereProcessed: boolean;
    /**
     * Count of extensions in the full sub-tree
     *
     * @generated from field: map<string, int32> full_subtree_extension_counts = 5;
     */
    fullSubtreeExtensionCounts: {
        [key: string]: number;
    };
    /**
     * @generated from field: int32 num_files = 6;
     */
    numFiles: number;
};
/**
 * Describes the message agent.v1.LsDirectoryTreeNode.
 * Use `create(LsDirectoryTreeNodeSchema)` to create a new message.
 */
export declare const LsDirectoryTreeNodeSchema: GenMessage<LsDirectoryTreeNode>;
/**
 * @generated from message agent.v1.LsDirectoryTreeNode_File
 */
export type LsDirectoryTreeNode_File = Message<"agent.v1.LsDirectoryTreeNode_File"> & {
    /**
     * @generated from field: string name = 1;
     */
    name: string;
    /**
     * @generated from field: optional agent.v1.TerminalMetadata terminal_metadata = 2;
     */
    terminalMetadata?: TerminalMetadata | undefined;
};
/**
 * Describes the message agent.v1.LsDirectoryTreeNode_File.
 * Use `create(LsDirectoryTreeNode_FileSchema)` to create a new message.
 */
export declare const LsDirectoryTreeNode_FileSchema: GenMessage<LsDirectoryTreeNode_File>;
/**
 * @generated from message agent.v1.LsError
 */
export type LsError = Message<"agent.v1.LsError"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string error = 2;
     */
    error: string;
};
/**
 * Describes the message agent.v1.LsError.
 * Use `create(LsErrorSchema)` to create a new message.
 */
export declare const LsErrorSchema: GenMessage<LsError>;
/**
 * @generated from message agent.v1.LsRejected
 */
export type LsRejected = Message<"agent.v1.LsRejected"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string reason = 2;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.LsRejected.
 * Use `create(LsRejectedSchema)` to create a new message.
 */
export declare const LsRejectedSchema: GenMessage<LsRejected>;
/**
 * Returned when ls operation timed out. Contains partial results gathered before timeout.
 *
 * @generated from message agent.v1.LsTimeout
 */
export type LsTimeout = Message<"agent.v1.LsTimeout"> & {
    /**
     * @generated from field: agent.v1.LsDirectoryTreeNode directory_tree_root = 1;
     */
    directoryTreeRoot?: LsDirectoryTreeNode | undefined;
};
/**
 * Describes the message agent.v1.LsTimeout.
 * Use `create(LsTimeoutSchema)` to create a new message.
 */
export declare const LsTimeoutSchema: GenMessage<LsTimeout>;
/**
 * @generated from message agent.v1.TerminalMetadata
 */
export type TerminalMetadata = Message<"agent.v1.TerminalMetadata"> & {
    /**
     * @generated from field: optional string cwd = 1;
     */
    cwd?: string | undefined;
    /**
     * @generated from field: repeated agent.v1.TerminalMetadata_Command last_commands = 2;
     */
    lastCommands: TerminalMetadata_Command[];
    /**
     * @generated from field: optional int64 last_modified_ms = 3;
     */
    lastModifiedMs?: bigint | undefined;
    /**
     * @generated from field: optional agent.v1.TerminalMetadata_Command current_command = 4;
     */
    currentCommand?: TerminalMetadata_Command | undefined;
};
/**
 * Describes the message agent.v1.TerminalMetadata.
 * Use `create(TerminalMetadataSchema)` to create a new message.
 */
export declare const TerminalMetadataSchema: GenMessage<TerminalMetadata>;
/**
 * @generated from message agent.v1.TerminalMetadata_Command
 */
export type TerminalMetadata_Command = Message<"agent.v1.TerminalMetadata_Command"> & {
    /**
     * @generated from field: string command = 1;
     */
    command: string;
    /**
     * @generated from field: optional int32 exit_code = 2;
     */
    exitCode?: number | undefined;
    /**
     * @generated from field: optional int64 timestamp_ms = 3;
     */
    timestampMs?: bigint | undefined;
    /**
     * @generated from field: optional int64 duration_ms = 4;
     */
    durationMs?: bigint | undefined;
};
/**
 * Describes the message agent.v1.TerminalMetadata_Command.
 * Use `create(TerminalMetadata_CommandSchema)` to create a new message.
 */
export declare const TerminalMetadata_CommandSchema: GenMessage<TerminalMetadata_Command>;
/**
 * @generated from message agent.v1.LsToolCall
 */
export type LsToolCall = Message<"agent.v1.LsToolCall"> & {
    /**
     * @generated from field: agent.v1.LsArgs args = 1;
     */
    args?: LsArgs | undefined;
    /**
     * @generated from field: agent.v1.LsResult result = 2;
     */
    result?: LsResult | undefined;
};
/**
 * Describes the message agent.v1.LsToolCall.
 * Use `create(LsToolCallSchema)` to create a new message.
 */
export declare const LsToolCallSchema: GenMessage<LsToolCall>;
/**
 * @generated from message agent.v1.McpArgs
 */
export type McpArgs = Message<"agent.v1.McpArgs"> & {
    /**
     * @generated from field: string name = 1;
     */
    name: string;
    /**
     * @generated from field: map<string, bytes> args = 2;
     */
    args: {
        [key: string]: Uint8Array;
    };
    /**
     * @generated from field: string tool_call_id = 3;
     */
    toolCallId: string;
    /**
     * @generated from field: string provider_identifier = 4;
     */
    providerIdentifier: string;
    /**
     * @generated from field: string tool_name = 5;
     */
    toolName: string;
    /**
     * @generated from field: optional agent.v1.SmartModeApproval smart_mode_approval = 6;
     */
    smartModeApproval?: SmartModeApproval | undefined;
    /**
     * @generated from field: bool smart_mode_approval_only = 7;
     */
    smartModeApprovalOnly: boolean;
    /**
     * @generated from field: bool skip_approval = 8;
     */
    skipApproval: boolean;
    /**
     * @generated from field: string server_identifier = 9;
     */
    serverIdentifier: string;
};
/**
 * Describes the message agent.v1.McpArgs.
 * Use `create(McpArgsSchema)` to create a new message.
 */
export declare const McpArgsSchema: GenMessage<McpArgs>;
/**
 * @generated from message agent.v1.McpResult
 */
export type McpResult = Message<"agent.v1.McpResult"> & {
    /**
     * @generated from oneof agent.v1.McpResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.McpSuccess success = 1;
         */
        value: McpSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.McpError error = 2;
         */
        value: McpError;
        case: "error";
    } | {
        /**
         * @generated from field: agent.v1.McpRejected rejected = 3;
         */
        value: McpRejected;
        case: "rejected";
    } | {
        /**
         * @generated from field: agent.v1.McpPermissionDenied permission_denied = 4;
         */
        value: McpPermissionDenied;
        case: "permissionDenied";
    } | {
        /**
         * @generated from field: agent.v1.McpToolNotFound tool_not_found = 5;
         */
        value: McpToolNotFound;
        case: "toolNotFound";
    } | {
        /**
         * @generated from field: agent.v1.McpServerNotFound server_not_found = 6;
         */
        value: McpServerNotFound;
        case: "serverNotFound";
    } | {
        /**
         * @generated from field: agent.v1.McpApproved approved = 7;
         */
        value: McpApproved;
        case: "approved";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.McpResult.
 * Use `create(McpResultSchema)` to create a new message.
 */
export declare const McpResultSchema: GenMessage<McpResult>;
/**
 * @generated from message agent.v1.McpToolNotFound
 */
export type McpToolNotFound = Message<"agent.v1.McpToolNotFound"> & {
    /**
     * @generated from field: string name = 1;
     */
    name: string;
    /**
     * @generated from field: repeated string available_tools = 2;
     */
    availableTools: string[];
};
/**
 * Describes the message agent.v1.McpToolNotFound.
 * Use `create(McpToolNotFoundSchema)` to create a new message.
 */
export declare const McpToolNotFoundSchema: GenMessage<McpToolNotFound>;
/**
 * Text content item
 *
 * @generated from message agent.v1.McpTextContent
 */
export type McpTextContent = Message<"agent.v1.McpTextContent"> & {
    /**
     * @generated from field: string text = 1;
     */
    text: string;
    /**
     * Optional file location for large outputs
     *
     * @generated from field: optional agent.v1.OutputLocation output_location = 2;
     */
    outputLocation?: OutputLocation | undefined;
};
/**
 * Describes the message agent.v1.McpTextContent.
 * Use `create(McpTextContentSchema)` to create a new message.
 */
export declare const McpTextContentSchema: GenMessage<McpTextContent>;
/**
 * Image content item
 *
 * @generated from message agent.v1.McpImageContent
 */
export type McpImageContent = Message<"agent.v1.McpImageContent"> & {
    /**
     * Raw bytes of the image. In JSON, this will be base64-encoded.
     *
     * @generated from field: bytes data = 1;
     */
    data: Uint8Array;
    /**
     * Optional MIME type, e.g. "image/png"
     *
     * @generated from field: string mime_type = 2;
     */
    mimeType: string;
};
/**
 * Describes the message agent.v1.McpImageContent.
 * Use `create(McpImageContentSchema)` to create a new message.
 */
export declare const McpImageContentSchema: GenMessage<McpImageContent>;
/**
 * A single tool result content item: either text or image
 *
 * @generated from message agent.v1.McpToolResultContentItem
 */
export type McpToolResultContentItem = Message<"agent.v1.McpToolResultContentItem"> & {
    /**
     * @generated from oneof agent.v1.McpToolResultContentItem.content
     */
    content: {
        /**
         * @generated from field: agent.v1.McpTextContent text = 1;
         */
        value: McpTextContent;
        case: "text";
    } | {
        /**
         * @generated from field: agent.v1.McpImageContent image = 2;
         */
        value: McpImageContent;
        case: "image";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.McpToolResultContentItem.
 * Use `create(McpToolResultContentItemSchema)` to create a new message.
 */
export declare const McpToolResultContentItemSchema: GenMessage<McpToolResultContentItem>;
/**
 * Equivalent to the requested McpToolResult TypeScript type
 *
 * @generated from message agent.v1.McpSuccess
 */
export type McpSuccess = Message<"agent.v1.McpSuccess"> & {
    /**
     * @generated from field: repeated agent.v1.McpToolResultContentItem content = 1;
     */
    content: McpToolResultContentItem[];
    /**
     * @generated from field: bool is_error = 2;
     */
    isError: boolean;
};
/**
 * Describes the message agent.v1.McpSuccess.
 * Use `create(McpSuccessSchema)` to create a new message.
 */
export declare const McpSuccessSchema: GenMessage<McpSuccess>;
/**
 * @generated from message agent.v1.McpError
 */
export type McpError = Message<"agent.v1.McpError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.McpError.
 * Use `create(McpErrorSchema)` to create a new message.
 */
export declare const McpErrorSchema: GenMessage<McpError>;
/**
 * @generated from message agent.v1.McpRejected
 */
export type McpRejected = Message<"agent.v1.McpRejected"> & {
    /**
     * @generated from field: string reason = 1;
     */
    reason: string;
    /**
     * @generated from field: bool is_readonly = 2;
     */
    isReadonly: boolean;
};
/**
 * Describes the message agent.v1.McpRejected.
 * Use `create(McpRejectedSchema)` to create a new message.
 */
export declare const McpRejectedSchema: GenMessage<McpRejected>;
/**
 * @generated from message agent.v1.McpPermissionDenied
 */
export type McpPermissionDenied = Message<"agent.v1.McpPermissionDenied"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
    /**
     * @generated from field: bool is_readonly = 2;
     */
    isReadonly: boolean;
};
/**
 * Describes the message agent.v1.McpPermissionDenied.
 * Use `create(McpPermissionDeniedSchema)` to create a new message.
 */
export declare const McpPermissionDeniedSchema: GenMessage<McpPermissionDenied>;
/**
 * List MCP resources exec args
 *
 * @generated from message agent.v1.ListMcpResourcesExecArgs
 */
export type ListMcpResourcesExecArgs = Message<"agent.v1.ListMcpResourcesExecArgs"> & {
    /**
     * Optional server name to filter resources by
     *
     * @generated from field: optional string server = 1;
     */
    server?: string | undefined;
};
/**
 * Describes the message agent.v1.ListMcpResourcesExecArgs.
 * Use `create(ListMcpResourcesExecArgsSchema)` to create a new message.
 */
export declare const ListMcpResourcesExecArgsSchema: GenMessage<ListMcpResourcesExecArgs>;
/**
 * List MCP resources exec result
 *
 * @generated from message agent.v1.ListMcpResourcesExecResult
 */
export type ListMcpResourcesExecResult = Message<"agent.v1.ListMcpResourcesExecResult"> & {
    /**
     * @generated from oneof agent.v1.ListMcpResourcesExecResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.ListMcpResourcesSuccess success = 1;
         */
        value: ListMcpResourcesSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.ListMcpResourcesError error = 2;
         */
        value: ListMcpResourcesError;
        case: "error";
    } | {
        /**
         * @generated from field: agent.v1.ListMcpResourcesRejected rejected = 3;
         */
        value: ListMcpResourcesRejected;
        case: "rejected";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ListMcpResourcesExecResult.
 * Use `create(ListMcpResourcesExecResultSchema)` to create a new message.
 */
export declare const ListMcpResourcesExecResultSchema: GenMessage<ListMcpResourcesExecResult>;
/**
 * @generated from message agent.v1.ListMcpResourcesExecResult_McpResource
 */
export type ListMcpResourcesExecResult_McpResource = Message<"agent.v1.ListMcpResourcesExecResult_McpResource"> & {
    /**
     * @generated from field: string uri = 1;
     */
    uri: string;
    /**
     * @generated from field: optional string name = 2;
     */
    name?: string | undefined;
    /**
     * @generated from field: optional string description = 3;
     */
    description?: string | undefined;
    /**
     * @generated from field: optional string mime_type = 4;
     */
    mimeType?: string | undefined;
    /**
     * Server name that provides this resource
     *
     * @generated from field: string server = 5;
     */
    server: string;
    /**
     * Additional metadata
     *
     * @generated from field: map<string, string> annotations = 6;
     */
    annotations: {
        [key: string]: string;
    };
};
/**
 * Describes the message agent.v1.ListMcpResourcesExecResult_McpResource.
 * Use `create(ListMcpResourcesExecResult_McpResourceSchema)` to create a new message.
 */
export declare const ListMcpResourcesExecResult_McpResourceSchema: GenMessage<ListMcpResourcesExecResult_McpResource>;
/**
 * @generated from message agent.v1.ListMcpResourcesSuccess
 */
export type ListMcpResourcesSuccess = Message<"agent.v1.ListMcpResourcesSuccess"> & {
    /**
     * @generated from field: repeated agent.v1.ListMcpResourcesExecResult_McpResource resources = 1;
     */
    resources: ListMcpResourcesExecResult_McpResource[];
};
/**
 * Describes the message agent.v1.ListMcpResourcesSuccess.
 * Use `create(ListMcpResourcesSuccessSchema)` to create a new message.
 */
export declare const ListMcpResourcesSuccessSchema: GenMessage<ListMcpResourcesSuccess>;
/**
 * @generated from message agent.v1.ListMcpResourcesError
 */
export type ListMcpResourcesError = Message<"agent.v1.ListMcpResourcesError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.ListMcpResourcesError.
 * Use `create(ListMcpResourcesErrorSchema)` to create a new message.
 */
export declare const ListMcpResourcesErrorSchema: GenMessage<ListMcpResourcesError>;
/**
 * @generated from message agent.v1.ListMcpResourcesRejected
 */
export type ListMcpResourcesRejected = Message<"agent.v1.ListMcpResourcesRejected"> & {
    /**
     * @generated from field: string reason = 1;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.ListMcpResourcesRejected.
 * Use `create(ListMcpResourcesRejectedSchema)` to create a new message.
 */
export declare const ListMcpResourcesRejectedSchema: GenMessage<ListMcpResourcesRejected>;
/**
 * Read MCP resource exec args
 *
 * @generated from message agent.v1.ReadMcpResourceExecArgs
 */
export type ReadMcpResourceExecArgs = Message<"agent.v1.ReadMcpResourceExecArgs"> & {
    /**
     * Required server name
     *
     * @generated from field: string server = 1;
     */
    server: string;
    /**
     * Required resource URI
     *
     * @generated from field: string uri = 2;
     */
    uri: string;
    /**
     * Optional: when set, the resource will be downloaded to this path relative to the workspace, and the content will not be returned to the model.
     *
     * @generated from field: optional string download_path = 3;
     */
    downloadPath?: string | undefined;
    /**
     * @generated from field: string tool_call_id = 4;
     */
    toolCallId: string;
    /**
     * @generated from field: optional agent.v1.SmartModeApproval smart_mode_approval = 5;
     */
    smartModeApproval?: SmartModeApproval | undefined;
};
/**
 * Describes the message agent.v1.ReadMcpResourceExecArgs.
 * Use `create(ReadMcpResourceExecArgsSchema)` to create a new message.
 */
export declare const ReadMcpResourceExecArgsSchema: GenMessage<ReadMcpResourceExecArgs>;
/**
 * Read MCP resource exec result
 *
 * @generated from message agent.v1.ReadMcpResourceExecResult
 */
export type ReadMcpResourceExecResult = Message<"agent.v1.ReadMcpResourceExecResult"> & {
    /**
     * @generated from oneof agent.v1.ReadMcpResourceExecResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.ReadMcpResourceSuccess success = 1;
         */
        value: ReadMcpResourceSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.ReadMcpResourceError error = 2;
         */
        value: ReadMcpResourceError;
        case: "error";
    } | {
        /**
         * @generated from field: agent.v1.ReadMcpResourceRejected rejected = 3;
         */
        value: ReadMcpResourceRejected;
        case: "rejected";
    } | {
        /**
         * @generated from field: agent.v1.ReadMcpResourceNotFound not_found = 4;
         */
        value: ReadMcpResourceNotFound;
        case: "notFound";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ReadMcpResourceExecResult.
 * Use `create(ReadMcpResourceExecResultSchema)` to create a new message.
 */
export declare const ReadMcpResourceExecResultSchema: GenMessage<ReadMcpResourceExecResult>;
/**
 * @generated from message agent.v1.ReadMcpResourceSuccess
 */
export type ReadMcpResourceSuccess = Message<"agent.v1.ReadMcpResourceSuccess"> & {
    /**
     * @generated from field: string uri = 1;
     */
    uri: string;
    /**
     * @generated from field: optional string name = 2;
     */
    name?: string | undefined;
    /**
     * @generated from field: optional string description = 3;
     */
    description?: string | undefined;
    /**
     * @generated from field: optional string mime_type = 4;
     */
    mimeType?: string | undefined;
    /**
     * Additional metadata
     *
     * @generated from field: map<string, string> annotations = 7;
     */
    annotations: {
        [key: string]: string;
    };
    /**
     * If set, resource was downloaded to this path
     *
     * @generated from field: optional string download_path = 8;
     */
    downloadPath?: string | undefined;
    /**
     * @generated from oneof agent.v1.ReadMcpResourceSuccess.content
     */
    content: {
        /**
         * @generated from field: string text = 5;
         */
        value: string;
        case: "text";
    } | {
        /**
         * @generated from field: bytes blob = 6;
         */
        value: Uint8Array;
        case: "blob";
    } | {
        case: undefined;
        value?: undefined;
    };
    /**
     * @generated from field: optional agent.v1.OutputLocation output_location = 9;
     */
    outputLocation?: OutputLocation | undefined;
};
/**
 * Describes the message agent.v1.ReadMcpResourceSuccess.
 * Use `create(ReadMcpResourceSuccessSchema)` to create a new message.
 */
export declare const ReadMcpResourceSuccessSchema: GenMessage<ReadMcpResourceSuccess>;
/**
 * @generated from message agent.v1.ReadMcpResourceError
 */
export type ReadMcpResourceError = Message<"agent.v1.ReadMcpResourceError"> & {
    /**
     * @generated from field: string uri = 1;
     */
    uri: string;
    /**
     * @generated from field: string error = 2;
     */
    error: string;
};
/**
 * Describes the message agent.v1.ReadMcpResourceError.
 * Use `create(ReadMcpResourceErrorSchema)` to create a new message.
 */
export declare const ReadMcpResourceErrorSchema: GenMessage<ReadMcpResourceError>;
/**
 * @generated from message agent.v1.ReadMcpResourceRejected
 */
export type ReadMcpResourceRejected = Message<"agent.v1.ReadMcpResourceRejected"> & {
    /**
     * @generated from field: string uri = 1;
     */
    uri: string;
    /**
     * @generated from field: string reason = 2;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.ReadMcpResourceRejected.
 * Use `create(ReadMcpResourceRejectedSchema)` to create a new message.
 */
export declare const ReadMcpResourceRejectedSchema: GenMessage<ReadMcpResourceRejected>;
/**
 * @generated from message agent.v1.ReadMcpResourceNotFound
 */
export type ReadMcpResourceNotFound = Message<"agent.v1.ReadMcpResourceNotFound"> & {
    /**
     * @generated from field: string uri = 1;
     */
    uri: string;
};
/**
 * Describes the message agent.v1.ReadMcpResourceNotFound.
 * Use `create(ReadMcpResourceNotFoundSchema)` to create a new message.
 */
export declare const ReadMcpResourceNotFoundSchema: GenMessage<ReadMcpResourceNotFound>;
/**
 * @generated from message agent.v1.McpToolDefinition
 */
export type McpToolDefinition = Message<"agent.v1.McpToolDefinition"> & {
    /**
     * @generated from field: string name = 1;
     */
    name: string;
    /**
     * @generated from field: string provider_identifier = 4;
     */
    providerIdentifier: string;
    /**
     * @generated from field: string tool_name = 5;
     */
    toolName: string;
    /**
     * @generated from field: string description = 2;
     */
    description: string;
    /**
     * @generated from field: bytes input_schema = 3;
     */
    inputSchema: Uint8Array;
    /**
     * @generated from field: optional string input_schema_json = 6;
     */
    inputSchemaJson?: string | undefined;
};
/**
 * Describes the message agent.v1.McpToolDefinition.
 * Use `create(McpToolDefinitionSchema)` to create a new message.
 */
export declare const McpToolDefinitionSchema: GenMessage<McpToolDefinition>;
/**
 * @generated from message agent.v1.McpTools
 */
export type McpTools = Message<"agent.v1.McpTools"> & {
    /**
     * @generated from field: repeated agent.v1.McpToolDefinition mcp_tools = 1;
     */
    mcpTools: McpToolDefinition[];
};
/**
 * Describes the message agent.v1.McpTools.
 * Use `create(McpToolsSchema)` to create a new message.
 */
export declare const McpToolsSchema: GenMessage<McpTools>;
/**
 * Represents MCP-provided instructions from a specific server
 *
 * @generated from message agent.v1.McpInstructions
 */
export type McpInstructions = Message<"agent.v1.McpInstructions"> & {
    /**
     * @generated from field: string server_name = 1;
     */
    serverName: string;
    /**
     * @generated from field: string instructions = 2;
     */
    instructions: string;
    /**
     * @generated from field: string server_identifier = 3;
     */
    serverIdentifier: string;
};
/**
 * Describes the message agent.v1.McpInstructions.
 * Use `create(McpInstructionsSchema)` to create a new message.
 */
export declare const McpInstructionsSchema: GenMessage<McpInstructions>;
/**
 * @generated from message agent.v1.McpDescriptor
 */
export type McpDescriptor = Message<"agent.v1.McpDescriptor"> & {
    /**
     * Display name of the MCP server associated with this folder.
     *
     * @generated from field: string server_name = 1;
     */
    serverName: string;
    /**
     * @generated from field: string server_identifier = 2;
     */
    serverIdentifier: string;
    /**
     * Absolute folder path where MCP tool descriptor JSON files are stored.
     *
     * @generated from field: optional string folder_path = 3;
     */
    folderPath?: string | undefined;
    /**
     * @generated from field: optional string server_use_instructions = 4;
     */
    serverUseInstructions?: string | undefined;
    /**
     * @generated from field: repeated agent.v1.McpToolDescriptor tools = 5;
     */
    tools: McpToolDescriptor[];
    /**
     * @generated from field: optional string plugin = 7;
     */
    plugin?: string | undefined;
    /**
     * @generated from field: optional string marketplace = 8;
     */
    marketplace?: string | undefined;
    /**
     * @generated from field: optional string plugin_db_id = 9;
     */
    pluginDbId?: string | undefined;
    /**
     * @generated from field: optional string marketplace_id = 10;
     */
    marketplaceId?: string | undefined;
};
/**
 * Describes the message agent.v1.McpDescriptor.
 * Use `create(McpDescriptorSchema)` to create a new message.
 */
export declare const McpDescriptorSchema: GenMessage<McpDescriptor>;
/**
 * @generated from message agent.v1.McpToolDescriptor
 */
export type McpToolDescriptor = Message<"agent.v1.McpToolDescriptor"> & {
    /**
     * @generated from field: string tool_name = 1;
     */
    toolName: string;
    /**
     * @generated from field: optional string definition_path = 2;
     */
    definitionPath?: string | undefined;
    /**
     * @generated from field: optional string description = 3;
     */
    description?: string | undefined;
    /**
     * @generated from field: optional string input_schema_json = 5;
     */
    inputSchemaJson?: string | undefined;
};
/**
 * Describes the message agent.v1.McpToolDescriptor.
 * Use `create(McpToolDescriptorSchema)` to create a new message.
 */
export declare const McpToolDescriptorSchema: GenMessage<McpToolDescriptor>;
/**
 * @generated from message agent.v1.McpFileSystemOptions
 */
export type McpFileSystemOptions = Message<"agent.v1.McpFileSystemOptions"> & {
    /**
     * @generated from field: bool enabled = 1;
     */
    enabled: boolean;
    /**
     * @generated from field: string workspace_project_dir = 2;
     */
    workspaceProjectDir: string;
    /**
     * @generated from field: repeated agent.v1.McpDescriptor mcp_descriptors = 3;
     */
    mcpDescriptors: McpDescriptor[];
};
/**
 * Describes the message agent.v1.McpFileSystemOptions.
 * Use `create(McpFileSystemOptionsSchema)` to create a new message.
 */
export declare const McpFileSystemOptionsSchema: GenMessage<McpFileSystemOptions>;
/**
 * @generated from message agent.v1.ReadArgs
 */
export type ReadArgs = Message<"agent.v1.ReadArgs"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string tool_call_id = 2;
     */
    toolCallId: string;
    /**
     * @generated from field: optional int32 offset = 4;
     */
    offset?: number | undefined;
    /**
     * @generated from field: optional uint32 limit = 5;
     */
    limit?: number | undefined;
    /**
     * @generated from field: optional string encoding_hint = 6;
     */
    encodingHint?: string | undefined;
};
/**
 * Describes the message agent.v1.ReadArgs.
 * Use `create(ReadArgsSchema)` to create a new message.
 */
export declare const ReadArgsSchema: GenMessage<ReadArgs>;
/**
 * @generated from message agent.v1.ReadResult
 */
export type ReadResult = Message<"agent.v1.ReadResult"> & {
    /**
     * @generated from oneof agent.v1.ReadResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.ReadSuccess success = 1;
         */
        value: ReadSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.ReadError error = 2;
         */
        value: ReadError;
        case: "error";
    } | {
        /**
         * @generated from field: agent.v1.ReadRejected rejected = 3;
         */
        value: ReadRejected;
        case: "rejected";
    } | {
        /**
         * @generated from field: agent.v1.ReadFileNotFound file_not_found = 4;
         */
        value: ReadFileNotFound;
        case: "fileNotFound";
    } | {
        /**
         * @generated from field: agent.v1.ReadPermissionDenied permission_denied = 5;
         */
        value: ReadPermissionDenied;
        case: "permissionDenied";
    } | {
        /**
         * @generated from field: agent.v1.ReadInvalidFile invalid_file = 6;
         */
        value: ReadInvalidFile;
        case: "invalidFile";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ReadResult.
 * Use `create(ReadResultSchema)` to create a new message.
 */
export declare const ReadResultSchema: GenMessage<ReadResult>;
/**
 * @generated from message agent.v1.ReadSuccess
 */
export type ReadSuccess = Message<"agent.v1.ReadSuccess"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: int32 total_lines = 3;
     */
    totalLines: number;
    /**
     * @generated from field: int64 file_size = 4;
     */
    fileSize: bigint;
    /**
     * true if the content was truncated due to size limits
     *
     * @generated from field: bool truncated = 6;
     */
    truncated: boolean;
    /**
     * Returns blob ID if the output was stored in the blob store. If provided, the output is stored separately from the rest of the tool result, and since it's already in the blob store, it need not be sent back to the client -- reducing bandwidth.
     *
     * @generated from field: optional bytes output_blob_id = 7;
     */
    outputBlobId?: Uint8Array | undefined;
    /**
     * @generated from oneof agent.v1.ReadSuccess.output
     */
    output: {
        /**
         * @generated from field: string content = 2;
         */
        value: string;
        case: "content";
    } | {
        /**
         * @generated from field: bytes data = 5;
         */
        value: Uint8Array;
        case: "data";
    } | {
        case: undefined;
        value?: undefined;
    };
    /**
     * @generated from field: bool range_applied = 8;
     */
    rangeApplied: boolean;
};
/**
 * Describes the message agent.v1.ReadSuccess.
 * Use `create(ReadSuccessSchema)` to create a new message.
 */
export declare const ReadSuccessSchema: GenMessage<ReadSuccess>;
/**
 * @generated from message agent.v1.ReadError
 */
export type ReadError = Message<"agent.v1.ReadError"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string error = 2;
     */
    error: string;
};
/**
 * Describes the message agent.v1.ReadError.
 * Use `create(ReadErrorSchema)` to create a new message.
 */
export declare const ReadErrorSchema: GenMessage<ReadError>;
/**
 * @generated from message agent.v1.ReadRejected
 */
export type ReadRejected = Message<"agent.v1.ReadRejected"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string reason = 2;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.ReadRejected.
 * Use `create(ReadRejectedSchema)` to create a new message.
 */
export declare const ReadRejectedSchema: GenMessage<ReadRejected>;
/**
 * @generated from message agent.v1.ReadFileNotFound
 */
export type ReadFileNotFound = Message<"agent.v1.ReadFileNotFound"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
};
/**
 * Describes the message agent.v1.ReadFileNotFound.
 * Use `create(ReadFileNotFoundSchema)` to create a new message.
 */
export declare const ReadFileNotFoundSchema: GenMessage<ReadFileNotFound>;
/**
 * @generated from message agent.v1.ReadPermissionDenied
 */
export type ReadPermissionDenied = Message<"agent.v1.ReadPermissionDenied"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
};
/**
 * Describes the message agent.v1.ReadPermissionDenied.
 * Use `create(ReadPermissionDeniedSchema)` to create a new message.
 */
export declare const ReadPermissionDeniedSchema: GenMessage<ReadPermissionDenied>;
/**
 * @generated from message agent.v1.ReadInvalidFile
 */
export type ReadInvalidFile = Message<"agent.v1.ReadInvalidFile"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * e.g., "Path is a directory, not a file"
     *
     * @generated from field: string reason = 2;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.ReadInvalidFile.
 * Use `create(ReadInvalidFileSchema)` to create a new message.
 */
export declare const ReadInvalidFileSchema: GenMessage<ReadInvalidFile>;
/**
 * @generated from message agent.v1.ReadToolCall
 */
export type ReadToolCall = Message<"agent.v1.ReadToolCall"> & {
    /**
     * @generated from field: agent.v1.ReadToolArgs args = 1;
     */
    args?: ReadToolArgs | undefined;
    /**
     * @generated from field: agent.v1.ReadToolResult result = 2;
     */
    result?: ReadToolResult | undefined;
};
/**
 * Describes the message agent.v1.ReadToolCall.
 * Use `create(ReadToolCallSchema)` to create a new message.
 */
export declare const ReadToolCallSchema: GenMessage<ReadToolCall>;
/**
 * @generated from message agent.v1.ReadToolArgs
 */
export type ReadToolArgs = Message<"agent.v1.ReadToolArgs"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: optional int32 offset = 2;
     */
    offset?: number | undefined;
    /**
     * @generated from field: optional int32 limit = 3;
     */
    limit?: number | undefined;
};
/**
 * Describes the message agent.v1.ReadToolArgs.
 * Use `create(ReadToolArgsSchema)` to create a new message.
 */
export declare const ReadToolArgsSchema: GenMessage<ReadToolArgs>;
/**
 * @generated from message agent.v1.ReadToolResult
 */
export type ReadToolResult = Message<"agent.v1.ReadToolResult"> & {
    /**
     * @generated from oneof agent.v1.ReadToolResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.ReadToolSuccess success = 1;
         */
        value: ReadToolSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.ReadToolError error = 2;
         */
        value: ReadToolError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ReadToolResult.
 * Use `create(ReadToolResultSchema)` to create a new message.
 */
export declare const ReadToolResultSchema: GenMessage<ReadToolResult>;
/**
 * @generated from message agent.v1.ReadRange
 */
export type ReadRange = Message<"agent.v1.ReadRange"> & {
    /**
     * @generated from field: uint32 start_line = 1;
     */
    startLine: number;
    /**
     * @generated from field: uint32 end_line = 2;
     */
    endLine: number;
};
/**
 * Describes the message agent.v1.ReadRange.
 * Use `create(ReadRangeSchema)` to create a new message.
 */
export declare const ReadRangeSchema: GenMessage<ReadRange>;
/**
 * @generated from message agent.v1.ReadToolSuccess
 */
export type ReadToolSuccess = Message<"agent.v1.ReadToolSuccess"> & {
    /**
     * @generated from field: bool is_empty = 2;
     */
    isEmpty: boolean;
    /**
     * @generated from field: bool exceeded_limit = 3;
     */
    exceededLimit: boolean;
    /**
     * @generated from field: uint32 total_lines = 4;
     */
    totalLines: number;
    /**
     * @generated from field: uint32 file_size = 5;
     */
    fileSize: number;
    /**
     * @generated from field: string path = 7;
     */
    path: string;
    /**
     * @generated from field: optional agent.v1.ReadRange read_range = 8;
     */
    readRange?: ReadRange | undefined;
    /**
     * @generated from oneof agent.v1.ReadToolSuccess.output
     */
    output: {
        /**
         * @generated from field: string content = 1;
         */
        value: string;
        case: "content";
    } | {
        /**
         * @generated from field: bytes data = 6;
         */
        value: Uint8Array;
        case: "data";
    } | {
        /**
         * @generated from field: bytes data_blob_id = 9;
         */
        value: Uint8Array;
        case: "dataBlobId";
    } | {
        /**
         * @generated from field: bytes content_blob_id = 10;
         */
        value: Uint8Array;
        case: "contentBlobId";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ReadToolSuccess.
 * Use `create(ReadToolSuccessSchema)` to create a new message.
 */
export declare const ReadToolSuccessSchema: GenMessage<ReadToolSuccess>;
/**
 * @generated from message agent.v1.ReadToolError
 */
export type ReadToolError = Message<"agent.v1.ReadToolError"> & {
    /**
     * @generated from field: string error_message = 1;
     */
    errorMessage: string;
};
/**
 * Describes the message agent.v1.ReadToolError.
 * Use `create(ReadToolErrorSchema)` to create a new message.
 */
export declare const ReadToolErrorSchema: GenMessage<ReadToolError>;
/**
 * @generated from message agent.v1.RecordScreenArgs
 */
export type RecordScreenArgs = Message<"agent.v1.RecordScreenArgs"> & {
    /**
     * @generated from field: int32 mode = 1;
     */
    mode: number;
    /**
     * @generated from field: string tool_call_id = 2;
     */
    toolCallId: string;
    /**
     * Custom filename for SAVE_RECORDING mode
     *
     * @generated from field: optional string save_as_filename = 3;
     */
    saveAsFilename?: string | undefined;
};
/**
 * Describes the message agent.v1.RecordScreenArgs.
 * Use `create(RecordScreenArgsSchema)` to create a new message.
 */
export declare const RecordScreenArgsSchema: GenMessage<RecordScreenArgs>;
/**
 * @generated from message agent.v1.RecordScreenResult
 */
export type RecordScreenResult = Message<"agent.v1.RecordScreenResult"> & {
    /**
     * @generated from oneof agent.v1.RecordScreenResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.RecordScreenStartSuccess start_success = 1;
         */
        value: RecordScreenStartSuccess;
        case: "startSuccess";
    } | {
        /**
         * @generated from field: agent.v1.RecordScreenSaveSuccess save_success = 2;
         */
        value: RecordScreenSaveSuccess;
        case: "saveSuccess";
    } | {
        /**
         * @generated from field: agent.v1.RecordScreenDiscardSuccess discard_success = 3;
         */
        value: RecordScreenDiscardSuccess;
        case: "discardSuccess";
    } | {
        /**
         * @generated from field: agent.v1.RecordScreenFailure failure = 4;
         */
        value: RecordScreenFailure;
        case: "failure";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.RecordScreenResult.
 * Use `create(RecordScreenResultSchema)` to create a new message.
 */
export declare const RecordScreenResultSchema: GenMessage<RecordScreenResult>;
/**
 * @generated from message agent.v1.RecordScreenStartSuccess
 */
export type RecordScreenStartSuccess = Message<"agent.v1.RecordScreenStartSuccess"> & {
    /**
     * True if a prior recording was cancelled, false otherwise
     *
     * @generated from field: bool was_prior_recording_cancelled = 1;
     */
    wasPriorRecordingCancelled: boolean;
    /**
     * True if save_as_filename arg was passed to start tool and ignored
     *
     * @generated from field: bool was_save_as_filename_ignored = 2;
     */
    wasSaveAsFilenameIgnored: boolean;
};
/**
 * Describes the message agent.v1.RecordScreenStartSuccess.
 * Use `create(RecordScreenStartSuccessSchema)` to create a new message.
 */
export declare const RecordScreenStartSuccessSchema: GenMessage<RecordScreenStartSuccess>;
/**
 * @generated from message agent.v1.RecordScreenSaveSuccess
 */
export type RecordScreenSaveSuccess = Message<"agent.v1.RecordScreenSaveSuccess"> & {
    /**
     * Path to the saved recording file
     *
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * Duration of the recording in milliseconds
     *
     * @generated from field: int64 recording_duration_ms = 2;
     */
    recordingDurationMs: bigint;
    /**
     * Set if save_as_filename was invalid and default path was used instead
     *
     * @generated from field: optional int32 requested_file_path_rejected_reason = 3;
     */
    requestedFilePathRejectedReason?: number | undefined;
};
/**
 * Describes the message agent.v1.RecordScreenSaveSuccess.
 * Use `create(RecordScreenSaveSuccessSchema)` to create a new message.
 */
export declare const RecordScreenSaveSuccessSchema: GenMessage<RecordScreenSaveSuccess>;
/**
 * Empty message - recording discarded successfully
 *
 * @generated from message agent.v1.RecordScreenDiscardSuccess
 */
export type RecordScreenDiscardSuccess = Message<"agent.v1.RecordScreenDiscardSuccess"> & {};
/**
 * Describes the message agent.v1.RecordScreenDiscardSuccess.
 * Use `create(RecordScreenDiscardSuccessSchema)` to create a new message.
 */
export declare const RecordScreenDiscardSuccessSchema: GenMessage<RecordScreenDiscardSuccess>;
/**
 * @generated from message agent.v1.RecordScreenFailure
 */
export type RecordScreenFailure = Message<"agent.v1.RecordScreenFailure"> & {
    /**
     * Error message
     *
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.RecordScreenFailure.
 * Use `create(RecordScreenFailureSchema)` to create a new message.
 */
export declare const RecordScreenFailureSchema: GenMessage<RecordScreenFailure>;
/**
 * @generated from message agent.v1.CursorPackagePrompt
 */
export type CursorPackagePrompt = Message<"agent.v1.CursorPackagePrompt"> & {
    /**
     * @generated from field: string name = 1;
     */
    name: string;
    /**
     * @generated from field: string file_path = 2;
     */
    filePath: string;
};
/**
 * Describes the message agent.v1.CursorPackagePrompt.
 * Use `create(CursorPackagePromptSchema)` to create a new message.
 */
export declare const CursorPackagePromptSchema: GenMessage<CursorPackagePrompt>;
/**
 * @generated from message agent.v1.CursorPackage
 */
export type CursorPackage = Message<"agent.v1.CursorPackage"> & {
    /**
     * @generated from field: string name = 1;
     */
    name: string;
    /**
     * @generated from field: string description = 2;
     */
    description: string;
    /**
     * @generated from field: string folder_path = 3;
     */
    folderPath: string;
    /**
     * @generated from field: bool enabled = 4;
     */
    enabled: boolean;
    /**
     * @generated from field: optional string parse_error = 5;
     */
    parseError?: string | undefined;
    /**
     * @generated from field: repeated agent.v1.CursorPackagePrompt prompts = 6;
     */
    prompts: CursorPackagePrompt[];
    /**
     * @generated from field: string readme_file_path = 7;
     */
    readmeFilePath: string;
    /**
     * @generated from field: int32 package_type = 8;
     */
    packageType: number;
};
/**
 * Describes the message agent.v1.CursorPackage.
 * Use `create(CursorPackageSchema)` to create a new message.
 */
export declare const CursorPackageSchema: GenMessage<CursorPackage>;
/**
 * TODO: you should be able to override / configure this list in your .vscode settings not exactly sure what that should look like... but i guess you should be able to specify an override URL because we use URLs for identifying repos and maybe you should be able to specify additional buckets too... like in the jane street case: i guess jane street should have some default buckets
 *
 * @generated from message agent.v1.RepositoryIndexingInfo
 */
export type RepositoryIndexingInfo = Message<"agent.v1.RepositoryIndexingInfo"> & {
    /**
     * the relative path in the current workspace this is useful for locating the repo and identifying what repo a given file is in this should be unique for different repositories (I think)
     *
     * @generated from field: string relative_workspace_path = 1;
     */
    relativeWorkspacePath: string;
    /**
     * a git repo may have multiple remotes at the server we choose the remote (either origin, or the one we have embedded, or something else) invariant: len(remote_urls) == len(remote_names)
     *
     * @generated from field: repeated string remote_urls = 2;
     */
    remoteUrls: string[];
    /**
     * @generated from field: repeated string remote_names = 3;
     */
    remoteNames: string[];
    /**
     * @generated from field: string repo_name = 4;
     */
    repoName: string;
    /**
     * @generated from field: string repo_owner = 5;
     */
    repoOwner: string;
    /**
     * @generated from field: bool is_tracked = 6;
     */
    isTracked: boolean;
    /**
     * If this is local
     *
     * @generated from field: bool is_local = 7;
     */
    isLocal: boolean;
    /**
     * the orthogonal transform seed if sent from the client! if the client sends up the transform seed then we use that for the orthogonal transform instead of the value stored in the database
     *
     * @generated from field: optional double orthogonal_transform_seed = 8;
     */
    orthogonalTransformSeed?: number | undefined;
    /**
     * The encrypted workspace uri for the repository.
     *
     * @generated from field: string workspace_uri = 9;
     */
    workspaceUri: string;
    /**
     * The encryption key for partial paths
     *
     * @generated from field: string path_encryption_key = 10;
     */
    pathEncryptionKey: string;
};
/**
 * Describes the message agent.v1.RepositoryIndexingInfo.
 * Use `create(RepositoryIndexingInfoSchema)` to create a new message.
 */
export declare const RepositoryIndexingInfoSchema: GenMessage<RepositoryIndexingInfo>;
/**
 * @generated from message agent.v1.RequestContextArgs
 */
export type RequestContextArgs = Message<"agent.v1.RequestContextArgs"> & {
    /**
     * @generated from field: optional string notes_session_id = 2;
     */
    notesSessionId?: string | undefined;
    /**
     * @generated from field: optional string workspace_id = 3;
     */
    workspaceId?: string | undefined;
    /**
     * @generated from field: optional string read_only_pinned_tree_sha = 4;
     */
    readOnlyPinnedTreeSha?: string | undefined;
    /**
     * @generated from field: optional string read_only_plugin_cache_root = 5;
     */
    readOnlyPluginCacheRoot?: string | undefined;
    /**
     * @generated from field: optional bool use_cached = 7;
     */
    useCached?: boolean | undefined;
};
/**
 * Describes the message agent.v1.RequestContextArgs.
 * Use `create(RequestContextArgsSchema)` to create a new message.
 */
export declare const RequestContextArgsSchema: GenMessage<RequestContextArgs>;
/**
 * @generated from message agent.v1.RequestContextResult
 */
export type RequestContextResult = Message<"agent.v1.RequestContextResult"> & {
    /**
     * @generated from oneof agent.v1.RequestContextResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.RequestContextSuccess success = 1;
         */
        value: RequestContextSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.RequestContextError error = 2;
         */
        value: RequestContextError;
        case: "error";
    } | {
        /**
         * @generated from field: agent.v1.RequestContextRejected rejected = 3;
         */
        value: RequestContextRejected;
        case: "rejected";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.RequestContextResult.
 * Use `create(RequestContextResultSchema)` to create a new message.
 */
export declare const RequestContextResultSchema: GenMessage<RequestContextResult>;
/**
 * @generated from message agent.v1.RequestContextSuccess
 */
export type RequestContextSuccess = Message<"agent.v1.RequestContextSuccess"> & {
    /**
     * @generated from field: agent.v1.RequestContext request_context = 1;
     */
    requestContext?: RequestContext | undefined;
    /**
     * @generated from field: optional bool served_from_disk_cache = 2;
     */
    servedFromDiskCache?: boolean | undefined;
};
/**
 * Describes the message agent.v1.RequestContextSuccess.
 * Use `create(RequestContextSuccessSchema)` to create a new message.
 */
export declare const RequestContextSuccessSchema: GenMessage<RequestContextSuccess>;
/**
 * @generated from message agent.v1.RequestContextError
 */
export type RequestContextError = Message<"agent.v1.RequestContextError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.RequestContextError.
 * Use `create(RequestContextErrorSchema)` to create a new message.
 */
export declare const RequestContextErrorSchema: GenMessage<RequestContextError>;
/**
 * @generated from message agent.v1.RequestContextRejected
 */
export type RequestContextRejected = Message<"agent.v1.RequestContextRejected"> & {
    /**
     * @generated from field: string reason = 1;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.RequestContextRejected.
 * Use `create(RequestContextRejectedSchema)` to create a new message.
 */
export declare const RequestContextRejectedSchema: GenMessage<RequestContextRejected>;
/**
 * same as SelectedImage, but with the data field is the full image data
 *
 * @generated from message agent.v1.ImageProto
 */
export type ImageProto = Message<"agent.v1.ImageProto"> & {
    /**
     * @generated from field: bytes data = 1;
     */
    data: Uint8Array;
    /**
     * @generated from field: string uuid = 2;
     */
    uuid: string;
    /**
     * @generated from field: string path = 3;
     */
    path: string;
    /**
     * @generated from field: agent.v1.ImageProto_Dimension dimension = 4;
     */
    dimension?: ImageProto_Dimension | undefined;
    /**
     * @generated from field: optional string task_specific_description = 6;
     */
    taskSpecificDescription?: string | undefined;
    /**
     * @generated from field: string mime_type = 7;
     */
    mimeType: string;
};
/**
 * Describes the message agent.v1.ImageProto.
 * Use `create(ImageProtoSchema)` to create a new message.
 */
export declare const ImageProtoSchema: GenMessage<ImageProto>;
/**
 * @generated from message agent.v1.ImageProto_Dimension
 */
export type ImageProto_Dimension = Message<"agent.v1.ImageProto_Dimension"> & {
    /**
     * @generated from field: int32 width = 1;
     */
    width: number;
    /**
     * @generated from field: int32 height = 2;
     */
    height: number;
};
/**
 * Describes the message agent.v1.ImageProto_Dimension.
 * Use `create(ImageProto_DimensionSchema)` to create a new message.
 */
export declare const ImageProto_DimensionSchema: GenMessage<ImageProto_Dimension>;
/**
 * Git repository information for a workspace
 *
 * @generated from message agent.v1.GitRepoInfo
 */
export type GitRepoInfo = Message<"agent.v1.GitRepoInfo"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string status = 2;
     */
    status: string;
    /**
     * @generated from field: string branch_name = 3;
     */
    branchName: string;
    /**
     * @generated from field: optional string remote_url = 4;
     */
    remoteUrl?: string | undefined;
};
/**
 * Describes the message agent.v1.GitRepoInfo.
 * Use `create(GitRepoInfoSchema)` to create a new message.
 */
export declare const GitRepoInfoSchema: GenMessage<GitRepoInfo>;
/**
 * Environment details for system prompt/context
 *
 * @generated from message agent.v1.RequestContextEnv
 */
export type RequestContextEnv = Message<"agent.v1.RequestContextEnv"> & {
    /**
     * @generated from field: string os_version = 1;
     */
    osVersion: string;
    /**
     * @generated from field: repeated string workspace_paths = 2;
     */
    workspacePaths: string[];
    /**
     * @generated from field: string shell = 3;
     */
    shell: string;
    /**
     * @generated from field: bool sandbox_enabled = 5;
     */
    sandboxEnabled: boolean;
    /**
     * @generated from field: string terminals_folder = 7;
     */
    terminalsFolder: string;
    /**
     * @generated from field: string agent_shared_notes_folder = 8;
     */
    agentSharedNotesFolder: string;
    /**
     * @generated from field: string agent_conversation_notes_folder = 9;
     */
    agentConversationNotesFolder: string;
    /**
     * @generated from field: string time_zone = 10;
     */
    timeZone: string;
    /**
     * Project-specific folder for storing artifacts, computed client-side as ~/.cursor/projects/{slug}/
     *
     * @generated from field: string project_folder = 11;
     */
    projectFolder: string;
    /**
     * Folder where agent conversation transcripts are stored
     *
     * @generated from field: string agent_transcripts_folder = 12;
     */
    agentTranscriptsFolder: string;
};
/**
 * Describes the message agent.v1.RequestContextEnv.
 * Use `create(RequestContextEnvSchema)` to create a new message.
 */
export declare const RequestContextEnvSchema: GenMessage<RequestContextEnv>;
/**
 * @generated from message agent.v1.DebugModeConfig
 */
export type DebugModeConfig = Message<"agent.v1.DebugModeConfig"> & {
    /**
     * @generated from field: string log_path = 1;
     */
    logPath: string;
    /**
     * @generated from field: string server_endpoint = 2;
     */
    serverEndpoint: string;
};
/**
 * Describes the message agent.v1.DebugModeConfig.
 * Use `create(DebugModeConfigSchema)` to create a new message.
 */
export declare const DebugModeConfigSchema: GenMessage<DebugModeConfig>;
/**
 * @generated from message agent.v1.SkillDescriptor
 */
export type SkillDescriptor = Message<"agent.v1.SkillDescriptor"> & {
    /**
     * @generated from field: string name = 1;
     */
    name: string;
    /**
     * @generated from field: string description = 2;
     */
    description: string;
    /**
     * @generated from field: string folder_path = 3;
     */
    folderPath: string;
    /**
     * @generated from field: bool enabled = 4;
     */
    enabled: boolean;
    /**
     * @generated from field: optional string parse_error = 5;
     */
    parseError?: string | undefined;
    /**
     * @generated from field: string readme_file_path = 6;
     */
    readmeFilePath: string;
    /**
     * @generated from field: int32 package_type = 7;
     */
    packageType: number;
};
/**
 * Describes the message agent.v1.SkillDescriptor.
 * Use `create(SkillDescriptorSchema)` to create a new message.
 */
export declare const SkillDescriptorSchema: GenMessage<SkillDescriptor>;
/**
 * @generated from message agent.v1.SkillOptions
 */
export type SkillOptions = Message<"agent.v1.SkillOptions"> & {
    /**
     * @generated from field: repeated agent.v1.SkillDescriptor skill_descriptors = 1;
     */
    skillDescriptors: SkillDescriptor[];
};
/**
 * Describes the message agent.v1.SkillOptions.
 * Use `create(SkillOptionsSchema)` to create a new message.
 */
export declare const SkillOptionsSchema: GenMessage<SkillOptions>;
/**
 * @generated from message agent.v1.RequestContext
 */
export type RequestContext = Message<"agent.v1.RequestContext"> & {
    /**
     * All rules, categorized by the embedded type
     *
     * @generated from field: repeated agent.v1.CursorRule rules = 2;
     */
    rules: CursorRule[];
    /**
     * @generated from field: agent.v1.RequestContextEnv env = 4;
     */
    env?: RequestContextEnv | undefined;
    /**
     * @generated from field: repeated agent.v1.RepositoryIndexingInfo repository_info = 6;
     */
    repositoryInfo: RepositoryIndexingInfo[];
    /**
     * @generated from field: repeated agent.v1.McpToolDefinition tools = 7;
     */
    tools: McpToolDefinition[];
    /**
     * @generated from field: optional string conversation_notes_listing = 8;
     */
    conversationNotesListing?: string | undefined;
    /**
     * @generated from field: optional string shared_notes_listing = 9;
     */
    sharedNotesListing?: string | undefined;
    /**
     * @generated from field: repeated agent.v1.GitRepoInfo git_repos = 11;
     */
    gitRepos: GitRepoInfo[];
    /**
     * @generated from field: repeated agent.v1.LsDirectoryTreeNode project_layouts = 13;
     */
    projectLayouts: LsDirectoryTreeNode[];
    /**
     * @generated from field: repeated agent.v1.McpInstructions mcp_instructions = 14;
     */
    mcpInstructions: McpInstructions[];
    /**
     * @generated from field: optional agent.v1.DebugModeConfig debug_mode_config = 15;
     */
    debugModeConfig?: DebugModeConfig | undefined;
    /**
     * @generated from field: optional string cloud_rule = 16;
     */
    cloudRule?: string | undefined;
    /**
     * @generated from field: optional bool web_search_enabled = 17;
     */
    webSearchEnabled?: boolean | undefined;
    /**
     * @generated from field: optional agent.v1.SkillOptions skill_options = 18;
     */
    skillOptions?: SkillOptions | undefined;
    /**
     * @generated from field: optional bool repository_info_should_query_prod = 19;
     */
    repositoryInfoShouldQueryProd?: boolean | undefined;
    /**
     * @generated from field: map<string, string> file_contents = 20;
     */
    fileContents: {
        [key: string]: string;
    };
    /**
     * Content of the user-intent/index.md file summarizing past conversations
     *
     * @generated from field: optional string user_intent_summary = 21;
     */
    userIntentSummary?: string | undefined;
    /**
     * Local custom subagent definitions loaded from workspace configuration
     *
     * @generated from field: repeated agent.v1.CustomSubagent custom_subagents = 22;
     */
    customSubagents: CustomSubagent[];
    /**
     * MCP file system options for agent MCP tool descriptor access
     *
     * @generated from field: optional agent.v1.McpFileSystemOptions mcp_file_system_options = 23;
     */
    mcpFileSystemOptions?: McpFileSystemOptions | undefined;
};
/**
 * Describes the message agent.v1.RequestContext.
 * Use `create(RequestContextSchema)` to create a new message.
 */
export declare const RequestContextSchema: GenMessage<RequestContext>;
/**
 * @generated from message agent.v1.SandboxPolicy
 */
export type SandboxPolicy = Message<"agent.v1.SandboxPolicy"> & {
    /**
     * @generated from field: int32 type = 1;
     */
    type: number;
    /**
     * @generated from field: optional bool network_access = 2;
     */
    networkAccess?: boolean | undefined;
    /**
     * @generated from field: repeated string additional_readwrite_paths = 3;
     */
    additionalReadwritePaths: string[];
    /**
     * @generated from field: repeated string additional_readonly_paths = 4;
     */
    additionalReadonlyPaths: string[];
    /**
     * @generated from field: optional string debug_output_dir = 5;
     */
    debugOutputDir?: string | undefined;
    /**
     * @generated from field: optional bool block_git_writes = 6;
     */
    blockGitWrites?: boolean | undefined;
    /**
     * If true, excludes default tmp paths (/tmp/, /private/tmp/, /var/folders/) from the sandbox writable paths. Useful for testing readonly behavior.
     *
     * @generated from field: optional bool disable_tmp_write = 7;
     */
    disableTmpWrite?: boolean | undefined;
};
/**
 * Describes the message agent.v1.SandboxPolicy.
 * Use `create(SandboxPolicySchema)` to create a new message.
 */
export declare const SandboxPolicySchema: GenMessage<SandboxPolicy>;
/**
 * @generated from message agent.v1.SelectedImage
 */
export type SelectedImage = Message<"agent.v1.SelectedImage"> & {
    /**
     * @generated from field: string uuid = 2;
     */
    uuid: string;
    /**
     * @generated from field: string path = 3;
     */
    path: string;
    /**
     * @generated from field: agent.v1.SelectedImage_Dimension dimension = 4;
     */
    dimension?: SelectedImage_Dimension | undefined;
    /**
     * @generated from field: string mime_type = 7;
     */
    mimeType: string;
    /**
     * @generated from oneof agent.v1.SelectedImage.data_or_blob_id
     */
    dataOrBlobId: {
        /**
         * @generated from field: bytes blob_id = 1;
         */
        value: Uint8Array;
        case: "blobId";
    } | {
        /**
         * @generated from field: bytes data = 8;
         */
        value: Uint8Array;
        case: "data";
    } | {
        /**
         * @generated from field: agent.v1.SelectedImage_BlobIdWithData blob_id_with_data = 9;
         */
        value: SelectedImage_BlobIdWithData;
        case: "blobIdWithData";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.SelectedImage.
 * Use `create(SelectedImageSchema)` to create a new message.
 */
export declare const SelectedImageSchema: GenMessage<SelectedImage>;
/**
 * Contains both blob_id and data together, for when the client has both and wants to populate the server-side cache without re-uploading
 *
 * @generated from message agent.v1.SelectedImage_BlobIdWithData
 */
export type SelectedImage_BlobIdWithData = Message<"agent.v1.SelectedImage_BlobIdWithData"> & {
    /**
     * @generated from field: bytes blob_id = 1;
     */
    blobId: Uint8Array;
    /**
     * @generated from field: bytes data = 2;
     */
    data: Uint8Array;
};
/**
 * Describes the message agent.v1.SelectedImage_BlobIdWithData.
 * Use `create(SelectedImage_BlobIdWithDataSchema)` to create a new message.
 */
export declare const SelectedImage_BlobIdWithDataSchema: GenMessage<SelectedImage_BlobIdWithData>;
/**
 * @generated from message agent.v1.SelectedImage_Dimension
 */
export type SelectedImage_Dimension = Message<"agent.v1.SelectedImage_Dimension"> & {
    /**
     * @generated from field: int32 width = 1;
     */
    width: number;
    /**
     * @generated from field: int32 height = 2;
     */
    height: number;
};
/**
 * Describes the message agent.v1.SelectedImage_Dimension.
 * Use `create(SelectedImage_DimensionSchema)` to create a new message.
 */
export declare const SelectedImage_DimensionSchema: GenMessage<SelectedImage_Dimension>;
/**
 * Extra context entry that can be stored inline or as a blob reference
 *
 * @generated from message agent.v1.ExtraContextEntry
 */
export type ExtraContextEntry = Message<"agent.v1.ExtraContextEntry"> & {
    /**
     * @generated from oneof agent.v1.ExtraContextEntry.data_or_blob_id
     */
    dataOrBlobId: {
        /**
         * @generated from field: string data = 1;
         */
        value: string;
        case: "data";
    } | {
        /**
         * @generated from field: bytes blob_id = 2;
         */
        value: Uint8Array;
        case: "blobId";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ExtraContextEntry.
 * Use `create(ExtraContextEntrySchema)` to create a new message.
 */
export declare const ExtraContextEntrySchema: GenMessage<ExtraContextEntry>;
/**
 * A selected file from the UI
 *
 * @generated from message agent.v1.SelectedFile
 */
export type SelectedFile = Message<"agent.v1.SelectedFile"> & {
    /**
     * @generated from field: string content = 1;
     */
    content: string;
    /**
     * This is the full path
     *
     * @generated from field: string path = 2;
     */
    path: string;
    /**
     * @generated from field: optional string relative_path = 3;
     */
    relativePath?: string | undefined;
};
/**
 * Describes the message agent.v1.SelectedFile.
 * Use `create(SelectedFileSchema)` to create a new message.
 */
export declare const SelectedFileSchema: GenMessage<SelectedFile>;
/**
 * A selected code selection from the UI
 *
 * @generated from message agent.v1.SelectedCodeSelection
 */
export type SelectedCodeSelection = Message<"agent.v1.SelectedCodeSelection"> & {
    /**
     * @generated from field: string content = 1;
     */
    content: string;
    /**
     * This is the full path
     *
     * @generated from field: string path = 2;
     */
    path: string;
    /**
     * @generated from field: optional string relative_path = 3;
     */
    relativePath?: string | undefined;
    /**
     * @generated from field: agent.v1.Range range = 4;
     */
    range?: Range | undefined;
};
/**
 * Describes the message agent.v1.SelectedCodeSelection.
 * Use `create(SelectedCodeSelectionSchema)` to create a new message.
 */
export declare const SelectedCodeSelectionSchema: GenMessage<SelectedCodeSelection>;
/**
 * A selected terminal from the UI
 *
 * @generated from message agent.v1.SelectedTerminal
 */
export type SelectedTerminal = Message<"agent.v1.SelectedTerminal"> & {
    /**
     * @generated from field: string content = 1;
     */
    content: string;
    /**
     * @generated from field: optional string title = 2;
     */
    title?: string | undefined;
    /**
     * @generated from field: optional string path = 3;
     */
    path?: string | undefined;
};
/**
 * Describes the message agent.v1.SelectedTerminal.
 * Use `create(SelectedTerminalSchema)` to create a new message.
 */
export declare const SelectedTerminalSchema: GenMessage<SelectedTerminal>;
/**
 * A selected terminal selection from the UI
 *
 * @generated from message agent.v1.SelectedTerminalSelection
 */
export type SelectedTerminalSelection = Message<"agent.v1.SelectedTerminalSelection"> & {
    /**
     * @generated from field: string content = 1;
     */
    content: string;
    /**
     * @generated from field: optional string title = 2;
     */
    title?: string | undefined;
    /**
     * @generated from field: optional string path = 3;
     */
    path?: string | undefined;
    /**
     * @generated from field: agent.v1.Range range = 4;
     */
    range?: Range | undefined;
};
/**
 * Describes the message agent.v1.SelectedTerminalSelection.
 * Use `create(SelectedTerminalSelectionSchema)` to create a new message.
 */
export declare const SelectedTerminalSelectionSchema: GenMessage<SelectedTerminalSelection>;
/**
 * A selected folder from the UI
 *
 * @generated from message agent.v1.SelectedFolder
 */
export type SelectedFolder = Message<"agent.v1.SelectedFolder"> & {
    /**
     * This is the full path
     *
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: optional string relative_path = 2;
     */
    relativePath?: string | undefined;
    /**
     * @generated from field: agent.v1.LsDirectoryTreeNode directory_tree = 3;
     */
    directoryTree?: LsDirectoryTreeNode | undefined;
};
/**
 * Describes the message agent.v1.SelectedFolder.
 * Use `create(SelectedFolderSchema)` to create a new message.
 */
export declare const SelectedFolderSchema: GenMessage<SelectedFolder>;
/**
 * An external link manually attached by the user
 *
 * @generated from message agent.v1.SelectedExternalLink
 */
export type SelectedExternalLink = Message<"agent.v1.SelectedExternalLink"> & {
    /**
     * @generated from field: string url = 1;
     */
    url: string;
    /**
     * @generated from field: string uuid = 2;
     */
    uuid: string;
    /**
     * For local PDF files Base64-encoded PDF content
     *
     * @generated from field: optional string pdf_content = 3;
     */
    pdfContent?: string | undefined;
    /**
     * @generated from field: optional bool is_pdf = 4;
     */
    isPdf?: boolean | undefined;
    /**
     * @generated from field: optional string filename = 5;
     */
    filename?: string | undefined;
};
/**
 * Describes the message agent.v1.SelectedExternalLink.
 * Use `create(SelectedExternalLinkSchema)` to create a new message.
 */
export declare const SelectedExternalLinkSchema: GenMessage<SelectedExternalLink>;
/**
 * A cursor rule manually attached by the user
 *
 * @generated from message agent.v1.SelectedCursorRule
 */
export type SelectedCursorRule = Message<"agent.v1.SelectedCursorRule"> & {
    /**
     * @generated from field: agent.v1.CursorRule rule = 1;
     */
    rule?: CursorRule | undefined;
};
/**
 * Describes the message agent.v1.SelectedCursorRule.
 * Use `create(SelectedCursorRuleSchema)` to create a new message.
 */
export declare const SelectedCursorRuleSchema: GenMessage<SelectedCursorRule>;
/**
 * Git diff (uncommitted changes in working tree)
 *
 * @generated from message agent.v1.SelectedGitDiff
 */
export type SelectedGitDiff = Message<"agent.v1.SelectedGitDiff"> & {
    /**
     * Raw git diff output
     *
     * @generated from field: string content = 1;
     */
    content: string;
};
/**
 * Describes the message agent.v1.SelectedGitDiff.
 * Use `create(SelectedGitDiffSchema)` to create a new message.
 */
export declare const SelectedGitDiffSchema: GenMessage<SelectedGitDiff>;
/**
 * Git diff from branch to main
 *
 * @generated from message agent.v1.SelectedGitDiffFromBranchToMain
 */
export type SelectedGitDiffFromBranchToMain = Message<"agent.v1.SelectedGitDiffFromBranchToMain"> & {
    /**
     * Raw git diff output
     *
     * @generated from field: string content = 1;
     */
    content: string;
};
/**
 * Describes the message agent.v1.SelectedGitDiffFromBranchToMain.
 * Use `create(SelectedGitDiffFromBranchToMainSchema)` to create a new message.
 */
export declare const SelectedGitDiffFromBranchToMainSchema: GenMessage<SelectedGitDiffFromBranchToMain>;
/**
 * A git commit manually attached by the user
 *
 * @generated from message agent.v1.SelectedGitCommit
 */
export type SelectedGitCommit = Message<"agent.v1.SelectedGitCommit"> & {
    /**
     * @generated from field: string sha = 1;
     */
    sha: string;
    /**
     * @generated from field: string message = 2;
     */
    message: string;
    /**
     * @generated from field: optional string description = 3;
     */
    description?: string | undefined;
    /**
     * Raw git diff output for this commit
     *
     * @generated from field: string diff = 4;
     */
    diff: string;
};
/**
 * Describes the message agent.v1.SelectedGitCommit.
 * Use `create(SelectedGitCommitSchema)` to create a new message.
 */
export declare const SelectedGitCommitSchema: GenMessage<SelectedGitCommit>;
/**
 * A pull request manually attached by the user via @mention Uses the same folder structure as ViewedPullRequest for consistency
 *
 * @generated from message agent.v1.SelectedPullRequest
 */
export type SelectedPullRequest = Message<"agent.v1.SelectedPullRequest"> & {
    /**
     * @generated from field: int32 number = 1;
     */
    number: number;
    /**
     * @generated from field: string url = 2;
     */
    url: string;
    /**
     * @generated from field: optional string title = 3;
     */
    title?: string | undefined;
    /**
     * Path to the folder containing PR details (diffs, metadata, etc.)
     *
     * @generated from field: string folder_path = 4;
     */
    folderPath: string;
    /**
     * Summary JSON containing file list and diff sizes (contents of summary.json)
     *
     * @generated from field: optional string summary_json = 5;
     */
    summaryJson?: string | undefined;
    /**
     * PR description/body
     *
     * @generated from field: optional string description = 6;
     */
    description?: string | undefined;
    /**
     * If set, other fields are empty and data should be fetched from the blob
     *
     * @generated from field: optional bytes blob_id = 7;
     */
    blobId?: Uint8Array | undefined;
};
/**
 * Describes the message agent.v1.SelectedPullRequest.
 * Use `create(SelectedPullRequestSchema)` to create a new message.
 */
export declare const SelectedPullRequestSchema: GenMessage<SelectedPullRequest>;
/**
 * A selection from a pull request diff (for files that may not exist on disk)
 *
 * @generated from message agent.v1.SelectedGitPRDiffSelection
 */
export type SelectedGitPRDiffSelection = Message<"agent.v1.SelectedGitPRDiffSelection"> & {
    /**
     * Full URL to the pull request
     *
     * @generated from field: string pr_url = 1;
     */
    prUrl: string;
    /**
     * Path to the file within the PR
     *
     * @generated from field: string file_path = 2;
     */
    filePath: string;
    /**
     * Start line in the diff
     *
     * @generated from field: int32 start_line = 3;
     */
    startLine: number;
    /**
     * End line in the diff
     *
     * @generated from field: int32 end_line = 4;
     */
    endLine: number;
    /**
     * The diff content for this file (or selection)
     *
     * @generated from field: optional string diff_content = 5;
     */
    diffContent?: string | undefined;
    /**
     * If set, other fields are empty and data should be fetched from the blob
     *
     * @generated from field: optional bytes blob_id = 6;
     */
    blobId?: Uint8Array | undefined;
};
/**
 * Describes the message agent.v1.SelectedGitPRDiffSelection.
 * Use `create(SelectedGitPRDiffSelectionSchema)` to create a new message.
 */
export declare const SelectedGitPRDiffSelectionSchema: GenMessage<SelectedGitPRDiffSelection>;
/**
 * A cursor command manually attached by the user
 *
 * @generated from message agent.v1.SelectedCursorCommand
 */
export type SelectedCursorCommand = Message<"agent.v1.SelectedCursorCommand"> & {
    /**
     * @generated from field: string name = 1;
     */
    name: string;
    /**
     * @generated from field: string content = 2;
     */
    content: string;
};
/**
 * Describes the message agent.v1.SelectedCursorCommand.
 * Use `create(SelectedCursorCommandSchema)` to create a new message.
 */
export declare const SelectedCursorCommandSchema: GenMessage<SelectedCursorCommand>;
/**
 * A documentation manually attached by the user
 *
 * @generated from message agent.v1.SelectedDocumentation
 */
export type SelectedDocumentation = Message<"agent.v1.SelectedDocumentation"> & {
    /**
     * @generated from field: string doc_id = 1;
     */
    docId: string;
    /**
     * @generated from field: string name = 2;
     */
    name: string;
};
/**
 * Describes the message agent.v1.SelectedDocumentation.
 * Use `create(SelectedDocumentationSchema)` to create a new message.
 */
export declare const SelectedDocumentationSchema: GenMessage<SelectedDocumentation>;
/**
 * A past chat manually attached by the user (transcript file)
 *
 * @generated from message agent.v1.SelectedPastChat
 */
export type SelectedPastChat = Message<"agent.v1.SelectedPastChat"> & {
    /**
     * @generated from field: string agent_id = 1;
     */
    agentId: string;
    /**
     * @generated from field: string name = 2;
     */
    name: string;
};
/**
 * Describes the message agent.v1.SelectedPastChat.
 * Use `create(SelectedPastChatSchema)` to create a new message.
 */
export declare const SelectedPastChatSchema: GenMessage<SelectedPastChat>;
/**
 * A call frame from a stack trace
 *
 * @generated from message agent.v1.CallFrame
 */
export type CallFrame = Message<"agent.v1.CallFrame"> & {
    /**
     * @generated from field: optional string function_name = 1;
     */
    functionName?: string | undefined;
    /**
     * @generated from field: optional string url = 2;
     */
    url?: string | undefined;
    /**
     * @generated from field: optional int32 line_number = 3;
     */
    lineNumber?: number | undefined;
    /**
     * @generated from field: optional int32 column_number = 4;
     */
    columnNumber?: number | undefined;
};
/**
 * Describes the message agent.v1.CallFrame.
 * Use `create(CallFrameSchema)` to create a new message.
 */
export declare const CallFrameSchema: GenMessage<CallFrame>;
/**
 * A stack trace
 *
 * @generated from message agent.v1.StackTrace
 */
export type StackTrace = Message<"agent.v1.StackTrace"> & {
    /**
     * @generated from field: repeated agent.v1.CallFrame call_frames = 1;
     */
    callFrames: CallFrame[];
    /**
     * @generated from field: optional string raw_stack_trace = 2;
     */
    rawStackTrace?: string | undefined;
};
/**
 * Describes the message agent.v1.StackTrace.
 * Use `create(StackTraceSchema)` to create a new message.
 */
export declare const StackTraceSchema: GenMessage<StackTrace>;
/**
 * A console log entry from the runtime
 *
 * @generated from message agent.v1.SelectedConsoleLog
 */
export type SelectedConsoleLog = Message<"agent.v1.SelectedConsoleLog"> & {
    /**
     * @generated from field: string message = 1;
     */
    message: string;
    /**
     * * Unix timestamp in milliseconds when this log entry was created
     *
     * @generated from field: double timestamp = 2;
     */
    timestamp: number;
    /**
     * @generated from field: string level = 3;
     */
    level: string;
    /**
     * @generated from field: string client_name = 4;
     */
    clientName: string;
    /**
     * @generated from field: string session_id = 5;
     */
    sessionId: string;
    /**
     * @generated from field: optional agent.v1.StackTrace stack_trace = 6;
     */
    stackTrace?: StackTrace | undefined;
    /**
     * @generated from field: optional string object_data_json = 7;
     */
    objectDataJson?: string | undefined;
};
/**
 * Describes the message agent.v1.SelectedConsoleLog.
 * Use `create(SelectedConsoleLogSchema)` to create a new message.
 */
export declare const SelectedConsoleLogSchema: GenMessage<SelectedConsoleLog>;
/**
 * A UI element picked by the user from the runtime
 *
 * @generated from message agent.v1.SelectedUIElement
 */
export type SelectedUIElement = Message<"agent.v1.SelectedUIElement"> & {
    /**
     * @generated from field: string element = 1;
     */
    element: string;
    /**
     * @generated from field: string xpath = 2;
     */
    xpath: string;
    /**
     * @generated from field: string text_content = 3;
     */
    textContent: string;
    /**
     * @generated from field: string extra = 4;
     */
    extra: string;
    /**
     * @generated from field: optional string component = 5;
     */
    component?: string | undefined;
    /**
     * @generated from field: optional string component_props_json = 6;
     */
    componentPropsJson?: string | undefined;
};
/**
 * Describes the message agent.v1.SelectedUIElement.
 * Use `create(SelectedUIElementSchema)` to create a new message.
 */
export declare const SelectedUIElementSchema: GenMessage<SelectedUIElement>;
/**
 * A subagent selected by the user from the slash menu
 *
 * @generated from message agent.v1.SelectedSubagent
 */
export type SelectedSubagent = Message<"agent.v1.SelectedSubagent"> & {
    /**
     * @generated from field: string name = 1;
     */
    name: string;
};
/**
 * Describes the message agent.v1.SelectedSubagent.
 * Use `create(SelectedSubagentSchema)` to create a new message.
 */
export declare const SelectedSubagentSchema: GenMessage<SelectedSubagent>;
/**
 * Container for selected context from the UI
 *
 * @generated from message agent.v1.SelectedContext
 */
export type SelectedContext = Message<"agent.v1.SelectedContext"> & {
    /**
     * @generated from field: repeated agent.v1.SelectedImage selected_images = 1;
     */
    selectedImages: SelectedImage[];
    /**
     * @generated from field: optional agent.v1.InvocationContext invocation_context = 2;
     */
    invocationContext?: InvocationContext | undefined;
    /**
     * Temporary hack for IDE-based context (@filename, @Diff, etc.) in background agents only. TODO: remove once proper IDE context format is implemented.
     *
     * @generated from field: repeated string extra_context = 3;
     */
    extraContext: string[];
    /**
     * @generated from field: repeated agent.v1.ExtraContextEntry extra_context_entries = 16;
     */
    extraContextEntries: ExtraContextEntry[];
    /**
     * New context types
     *
     * @generated from field: repeated agent.v1.SelectedFile files = 4;
     */
    files: SelectedFile[];
    /**
     * @generated from field: repeated agent.v1.SelectedCodeSelection code_selections = 5;
     */
    codeSelections: SelectedCodeSelection[];
    /**
     * @generated from field: repeated agent.v1.SelectedTerminal terminals = 6;
     */
    terminals: SelectedTerminal[];
    /**
     * @generated from field: repeated agent.v1.SelectedTerminalSelection terminal_selections = 7;
     */
    terminalSelections: SelectedTerminalSelection[];
    /**
     * @generated from field: repeated agent.v1.SelectedFolder folders = 8;
     */
    folders: SelectedFolder[];
    /**
     * @generated from field: repeated agent.v1.SelectedExternalLink external_links = 9;
     */
    externalLinks: SelectedExternalLink[];
    /**
     * @generated from field: repeated agent.v1.SelectedCursorRule cursor_rules = 10;
     */
    cursorRules: SelectedCursorRule[];
    /**
     * @generated from field: optional agent.v1.SelectedGitDiff git_diff = 18;
     */
    gitDiff?: SelectedGitDiff | undefined;
    /**
     * @generated from field: optional agent.v1.SelectedGitDiffFromBranchToMain git_diff_from_branch_to_main = 11;
     */
    gitDiffFromBranchToMain?: SelectedGitDiffFromBranchToMain | undefined;
    /**
     * @generated from field: repeated agent.v1.SelectedCursorCommand cursor_commands = 12;
     */
    cursorCommands: SelectedCursorCommand[];
    /**
     * @generated from field: repeated agent.v1.SelectedDocumentation documentations = 13;
     */
    documentations: SelectedDocumentation[];
    /**
     * @generated from field: repeated agent.v1.SelectedUIElement ui_elements = 14;
     */
    uiElements: SelectedUIElement[];
    /**
     * @generated from field: repeated agent.v1.SelectedConsoleLog console_logs = 15;
     */
    consoleLogs: SelectedConsoleLog[];
    /**
     * @generated from field: repeated agent.v1.SelectedGitCommit git_commits = 17;
     */
    gitCommits: SelectedGitCommit[];
    /**
     * @generated from field: repeated agent.v1.SelectedPastChat past_chats = 19;
     */
    pastChats: SelectedPastChat[];
    /**
     * @generated from field: repeated agent.v1.SelectedGitPRDiffSelection git_pr_diff_selections = 20;
     */
    gitPrDiffSelections: SelectedGitPRDiffSelection[];
    /**
     * @generated from field: repeated agent.v1.SelectedPullRequest selected_pull_requests = 21;
     */
    selectedPullRequests: SelectedPullRequest[];
    /**
     * @generated from field: repeated agent.v1.SelectedSubagent selected_subagents = 22;
     */
    selectedSubagents: SelectedSubagent[];
};
/**
 * Describes the message agent.v1.SelectedContext.
 * Use `create(SelectedContextSchema)` to create a new message.
 */
export declare const SelectedContextSchema: GenMessage<SelectedContext>;
/**
 * InvocationContext represents the context from the external app/integration that triggered this agent request.
 *
 * @generated from message agent.v1.InvocationContext
 */
export type InvocationContext = Message<"agent.v1.InvocationContext"> & {
    /**
     * @generated from oneof agent.v1.InvocationContext.data
     */
    data: {
        /**
         * @generated from field: agent.v1.InvocationContext_SlackThread slack_thread = 1;
         */
        value: InvocationContext_SlackThread;
        case: "slackThread";
    } | {
        /**
         * @generated from field: agent.v1.InvocationContext_GithubPR github_pr = 2;
         */
        value: InvocationContext_GithubPR;
        case: "githubPr";
    } | {
        /**
         * @generated from field: agent.v1.InvocationContext_IdeState ide_state = 3;
         */
        value: InvocationContext_IdeState;
        case: "ideState";
    } | {
        /**
         * @generated from field: bytes blob_id = 10;
         */
        value: Uint8Array;
        case: "blobId";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.InvocationContext.
 * Use `create(InvocationContextSchema)` to create a new message.
 */
export declare const InvocationContextSchema: GenMessage<InvocationContext>;
/**
 * @generated from message agent.v1.InvocationContext_SlackThread
 */
export type InvocationContext_SlackThread = Message<"agent.v1.InvocationContext_SlackThread"> & {
    /**
     * @generated from field: string thread = 1;
     */
    thread: string;
    /**
     * @generated from field: optional string channel_name = 2;
     */
    channelName?: string | undefined;
    /**
     * @generated from field: optional string channel_purpose = 3;
     */
    channelPurpose?: string | undefined;
    /**
     * @generated from field: optional string channel_topic = 4;
     */
    channelTopic?: string | undefined;
};
/**
 * Describes the message agent.v1.InvocationContext_SlackThread.
 * Use `create(InvocationContext_SlackThreadSchema)` to create a new message.
 */
export declare const InvocationContext_SlackThreadSchema: GenMessage<InvocationContext_SlackThread>;
/**
 * @generated from message agent.v1.InvocationContext_GithubPR
 */
export type InvocationContext_GithubPR = Message<"agent.v1.InvocationContext_GithubPR"> & {
    /**
     * @generated from field: string title = 1;
     */
    title: string;
    /**
     * @generated from field: string description = 2;
     */
    description: string;
    /**
     * @generated from field: string comments = 3;
     */
    comments: string;
    /**
     * @generated from field: optional string ci_failures = 4;
     */
    ciFailures?: string | undefined;
};
/**
 * Describes the message agent.v1.InvocationContext_GithubPR.
 * Use `create(InvocationContext_GithubPRSchema)` to create a new message.
 */
export declare const InvocationContext_GithubPRSchema: GenMessage<InvocationContext_GithubPR>;
/**
 * @generated from message agent.v1.InvocationContext_IdeState
 */
export type InvocationContext_IdeState = Message<"agent.v1.InvocationContext_IdeState"> & {
    /**
     * @generated from field: repeated agent.v1.InvocationContext_IdeState_File visible_files = 1;
     */
    visibleFiles: InvocationContext_IdeState_File[];
    /**
     * @generated from field: repeated agent.v1.InvocationContext_IdeState_File recently_viewed_files = 2;
     */
    recentlyViewedFiles: InvocationContext_IdeState_File[];
    /**
     * PRs currently being viewed in the review editor (if any)
     *
     * @generated from field: repeated agent.v1.InvocationContext_IdeState_ViewedPullRequest currently_viewed_prs = 3;
     */
    currentlyViewedPrs: InvocationContext_IdeState_ViewedPullRequest[];
};
/**
 * Describes the message agent.v1.InvocationContext_IdeState.
 * Use `create(InvocationContext_IdeStateSchema)` to create a new message.
 */
export declare const InvocationContext_IdeStateSchema: GenMessage<InvocationContext_IdeState>;
/**
 * @generated from message agent.v1.InvocationContext_IdeState_File
 */
export type InvocationContext_IdeState_File = Message<"agent.v1.InvocationContext_IdeState_File"> & {
    /**
     * This is the full path
     *
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: optional string relative_path = 2;
     */
    relativePath?: string | undefined;
    /**
     * Present if file is currently focused
     *
     * @generated from field: optional agent.v1.InvocationContext_IdeState_File_CursorPosition cursor_position = 3;
     */
    cursorPosition?: InvocationContext_IdeState_File_CursorPosition | undefined;
    /**
     * @generated from field: int32 total_lines = 4;
     */
    totalLines: number;
    /**
     * Present for terminal files
     *
     * @generated from field: optional string active_command = 5;
     */
    activeCommand?: string | undefined;
};
/**
 * Describes the message agent.v1.InvocationContext_IdeState_File.
 * Use `create(InvocationContext_IdeState_FileSchema)` to create a new message.
 */
export declare const InvocationContext_IdeState_FileSchema: GenMessage<InvocationContext_IdeState_File>;
/**
 * @generated from message agent.v1.InvocationContext_IdeState_File_CursorPosition
 */
export type InvocationContext_IdeState_File_CursorPosition = Message<"agent.v1.InvocationContext_IdeState_File_CursorPosition"> & {
    /**
     * @generated from field: int32 line = 1;
     */
    line: number;
    /**
     * @generated from field: string text = 2;
     */
    text: string;
};
/**
 * Describes the message agent.v1.InvocationContext_IdeState_File_CursorPosition.
 * Use `create(InvocationContext_IdeState_File_CursorPositionSchema)` to create a new message.
 */
export declare const InvocationContext_IdeState_File_CursorPositionSchema: GenMessage<InvocationContext_IdeState_File_CursorPosition>;
/**
 * Information about a PR currently being viewed in a review editor
 *
 * @generated from message agent.v1.InvocationContext_IdeState_ViewedPullRequest
 */
export type InvocationContext_IdeState_ViewedPullRequest = Message<"agent.v1.InvocationContext_IdeState_ViewedPullRequest"> & {
    /**
     * @generated from field: int32 number = 1;
     */
    number: number;
    /**
     * @generated from field: string url = 2;
     */
    url: string;
    /**
     * @generated from field: optional string title = 3;
     */
    title?: string | undefined;
    /**
     * Path to the folder containing PR details (diffs, metadata, etc.)
     *
     * @generated from field: optional string folder_path = 4;
     */
    folderPath?: string | undefined;
    /**
     * Summary JSON containing file list and diff sizes (contents of summary.json)
     *
     * @generated from field: optional string summary_json = 5;
     */
    summaryJson?: string | undefined;
    /**
     * PR description/body
     *
     * @generated from field: optional string description = 6;
     */
    description?: string | undefined;
};
/**
 * Describes the message agent.v1.InvocationContext_IdeState_ViewedPullRequest.
 * Use `create(InvocationContext_IdeState_ViewedPullRequestSchema)` to create a new message.
 */
export declare const InvocationContext_IdeState_ViewedPullRequestSchema: GenMessage<InvocationContext_IdeState_ViewedPullRequest>;
/**
 * @generated from message agent.v1.SetupVmEnvironmentArgs
 */
export type SetupVmEnvironmentArgs = Message<"agent.v1.SetupVmEnvironmentArgs"> & {
    /**
     * Command to install runtime dependencies (e.g., "npm install")
     *
     * @generated from field: string install_command = 2;
     */
    installCommand: string;
    /**
     * @generated from field: string start_command = 3;
     */
    startCommand: string;
};
/**
 * Describes the message agent.v1.SetupVmEnvironmentArgs.
 * Use `create(SetupVmEnvironmentArgsSchema)` to create a new message.
 */
export declare const SetupVmEnvironmentArgsSchema: GenMessage<SetupVmEnvironmentArgs>;
/**
 * Result of VM environment setup operations
 *
 * @generated from message agent.v1.SetupVmEnvironmentResult
 */
export type SetupVmEnvironmentResult = Message<"agent.v1.SetupVmEnvironmentResult"> & {
    /**
     * @generated from oneof agent.v1.SetupVmEnvironmentResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.SetupVmEnvironmentSuccess success = 1;
         */
        value: SetupVmEnvironmentSuccess;
        case: "success";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.SetupVmEnvironmentResult.
 * Use `create(SetupVmEnvironmentResultSchema)` to create a new message.
 */
export declare const SetupVmEnvironmentResultSchema: GenMessage<SetupVmEnvironmentResult>;
/**
 * Successful VM environment setup result
 *
 * @generated from message agent.v1.SetupVmEnvironmentSuccess
 */
export type SetupVmEnvironmentSuccess = Message<"agent.v1.SetupVmEnvironmentSuccess"> & {};
/**
 * Describes the message agent.v1.SetupVmEnvironmentSuccess.
 * Use `create(SetupVmEnvironmentSuccessSchema)` to create a new message.
 */
export declare const SetupVmEnvironmentSuccessSchema: GenMessage<SetupVmEnvironmentSuccess>;
/**
 * Tool call structure for SetupVmEnvironment
 *
 * @generated from message agent.v1.SetupVmEnvironmentToolCall
 */
export type SetupVmEnvironmentToolCall = Message<"agent.v1.SetupVmEnvironmentToolCall"> & {
    /**
     * Arguments for the tool call
     *
     * @generated from field: agent.v1.SetupVmEnvironmentArgs args = 1;
     */
    args?: SetupVmEnvironmentArgs | undefined;
    /**
     * Result of the tool call (populated after execution)
     *
     * @generated from field: agent.v1.SetupVmEnvironmentResult result = 2;
     */
    result?: SetupVmEnvironmentResult | undefined;
};
/**
 * Describes the message agent.v1.SetupVmEnvironmentToolCall.
 * Use `create(SetupVmEnvironmentToolCallSchema)` to create a new message.
 */
export declare const SetupVmEnvironmentToolCallSchema: GenMessage<SetupVmEnvironmentToolCall>;
/**
 * @generated from message agent.v1.ShellCommandParsingResult
 */
export type ShellCommandParsingResult = Message<"agent.v1.ShellCommandParsingResult"> & {
    /**
     * @generated from field: bool parsing_failed = 1;
     */
    parsingFailed: boolean;
    /**
     * @generated from field: repeated agent.v1.ShellCommandParsingResult_ExecutableCommand executable_commands = 2;
     */
    executableCommands: ShellCommandParsingResult_ExecutableCommand[];
    /**
     * @generated from field: bool has_redirects = 3;
     */
    hasRedirects: boolean;
    /**
     * @generated from field: bool has_command_substitution = 4;
     */
    hasCommandSubstitution: boolean;
    /**
     * @generated from field: optional bool all_redirects_are_dev_null = 5;
     */
    allRedirectsAreDevNull?: boolean | undefined;
    /**
     * @generated from field: repeated agent.v1.ShellCommandParsingResult_Redirect redirects = 6;
     */
    redirects: ShellCommandParsingResult_Redirect[];
};
/**
 * Describes the message agent.v1.ShellCommandParsingResult.
 * Use `create(ShellCommandParsingResultSchema)` to create a new message.
 */
export declare const ShellCommandParsingResultSchema: GenMessage<ShellCommandParsingResult>;
/**
 * @generated from message agent.v1.ShellCommandParsingResult_ExecutableCommandArg
 */
export type ShellCommandParsingResult_ExecutableCommandArg = Message<"agent.v1.ShellCommandParsingResult_ExecutableCommandArg"> & {
    /**
     * @generated from field: string type = 1;
     */
    type: string;
    /**
     * @generated from field: string value = 2;
     */
    value: string;
};
/**
 * Describes the message agent.v1.ShellCommandParsingResult_ExecutableCommandArg.
 * Use `create(ShellCommandParsingResult_ExecutableCommandArgSchema)` to create a new message.
 */
export declare const ShellCommandParsingResult_ExecutableCommandArgSchema: GenMessage<ShellCommandParsingResult_ExecutableCommandArg>;
/**
 * @generated from message agent.v1.ShellCommandParsingResult_ExecutableCommand
 */
export type ShellCommandParsingResult_ExecutableCommand = Message<"agent.v1.ShellCommandParsingResult_ExecutableCommand"> & {
    /**
     * @generated from field: string name = 1;
     */
    name: string;
    /**
     * @generated from field: repeated agent.v1.ShellCommandParsingResult_ExecutableCommandArg args = 2;
     */
    args: ShellCommandParsingResult_ExecutableCommandArg[];
    /**
     * @generated from field: string full_text = 3;
     */
    fullText: string;
};
/**
 * Describes the message agent.v1.ShellCommandParsingResult_ExecutableCommand.
 * Use `create(ShellCommandParsingResult_ExecutableCommandSchema)` to create a new message.
 */
export declare const ShellCommandParsingResult_ExecutableCommandSchema: GenMessage<ShellCommandParsingResult_ExecutableCommand>;
/**
 * @generated from message agent.v1.ShellArgs
 */
export type ShellArgs = Message<"agent.v1.ShellArgs"> & {
    /**
     * @generated from field: string command = 1;
     */
    command: string;
    /**
     * @generated from field: string working_directory = 2;
     */
    workingDirectory: string;
    /**
     * @generated from field: int32 timeout = 3;
     */
    timeout: number;
    /**
     * @generated from field: string tool_call_id = 4;
     */
    toolCallId: string;
    /**
     * @generated from field: repeated string simple_commands = 5;
     */
    simpleCommands: string[];
    /**
     * @generated from field: bool has_input_redirect = 6;
     */
    hasInputRedirect: boolean;
    /**
     * @generated from field: bool has_output_redirect = 7;
     */
    hasOutputRedirect: boolean;
    /**
     * Deprecated: use parsing_result instead @deprecated simpleCommands = []; Deprecated: use parsing_result instead @deprecated hasInputRedirect = false; Deprecated: use parsing_result instead @deprecated hasOutputRedirect = false;
     *
     * @generated from field: agent.v1.ShellCommandParsingResult parsing_result = 8;
     */
    parsingResult?: ShellCommandParsingResult | undefined;
    /**
     * @generated from field: optional agent.v1.SandboxPolicy requested_sandbox_policy = 9;
     */
    requestedSandboxPolicy?: SandboxPolicy | undefined;
    /**
     * If output size exceeds this threshold (in bytes), write to file instead of inline. If unset or 0, always use inline output.
     *
     * @generated from field: optional uint64 file_output_threshold_bytes = 10;
     */
    fileOutputThresholdBytes?: bigint | undefined;
    /**
     * @generated from field: bool is_background = 11;
     */
    isBackground: boolean;
    /**
     * @generated from field: bool skip_approval = 12;
     */
    skipApproval: boolean;
    /**
     * @generated from field: int32 timeout_behavior = 13;
     */
    timeoutBehavior: number;
    /**
     * Hard timeout: kill the command after this many ms, even if running in background
     *
     * @generated from field: optional int32 hard_timeout = 14;
     */
    hardTimeout?: number | undefined;
    /**
     * @generated from field: optional string description = 15;
     */
    description?: string | undefined;
    /**
     * @generated from field: optional agent.v1.CommandClassifierResult classifier_result = 16;
     */
    classifierResult?: CommandClassifierResult | undefined;
    /**
     * @generated from field: bool close_stdin = 17;
     */
    closeStdin: boolean;
    /**
     * @generated from field: optional agent.v1.ShellOutputNotificationConfig output_notification = 18;
     */
    outputNotification?: ShellOutputNotificationConfig | undefined;
    /**
     * @generated from field: optional agent.v1.SmartModeApproval smart_mode_approval = 19;
     */
    smartModeApproval?: SmartModeApproval | undefined;
    /**
     * @generated from field: optional agent.v1.ShellHookApprovalRequirement hook_approval_requirement = 20;
     */
    hookApprovalRequirement?: ShellHookApprovalRequirement | undefined;
    /**
     * @generated from field: optional string conversation_id = 21;
     */
    conversationId?: string | undefined;
};
/**
 * Describes the message agent.v1.ShellArgs.
 * Use `create(ShellArgsSchema)` to create a new message.
 */
export declare const ShellArgsSchema: GenMessage<ShellArgs>;
/**
 * @generated from message agent.v1.ShellResult
 */
export type ShellResult = Message<"agent.v1.ShellResult"> & {
    /**
     * @generated from field: optional agent.v1.SandboxPolicy sandbox_policy = 101;
     */
    sandboxPolicy?: SandboxPolicy | undefined;
    /**
     * Rendering is affected by this flag, pass forward from args.
     *
     * @generated from field: optional bool is_background = 102;
     */
    isBackground?: boolean | undefined;
    /**
     * Rendering is affected by this flag, pass forward from args.
     *
     * @generated from field: optional string terminals_folder = 103;
     */
    terminalsFolder?: string | undefined;
    /**
     * Process ID, used for backgrounded shells.
     *
     * @generated from field: optional uint32 pid = 104;
     */
    pid?: number | undefined;
    /**
     * @generated from oneof agent.v1.ShellResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.ShellSuccess success = 1;
         */
        value: ShellSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.ShellFailure failure = 2;
         */
        value: ShellFailure;
        case: "failure";
    } | {
        /**
         * @generated from field: agent.v1.ShellTimeout timeout = 3;
         */
        value: ShellTimeout;
        case: "timeout";
    } | {
        /**
         * @generated from field: agent.v1.ShellRejected rejected = 4;
         */
        value: ShellRejected;
        case: "rejected";
    } | {
        /**
         * @generated from field: agent.v1.ShellSpawnError spawn_error = 5;
         */
        value: ShellSpawnError;
        case: "spawnError";
    } | {
        /**
         * @generated from field: agent.v1.ShellPermissionDenied permission_denied = 7;
         */
        value: ShellPermissionDenied;
        case: "permissionDenied";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ShellResult.
 * Use `create(ShellResultSchema)` to create a new message.
 */
export declare const ShellResultSchema: GenMessage<ShellResult>;
/**
 * @generated from message agent.v1.ShellStreamStdout
 */
export type ShellStreamStdout = Message<"agent.v1.ShellStreamStdout"> & {
    /**
     * @generated from field: string data = 1;
     */
    data: string;
};
/**
 * Describes the message agent.v1.ShellStreamStdout.
 * Use `create(ShellStreamStdoutSchema)` to create a new message.
 */
export declare const ShellStreamStdoutSchema: GenMessage<ShellStreamStdout>;
/**
 * @generated from message agent.v1.ShellStreamStderr
 */
export type ShellStreamStderr = Message<"agent.v1.ShellStreamStderr"> & {
    /**
     * @generated from field: string data = 1;
     */
    data: string;
};
/**
 * Describes the message agent.v1.ShellStreamStderr.
 * Use `create(ShellStreamStderrSchema)` to create a new message.
 */
export declare const ShellStreamStderrSchema: GenMessage<ShellStreamStderr>;
/**
 * @generated from message agent.v1.ShellStreamExit
 */
export type ShellStreamExit = Message<"agent.v1.ShellStreamExit"> & {
    /**
     * @generated from field: uint32 code = 1;
     */
    code: number;
    /**
     * @generated from field: string cwd = 2;
     */
    cwd: string;
    /**
     * @generated from field: optional agent.v1.OutputLocation output_location = 3;
     */
    outputLocation?: OutputLocation | undefined;
    /**
     * @generated from field: bool aborted = 4;
     */
    aborted: boolean;
    /**
     * If aborted is true, this field indicates the reason for the abort
     *
     * @generated from field: optional int32 abort_reason = 5;
     */
    abortReason?: number | undefined;
    /**
     * @generated from field: optional int32 local_execution_time_ms = 6;
     */
    localExecutionTimeMs?: number | undefined;
};
/**
 * Describes the message agent.v1.ShellStreamExit.
 * Use `create(ShellStreamExitSchema)` to create a new message.
 */
export declare const ShellStreamExitSchema: GenMessage<ShellStreamExit>;
/**
 * @generated from message agent.v1.ShellStreamStart
 */
export type ShellStreamStart = Message<"agent.v1.ShellStreamStart"> & {
    /**
     * @generated from field: optional agent.v1.SandboxPolicy sandbox_policy = 1;
     */
    sandboxPolicy?: SandboxPolicy | undefined;
};
/**
 * Describes the message agent.v1.ShellStreamStart.
 * Use `create(ShellStreamStartSchema)` to create a new message.
 */
export declare const ShellStreamStartSchema: GenMessage<ShellStreamStart>;
/**
 * @generated from message agent.v1.ShellStreamBackgrounded
 */
export type ShellStreamBackgrounded = Message<"agent.v1.ShellStreamBackgrounded"> & {
    /**
     * @generated from field: uint32 shell_id = 1;
     */
    shellId: number;
    /**
     * @generated from field: string command = 2;
     */
    command: string;
    /**
     * @generated from field: string working_directory = 3;
     */
    workingDirectory: string;
    /**
     * @generated from field: optional uint32 pid = 4;
     */
    pid?: number | undefined;
    /**
     * The ms_to_wait value that was used for backgrounding, for display purposes
     *
     * @generated from field: optional int32 ms_to_wait = 5;
     */
    msToWait?: number | undefined;
    /**
     * @generated from field: optional agent.v1.ShellBackgroundReason reason = 6;
     */
    reason?: ShellBackgroundReason | undefined;
};
/**
 * Describes the message agent.v1.ShellStreamBackgrounded.
 * Use `create(ShellStreamBackgroundedSchema)` to create a new message.
 */
export declare const ShellStreamBackgroundedSchema: GenMessage<ShellStreamBackgrounded>;
/**
 * @generated from message agent.v1.ShellStream
 */
export type ShellStream = Message<"agent.v1.ShellStream"> & {
    /**
     * @generated from oneof agent.v1.ShellStream.event
     */
    event: {
        /**
         * @generated from field: agent.v1.ShellStreamStdout stdout = 1;
         */
        value: ShellStreamStdout;
        case: "stdout";
    } | {
        /**
         * @generated from field: agent.v1.ShellStreamStderr stderr = 2;
         */
        value: ShellStreamStderr;
        case: "stderr";
    } | {
        /**
         * @generated from field: agent.v1.ShellStreamExit exit = 3;
         */
        value: ShellStreamExit;
        case: "exit";
    } | {
        /**
         * @generated from field: agent.v1.ShellStreamStart start = 4;
         */
        value: ShellStreamStart;
        case: "start";
    } | {
        /**
         * @generated from field: agent.v1.ShellRejected rejected = 5;
         */
        value: ShellRejected;
        case: "rejected";
    } | {
        /**
         * @generated from field: agent.v1.ShellPermissionDenied permission_denied = 6;
         */
        value: ShellPermissionDenied;
        case: "permissionDenied";
    } | {
        /**
         * @generated from field: agent.v1.ShellStreamBackgrounded backgrounded = 7;
         */
        value: ShellStreamBackgrounded;
        case: "backgrounded";
    } | {
        /**
         * @generated from field: agent.v1.ShellStreamHookContext hook_context = 8;
         */
        value: ShellStreamHookContext;
        case: "hookContext";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ShellStream.
 * Use `create(ShellStreamSchema)` to create a new message.
 */
export declare const ShellStreamSchema: GenMessage<ShellStream>;
/**
 * @generated from message agent.v1.OutputLocation
 */
export type OutputLocation = Message<"agent.v1.OutputLocation"> & {
    /**
     * Absolute path to the output file
     *
     * @generated from field: string file_path = 1;
     */
    filePath: string;
    /**
     * Size of the output in bytes
     *
     * @generated from field: int64 size_bytes = 2;
     */
    sizeBytes: bigint;
    /**
     * Number of lines in the output
     *
     * @generated from field: int64 line_count = 3;
     */
    lineCount: bigint;
};
/**
 * Describes the message agent.v1.OutputLocation.
 * Use `create(OutputLocationSchema)` to create a new message.
 */
export declare const OutputLocationSchema: GenMessage<OutputLocation>;
/**
 * @generated from message agent.v1.ShellSuccess
 */
export type ShellSuccess = Message<"agent.v1.ShellSuccess"> & {
    /**
     * @generated from field: string command = 1;
     */
    command: string;
    /**
     * @generated from field: string working_directory = 2;
     */
    workingDirectory: string;
    /**
     * @generated from field: int32 exit_code = 3;
     */
    exitCode: number;
    /**
     * @generated from field: string signal = 4;
     */
    signal: string;
    /**
     * Inline stdout - populated when write_output_to_file is false, empty when true
     *
     * @generated from field: string stdout = 5;
     */
    stdout: string;
    /**
     * Inline stderr - populated when write_output_to_file is false, empty when true
     *
     * @generated from field: string stderr = 6;
     */
    stderr: string;
    /**
     * @generated from field: int32 execution_time = 7;
     */
    executionTime: number;
    /**
     * File-based output - populated when write_output_to_file is true (chronologically merged stdout+stderr)
     *
     * @generated from field: optional agent.v1.OutputLocation output_location = 8;
     */
    outputLocation?: OutputLocation | undefined;
    /**
     * Used by background shell executor
     *
     * @generated from field: optional uint32 shell_id = 9;
     */
    shellId?: number | undefined;
    /**
     * @generated from field: optional string interleaved_output = 10;
     */
    interleavedOutput?: string | undefined;
    /**
     * Process ID, used for backgrounded shells
     *
     * @generated from field: optional uint32 pid = 11;
     */
    pid?: number | undefined;
    /**
     * The ms_to_wait value used for backgrounding (for display in result)
     *
     * @generated from field: optional int32 ms_to_wait = 12;
     */
    msToWait?: number | undefined;
    /**
     * @generated from field: optional int32 local_execution_time_ms = 13;
     */
    localExecutionTimeMs?: number | undefined;
    /**
     * @generated from field: optional agent.v1.ShellBackgroundReason background_reason = 14;
     */
    backgroundReason?: ShellBackgroundReason | undefined;
    /**
     * @generated from field: optional string output_head = 15;
     */
    outputHead?: string | undefined;
    /**
     * @generated from field: optional string output_tail = 16;
     */
    outputTail?: string | undefined;
    /**
     * @generated from field: optional uint32 elided_chars = 17;
     */
    elidedChars?: number | undefined;
};
/**
 * Describes the message agent.v1.ShellSuccess.
 * Use `create(ShellSuccessSchema)` to create a new message.
 */
export declare const ShellSuccessSchema: GenMessage<ShellSuccess>;
/**
 * @generated from message agent.v1.ShellFailure
 */
export type ShellFailure = Message<"agent.v1.ShellFailure"> & {
    /**
     * @generated from field: string command = 1;
     */
    command: string;
    /**
     * @generated from field: string working_directory = 2;
     */
    workingDirectory: string;
    /**
     * @generated from field: int32 exit_code = 3;
     */
    exitCode: number;
    /**
     * @generated from field: string signal = 4;
     */
    signal: string;
    /**
     * Inline stdout - populated when write_output_to_file is false, empty when true
     *
     * @generated from field: string stdout = 5;
     */
    stdout: string;
    /**
     * Inline stderr - populated when write_output_to_file is false, empty when true
     *
     * @generated from field: string stderr = 6;
     */
    stderr: string;
    /**
     * @generated from field: int32 execution_time = 7;
     */
    executionTime: number;
    /**
     * File-based output - populated when write_output_to_file is true (chronologically merged stdout+stderr)
     *
     * @generated from field: optional agent.v1.OutputLocation output_location = 8;
     */
    outputLocation?: OutputLocation | undefined;
    /**
     * @generated from field: optional string interleaved_output = 9;
     */
    interleavedOutput?: string | undefined;
    /**
     * If the command was aborted, this indicates the reason
     *
     * @generated from field: optional int32 abort_reason = 10;
     */
    abortReason?: number | undefined;
    /**
     * Whether the command was aborted (by user or timeout)
     *
     * @generated from field: bool aborted = 11;
     */
    aborted: boolean;
    /**
     * @generated from field: optional int32 local_execution_time_ms = 12;
     */
    localExecutionTimeMs?: number | undefined;
    /**
     * @generated from field: optional string output_head = 13;
     */
    outputHead?: string | undefined;
    /**
     * @generated from field: optional string output_tail = 14;
     */
    outputTail?: string | undefined;
    /**
     * @generated from field: optional uint32 elided_chars = 15;
     */
    elidedChars?: number | undefined;
};
/**
 * Describes the message agent.v1.ShellFailure.
 * Use `create(ShellFailureSchema)` to create a new message.
 */
export declare const ShellFailureSchema: GenMessage<ShellFailure>;
/**
 * @generated from message agent.v1.ShellTimeout
 */
export type ShellTimeout = Message<"agent.v1.ShellTimeout"> & {
    /**
     * @generated from field: string command = 1;
     */
    command: string;
    /**
     * @generated from field: string working_directory = 2;
     */
    workingDirectory: string;
    /**
     * @generated from field: int32 timeout_ms = 3;
     */
    timeoutMs: number;
};
/**
 * Describes the message agent.v1.ShellTimeout.
 * Use `create(ShellTimeoutSchema)` to create a new message.
 */
export declare const ShellTimeoutSchema: GenMessage<ShellTimeout>;
/**
 * @generated from message agent.v1.ShellRejected
 */
export type ShellRejected = Message<"agent.v1.ShellRejected"> & {
    /**
     * @generated from field: string command = 1;
     */
    command: string;
    /**
     * @generated from field: string working_directory = 2;
     */
    workingDirectory: string;
    /**
     * @generated from field: string reason = 3;
     */
    reason: string;
    /**
     * @generated from field: bool is_readonly = 4;
     */
    isReadonly: boolean;
};
/**
 * Describes the message agent.v1.ShellRejected.
 * Use `create(ShellRejectedSchema)` to create a new message.
 */
export declare const ShellRejectedSchema: GenMessage<ShellRejected>;
/**
 * @generated from message agent.v1.ShellPermissionDenied
 */
export type ShellPermissionDenied = Message<"agent.v1.ShellPermissionDenied"> & {
    /**
     * @generated from field: string command = 1;
     */
    command: string;
    /**
     * @generated from field: string working_directory = 2;
     */
    workingDirectory: string;
    /**
     * @generated from field: string error = 3;
     */
    error: string;
    /**
     * @generated from field: bool is_readonly = 4;
     */
    isReadonly: boolean;
};
/**
 * Describes the message agent.v1.ShellPermissionDenied.
 * Use `create(ShellPermissionDeniedSchema)` to create a new message.
 */
export declare const ShellPermissionDeniedSchema: GenMessage<ShellPermissionDenied>;
/**
 * @generated from message agent.v1.ShellSpawnError
 */
export type ShellSpawnError = Message<"agent.v1.ShellSpawnError"> & {
    /**
     * @generated from field: string command = 1;
     */
    command: string;
    /**
     * @generated from field: string working_directory = 2;
     */
    workingDirectory: string;
    /**
     * @generated from field: string error = 3;
     */
    error: string;
};
/**
 * Describes the message agent.v1.ShellSpawnError.
 * Use `create(ShellSpawnErrorSchema)` to create a new message.
 */
export declare const ShellSpawnErrorSchema: GenMessage<ShellSpawnError>;
/**
 * @generated from message agent.v1.ShellPartialResult
 */
export type ShellPartialResult = Message<"agent.v1.ShellPartialResult"> & {
    /**
     * @generated from field: string stdout_delta = 1;
     */
    stdoutDelta: string;
    /**
     * @generated from field: string stderr_delta = 2;
     */
    stderrDelta: string;
};
/**
 * Describes the message agent.v1.ShellPartialResult.
 * Use `create(ShellPartialResultSchema)` to create a new message.
 */
export declare const ShellPartialResultSchema: GenMessage<ShellPartialResult>;
/**
 * @generated from message agent.v1.ShellToolCall
 */
export type ShellToolCall = Message<"agent.v1.ShellToolCall"> & {
    /**
     * @generated from field: agent.v1.ShellArgs args = 1;
     */
    args?: ShellArgs | undefined;
    /**
     * @generated from field: agent.v1.ShellResult result = 2;
     */
    result?: ShellResult | undefined;
};
/**
 * Describes the message agent.v1.ShellToolCall.
 * Use `create(ShellToolCallSchema)` to create a new message.
 */
export declare const ShellToolCallSchema: GenMessage<ShellToolCall>;
/**
 * @generated from message agent.v1.ShellToolCallStdoutDelta
 */
export type ShellToolCallStdoutDelta = Message<"agent.v1.ShellToolCallStdoutDelta"> & {
    /**
     * @generated from field: string content = 1;
     */
    content: string;
};
/**
 * Describes the message agent.v1.ShellToolCallStdoutDelta.
 * Use `create(ShellToolCallStdoutDeltaSchema)` to create a new message.
 */
export declare const ShellToolCallStdoutDeltaSchema: GenMessage<ShellToolCallStdoutDelta>;
/**
 * @generated from message agent.v1.ShellToolCallStderrDelta
 */
export type ShellToolCallStderrDelta = Message<"agent.v1.ShellToolCallStderrDelta"> & {
    /**
     * @generated from field: string content = 1;
     */
    content: string;
};
/**
 * Describes the message agent.v1.ShellToolCallStderrDelta.
 * Use `create(ShellToolCallStderrDeltaSchema)` to create a new message.
 */
export declare const ShellToolCallStderrDeltaSchema: GenMessage<ShellToolCallStderrDelta>;
/**
 * @generated from message agent.v1.ShellToolCallDelta
 */
export type ShellToolCallDelta = Message<"agent.v1.ShellToolCallDelta"> & {
    /**
     * @generated from oneof agent.v1.ShellToolCallDelta.delta
     */
    delta: {
        /**
         * @generated from field: agent.v1.ShellToolCallStdoutDelta stdout = 1;
         */
        value: ShellToolCallStdoutDelta;
        case: "stdout";
    } | {
        /**
         * @generated from field: agent.v1.ShellToolCallStderrDelta stderr = 2;
         */
        value: ShellToolCallStderrDelta;
        case: "stderr";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ShellToolCallDelta.
 * Use `create(ShellToolCallDeltaSchema)` to create a new message.
 */
export declare const ShellToolCallDeltaSchema: GenMessage<ShellToolCallDelta>;
/**
 * @generated from message agent.v1.SubagentType
 */
export type SubagentType = Message<"agent.v1.SubagentType"> & {
    /**
     * @generated from oneof agent.v1.SubagentType.type
     */
    type: {
        /**
         * @generated from field: agent.v1.SubagentTypeUnspecified unspecified = 1;
         */
        value: SubagentTypeUnspecified;
        case: "unspecified";
    } | {
        /**
         * @generated from field: agent.v1.SubagentTypeComputerUse computer_use = 2;
         */
        value: SubagentTypeComputerUse;
        case: "computerUse";
    } | {
        /**
         * @generated from field: agent.v1.SubagentTypeCustom custom = 3;
         */
        value: SubagentTypeCustom;
        case: "custom";
    } | {
        /**
         * @generated from field: agent.v1.SubagentTypeExplore explore = 4;
         */
        value: SubagentTypeExplore;
        case: "explore";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.SubagentType.
 * Use `create(SubagentTypeSchema)` to create a new message.
 */
export declare const SubagentTypeSchema: GenMessage<SubagentType>;
/**
 * Empty message for unspecified subagent type
 *
 * @generated from message agent.v1.SubagentTypeUnspecified
 */
export type SubagentTypeUnspecified = Message<"agent.v1.SubagentTypeUnspecified"> & {};
/**
 * Describes the message agent.v1.SubagentTypeUnspecified.
 * Use `create(SubagentTypeUnspecifiedSchema)` to create a new message.
 */
export declare const SubagentTypeUnspecifiedSchema: GenMessage<SubagentTypeUnspecified>;
/**
 * Empty message for computer use subagent type
 *
 * @generated from message agent.v1.SubagentTypeComputerUse
 */
export type SubagentTypeComputerUse = Message<"agent.v1.SubagentTypeComputerUse"> & {};
/**
 * Describes the message agent.v1.SubagentTypeComputerUse.
 * Use `create(SubagentTypeComputerUseSchema)` to create a new message.
 */
export declare const SubagentTypeComputerUseSchema: GenMessage<SubagentTypeComputerUse>;
/**
 * Empty message for explore subagent type (read-only codebase exploration)
 *
 * @generated from message agent.v1.SubagentTypeExplore
 */
export type SubagentTypeExplore = Message<"agent.v1.SubagentTypeExplore"> & {};
/**
 * Describes the message agent.v1.SubagentTypeExplore.
 * Use `create(SubagentTypeExploreSchema)` to create a new message.
 */
export declare const SubagentTypeExploreSchema: GenMessage<SubagentTypeExplore>;
/**
 * Custom subagent type with a name field
 *
 * @generated from message agent.v1.SubagentTypeCustom
 */
export type SubagentTypeCustom = Message<"agent.v1.SubagentTypeCustom"> & {
    /**
     * unique identifier of the custom subagent
     *
     * @generated from field: string name = 1;
     */
    name: string;
};
/**
 * Describes the message agent.v1.SubagentTypeCustom.
 * Use `create(SubagentTypeCustomSchema)` to create a new message.
 */
export declare const SubagentTypeCustomSchema: GenMessage<SubagentTypeCustom>;
/**
 * Custom subagent definition loaded from local workspace configuration.
 *
 * @generated from message agent.v1.CustomSubagent
 */
export type CustomSubagent = Message<"agent.v1.CustomSubagent"> & {
    /**
     * absolute path to the markdown definition file
     *
     * @generated from field: string full_path = 1;
     */
    fullPath: string;
    /**
     * unique identifier of the subagent
     *
     * @generated from field: string name = 2;
     */
    name: string;
    /**
     * short summary of the agent's specialization
     *
     * @generated from field: string description = 3;
     */
    description: string;
    /**
     * list of tool names the subagent can access
     *
     * @generated from field: repeated string tools = 4;
     */
    tools: string[];
    /**
     * preferred model (or "inherit" to use parent's model)
     *
     * @generated from field: string model = 5;
     */
    model: string;
    /**
     * full prompt contents from the markdown file
     *
     * @generated from field: string prompt = 6;
     */
    prompt: string;
    /**
     * default permission mode for subagent execution
     *
     * @generated from field: int32 permission_mode = 7;
     */
    permissionMode: number;
};
/**
 * Describes the message agent.v1.CustomSubagent.
 * Use `create(CustomSubagentSchema)` to create a new message.
 */
export declare const CustomSubagentSchema: GenMessage<CustomSubagent>;
/**
 * @generated from message agent.v1.SwitchModeArgs
 */
export type SwitchModeArgs = Message<"agent.v1.SwitchModeArgs"> & {
    /**
     * The unified mode id to switch to (agent/chat/plan/spec/debug/triage)
     *
     * @generated from field: string target_mode_id = 1;
     */
    targetModeId: string;
    /**
     * Optional explanation for why the mode switch is requested
     *
     * @generated from field: optional string explanation = 2;
     */
    explanation?: string | undefined;
    /**
     * @generated from field: string tool_call_id = 3;
     */
    toolCallId: string;
};
/**
 * Describes the message agent.v1.SwitchModeArgs.
 * Use `create(SwitchModeArgsSchema)` to create a new message.
 */
export declare const SwitchModeArgsSchema: GenMessage<SwitchModeArgs>;
/**
 * @generated from message agent.v1.SwitchModeResult
 */
export type SwitchModeResult = Message<"agent.v1.SwitchModeResult"> & {
    /**
     * @generated from oneof agent.v1.SwitchModeResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.SwitchModeSuccess success = 1;
         */
        value: SwitchModeSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.SwitchModeError error = 2;
         */
        value: SwitchModeError;
        case: "error";
    } | {
        /**
         * @generated from field: agent.v1.SwitchModeRejected rejected = 3;
         */
        value: SwitchModeRejected;
        case: "rejected";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.SwitchModeResult.
 * Use `create(SwitchModeResultSchema)` to create a new message.
 */
export declare const SwitchModeResultSchema: GenMessage<SwitchModeResult>;
/**
 * @generated from message agent.v1.SwitchModeSuccess
 */
export type SwitchModeSuccess = Message<"agent.v1.SwitchModeSuccess"> & {
    /**
     * The mode we switched from
     *
     * @generated from field: string from_mode_id = 1;
     */
    fromModeId: string;
    /**
     * The mode we switched to
     *
     * @generated from field: string to_mode_id = 2;
     */
    toModeId: string;
};
/**
 * Describes the message agent.v1.SwitchModeSuccess.
 * Use `create(SwitchModeSuccessSchema)` to create a new message.
 */
export declare const SwitchModeSuccessSchema: GenMessage<SwitchModeSuccess>;
/**
 * @generated from message agent.v1.SwitchModeError
 */
export type SwitchModeError = Message<"agent.v1.SwitchModeError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.SwitchModeError.
 * Use `create(SwitchModeErrorSchema)` to create a new message.
 */
export declare const SwitchModeErrorSchema: GenMessage<SwitchModeError>;
/**
 * @generated from message agent.v1.SwitchModeRejected
 */
export type SwitchModeRejected = Message<"agent.v1.SwitchModeRejected"> & {
    /**
     * @generated from field: string reason = 1;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.SwitchModeRejected.
 * Use `create(SwitchModeRejectedSchema)` to create a new message.
 */
export declare const SwitchModeRejectedSchema: GenMessage<SwitchModeRejected>;
/**
 * @generated from message agent.v1.SwitchModeToolCall
 */
export type SwitchModeToolCall = Message<"agent.v1.SwitchModeToolCall"> & {
    /**
     * @generated from field: agent.v1.SwitchModeArgs args = 1;
     */
    args?: SwitchModeArgs | undefined;
    /**
     * @generated from field: agent.v1.SwitchModeResult result = 2;
     */
    result?: SwitchModeResult | undefined;
};
/**
 * Describes the message agent.v1.SwitchModeToolCall.
 * Use `create(SwitchModeToolCallSchema)` to create a new message.
 */
export declare const SwitchModeToolCallSchema: GenMessage<SwitchModeToolCall>;
/**
 * @generated from message agent.v1.SwitchModeRequestQuery
 */
export type SwitchModeRequestQuery = Message<"agent.v1.SwitchModeRequestQuery"> & {
    /**
     * @generated from field: agent.v1.SwitchModeArgs args = 1;
     */
    args?: SwitchModeArgs | undefined;
};
/**
 * Describes the message agent.v1.SwitchModeRequestQuery.
 * Use `create(SwitchModeRequestQuerySchema)` to create a new message.
 */
export declare const SwitchModeRequestQuerySchema: GenMessage<SwitchModeRequestQuery>;
/**
 * @generated from message agent.v1.SwitchModeRequestResponse
 */
export type SwitchModeRequestResponse = Message<"agent.v1.SwitchModeRequestResponse"> & {
    /**
     * @generated from oneof agent.v1.SwitchModeRequestResponse.result
     */
    result: {
        /**
         * @generated from field: agent.v1.SwitchModeRequestResponse_Approved approved = 1;
         */
        value: SwitchModeRequestResponse_Approved;
        case: "approved";
    } | {
        /**
         * @generated from field: agent.v1.SwitchModeRequestResponse_Rejected rejected = 2;
         */
        value: SwitchModeRequestResponse_Rejected;
        case: "rejected";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.SwitchModeRequestResponse.
 * Use `create(SwitchModeRequestResponseSchema)` to create a new message.
 */
export declare const SwitchModeRequestResponseSchema: GenMessage<SwitchModeRequestResponse>;
/**
 * @generated from message agent.v1.SwitchModeRequestResponse_Approved
 */
export type SwitchModeRequestResponse_Approved = Message<"agent.v1.SwitchModeRequestResponse_Approved"> & {};
/**
 * Describes the message agent.v1.SwitchModeRequestResponse_Approved.
 * Use `create(SwitchModeRequestResponse_ApprovedSchema)` to create a new message.
 */
export declare const SwitchModeRequestResponse_ApprovedSchema: GenMessage<SwitchModeRequestResponse_Approved>;
/**
 * @generated from message agent.v1.SwitchModeRequestResponse_Rejected
 */
export type SwitchModeRequestResponse_Rejected = Message<"agent.v1.SwitchModeRequestResponse_Rejected"> & {
    /**
     * @generated from field: string reason = 1;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.SwitchModeRequestResponse_Rejected.
 * Use `create(SwitchModeRequestResponse_RejectedSchema)` to create a new message.
 */
export declare const SwitchModeRequestResponse_RejectedSchema: GenMessage<SwitchModeRequestResponse_Rejected>;
/**
 * @generated from message agent.v1.TodoItem
 */
export type TodoItem = Message<"agent.v1.TodoItem"> & {
    /**
     * @generated from field: string id = 1;
     */
    id: string;
    /**
     * @generated from field: string content = 2;
     */
    content: string;
    /**
     * @generated from field: int32 status = 3;
     */
    status: number;
    /**
     * @generated from field: int64 created_at = 4;
     */
    createdAt: bigint;
    /**
     * @generated from field: int64 updated_at = 5;
     */
    updatedAt: bigint;
    /**
     * IDs of other TODOs this depends on
     *
     * @generated from field: repeated string dependencies = 6;
     */
    dependencies: string[];
};
/**
 * Describes the message agent.v1.TodoItem.
 * Use `create(TodoItemSchema)` to create a new message.
 */
export declare const TodoItemSchema: GenMessage<TodoItem>;
/**
 * UpdateTodos tool call
 *
 * @generated from message agent.v1.UpdateTodosToolCall
 */
export type UpdateTodosToolCall = Message<"agent.v1.UpdateTodosToolCall"> & {
    /**
     * @generated from field: agent.v1.UpdateTodosArgs args = 1;
     */
    args?: UpdateTodosArgs | undefined;
    /**
     * @generated from field: agent.v1.UpdateTodosResult result = 2;
     */
    result?: UpdateTodosResult | undefined;
};
/**
 * Describes the message agent.v1.UpdateTodosToolCall.
 * Use `create(UpdateTodosToolCallSchema)` to create a new message.
 */
export declare const UpdateTodosToolCallSchema: GenMessage<UpdateTodosToolCall>;
/**
 * @generated from message agent.v1.UpdateTodosArgs
 */
export type UpdateTodosArgs = Message<"agent.v1.UpdateTodosArgs"> & {
    /**
     * @generated from field: repeated agent.v1.TodoItem todos = 1;
     */
    todos: TodoItem[];
    /**
     * @generated from field: bool merge = 2;
     */
    merge: boolean;
};
/**
 * Describes the message agent.v1.UpdateTodosArgs.
 * Use `create(UpdateTodosArgsSchema)` to create a new message.
 */
export declare const UpdateTodosArgsSchema: GenMessage<UpdateTodosArgs>;
/**
 * @generated from message agent.v1.UpdateTodosResult
 */
export type UpdateTodosResult = Message<"agent.v1.UpdateTodosResult"> & {
    /**
     * @generated from oneof agent.v1.UpdateTodosResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.UpdateTodosSuccess success = 1;
         */
        value: UpdateTodosSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.UpdateTodosError error = 2;
         */
        value: UpdateTodosError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.UpdateTodosResult.
 * Use `create(UpdateTodosResultSchema)` to create a new message.
 */
export declare const UpdateTodosResultSchema: GenMessage<UpdateTodosResult>;
/**
 * @generated from message agent.v1.UpdateTodosSuccess
 */
export type UpdateTodosSuccess = Message<"agent.v1.UpdateTodosSuccess"> & {
    /**
     * @generated from field: repeated agent.v1.TodoItem todos = 1;
     */
    todos: TodoItem[];
    /**
     * @generated from field: int32 total_count = 2;
     */
    totalCount: number;
    /**
     * Whether this was a merge operation (needed for conditional rendering)
     *
     * @generated from field: bool was_merge = 3;
     */
    wasMerge: boolean;
};
/**
 * Describes the message agent.v1.UpdateTodosSuccess.
 * Use `create(UpdateTodosSuccessSchema)` to create a new message.
 */
export declare const UpdateTodosSuccessSchema: GenMessage<UpdateTodosSuccess>;
/**
 * @generated from message agent.v1.UpdateTodosError
 */
export type UpdateTodosError = Message<"agent.v1.UpdateTodosError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.UpdateTodosError.
 * Use `create(UpdateTodosErrorSchema)` to create a new message.
 */
export declare const UpdateTodosErrorSchema: GenMessage<UpdateTodosError>;
/**
 * ReadTodos tool call
 *
 * @generated from message agent.v1.ReadTodosToolCall
 */
export type ReadTodosToolCall = Message<"agent.v1.ReadTodosToolCall"> & {
    /**
     * @generated from field: agent.v1.ReadTodosArgs args = 1;
     */
    args?: ReadTodosArgs | undefined;
    /**
     * @generated from field: agent.v1.ReadTodosResult result = 2;
     */
    result?: ReadTodosResult | undefined;
};
/**
 * Describes the message agent.v1.ReadTodosToolCall.
 * Use `create(ReadTodosToolCallSchema)` to create a new message.
 */
export declare const ReadTodosToolCallSchema: GenMessage<ReadTodosToolCall>;
/**
 * @generated from message agent.v1.ReadTodosArgs
 */
export type ReadTodosArgs = Message<"agent.v1.ReadTodosArgs"> & {
    /**
     * Optional: filter by status
     *
     * @generated from field: repeated int32 status_filter = 1;
     */
    statusFilter: number[];
    /**
     * Optional: filter by IDs
     *
     * @generated from field: repeated string id_filter = 2;
     */
    idFilter: string[];
};
/**
 * Describes the message agent.v1.ReadTodosArgs.
 * Use `create(ReadTodosArgsSchema)` to create a new message.
 */
export declare const ReadTodosArgsSchema: GenMessage<ReadTodosArgs>;
/**
 * @generated from message agent.v1.ReadTodosResult
 */
export type ReadTodosResult = Message<"agent.v1.ReadTodosResult"> & {
    /**
     * @generated from oneof agent.v1.ReadTodosResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.ReadTodosSuccess success = 1;
         */
        value: ReadTodosSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.ReadTodosError error = 2;
         */
        value: ReadTodosError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ReadTodosResult.
 * Use `create(ReadTodosResultSchema)` to create a new message.
 */
export declare const ReadTodosResultSchema: GenMessage<ReadTodosResult>;
/**
 * @generated from message agent.v1.ReadTodosSuccess
 */
export type ReadTodosSuccess = Message<"agent.v1.ReadTodosSuccess"> & {
    /**
     * @generated from field: repeated agent.v1.TodoItem todos = 1;
     */
    todos: TodoItem[];
    /**
     * @generated from field: int32 total_count = 2;
     */
    totalCount: number;
};
/**
 * Describes the message agent.v1.ReadTodosSuccess.
 * Use `create(ReadTodosSuccessSchema)` to create a new message.
 */
export declare const ReadTodosSuccessSchema: GenMessage<ReadTodosSuccess>;
/**
 * @generated from message agent.v1.ReadTodosError
 */
export type ReadTodosError = Message<"agent.v1.ReadTodosError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.ReadTodosError.
 * Use `create(ReadTodosErrorSchema)` to create a new message.
 */
export declare const ReadTodosErrorSchema: GenMessage<ReadTodosError>;
/**
 * @generated from message agent.v1.Range
 */
export type Range = Message<"agent.v1.Range"> & {
    /**
     * @generated from field: agent.v1.Position start = 1;
     */
    start?: Position | undefined;
    /**
     * @generated from field: agent.v1.Position end = 2;
     */
    end?: Position | undefined;
};
/**
 * Describes the message agent.v1.Range.
 * Use `create(RangeSchema)` to create a new message.
 */
export declare const RangeSchema: GenMessage<Range>;
/**
 * @generated from message agent.v1.Position
 */
export type Position = Message<"agent.v1.Position"> & {
    /**
     * @generated from field: uint32 line = 1;
     */
    line: number;
    /**
     * @generated from field: uint32 column = 2;
     */
    column: number;
};
/**
 * Describes the message agent.v1.Position.
 * Use `create(PositionSchema)` to create a new message.
 */
export declare const PositionSchema: GenMessage<Position>;
/**
 * @generated from message agent.v1.Error
 */
export type Error = Message<"agent.v1.Error"> & {
    /**
     * @generated from field: string message = 1;
     */
    message: string;
};
/**
 * Describes the message agent.v1.Error.
 * Use `create(ErrorSchema)` to create a new message.
 */
export declare const ErrorSchema: GenMessage<Error>;
/**
 * @generated from message agent.v1.WebSearchArgs
 */
export type WebSearchArgs = Message<"agent.v1.WebSearchArgs"> & {
    /**
     * @generated from field: string search_term = 1;
     */
    searchTerm: string;
    /**
     * @generated from field: string tool_call_id = 2;
     */
    toolCallId: string;
};
/**
 * Describes the message agent.v1.WebSearchArgs.
 * Use `create(WebSearchArgsSchema)` to create a new message.
 */
export declare const WebSearchArgsSchema: GenMessage<WebSearchArgs>;
/**
 * @generated from message agent.v1.WebSearchResult
 */
export type WebSearchResult = Message<"agent.v1.WebSearchResult"> & {
    /**
     * @generated from oneof agent.v1.WebSearchResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.WebSearchSuccess success = 1;
         */
        value: WebSearchSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.WebSearchError error = 2;
         */
        value: WebSearchError;
        case: "error";
    } | {
        /**
         * @generated from field: agent.v1.WebSearchRejected rejected = 3;
         */
        value: WebSearchRejected;
        case: "rejected";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.WebSearchResult.
 * Use `create(WebSearchResultSchema)` to create a new message.
 */
export declare const WebSearchResultSchema: GenMessage<WebSearchResult>;
/**
 * @generated from message agent.v1.WebSearchSuccess
 */
export type WebSearchSuccess = Message<"agent.v1.WebSearchSuccess"> & {
    /**
     * @generated from field: repeated agent.v1.WebSearchReference references = 1;
     */
    references: WebSearchReference[];
};
/**
 * Describes the message agent.v1.WebSearchSuccess.
 * Use `create(WebSearchSuccessSchema)` to create a new message.
 */
export declare const WebSearchSuccessSchema: GenMessage<WebSearchSuccess>;
/**
 * @generated from message agent.v1.WebSearchError
 */
export type WebSearchError = Message<"agent.v1.WebSearchError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.WebSearchError.
 * Use `create(WebSearchErrorSchema)` to create a new message.
 */
export declare const WebSearchErrorSchema: GenMessage<WebSearchError>;
/**
 * @generated from message agent.v1.WebSearchRejected
 */
export type WebSearchRejected = Message<"agent.v1.WebSearchRejected"> & {
    /**
     * @generated from field: string reason = 1;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.WebSearchRejected.
 * Use `create(WebSearchRejectedSchema)` to create a new message.
 */
export declare const WebSearchRejectedSchema: GenMessage<WebSearchRejected>;
/**
 * @generated from message agent.v1.WebSearchReference
 */
export type WebSearchReference = Message<"agent.v1.WebSearchReference"> & {
    /**
     * @generated from field: string title = 1;
     */
    title: string;
    /**
     * @generated from field: string url = 2;
     */
    url: string;
    /**
     * @generated from field: string chunk = 3;
     */
    chunk: string;
};
/**
 * Describes the message agent.v1.WebSearchReference.
 * Use `create(WebSearchReferenceSchema)` to create a new message.
 */
export declare const WebSearchReferenceSchema: GenMessage<WebSearchReference>;
/**
 * @generated from message agent.v1.WebSearchToolCall
 */
export type WebSearchToolCall = Message<"agent.v1.WebSearchToolCall"> & {
    /**
     * @generated from field: agent.v1.WebSearchArgs args = 1;
     */
    args?: WebSearchArgs | undefined;
    /**
     * @generated from field: agent.v1.WebSearchResult result = 2;
     */
    result?: WebSearchResult | undefined;
};
/**
 * Describes the message agent.v1.WebSearchToolCall.
 * Use `create(WebSearchToolCallSchema)` to create a new message.
 */
export declare const WebSearchToolCallSchema: GenMessage<WebSearchToolCall>;
/**
 * @generated from message agent.v1.WebSearchRequestQuery
 */
export type WebSearchRequestQuery = Message<"agent.v1.WebSearchRequestQuery"> & {
    /**
     * @generated from field: agent.v1.WebSearchArgs args = 1;
     */
    args?: WebSearchArgs | undefined;
};
/**
 * Describes the message agent.v1.WebSearchRequestQuery.
 * Use `create(WebSearchRequestQuerySchema)` to create a new message.
 */
export declare const WebSearchRequestQuerySchema: GenMessage<WebSearchRequestQuery>;
/**
 * @generated from message agent.v1.WebSearchRequestResponse
 */
export type WebSearchRequestResponse = Message<"agent.v1.WebSearchRequestResponse"> & {
    /**
     * @generated from oneof agent.v1.WebSearchRequestResponse.result
     */
    result: {
        /**
         * @generated from field: agent.v1.WebSearchRequestResponse_Approved approved = 1;
         */
        value: WebSearchRequestResponse_Approved;
        case: "approved";
    } | {
        /**
         * @generated from field: agent.v1.WebSearchRequestResponse_Rejected rejected = 2;
         */
        value: WebSearchRequestResponse_Rejected;
        case: "rejected";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.WebSearchRequestResponse.
 * Use `create(WebSearchRequestResponseSchema)` to create a new message.
 */
export declare const WebSearchRequestResponseSchema: GenMessage<WebSearchRequestResponse>;
/**
 * @generated from message agent.v1.WebSearchRequestResponse_Approved
 */
export type WebSearchRequestResponse_Approved = Message<"agent.v1.WebSearchRequestResponse_Approved"> & {};
/**
 * Describes the message agent.v1.WebSearchRequestResponse_Approved.
 * Use `create(WebSearchRequestResponse_ApprovedSchema)` to create a new message.
 */
export declare const WebSearchRequestResponse_ApprovedSchema: GenMessage<WebSearchRequestResponse_Approved>;
/**
 * @generated from message agent.v1.WebSearchRequestResponse_Rejected
 */
export type WebSearchRequestResponse_Rejected = Message<"agent.v1.WebSearchRequestResponse_Rejected"> & {
    /**
     * @generated from field: string reason = 1;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.WebSearchRequestResponse_Rejected.
 * Use `create(WebSearchRequestResponse_RejectedSchema)` to create a new message.
 */
export declare const WebSearchRequestResponse_RejectedSchema: GenMessage<WebSearchRequestResponse_Rejected>;
/**
 * @generated from message agent.v1.WriteArgs
 */
export type WriteArgs = Message<"agent.v1.WriteArgs"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string file_text = 2;
     */
    fileText: string;
    /**
     * @generated from field: string tool_call_id = 3;
     */
    toolCallId: string;
    /**
     * @generated from field: bool return_file_content_after_write = 4;
     */
    returnFileContentAfterWrite: boolean;
    /**
     * Raw binary data to write. When set, file_text is ignored and the bytes are written directly without any text processing (e.g., line ending normalization).
     *
     * @generated from field: bytes file_bytes = 5;
     */
    fileBytes: Uint8Array;
    /**
     * @generated from field: optional string encoding_hint = 6;
     */
    encodingHint?: string | undefined;
};
/**
 * Describes the message agent.v1.WriteArgs.
 * Use `create(WriteArgsSchema)` to create a new message.
 */
export declare const WriteArgsSchema: GenMessage<WriteArgs>;
/**
 * @generated from message agent.v1.WriteResult
 */
export type WriteResult = Message<"agent.v1.WriteResult"> & {
    /**
     * @generated from oneof agent.v1.WriteResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.WriteSuccess success = 1;
         */
        value: WriteSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.WritePermissionDenied permission_denied = 3;
         */
        value: WritePermissionDenied;
        case: "permissionDenied";
    } | {
        /**
         * @generated from field: agent.v1.WriteNoSpace no_space = 4;
         */
        value: WriteNoSpace;
        case: "noSpace";
    } | {
        /**
         * @generated from field: agent.v1.WriteError error = 5;
         */
        value: WriteError;
        case: "error";
    } | {
        /**
         * @generated from field: agent.v1.WriteRejected rejected = 6;
         */
        value: WriteRejected;
        case: "rejected";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.WriteResult.
 * Use `create(WriteResultSchema)` to create a new message.
 */
export declare const WriteResultSchema: GenMessage<WriteResult>;
/**
 * @generated from message agent.v1.WriteSuccess
 */
export type WriteSuccess = Message<"agent.v1.WriteSuccess"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: int32 lines_created = 2;
     */
    linesCreated: number;
    /**
     * @generated from field: int32 file_size = 3;
     */
    fileSize: number;
    /**
     * @generated from field: optional string file_content_after_write = 4;
     */
    fileContentAfterWrite?: string | undefined;
};
/**
 * Describes the message agent.v1.WriteSuccess.
 * Use `create(WriteSuccessSchema)` to create a new message.
 */
export declare const WriteSuccessSchema: GenMessage<WriteSuccess>;
/**
 * @generated from message agent.v1.WritePermissionDenied
 */
export type WritePermissionDenied = Message<"agent.v1.WritePermissionDenied"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string directory = 2;
     */
    directory: string;
    /**
     * "create_directory" or "create_file"
     *
     * @generated from field: string operation = 3;
     */
    operation: string;
    /**
     * @generated from field: string error = 4;
     */
    error: string;
    /**
     * @generated from field: bool is_readonly = 5;
     */
    isReadonly: boolean;
};
/**
 * Describes the message agent.v1.WritePermissionDenied.
 * Use `create(WritePermissionDeniedSchema)` to create a new message.
 */
export declare const WritePermissionDeniedSchema: GenMessage<WritePermissionDenied>;
/**
 * @generated from message agent.v1.WriteNoSpace
 */
export type WriteNoSpace = Message<"agent.v1.WriteNoSpace"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
};
/**
 * Describes the message agent.v1.WriteNoSpace.
 * Use `create(WriteNoSpaceSchema)` to create a new message.
 */
export declare const WriteNoSpaceSchema: GenMessage<WriteNoSpace>;
/**
 * @generated from message agent.v1.WriteError
 */
export type WriteError = Message<"agent.v1.WriteError"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string error = 2;
     */
    error: string;
};
/**
 * Describes the message agent.v1.WriteError.
 * Use `create(WriteErrorSchema)` to create a new message.
 */
export declare const WriteErrorSchema: GenMessage<WriteError>;
/**
 * @generated from message agent.v1.WriteRejected
 */
export type WriteRejected = Message<"agent.v1.WriteRejected"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string reason = 2;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.WriteRejected.
 * Use `create(WriteRejectedSchema)` to create a new message.
 */
export declare const WriteRejectedSchema: GenMessage<WriteRejected>;
/**
 * @generated from message agent.v1.BootstrapStatsigRequest
 */
export type BootstrapStatsigRequest = Message<"agent.v1.BootstrapStatsigRequest"> & {
    /**
     * When true, the server should evaluate gates as if dev/internal status is ignored. This is used by clients to simulate a prod user experience.
     *
     * @generated from field: optional bool ignore_dev_status = 1;
     */
    ignoreDevStatus?: boolean | undefined;
    /**
     * @generated from field: optional int32 operating_system = 2;
     */
    operatingSystem?: number | undefined;
};
/**
 * Describes the message agent.v1.BootstrapStatsigRequest.
 * Use `create(BootstrapStatsigRequestSchema)` to create a new message.
 */
export declare const BootstrapStatsigRequestSchema: GenMessage<BootstrapStatsigRequest>;
/**
 * @generated from message agent.v1.PingResponse
 */
export type PingResponse = Message<"agent.v1.PingResponse"> & {};
/**
 * Describes the message agent.v1.PingResponse.
 * Use `create(PingResponseSchema)` to create a new message.
 */
export declare const PingResponseSchema: GenMessage<PingResponse>;
/**
 * @generated from message agent.v1.ExecRequest
 */
export type ExecRequest = Message<"agent.v1.ExecRequest"> & {
    /**
     * @generated from field: string command = 1;
     */
    command: string;
    /**
     * @generated from field: optional string cwd = 2;
     */
    cwd?: string | undefined;
    /**
     * @generated from field: repeated string args = 3;
     */
    args: string[];
    /**
     * @generated from field: map<string, string> environment = 4;
     */
    environment: {
        [key: string]: string;
    };
};
/**
 * Describes the message agent.v1.ExecRequest.
 * Use `create(ExecRequestSchema)` to create a new message.
 */
export declare const ExecRequestSchema: GenMessage<ExecRequest>;
/**
 * @generated from message agent.v1.ExecResponse
 */
export type ExecResponse = Message<"agent.v1.ExecResponse"> & {
    /**
     * @generated from oneof agent.v1.ExecResponse.event
     */
    event: {
        /**
         * @generated from field: agent.v1.StdoutEvent stdout_event = 1;
         */
        value: StdoutEvent;
        case: "stdoutEvent";
    } | {
        /**
         * @generated from field: agent.v1.StderrEvent stderr_event = 2;
         */
        value: StderrEvent;
        case: "stderrEvent";
    } | {
        /**
         * @generated from field: agent.v1.ExitEvent exit_event = 3;
         */
        value: ExitEvent;
        case: "exitEvent";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ExecResponse.
 * Use `create(ExecResponseSchema)` to create a new message.
 */
export declare const ExecResponseSchema: GenMessage<ExecResponse>;
/**
 * @generated from message agent.v1.StdoutEvent
 */
export type StdoutEvent = Message<"agent.v1.StdoutEvent"> & {
    /**
     * @generated from field: string data = 1;
     */
    data: string;
};
/**
 * Describes the message agent.v1.StdoutEvent.
 * Use `create(StdoutEventSchema)` to create a new message.
 */
export declare const StdoutEventSchema: GenMessage<StdoutEvent>;
/**
 * @generated from message agent.v1.StderrEvent
 */
export type StderrEvent = Message<"agent.v1.StderrEvent"> & {
    /**
     * @generated from field: string data = 1;
     */
    data: string;
};
/**
 * Describes the message agent.v1.StderrEvent.
 * Use `create(StderrEventSchema)` to create a new message.
 */
export declare const StderrEventSchema: GenMessage<StderrEvent>;
/**
 * @generated from message agent.v1.ExitEvent
 */
export type ExitEvent = Message<"agent.v1.ExitEvent"> & {
    /**
     * @generated from field: int32 exit_code = 1;
     */
    exitCode: number;
};
/**
 * Describes the message agent.v1.ExitEvent.
 * Use `create(ExitEventSchema)` to create a new message.
 */
export declare const ExitEventSchema: GenMessage<ExitEvent>;
/**
 * @generated from message agent.v1.ReadTextFileRequest
 */
export type ReadTextFileRequest = Message<"agent.v1.ReadTextFileRequest"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
};
/**
 * Describes the message agent.v1.ReadTextFileRequest.
 * Use `create(ReadTextFileRequestSchema)` to create a new message.
 */
export declare const ReadTextFileRequestSchema: GenMessage<ReadTextFileRequest>;
/**
 * @generated from message agent.v1.ReadTextFileResponse
 */
export type ReadTextFileResponse = Message<"agent.v1.ReadTextFileResponse"> & {
    /**
     * @generated from field: string content = 1;
     */
    content: string;
};
/**
 * Describes the message agent.v1.ReadTextFileResponse.
 * Use `create(ReadTextFileResponseSchema)` to create a new message.
 */
export declare const ReadTextFileResponseSchema: GenMessage<ReadTextFileResponse>;
/**
 * @generated from message agent.v1.WriteTextFileRequest
 */
export type WriteTextFileRequest = Message<"agent.v1.WriteTextFileRequest"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string content = 2;
     */
    content: string;
};
/**
 * Describes the message agent.v1.WriteTextFileRequest.
 * Use `create(WriteTextFileRequestSchema)` to create a new message.
 */
export declare const WriteTextFileRequestSchema: GenMessage<WriteTextFileRequest>;
/**
 * Empty response - success is implied by RPC completion
 *
 * @generated from message agent.v1.WriteTextFileResponse
 */
export type WriteTextFileResponse = Message<"agent.v1.WriteTextFileResponse"> & {};
/**
 * Describes the message agent.v1.WriteTextFileResponse.
 * Use `create(WriteTextFileResponseSchema)` to create a new message.
 */
export declare const WriteTextFileResponseSchema: GenMessage<WriteTextFileResponse>;
/**
 * @generated from message agent.v1.ReadBinaryFileRequest
 */
export type ReadBinaryFileRequest = Message<"agent.v1.ReadBinaryFileRequest"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
};
/**
 * Describes the message agent.v1.ReadBinaryFileRequest.
 * Use `create(ReadBinaryFileRequestSchema)` to create a new message.
 */
export declare const ReadBinaryFileRequestSchema: GenMessage<ReadBinaryFileRequest>;
/**
 * @generated from message agent.v1.ReadBinaryFileResponse
 */
export type ReadBinaryFileResponse = Message<"agent.v1.ReadBinaryFileResponse"> & {
    /**
     * @generated from field: bytes content = 1;
     */
    content: Uint8Array;
};
/**
 * Describes the message agent.v1.ReadBinaryFileResponse.
 * Use `create(ReadBinaryFileResponseSchema)` to create a new message.
 */
export declare const ReadBinaryFileResponseSchema: GenMessage<ReadBinaryFileResponse>;
/**
 * @generated from message agent.v1.WriteBinaryFileRequest
 */
export type WriteBinaryFileRequest = Message<"agent.v1.WriteBinaryFileRequest"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: bytes content = 2;
     */
    content: Uint8Array;
};
/**
 * Describes the message agent.v1.WriteBinaryFileRequest.
 * Use `create(WriteBinaryFileRequestSchema)` to create a new message.
 */
export declare const WriteBinaryFileRequestSchema: GenMessage<WriteBinaryFileRequest>;
/**
 * Empty response - success is implied by RPC completion
 *
 * @generated from message agent.v1.WriteBinaryFileResponse
 */
export type WriteBinaryFileResponse = Message<"agent.v1.WriteBinaryFileResponse"> & {};
/**
 * Describes the message agent.v1.WriteBinaryFileResponse.
 * Use `create(WriteBinaryFileResponseSchema)` to create a new message.
 */
export declare const WriteBinaryFileResponseSchema: GenMessage<WriteBinaryFileResponse>;
/**
 * @generated from message agent.v1.GetWorkspaceChangesHashRequest
 */
export type GetWorkspaceChangesHashRequest = Message<"agent.v1.GetWorkspaceChangesHashRequest"> & {
    /**
     * @generated from field: string root_path = 1;
     */
    rootPath: string;
    /**
     * @generated from field: string base_ref = 2;
     */
    baseRef: string;
};
/**
 * Describes the message agent.v1.GetWorkspaceChangesHashRequest.
 * Use `create(GetWorkspaceChangesHashRequestSchema)` to create a new message.
 */
export declare const GetWorkspaceChangesHashRequestSchema: GenMessage<GetWorkspaceChangesHashRequest>;
/**
 * @generated from message agent.v1.GetWorkspaceChangesHashResponse
 */
export type GetWorkspaceChangesHashResponse = Message<"agent.v1.GetWorkspaceChangesHashResponse"> & {
    /**
     * @generated from field: string hash = 1;
     */
    hash: string;
};
/**
 * Describes the message agent.v1.GetWorkspaceChangesHashResponse.
 * Use `create(GetWorkspaceChangesHashResponseSchema)` to create a new message.
 */
export declare const GetWorkspaceChangesHashResponseSchema: GenMessage<GetWorkspaceChangesHashResponse>;
/**
 * @generated from message agent.v1.RefreshGithubAccessTokenRequest
 */
export type RefreshGithubAccessTokenRequest = Message<"agent.v1.RefreshGithubAccessTokenRequest"> & {
    /**
     * @generated from field: string github_access_token = 1;
     */
    githubAccessToken: string;
    /**
     * e.g., "github.com", "gitlab.com", "gitlab.example.com"
     *
     * @generated from field: string hostname = 2;
     */
    hostname: string;
};
/**
 * Describes the message agent.v1.RefreshGithubAccessTokenRequest.
 * Use `create(RefreshGithubAccessTokenRequestSchema)` to create a new message.
 */
export declare const RefreshGithubAccessTokenRequestSchema: GenMessage<RefreshGithubAccessTokenRequest>;
/**
 * Empty response - success is implied by RPC completion
 *
 * @generated from message agent.v1.RefreshGithubAccessTokenResponse
 */
export type RefreshGithubAccessTokenResponse = Message<"agent.v1.RefreshGithubAccessTokenResponse"> & {};
/**
 * Describes the message agent.v1.RefreshGithubAccessTokenResponse.
 * Use `create(RefreshGithubAccessTokenResponseSchema)` to create a new message.
 */
export declare const RefreshGithubAccessTokenResponseSchema: GenMessage<RefreshGithubAccessTokenResponse>;
/**
 * @generated from message agent.v1.WarmRemoteAccessServerRequest
 */
export type WarmRemoteAccessServerRequest = Message<"agent.v1.WarmRemoteAccessServerRequest"> & {
    /**
     * @generated from field: string commit = 1;
     */
    commit: string;
    /**
     * @generated from field: int32 port = 2;
     */
    port: number;
    /**
     * @generated from field: string connection_token = 3;
     */
    connectionToken: string;
};
/**
 * Describes the message agent.v1.WarmRemoteAccessServerRequest.
 * Use `create(WarmRemoteAccessServerRequestSchema)` to create a new message.
 */
export declare const WarmRemoteAccessServerRequestSchema: GenMessage<WarmRemoteAccessServerRequest>;
/**
 * Empty response - success is implied by RPC completion
 *
 * @generated from message agent.v1.WarmRemoteAccessServerResponse
 */
export type WarmRemoteAccessServerResponse = Message<"agent.v1.WarmRemoteAccessServerResponse"> & {};
/**
 * Describes the message agent.v1.WarmRemoteAccessServerResponse.
 * Use `create(WarmRemoteAccessServerResponseSchema)` to create a new message.
 */
export declare const WarmRemoteAccessServerResponseSchema: GenMessage<WarmRemoteAccessServerResponse>;
/**
 * @generated from message agent.v1.ListArtifactsRequest
 */
export type ListArtifactsRequest = Message<"agent.v1.ListArtifactsRequest"> & {};
/**
 * Describes the message agent.v1.ListArtifactsRequest.
 * Use `create(ListArtifactsRequestSchema)` to create a new message.
 */
export declare const ListArtifactsRequestSchema: GenMessage<ListArtifactsRequest>;
/**
 * @generated from message agent.v1.ArtifactUploadMetadata
 */
export type ArtifactUploadMetadata = Message<"agent.v1.ArtifactUploadMetadata"> & {
    /**
     * @generated from field: string absolute_path = 1;
     */
    absolutePath: string;
    /**
     * @generated from field: uint64 size_bytes = 2;
     */
    sizeBytes: bigint;
    /**
     * @generated from field: int64 updated_at_unix_ms = 3;
     */
    updatedAtUnixMs: bigint;
    /**
     * @generated from field: int32 status = 4;
     */
    status: number;
    /**
     * @generated from field: uint64 bytes_uploaded = 5;
     */
    bytesUploaded: bigint;
    /**
     * @generated from field: string last_error = 6;
     */
    lastError: string;
    /**
     * @generated from field: uint32 upload_attempts = 7;
     */
    uploadAttempts: number;
    /**
     * @generated from field: int64 last_started_at_unix_ms = 8;
     */
    lastStartedAtUnixMs: bigint;
    /**
     * @generated from field: int64 last_finished_at_unix_ms = 9;
     */
    lastFinishedAtUnixMs: bigint;
    /**
     * @generated from field: string upload_id = 10;
     */
    uploadId: string;
};
/**
 * Describes the message agent.v1.ArtifactUploadMetadata.
 * Use `create(ArtifactUploadMetadataSchema)` to create a new message.
 */
export declare const ArtifactUploadMetadataSchema: GenMessage<ArtifactUploadMetadata>;
/**
 * @generated from message agent.v1.ListArtifactsResponse
 */
export type ListArtifactsResponse = Message<"agent.v1.ListArtifactsResponse"> & {
    /**
     * @generated from field: repeated agent.v1.ArtifactUploadMetadata artifacts = 1;
     */
    artifacts: ArtifactUploadMetadata[];
};
/**
 * Describes the message agent.v1.ListArtifactsResponse.
 * Use `create(ListArtifactsResponseSchema)` to create a new message.
 */
export declare const ListArtifactsResponseSchema: GenMessage<ListArtifactsResponse>;
/**
 * @generated from message agent.v1.UploadArtifactsRequest
 */
export type UploadArtifactsRequest = Message<"agent.v1.UploadArtifactsRequest"> & {
    /**
     * @generated from field: repeated agent.v1.ArtifactUploadInstruction uploads = 1;
     */
    uploads: ArtifactUploadInstruction[];
};
/**
 * Describes the message agent.v1.UploadArtifactsRequest.
 * Use `create(UploadArtifactsRequestSchema)` to create a new message.
 */
export declare const UploadArtifactsRequestSchema: GenMessage<UploadArtifactsRequest>;
/**
 * @generated from message agent.v1.ArtifactUploadInstruction
 */
export type ArtifactUploadInstruction = Message<"agent.v1.ArtifactUploadInstruction"> & {
    /**
     * @generated from field: string absolute_path = 1;
     */
    absolutePath: string;
    /**
     * @generated from field: string upload_url = 2;
     */
    uploadUrl: string;
    /**
     * @generated from field: string method = 3;
     */
    method: string;
    /**
     * @generated from field: map<string, string> headers = 4;
     */
    headers: {
        [key: string]: string;
    };
    /**
     * @generated from field: optional string content_type = 5;
     */
    contentType?: string | undefined;
    /**
     * @generated from field: optional string slack_upload_url = 6;
     */
    slackUploadUrl?: string | undefined;
    /**
     * @generated from field: optional string slack_file_id = 7;
     */
    slackFileId?: string | undefined;
};
/**
 * Describes the message agent.v1.ArtifactUploadInstruction.
 * Use `create(ArtifactUploadInstructionSchema)` to create a new message.
 */
export declare const ArtifactUploadInstructionSchema: GenMessage<ArtifactUploadInstruction>;
/**
 * @generated from message agent.v1.ArtifactUploadDispatchResult
 */
export type ArtifactUploadDispatchResult = Message<"agent.v1.ArtifactUploadDispatchResult"> & {
    /**
     * @generated from field: string absolute_path = 1;
     */
    absolutePath: string;
    /**
     * @generated from field: int32 status = 2;
     */
    status: number;
    /**
     * @generated from field: string message = 3;
     */
    message: string;
    /**
     * @generated from field: optional string slack_file_id = 4;
     */
    slackFileId?: string | undefined;
};
/**
 * Describes the message agent.v1.ArtifactUploadDispatchResult.
 * Use `create(ArtifactUploadDispatchResultSchema)` to create a new message.
 */
export declare const ArtifactUploadDispatchResultSchema: GenMessage<ArtifactUploadDispatchResult>;
/**
 * @generated from message agent.v1.UploadArtifactsResponse
 */
export type UploadArtifactsResponse = Message<"agent.v1.UploadArtifactsResponse"> & {
    /**
     * @generated from field: repeated agent.v1.ArtifactUploadDispatchResult results = 1;
     */
    results: ArtifactUploadDispatchResult[];
};
/**
 * Describes the message agent.v1.UploadArtifactsResponse.
 * Use `create(UploadArtifactsResponseSchema)` to create a new message.
 */
export declare const UploadArtifactsResponseSchema: GenMessage<UploadArtifactsResponse>;
/**
 * @generated from message agent.v1.GetMcpRefreshTokensRequest
 */
export type GetMcpRefreshTokensRequest = Message<"agent.v1.GetMcpRefreshTokensRequest"> & {};
/**
 * Describes the message agent.v1.GetMcpRefreshTokensRequest.
 * Use `create(GetMcpRefreshTokensRequestSchema)` to create a new message.
 */
export declare const GetMcpRefreshTokensRequestSchema: GenMessage<GetMcpRefreshTokensRequest>;
/**
 * @generated from message agent.v1.GetMcpRefreshTokensResponse
 */
export type GetMcpRefreshTokensResponse = Message<"agent.v1.GetMcpRefreshTokensResponse"> & {
    /**
     * Map from server URL to refresh token
     *
     * @generated from field: map<string, string> refresh_tokens = 1;
     */
    refreshTokens: {
        [key: string]: string;
    };
};
/**
 * Describes the message agent.v1.GetMcpRefreshTokensResponse.
 * Use `create(GetMcpRefreshTokensResponseSchema)` to create a new message.
 */
export declare const GetMcpRefreshTokensResponseSchema: GenMessage<GetMcpRefreshTokensResponse>;
/**
 * @generated from message agent.v1.UpdateEnvironmentVariablesRequest
 */
export type UpdateEnvironmentVariablesRequest = Message<"agent.v1.UpdateEnvironmentVariablesRequest"> & {
    /**
     * Environment variables to manage (plaintext values).
     *
     * @generated from field: map<string, string> env = 1;
     */
    env: {
        [key: string]: string;
    };
    /**
     * If true, unset previously-managed keys that are not present in `env`.
     *
     * @generated from field: bool replace = 2;
     */
    replace: boolean;
};
/**
 * Describes the message agent.v1.UpdateEnvironmentVariablesRequest.
 * Use `create(UpdateEnvironmentVariablesRequestSchema)` to create a new message.
 */
export declare const UpdateEnvironmentVariablesRequestSchema: GenMessage<UpdateEnvironmentVariablesRequest>;
/**
 * @generated from message agent.v1.UpdateEnvironmentVariablesResponse
 */
export type UpdateEnvironmentVariablesResponse = Message<"agent.v1.UpdateEnvironmentVariablesResponse"> & {
    /**
     * @generated from field: uint32 applied = 1;
     */
    applied: number;
    /**
     * @generated from field: uint32 removed = 2;
     */
    removed: number;
};
/**
 * Describes the message agent.v1.UpdateEnvironmentVariablesResponse.
 * Use `create(UpdateEnvironmentVariablesResponseSchema)` to create a new message.
 */
export declare const UpdateEnvironmentVariablesResponseSchema: GenMessage<UpdateEnvironmentVariablesResponse>;
/**
 * Check if an error is caused by the client disconnecting (e.g., due to timeout or abort). This includes errors like ERR_STREAM_DESTROYED which occur when the HTTP response stream is closed by the client while the server is still writing to it. function isClientDisconnectError(error) { if (!(error instanceof Error)) { return false; const code = error.code; return (code === "ERR_STREAM_DESTROYED" || code === "ERR_STREAM_PREMATURE_CLOSE" || code === "ECONNRESET" || code === "EPIPE"); ;// ../proto/dist/generated/aiserver/v1/mcp_pb.js // @ts-nocheck
 *
 * @generated from message agent.v1.McpOAuthStoredData
 */
export type McpOAuthStoredData = Message<"agent.v1.McpOAuthStoredData"> & {
    /**
     * @generated from field: string refresh_token = 1;
     */
    refreshToken: string;
    /**
     * @generated from field: string client_id = 2;
     */
    clientId: string;
    /**
     * @generated from field: optional string client_secret = 3;
     */
    clientSecret?: string | undefined;
    /**
     * @generated from field: repeated string redirect_uris = 4;
     */
    redirectUris: string[];
};
/**
 * Describes the message agent.v1.McpOAuthStoredData.
 * Use `create(McpOAuthStoredDataSchema)` to create a new message.
 */
export declare const McpOAuthStoredDataSchema: GenMessage<McpOAuthStoredData>;
/**
 * @generated from message agent.v1.Frame
 */
export type Frame = Message<"agent.v1.Frame"> & {
    /**
     * Correlation ID
     *
     * @generated from field: string id = 1;
     */
    id: string;
    /**
     * RPC method (e.g., "/agent.v1.ControlService/Ping")
     *
     * @generated from field: string method = 2;
     */
    method: string;
    /**
     * Serialized payload
     *
     * @generated from field: bytes data = 3;
     */
    data: Uint8Array;
    /**
     * @generated from field: int32 kind = 4;
     */
    kind: number;
    /**
     * Error message (kind == ERROR)
     *
     * @generated from field: string error = 5;
     */
    error: string;
};
/**
 * Describes the message agent.v1.Frame.
 * Use `create(FrameSchema)` to create a new message.
 */
export declare const FrameSchema: GenMessage<Frame>;
/**
 * var Frame_Kind; (function (Frame_Kind) { Frame_Kind[Frame_Kind["UNSPECIFIED"] = 0] = "UNSPECIFIED"; Frame_Kind[Frame_Kind["REQUEST"] = 1] = "REQUEST"; Frame_Kind[Frame_Kind["RESPONSE"] = 2] = "RESPONSE"; Frame_Kind[Frame_Kind["ERROR"] = 3] = "ERROR"; })(Frame_Kind || (Frame_Kind = {})); // Retrieve enum metadata with: proto3.getEnumType(Frame_Kind) proto3/* int32 *\/.C.util.setEnumType(Frame_Kind, "agent.v1.Frame.Kind", [ { no: 0, name: "KIND_UNSPECIFIED" }, { no: 1, name: "KIND_REQUEST" }, { no: 2, name: "KIND_RESPONSE" }, { no: 3, name: "KIND_ERROR" }, ]);
 *
 * @generated from message agent.v1.Empty
 */
export type Empty = Message<"agent.v1.Empty"> & {};
/**
 * Describes the message agent.v1.Empty.
 * Use `create(EmptySchema)` to create a new message.
 */
export declare const EmptySchema: GenMessage<Empty>;
/**
 * @generated from message agent.v1.BidiRequestId
 */
export type BidiRequestId = Message<"agent.v1.BidiRequestId"> & {
    /**
     * @generated from field: string request_id = 1;
     */
    requestId: string;
};
/**
 * Describes the message agent.v1.BidiRequestId.
 * Use `create(BidiRequestIdSchema)` to create a new message.
 */
export declare const BidiRequestIdSchema: GenMessage<BidiRequestId>;
/**
 * @generated from message agent.v1.PiTruncation
 */
export type PiTruncation = Message<"agent.v1.PiTruncation"> & {
    /**
     * @generated from field: bool truncated = 1;
     */
    truncated: boolean;
    /**
     * @generated from field: string truncated_by = 2;
     */
    truncatedBy: string;
    /**
     * @generated from field: uint32 total_lines = 3;
     */
    totalLines: number;
    /**
     * @generated from field: uint32 output_lines = 4;
     */
    outputLines: number;
    /**
     * @generated from field: uint32 output_bytes = 5;
     */
    outputBytes: number;
    /**
     * @generated from field: optional uint32 max_lines = 6;
     */
    maxLines?: number | undefined;
    /**
     * @generated from field: optional uint32 max_bytes = 7;
     */
    maxBytes?: number | undefined;
    /**
     * @generated from field: bool first_line_exceeds_limit = 8;
     */
    firstLineExceedsLimit: boolean;
    /**
     * @generated from field: bool last_line_partial = 9;
     */
    lastLinePartial: boolean;
};
/**
 * Describes the message agent.v1.PiTruncation.
 * Use `create(PiTruncationSchema)` to create a new message.
 */
export declare const PiTruncationSchema: GenMessage<PiTruncation>;
/**
 * @generated from message agent.v1.PiEditReplacement
 */
export type PiEditReplacement = Message<"agent.v1.PiEditReplacement"> & {
    /**
     * @generated from field: string old_text = 1;
     */
    oldText: string;
    /**
     * @generated from field: string new_text = 2;
     */
    newText: string;
};
/**
 * Describes the message agent.v1.PiEditReplacement.
 * Use `create(PiEditReplacementSchema)` to create a new message.
 */
export declare const PiEditReplacementSchema: GenMessage<PiEditReplacement>;
/**
 * @generated from message agent.v1.PiReadExecArgs
 */
export type PiReadExecArgs = Message<"agent.v1.PiReadExecArgs"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: optional int32 offset = 2;
     */
    offset?: number | undefined;
    /**
     * @generated from field: optional int32 limit = 3;
     */
    limit?: number | undefined;
};
/**
 * Describes the message agent.v1.PiReadExecArgs.
 * Use `create(PiReadExecArgsSchema)` to create a new message.
 */
export declare const PiReadExecArgsSchema: GenMessage<PiReadExecArgs>;
/**
 * @generated from message agent.v1.PiReadExecSuccess
 */
export type PiReadExecSuccess = Message<"agent.v1.PiReadExecSuccess"> & {
    /**
     * @generated from field: string output = 1;
     */
    output: string;
    /**
     * @generated from field: optional agent.v1.PiTruncation truncation = 2;
     */
    truncation?: PiTruncation | undefined;
};
/**
 * Describes the message agent.v1.PiReadExecSuccess.
 * Use `create(PiReadExecSuccessSchema)` to create a new message.
 */
export declare const PiReadExecSuccessSchema: GenMessage<PiReadExecSuccess>;
/**
 * @generated from message agent.v1.PiReadExecError
 */
export type PiReadExecError = Message<"agent.v1.PiReadExecError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.PiReadExecError.
 * Use `create(PiReadExecErrorSchema)` to create a new message.
 */
export declare const PiReadExecErrorSchema: GenMessage<PiReadExecError>;
/**
 * @generated from message agent.v1.PiReadExecResult
 */
export type PiReadExecResult = Message<"agent.v1.PiReadExecResult"> & {
    /**
     * @generated from oneof agent.v1.PiReadExecResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.PiReadExecSuccess success = 1;
         */
        value: PiReadExecSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.PiReadExecError error = 2;
         */
        value: PiReadExecError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.PiReadExecResult.
 * Use `create(PiReadExecResultSchema)` to create a new message.
 */
export declare const PiReadExecResultSchema: GenMessage<PiReadExecResult>;
/**
 * @generated from message agent.v1.PiBashExecArgs
 */
export type PiBashExecArgs = Message<"agent.v1.PiBashExecArgs"> & {
    /**
     * @generated from field: string command = 1;
     */
    command: string;
    /**
     * @generated from field: optional double timeout = 2;
     */
    timeout?: number | undefined;
};
/**
 * Describes the message agent.v1.PiBashExecArgs.
 * Use `create(PiBashExecArgsSchema)` to create a new message.
 */
export declare const PiBashExecArgsSchema: GenMessage<PiBashExecArgs>;
/**
 * @generated from message agent.v1.PiBashExecSuccess
 */
export type PiBashExecSuccess = Message<"agent.v1.PiBashExecSuccess"> & {
    /**
     * @generated from field: string output = 1;
     */
    output: string;
    /**
     * @generated from field: optional agent.v1.PiTruncation truncation = 2;
     */
    truncation?: PiTruncation | undefined;
    /**
     * @generated from field: optional string full_output_path = 3;
     */
    fullOutputPath?: string | undefined;
};
/**
 * Describes the message agent.v1.PiBashExecSuccess.
 * Use `create(PiBashExecSuccessSchema)` to create a new message.
 */
export declare const PiBashExecSuccessSchema: GenMessage<PiBashExecSuccess>;
/**
 * @generated from message agent.v1.PiBashExecError
 */
export type PiBashExecError = Message<"agent.v1.PiBashExecError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
    /**
     * @generated from field: optional agent.v1.PiTruncation truncation = 2;
     */
    truncation?: PiTruncation | undefined;
    /**
     * @generated from field: optional string full_output_path = 3;
     */
    fullOutputPath?: string | undefined;
};
/**
 * Describes the message agent.v1.PiBashExecError.
 * Use `create(PiBashExecErrorSchema)` to create a new message.
 */
export declare const PiBashExecErrorSchema: GenMessage<PiBashExecError>;
/**
 * @generated from message agent.v1.PiBashExecResult
 */
export type PiBashExecResult = Message<"agent.v1.PiBashExecResult"> & {
    /**
     * @generated from oneof agent.v1.PiBashExecResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.PiBashExecSuccess success = 1;
         */
        value: PiBashExecSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.PiBashExecError error = 2;
         */
        value: PiBashExecError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.PiBashExecResult.
 * Use `create(PiBashExecResultSchema)` to create a new message.
 */
export declare const PiBashExecResultSchema: GenMessage<PiBashExecResult>;
/**
 * @generated from message agent.v1.PiEditExecArgs
 */
export type PiEditExecArgs = Message<"agent.v1.PiEditExecArgs"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: repeated agent.v1.PiEditReplacement edits = 2;
     */
    edits: PiEditReplacement[];
};
/**
 * Describes the message agent.v1.PiEditExecArgs.
 * Use `create(PiEditExecArgsSchema)` to create a new message.
 */
export declare const PiEditExecArgsSchema: GenMessage<PiEditExecArgs>;
/**
 * @generated from message agent.v1.PiEditExecSuccess
 */
export type PiEditExecSuccess = Message<"agent.v1.PiEditExecSuccess"> & {
    /**
     * @generated from field: string output = 1;
     */
    output: string;
    /**
     * @generated from field: string diff = 2;
     */
    diff: string;
    /**
     * @generated from field: string patch = 3;
     */
    patch: string;
    /**
     * @generated from field: optional uint32 first_changed_line = 4;
     */
    firstChangedLine?: number | undefined;
};
/**
 * Describes the message agent.v1.PiEditExecSuccess.
 * Use `create(PiEditExecSuccessSchema)` to create a new message.
 */
export declare const PiEditExecSuccessSchema: GenMessage<PiEditExecSuccess>;
/**
 * @generated from message agent.v1.PiEditExecError
 */
export type PiEditExecError = Message<"agent.v1.PiEditExecError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.PiEditExecError.
 * Use `create(PiEditExecErrorSchema)` to create a new message.
 */
export declare const PiEditExecErrorSchema: GenMessage<PiEditExecError>;
/**
 * @generated from message agent.v1.PiEditExecRejected
 */
export type PiEditExecRejected = Message<"agent.v1.PiEditExecRejected"> & {
    /**
     * @generated from field: string reason = 1;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.PiEditExecRejected.
 * Use `create(PiEditExecRejectedSchema)` to create a new message.
 */
export declare const PiEditExecRejectedSchema: GenMessage<PiEditExecRejected>;
/**
 * @generated from message agent.v1.PiEditExecResult
 */
export type PiEditExecResult = Message<"agent.v1.PiEditExecResult"> & {
    /**
     * @generated from oneof agent.v1.PiEditExecResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.PiEditExecSuccess success = 1;
         */
        value: PiEditExecSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.PiEditExecError error = 2;
         */
        value: PiEditExecError;
        case: "error";
    } | {
        /**
         * @generated from field: agent.v1.PiEditExecRejected rejected = 3;
         */
        value: PiEditExecRejected;
        case: "rejected";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.PiEditExecResult.
 * Use `create(PiEditExecResultSchema)` to create a new message.
 */
export declare const PiEditExecResultSchema: GenMessage<PiEditExecResult>;
/**
 * @generated from message agent.v1.PiWriteExecArgs
 */
export type PiWriteExecArgs = Message<"agent.v1.PiWriteExecArgs"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string content = 2;
     */
    content: string;
};
/**
 * Describes the message agent.v1.PiWriteExecArgs.
 * Use `create(PiWriteExecArgsSchema)` to create a new message.
 */
export declare const PiWriteExecArgsSchema: GenMessage<PiWriteExecArgs>;
/**
 * @generated from message agent.v1.PiWriteExecSuccess
 */
export type PiWriteExecSuccess = Message<"agent.v1.PiWriteExecSuccess"> & {
    /**
     * @generated from field: string output = 1;
     */
    output: string;
};
/**
 * Describes the message agent.v1.PiWriteExecSuccess.
 * Use `create(PiWriteExecSuccessSchema)` to create a new message.
 */
export declare const PiWriteExecSuccessSchema: GenMessage<PiWriteExecSuccess>;
/**
 * @generated from message agent.v1.PiWriteExecError
 */
export type PiWriteExecError = Message<"agent.v1.PiWriteExecError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.PiWriteExecError.
 * Use `create(PiWriteExecErrorSchema)` to create a new message.
 */
export declare const PiWriteExecErrorSchema: GenMessage<PiWriteExecError>;
/**
 * @generated from message agent.v1.PiWriteExecRejected
 */
export type PiWriteExecRejected = Message<"agent.v1.PiWriteExecRejected"> & {
    /**
     * @generated from field: string reason = 1;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.PiWriteExecRejected.
 * Use `create(PiWriteExecRejectedSchema)` to create a new message.
 */
export declare const PiWriteExecRejectedSchema: GenMessage<PiWriteExecRejected>;
/**
 * @generated from message agent.v1.PiWriteExecResult
 */
export type PiWriteExecResult = Message<"agent.v1.PiWriteExecResult"> & {
    /**
     * @generated from oneof agent.v1.PiWriteExecResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.PiWriteExecSuccess success = 1;
         */
        value: PiWriteExecSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.PiWriteExecError error = 2;
         */
        value: PiWriteExecError;
        case: "error";
    } | {
        /**
         * @generated from field: agent.v1.PiWriteExecRejected rejected = 3;
         */
        value: PiWriteExecRejected;
        case: "rejected";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.PiWriteExecResult.
 * Use `create(PiWriteExecResultSchema)` to create a new message.
 */
export declare const PiWriteExecResultSchema: GenMessage<PiWriteExecResult>;
/**
 * @generated from message agent.v1.PiGrepExecArgs
 */
export type PiGrepExecArgs = Message<"agent.v1.PiGrepExecArgs"> & {
    /**
     * @generated from field: string pattern = 1;
     */
    pattern: string;
    /**
     * @generated from field: optional string path = 2;
     */
    path?: string | undefined;
    /**
     * @generated from field: optional string glob = 3;
     */
    glob?: string | undefined;
    /**
     * @generated from field: optional bool ignore_case = 4;
     */
    ignoreCase?: boolean | undefined;
    /**
     * @generated from field: optional bool literal = 5;
     */
    literal?: boolean | undefined;
    /**
     * @generated from field: optional int32 context = 6;
     */
    context?: number | undefined;
    /**
     * @generated from field: optional int32 limit = 7;
     */
    limit?: number | undefined;
};
/**
 * Describes the message agent.v1.PiGrepExecArgs.
 * Use `create(PiGrepExecArgsSchema)` to create a new message.
 */
export declare const PiGrepExecArgsSchema: GenMessage<PiGrepExecArgs>;
/**
 * @generated from message agent.v1.PiGrepExecSuccess
 */
export type PiGrepExecSuccess = Message<"agent.v1.PiGrepExecSuccess"> & {
    /**
     * @generated from field: string output = 1;
     */
    output: string;
    /**
     * @generated from field: optional agent.v1.PiTruncation truncation = 2;
     */
    truncation?: PiTruncation | undefined;
    /**
     * @generated from field: optional uint32 match_limit_reached = 3;
     */
    matchLimitReached?: number | undefined;
    /**
     * @generated from field: bool lines_truncated = 4;
     */
    linesTruncated: boolean;
};
/**
 * Describes the message agent.v1.PiGrepExecSuccess.
 * Use `create(PiGrepExecSuccessSchema)` to create a new message.
 */
export declare const PiGrepExecSuccessSchema: GenMessage<PiGrepExecSuccess>;
/**
 * @generated from message agent.v1.PiGrepExecError
 */
export type PiGrepExecError = Message<"agent.v1.PiGrepExecError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.PiGrepExecError.
 * Use `create(PiGrepExecErrorSchema)` to create a new message.
 */
export declare const PiGrepExecErrorSchema: GenMessage<PiGrepExecError>;
/**
 * @generated from message agent.v1.PiGrepExecResult
 */
export type PiGrepExecResult = Message<"agent.v1.PiGrepExecResult"> & {
    /**
     * @generated from oneof agent.v1.PiGrepExecResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.PiGrepExecSuccess success = 1;
         */
        value: PiGrepExecSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.PiGrepExecError error = 2;
         */
        value: PiGrepExecError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.PiGrepExecResult.
 * Use `create(PiGrepExecResultSchema)` to create a new message.
 */
export declare const PiGrepExecResultSchema: GenMessage<PiGrepExecResult>;
/**
 * @generated from message agent.v1.PiFindExecArgs
 */
export type PiFindExecArgs = Message<"agent.v1.PiFindExecArgs"> & {
    /**
     * @generated from field: string pattern = 1;
     */
    pattern: string;
    /**
     * @generated from field: optional string path = 2;
     */
    path?: string | undefined;
    /**
     * @generated from field: optional int32 limit = 3;
     */
    limit?: number | undefined;
};
/**
 * Describes the message agent.v1.PiFindExecArgs.
 * Use `create(PiFindExecArgsSchema)` to create a new message.
 */
export declare const PiFindExecArgsSchema: GenMessage<PiFindExecArgs>;
/**
 * @generated from message agent.v1.PiFindExecSuccess
 */
export type PiFindExecSuccess = Message<"agent.v1.PiFindExecSuccess"> & {
    /**
     * @generated from field: string output = 1;
     */
    output: string;
    /**
     * @generated from field: optional agent.v1.PiTruncation truncation = 2;
     */
    truncation?: PiTruncation | undefined;
    /**
     * @generated from field: optional uint32 result_limit_reached = 3;
     */
    resultLimitReached?: number | undefined;
};
/**
 * Describes the message agent.v1.PiFindExecSuccess.
 * Use `create(PiFindExecSuccessSchema)` to create a new message.
 */
export declare const PiFindExecSuccessSchema: GenMessage<PiFindExecSuccess>;
/**
 * @generated from message agent.v1.PiFindExecError
 */
export type PiFindExecError = Message<"agent.v1.PiFindExecError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.PiFindExecError.
 * Use `create(PiFindExecErrorSchema)` to create a new message.
 */
export declare const PiFindExecErrorSchema: GenMessage<PiFindExecError>;
/**
 * @generated from message agent.v1.PiFindExecResult
 */
export type PiFindExecResult = Message<"agent.v1.PiFindExecResult"> & {
    /**
     * @generated from oneof agent.v1.PiFindExecResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.PiFindExecSuccess success = 1;
         */
        value: PiFindExecSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.PiFindExecError error = 2;
         */
        value: PiFindExecError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.PiFindExecResult.
 * Use `create(PiFindExecResultSchema)` to create a new message.
 */
export declare const PiFindExecResultSchema: GenMessage<PiFindExecResult>;
/**
 * @generated from message agent.v1.PiLsExecArgs
 */
export type PiLsExecArgs = Message<"agent.v1.PiLsExecArgs"> & {
    /**
     * @generated from field: optional string path = 1;
     */
    path?: string | undefined;
    /**
     * @generated from field: optional int32 limit = 2;
     */
    limit?: number | undefined;
};
/**
 * Describes the message agent.v1.PiLsExecArgs.
 * Use `create(PiLsExecArgsSchema)` to create a new message.
 */
export declare const PiLsExecArgsSchema: GenMessage<PiLsExecArgs>;
/**
 * @generated from message agent.v1.PiLsExecSuccess
 */
export type PiLsExecSuccess = Message<"agent.v1.PiLsExecSuccess"> & {
    /**
     * @generated from field: string output = 1;
     */
    output: string;
    /**
     * @generated from field: optional agent.v1.PiTruncation truncation = 2;
     */
    truncation?: PiTruncation | undefined;
    /**
     * @generated from field: optional uint32 entry_limit_reached = 3;
     */
    entryLimitReached?: number | undefined;
};
/**
 * Describes the message agent.v1.PiLsExecSuccess.
 * Use `create(PiLsExecSuccessSchema)` to create a new message.
 */
export declare const PiLsExecSuccessSchema: GenMessage<PiLsExecSuccess>;
/**
 * @generated from message agent.v1.PiLsExecError
 */
export type PiLsExecError = Message<"agent.v1.PiLsExecError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.PiLsExecError.
 * Use `create(PiLsExecErrorSchema)` to create a new message.
 */
export declare const PiLsExecErrorSchema: GenMessage<PiLsExecError>;
/**
 * @generated from message agent.v1.PiLsExecResult
 */
export type PiLsExecResult = Message<"agent.v1.PiLsExecResult"> & {
    /**
     * @generated from oneof agent.v1.PiLsExecResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.PiLsExecSuccess success = 1;
         */
        value: PiLsExecSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.PiLsExecError error = 2;
         */
        value: PiLsExecError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.PiLsExecResult.
 * Use `create(PiLsExecResultSchema)` to create a new message.
 */
export declare const PiLsExecResultSchema: GenMessage<PiLsExecResult>;
/**
 * @generated from message agent.v1.McpServerNotFound
 */
export type McpServerNotFound = Message<"agent.v1.McpServerNotFound"> & {
    /**
     * @generated from field: string name = 1;
     */
    name: string;
    /**
     * @generated from field: repeated string available_servers = 2;
     */
    availableServers: string[];
};
/**
 * Describes the message agent.v1.McpServerNotFound.
 * Use `create(McpServerNotFoundSchema)` to create a new message.
 */
export declare const McpServerNotFoundSchema: GenMessage<McpServerNotFound>;
/**
 * @generated from message agent.v1.McpApproved
 */
export type McpApproved = Message<"agent.v1.McpApproved"> & {};
/**
 * Describes the message agent.v1.McpApproved.
 * Use `create(McpApprovedSchema)` to create a new message.
 */
export declare const McpApprovedSchema: GenMessage<McpApproved>;
/**
 * @generated from message agent.v1.McpStateExecArgs
 */
export type McpStateExecArgs = Message<"agent.v1.McpStateExecArgs"> & {
    /**
     * @generated from field: repeated string server_identifiers = 1;
     */
    serverIdentifiers: string[];
    /**
     * @generated from field: bool kick_only = 2;
     */
    kickOnly: boolean;
};
/**
 * Describes the message agent.v1.McpStateExecArgs.
 * Use `create(McpStateExecArgsSchema)` to create a new message.
 */
export declare const McpStateExecArgsSchema: GenMessage<McpStateExecArgs>;
/**
 * @generated from message agent.v1.McpStateServer
 */
export type McpStateServer = Message<"agent.v1.McpStateServer"> & {
    /**
     * @generated from field: string server_name = 1;
     */
    serverName: string;
    /**
     * @generated from field: string server_identifier = 2;
     */
    serverIdentifier: string;
    /**
     * @generated from field: optional string plugin = 3;
     */
    plugin?: string | undefined;
    /**
     * @generated from field: optional string marketplace = 4;
     */
    marketplace?: string | undefined;
    /**
     * @generated from field: repeated agent.v1.McpToolDefinition tools = 5;
     */
    tools: McpToolDefinition[];
    /**
     * @generated from field: repeated agent.v1.McpInstructions instructions = 6;
     */
    instructions: McpInstructions[];
    /**
     * @generated from field: optional string status = 7;
     */
    status?: string | undefined;
};
/**
 * Describes the message agent.v1.McpStateServer.
 * Use `create(McpStateServerSchema)` to create a new message.
 */
export declare const McpStateServerSchema: GenMessage<McpStateServer>;
/**
 * @generated from message agent.v1.McpStateSuccess
 */
export type McpStateSuccess = Message<"agent.v1.McpStateSuccess"> & {
    /**
     * @generated from field: repeated agent.v1.McpStateServer servers = 1;
     */
    servers: McpStateServer[];
};
/**
 * Describes the message agent.v1.McpStateSuccess.
 * Use `create(McpStateSuccessSchema)` to create a new message.
 */
export declare const McpStateSuccessSchema: GenMessage<McpStateSuccess>;
/**
 * @generated from message agent.v1.McpStateError
 */
export type McpStateError = Message<"agent.v1.McpStateError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.McpStateError.
 * Use `create(McpStateErrorSchema)` to create a new message.
 */
export declare const McpStateErrorSchema: GenMessage<McpStateError>;
/**
 * @generated from message agent.v1.McpStateRejected
 */
export type McpStateRejected = Message<"agent.v1.McpStateRejected"> & {
    /**
     * @generated from field: string reason = 1;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.McpStateRejected.
 * Use `create(McpStateRejectedSchema)` to create a new message.
 */
export declare const McpStateRejectedSchema: GenMessage<McpStateRejected>;
/**
 * @generated from message agent.v1.McpStateExecResult
 */
export type McpStateExecResult = Message<"agent.v1.McpStateExecResult"> & {
    /**
     * @generated from oneof agent.v1.McpStateExecResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.McpStateSuccess success = 1;
         */
        value: McpStateSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.McpStateError error = 2;
         */
        value: McpStateError;
        case: "error";
    } | {
        /**
         * @generated from field: agent.v1.McpStateRejected rejected = 3;
         */
        value: McpStateRejected;
        case: "rejected";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.McpStateExecResult.
 * Use `create(McpStateExecResultSchema)` to create a new message.
 */
export declare const McpStateExecResultSchema: GenMessage<McpStateExecResult>;
/**
 * @generated from message agent.v1.CommandClassifierResult_ClassifiedCommand
 */
export type CommandClassifierResult_ClassifiedCommand = Message<"agent.v1.CommandClassifierResult_ClassifiedCommand"> & {
    /**
     * @generated from field: string name = 1;
     */
    name: string;
    /**
     * @generated from field: repeated string arguments = 2;
     */
    arguments: string[];
    /**
     * @generated from field: optional string suggested_allowlist_entry = 3;
     */
    suggestedAllowlistEntry?: string | undefined;
    /**
     * @generated from field: repeated string subcommand_tokens = 4;
     */
    subcommandTokens: string[];
};
/**
 * Describes the message agent.v1.CommandClassifierResult_ClassifiedCommand.
 * Use `create(CommandClassifierResult_ClassifiedCommandSchema)` to create a new message.
 */
export declare const CommandClassifierResult_ClassifiedCommandSchema: GenMessage<CommandClassifierResult_ClassifiedCommand>;
/**
 * @generated from message agent.v1.CommandClassifierResult
 */
export type CommandClassifierResult = Message<"agent.v1.CommandClassifierResult"> & {
    /**
     * @generated from field: repeated agent.v1.CommandClassifierResult_ClassifiedCommand commands = 1;
     */
    commands: CommandClassifierResult_ClassifiedCommand[];
    /**
     * @generated from field: agent.v1.CommandClassifierResult_SuggestedSandboxMode suggested_sandbox_mode = 2;
     */
    suggestedSandboxMode: CommandClassifierResult_SuggestedSandboxMode;
    /**
     * @generated from field: bool classification_failed = 3;
     */
    classificationFailed: boolean;
};
/**
 * Describes the message agent.v1.CommandClassifierResult.
 * Use `create(CommandClassifierResultSchema)` to create a new message.
 */
export declare const CommandClassifierResultSchema: GenMessage<CommandClassifierResult>;
/**
 * @generated from message agent.v1.ShellCommandParsingResult_Redirect
 */
export type ShellCommandParsingResult_Redirect = Message<"agent.v1.ShellCommandParsingResult_Redirect"> & {
    /**
     * @generated from field: string operator = 1;
     */
    operator: string;
    /**
     * @generated from field: repeated uint32 destination_fds = 2;
     */
    destinationFds: number[];
    /**
     * @generated from field: string target_node_type = 3;
     */
    targetNodeType: string;
    /**
     * @generated from field: optional string target_text = 4;
     */
    targetText?: string | undefined;
};
/**
 * Describes the message agent.v1.ShellCommandParsingResult_Redirect.
 * Use `create(ShellCommandParsingResult_RedirectSchema)` to create a new message.
 */
export declare const ShellCommandParsingResult_RedirectSchema: GenMessage<ShellCommandParsingResult_Redirect>;
/**
 * @generated from message agent.v1.ShellAllowlistPrecheckArgs
 */
export type ShellAllowlistPrecheckArgs = Message<"agent.v1.ShellAllowlistPrecheckArgs"> & {
    /**
     * @generated from field: string command = 1;
     */
    command: string;
    /**
     * @generated from field: string working_directory = 2;
     */
    workingDirectory: string;
    /**
     * @generated from field: agent.v1.ShellCommandParsingResult parsing_result = 3;
     */
    parsingResult?: ShellCommandParsingResult | undefined;
    /**
     * @generated from field: optional agent.v1.CommandClassifierResult classifier_result = 4;
     */
    classifierResult?: CommandClassifierResult | undefined;
    /**
     * @generated from field: optional string tool_call_id = 5;
     */
    toolCallId?: string | undefined;
};
/**
 * Describes the message agent.v1.ShellAllowlistPrecheckArgs.
 * Use `create(ShellAllowlistPrecheckArgsSchema)` to create a new message.
 */
export declare const ShellAllowlistPrecheckArgsSchema: GenMessage<ShellAllowlistPrecheckArgs>;
/**
 * @generated from message agent.v1.ShellAllowlistPrecheckResult
 */
export type ShellAllowlistPrecheckResult = Message<"agent.v1.ShellAllowlistPrecheckResult"> & {
    /**
     * @generated from field: bool allowlisted = 1;
     */
    allowlisted: boolean;
};
/**
 * Describes the message agent.v1.ShellAllowlistPrecheckResult.
 * Use `create(ShellAllowlistPrecheckResultSchema)` to create a new message.
 */
export declare const ShellAllowlistPrecheckResultSchema: GenMessage<ShellAllowlistPrecheckResult>;
/**
 * @generated from message agent.v1.McpAllowlistPrecheckArgs
 */
export type McpAllowlistPrecheckArgs = Message<"agent.v1.McpAllowlistPrecheckArgs"> & {
    /**
     * @generated from field: string provider_identifier = 1;
     */
    providerIdentifier: string;
    /**
     * @generated from field: string tool_name = 2;
     */
    toolName: string;
    /**
     * @generated from field: optional string tool_call_id = 3;
     */
    toolCallId?: string | undefined;
};
/**
 * Describes the message agent.v1.McpAllowlistPrecheckArgs.
 * Use `create(McpAllowlistPrecheckArgsSchema)` to create a new message.
 */
export declare const McpAllowlistPrecheckArgsSchema: GenMessage<McpAllowlistPrecheckArgs>;
/**
 * @generated from message agent.v1.McpAllowlistPrecheckResult
 */
export type McpAllowlistPrecheckResult = Message<"agent.v1.McpAllowlistPrecheckResult"> & {
    /**
     * @generated from field: bool allowlisted = 1;
     */
    allowlisted: boolean;
};
/**
 * Describes the message agent.v1.McpAllowlistPrecheckResult.
 * Use `create(McpAllowlistPrecheckResultSchema)` to create a new message.
 */
export declare const McpAllowlistPrecheckResultSchema: GenMessage<McpAllowlistPrecheckResult>;
/**
 * @generated from message agent.v1.WebFetchAllowlistPrecheckArgs
 */
export type WebFetchAllowlistPrecheckArgs = Message<"agent.v1.WebFetchAllowlistPrecheckArgs"> & {
    /**
     * @generated from field: string url = 1;
     */
    url: string;
    /**
     * @generated from field: optional string tool_call_id = 2;
     */
    toolCallId?: string | undefined;
};
/**
 * Describes the message agent.v1.WebFetchAllowlistPrecheckArgs.
 * Use `create(WebFetchAllowlistPrecheckArgsSchema)` to create a new message.
 */
export declare const WebFetchAllowlistPrecheckArgsSchema: GenMessage<WebFetchAllowlistPrecheckArgs>;
/**
 * @generated from message agent.v1.WebFetchAllowlistPrecheckResult
 */
export type WebFetchAllowlistPrecheckResult = Message<"agent.v1.WebFetchAllowlistPrecheckResult"> & {
    /**
     * @generated from field: bool allowlisted = 1;
     */
    allowlisted: boolean;
};
/**
 * Describes the message agent.v1.WebFetchAllowlistPrecheckResult.
 * Use `create(WebFetchAllowlistPrecheckResultSchema)` to create a new message.
 */
export declare const WebFetchAllowlistPrecheckResultSchema: GenMessage<WebFetchAllowlistPrecheckResult>;
/**
 * @generated from message agent.v1.SmartModeApproval
 */
export type SmartModeApproval = Message<"agent.v1.SmartModeApproval"> & {
    /**
     * @generated from field: string request_id = 1;
     */
    requestId: string;
    /**
     * @generated from field: string reason = 2;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.SmartModeApproval.
 * Use `create(SmartModeApprovalSchema)` to create a new message.
 */
export declare const SmartModeApprovalSchema: GenMessage<SmartModeApproval>;
/**
 * @generated from message agent.v1.ShellOutputNotificationConfig
 */
export type ShellOutputNotificationConfig = Message<"agent.v1.ShellOutputNotificationConfig"> & {
    /**
     * @generated from field: string pattern = 1;
     */
    pattern: string;
    /**
     * @generated from field: string reason = 2;
     */
    reason: string;
    /**
     * @generated from field: optional double debounce = 3;
     */
    debounce?: number | undefined;
    /**
     * @generated from field: optional int32 notification_limit = 4;
     */
    notificationLimit?: number | undefined;
};
/**
 * Describes the message agent.v1.ShellOutputNotificationConfig.
 * Use `create(ShellOutputNotificationConfigSchema)` to create a new message.
 */
export declare const ShellOutputNotificationConfigSchema: GenMessage<ShellOutputNotificationConfig>;
/**
 * @generated from message agent.v1.ShellHookApprovalRequirement
 */
export type ShellHookApprovalRequirement = Message<"agent.v1.ShellHookApprovalRequirement"> & {
    /**
     * @generated from field: agent.v1.ShellHookApprovalRequirement_Kind kind = 1;
     */
    kind: ShellHookApprovalRequirement_Kind;
    /**
     * @generated from field: optional string reason = 2;
     */
    reason?: string | undefined;
};
/**
 * Describes the message agent.v1.ShellHookApprovalRequirement.
 * Use `create(ShellHookApprovalRequirementSchema)` to create a new message.
 */
export declare const ShellHookApprovalRequirementSchema: GenMessage<ShellHookApprovalRequirement>;
/**
 * @generated from message agent.v1.ForceBackgroundShellArgs
 */
export type ForceBackgroundShellArgs = Message<"agent.v1.ForceBackgroundShellArgs"> & {
    /**
     * @generated from field: string tool_call_id = 1;
     */
    toolCallId: string;
};
/**
 * Describes the message agent.v1.ForceBackgroundShellArgs.
 * Use `create(ForceBackgroundShellArgsSchema)` to create a new message.
 */
export declare const ForceBackgroundShellArgsSchema: GenMessage<ForceBackgroundShellArgs>;
/**
 * @generated from message agent.v1.ForceBackgroundShellResult
 */
export type ForceBackgroundShellResult = Message<"agent.v1.ForceBackgroundShellResult"> & {
    /**
     * @generated from field: agent.v1.ForceBackgroundShellStatus status = 1;
     */
    status: ForceBackgroundShellStatus;
    /**
     * @generated from field: optional agent.v1.ShellResult shell_result = 2;
     */
    shellResult?: ShellResult | undefined;
};
/**
 * Describes the message agent.v1.ForceBackgroundShellResult.
 * Use `create(ForceBackgroundShellResultSchema)` to create a new message.
 */
export declare const ForceBackgroundShellResultSchema: GenMessage<ForceBackgroundShellResult>;
/**
 * @generated from message agent.v1.HookAdditionalContext
 */
export type HookAdditionalContext = Message<"agent.v1.HookAdditionalContext"> & {
    /**
     * @generated from field: string hook_event_name = 1;
     */
    hookEventName: string;
    /**
     * @generated from field: string content = 2;
     */
    content: string;
};
/**
 * Describes the message agent.v1.HookAdditionalContext.
 * Use `create(HookAdditionalContextSchema)` to create a new message.
 */
export declare const HookAdditionalContextSchema: GenMessage<HookAdditionalContext>;
/**
 * @generated from message agent.v1.ShellStreamHookContext
 */
export type ShellStreamHookContext = Message<"agent.v1.ShellStreamHookContext"> & {
    /**
     * @generated from field: repeated agent.v1.HookAdditionalContext hook_additional_contexts = 1;
     */
    hookAdditionalContexts: HookAdditionalContext[];
};
/**
 * Describes the message agent.v1.ShellStreamHookContext.
 * Use `create(ShellStreamHookContextSchema)` to create a new message.
 */
export declare const ShellStreamHookContextSchema: GenMessage<ShellStreamHookContext>;
/**
 * Subset: only the fields this client reads. Upstream also defines model_id=3, readonly=5,
 * resume_agent_id=6, run_in_background=7, continuation_config=8, parent_conversation_id=9,
 * credentials 10-12, interrupt=13, mode=14, fork_agent_id=15, root_parent_conversation_id=16,
 * selected_context=17, direct_meta_parent_child_subagent=18, environment=19, cloud_base_branch=20.
 * Those decode into unknown fields; do not reuse these numbers.
 *
 * @generated from message agent.v1.SubagentArgs
 */
export type SubagentArgs = Message<"agent.v1.SubagentArgs"> & {
    /**
     * @generated from field: string tool_call_id = 1;
     */
    toolCallId: string;
    /**
     * @generated from field: string subagent_type = 2;
     */
    subagentType: string;
    /**
     * @generated from field: string prompt = 4;
     */
    prompt: string;
};
/**
 * Describes the message agent.v1.SubagentArgs.
 * Use `create(SubagentArgsSchema)` to create a new message.
 */
export declare const SubagentArgsSchema: GenMessage<SubagentArgs>;
/**
 * @generated from message agent.v1.SubagentSuccess
 */
export type SubagentSuccess = Message<"agent.v1.SubagentSuccess"> & {
    /**
     * @generated from field: string agent_id = 1;
     */
    agentId: string;
    /**
     * @generated from field: optional string final_message = 2;
     */
    finalMessage?: string | undefined;
    /**
     * @generated from field: int32 tool_call_count = 3;
     */
    toolCallCount: number;
    /**
     * @generated from field: agent.v1.SubagentBackgroundReason background_reason = 4;
     */
    backgroundReason: SubagentBackgroundReason;
    /**
     * @generated from field: optional string transcript_path = 5;
     */
    transcriptPath?: string | undefined;
};
/**
 * Describes the message agent.v1.SubagentSuccess.
 * Use `create(SubagentSuccessSchema)` to create a new message.
 */
export declare const SubagentSuccessSchema: GenMessage<SubagentSuccess>;
/**
 * @generated from message agent.v1.SubagentError
 */
export type SubagentError = Message<"agent.v1.SubagentError"> & {
    /**
     * @generated from field: optional string agent_id = 1;
     */
    agentId?: string | undefined;
    /**
     * @generated from field: string error = 2;
     */
    error: string;
};
/**
 * Describes the message agent.v1.SubagentError.
 * Use `create(SubagentErrorSchema)` to create a new message.
 */
export declare const SubagentErrorSchema: GenMessage<SubagentError>;
/**
 * @generated from message agent.v1.SubagentResult
 */
export type SubagentResult = Message<"agent.v1.SubagentResult"> & {
    /**
     * @generated from oneof agent.v1.SubagentResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.SubagentSuccess success = 1;
         */
        value: SubagentSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.SubagentError error = 2;
         */
        value: SubagentError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.SubagentResult.
 * Use `create(SubagentResultSchema)` to create a new message.
 */
export declare const SubagentResultSchema: GenMessage<SubagentResult>;
/**
 * @generated from message agent.v1.SubagentAwaitArgs
 */
export type SubagentAwaitArgs = Message<"agent.v1.SubagentAwaitArgs"> & {
    /**
     * @generated from field: string agent_id = 1;
     */
    agentId: string;
    /**
     * @generated from field: uint32 timeout_ms = 2;
     */
    timeoutMs: number;
};
/**
 * Describes the message agent.v1.SubagentAwaitArgs.
 * Use `create(SubagentAwaitArgsSchema)` to create a new message.
 */
export declare const SubagentAwaitArgsSchema: GenMessage<SubagentAwaitArgs>;
/**
 * @generated from message agent.v1.SubagentAwaitComplete
 */
export type SubagentAwaitComplete = Message<"agent.v1.SubagentAwaitComplete"> & {
    /**
     * @generated from field: string agent_id = 1;
     */
    agentId: string;
    /**
     * @generated from field: optional string transcript_path = 2;
     */
    transcriptPath?: string | undefined;
    /**
     * @generated from field: int32 tool_call_count = 3;
     */
    toolCallCount: number;
    /**
     * @generated from field: optional string final_message = 4;
     */
    finalMessage?: string | undefined;
};
/**
 * Describes the message agent.v1.SubagentAwaitComplete.
 * Use `create(SubagentAwaitCompleteSchema)` to create a new message.
 */
export declare const SubagentAwaitCompleteSchema: GenMessage<SubagentAwaitComplete>;
/**
 * @generated from message agent.v1.SubagentAwaitStillRunning
 */
export type SubagentAwaitStillRunning = Message<"agent.v1.SubagentAwaitStillRunning"> & {
    /**
     * @generated from field: string agent_id = 1;
     */
    agentId: string;
    /**
     * @generated from field: optional string transcript_path = 2;
     */
    transcriptPath?: string | undefined;
};
/**
 * Describes the message agent.v1.SubagentAwaitStillRunning.
 * Use `create(SubagentAwaitStillRunningSchema)` to create a new message.
 */
export declare const SubagentAwaitStillRunningSchema: GenMessage<SubagentAwaitStillRunning>;
/**
 * @generated from message agent.v1.SubagentAwaitNotFound
 */
export type SubagentAwaitNotFound = Message<"agent.v1.SubagentAwaitNotFound"> & {
    /**
     * @generated from field: string agent_id = 1;
     */
    agentId: string;
};
/**
 * Describes the message agent.v1.SubagentAwaitNotFound.
 * Use `create(SubagentAwaitNotFoundSchema)` to create a new message.
 */
export declare const SubagentAwaitNotFoundSchema: GenMessage<SubagentAwaitNotFound>;
/**
 * @generated from message agent.v1.SubagentAwaitError
 */
export type SubagentAwaitError = Message<"agent.v1.SubagentAwaitError"> & {
    /**
     * @generated from field: optional string agent_id = 1;
     */
    agentId?: string | undefined;
    /**
     * @generated from field: string error = 2;
     */
    error: string;
};
/**
 * Describes the message agent.v1.SubagentAwaitError.
 * Use `create(SubagentAwaitErrorSchema)` to create a new message.
 */
export declare const SubagentAwaitErrorSchema: GenMessage<SubagentAwaitError>;
/**
 * @generated from message agent.v1.SubagentAwaitResult
 */
export type SubagentAwaitResult = Message<"agent.v1.SubagentAwaitResult"> & {
    /**
     * @generated from oneof agent.v1.SubagentAwaitResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.SubagentAwaitComplete complete = 1;
         */
        value: SubagentAwaitComplete;
        case: "complete";
    } | {
        /**
         * @generated from field: agent.v1.SubagentAwaitStillRunning still_running = 2;
         */
        value: SubagentAwaitStillRunning;
        case: "stillRunning";
    } | {
        /**
         * @generated from field: agent.v1.SubagentAwaitNotFound not_found = 3;
         */
        value: SubagentAwaitNotFound;
        case: "notFound";
    } | {
        /**
         * @generated from field: agent.v1.SubagentAwaitError error = 4;
         */
        value: SubagentAwaitError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.SubagentAwaitResult.
 * Use `create(SubagentAwaitResultSchema)` to create a new message.
 */
export declare const SubagentAwaitResultSchema: GenMessage<SubagentAwaitResult>;
/**
 * @generated from message agent.v1.ForceBackgroundSubagentArgs
 */
export type ForceBackgroundSubagentArgs = Message<"agent.v1.ForceBackgroundSubagentArgs"> & {
    /**
     * @generated from field: string tool_call_id = 1;
     */
    toolCallId: string;
};
/**
 * Describes the message agent.v1.ForceBackgroundSubagentArgs.
 * Use `create(ForceBackgroundSubagentArgsSchema)` to create a new message.
 */
export declare const ForceBackgroundSubagentArgsSchema: GenMessage<ForceBackgroundSubagentArgs>;
/**
 * @generated from message agent.v1.ForceBackgroundSubagentResult
 */
export type ForceBackgroundSubagentResult = Message<"agent.v1.ForceBackgroundSubagentResult"> & {
    /**
     * @generated from field: agent.v1.ForceBackgroundSubagentStatus status = 1;
     */
    status: ForceBackgroundSubagentStatus;
};
/**
 * Describes the message agent.v1.ForceBackgroundSubagentResult.
 * Use `create(ForceBackgroundSubagentResultSchema)` to create a new message.
 */
export declare const ForceBackgroundSubagentResultSchema: GenMessage<ForceBackgroundSubagentResult>;
/**
 * Payload not modelled: this client runs no Cursor hooks and only reads the oneof case.
 *
 * @generated from message agent.v1.PreCompactRequestQuery
 */
export type PreCompactRequestQuery = Message<"agent.v1.PreCompactRequestQuery"> & {};
/**
 * Describes the message agent.v1.PreCompactRequestQuery.
 * Use `create(PreCompactRequestQuerySchema)` to create a new message.
 */
export declare const PreCompactRequestQuerySchema: GenMessage<PreCompactRequestQuery>;
/**
 * Payload not modelled: this client runs no Cursor hooks and only reads the oneof case.
 *
 * @generated from message agent.v1.SubagentStartRequestQuery
 */
export type SubagentStartRequestQuery = Message<"agent.v1.SubagentStartRequestQuery"> & {};
/**
 * Describes the message agent.v1.SubagentStartRequestQuery.
 * Use `create(SubagentStartRequestQuerySchema)` to create a new message.
 */
export declare const SubagentStartRequestQuerySchema: GenMessage<SubagentStartRequestQuery>;
/**
 * Payload not modelled: this client runs no Cursor hooks and only reads the oneof case.
 *
 * @generated from message agent.v1.SubagentStopRequestQuery
 */
export type SubagentStopRequestQuery = Message<"agent.v1.SubagentStopRequestQuery"> & {};
/**
 * Describes the message agent.v1.SubagentStopRequestQuery.
 * Use `create(SubagentStopRequestQuerySchema)` to create a new message.
 */
export declare const SubagentStopRequestQuerySchema: GenMessage<SubagentStopRequestQuery>;
/**
 * Payload not modelled: this client runs no Cursor hooks and only reads the oneof case.
 *
 * @generated from message agent.v1.PreToolUseRequestQuery
 */
export type PreToolUseRequestQuery = Message<"agent.v1.PreToolUseRequestQuery"> & {};
/**
 * Describes the message agent.v1.PreToolUseRequestQuery.
 * Use `create(PreToolUseRequestQuerySchema)` to create a new message.
 */
export declare const PreToolUseRequestQuerySchema: GenMessage<PreToolUseRequestQuery>;
/**
 * Payload not modelled: this client runs no Cursor hooks and only reads the oneof case.
 *
 * @generated from message agent.v1.PostToolUseRequestQuery
 */
export type PostToolUseRequestQuery = Message<"agent.v1.PostToolUseRequestQuery"> & {};
/**
 * Describes the message agent.v1.PostToolUseRequestQuery.
 * Use `create(PostToolUseRequestQuerySchema)` to create a new message.
 */
export declare const PostToolUseRequestQuerySchema: GenMessage<PostToolUseRequestQuery>;
/**
 * Payload not modelled: this client runs no Cursor hooks and only reads the oneof case.
 *
 * @generated from message agent.v1.PostToolUseFailureRequestQuery
 */
export type PostToolUseFailureRequestQuery = Message<"agent.v1.PostToolUseFailureRequestQuery"> & {};
/**
 * Describes the message agent.v1.PostToolUseFailureRequestQuery.
 * Use `create(PostToolUseFailureRequestQuerySchema)` to create a new message.
 */
export declare const PostToolUseFailureRequestQuerySchema: GenMessage<PostToolUseFailureRequestQuery>;
/**
 * Payload not modelled: this client runs no Cursor hooks and only reads the oneof case.
 *
 * @generated from message agent.v1.BeforeSubmitPromptRequestQuery
 */
export type BeforeSubmitPromptRequestQuery = Message<"agent.v1.BeforeSubmitPromptRequestQuery"> & {};
/**
 * Describes the message agent.v1.BeforeSubmitPromptRequestQuery.
 * Use `create(BeforeSubmitPromptRequestQuerySchema)` to create a new message.
 */
export declare const BeforeSubmitPromptRequestQuerySchema: GenMessage<BeforeSubmitPromptRequestQuery>;
/**
 * Payload not modelled: this client runs no Cursor hooks and only reads the oneof case.
 *
 * @generated from message agent.v1.AfterAgentResponseRequestQuery
 */
export type AfterAgentResponseRequestQuery = Message<"agent.v1.AfterAgentResponseRequestQuery"> & {};
/**
 * Describes the message agent.v1.AfterAgentResponseRequestQuery.
 * Use `create(AfterAgentResponseRequestQuerySchema)` to create a new message.
 */
export declare const AfterAgentResponseRequestQuerySchema: GenMessage<AfterAgentResponseRequestQuery>;
/**
 * Payload not modelled: this client runs no Cursor hooks and only reads the oneof case.
 *
 * @generated from message agent.v1.AfterAgentThoughtRequestQuery
 */
export type AfterAgentThoughtRequestQuery = Message<"agent.v1.AfterAgentThoughtRequestQuery"> & {};
/**
 * Describes the message agent.v1.AfterAgentThoughtRequestQuery.
 * Use `create(AfterAgentThoughtRequestQuerySchema)` to create a new message.
 */
export declare const AfterAgentThoughtRequestQuerySchema: GenMessage<AfterAgentThoughtRequestQuery>;
/**
 * Payload not modelled: this client runs no Cursor hooks and only reads the oneof case.
 *
 * @generated from message agent.v1.StopRequestQuery
 */
export type StopRequestQuery = Message<"agent.v1.StopRequestQuery"> & {};
/**
 * Describes the message agent.v1.StopRequestQuery.
 * Use `create(StopRequestQuerySchema)` to create a new message.
 */
export declare const StopRequestQuerySchema: GenMessage<StopRequestQuery>;
/**
 * @generated from message agent.v1.PreCompactRequestResponse
 */
export type PreCompactRequestResponse = Message<"agent.v1.PreCompactRequestResponse"> & {
    /**
     * @generated from field: optional string user_message = 1;
     */
    userMessage?: string | undefined;
};
/**
 * Describes the message agent.v1.PreCompactRequestResponse.
 * Use `create(PreCompactRequestResponseSchema)` to create a new message.
 */
export declare const PreCompactRequestResponseSchema: GenMessage<PreCompactRequestResponse>;
/**
 * @generated from message agent.v1.SubagentStartRequestResponse
 */
export type SubagentStartRequestResponse = Message<"agent.v1.SubagentStartRequestResponse"> & {
    /**
     * @generated from field: optional string permission = 1;
     */
    permission?: string | undefined;
    /**
     * @generated from field: optional string user_message = 2;
     */
    userMessage?: string | undefined;
    /**
     * @generated from field: optional string additional_context = 3;
     */
    additionalContext?: string | undefined;
};
/**
 * Describes the message agent.v1.SubagentStartRequestResponse.
 * Use `create(SubagentStartRequestResponseSchema)` to create a new message.
 */
export declare const SubagentStartRequestResponseSchema: GenMessage<SubagentStartRequestResponse>;
/**
 * @generated from message agent.v1.SubagentStopRequestResponse
 */
export type SubagentStopRequestResponse = Message<"agent.v1.SubagentStopRequestResponse"> & {
    /**
     * @generated from field: optional string followup_message = 1;
     */
    followupMessage?: string | undefined;
    /**
     * @generated from field: optional string additional_context = 2;
     */
    additionalContext?: string | undefined;
};
/**
 * Describes the message agent.v1.SubagentStopRequestResponse.
 * Use `create(SubagentStopRequestResponseSchema)` to create a new message.
 */
export declare const SubagentStopRequestResponseSchema: GenMessage<SubagentStopRequestResponse>;
/**
 * @generated from message agent.v1.PreToolUseRequestResponse
 */
export type PreToolUseRequestResponse = Message<"agent.v1.PreToolUseRequestResponse"> & {
    /**
     * @generated from field: optional string permission = 1;
     */
    permission?: string | undefined;
    /**
     * @generated from field: optional string user_message = 2;
     */
    userMessage?: string | undefined;
    /**
     * @generated from field: optional string agent_message = 3;
     */
    agentMessage?: string | undefined;
    /**
     * @generated from field: optional string updated_input = 4;
     */
    updatedInput?: string | undefined;
    /**
     * @generated from field: optional string additional_context = 5;
     */
    additionalContext?: string | undefined;
};
/**
 * Describes the message agent.v1.PreToolUseRequestResponse.
 * Use `create(PreToolUseRequestResponseSchema)` to create a new message.
 */
export declare const PreToolUseRequestResponseSchema: GenMessage<PreToolUseRequestResponse>;
/**
 * @generated from message agent.v1.PostToolUseRequestResponse
 */
export type PostToolUseRequestResponse = Message<"agent.v1.PostToolUseRequestResponse"> & {
    /**
     * @generated from field: optional string additional_context = 1;
     */
    additionalContext?: string | undefined;
};
/**
 * Describes the message agent.v1.PostToolUseRequestResponse.
 * Use `create(PostToolUseRequestResponseSchema)` to create a new message.
 */
export declare const PostToolUseRequestResponseSchema: GenMessage<PostToolUseRequestResponse>;
/**
 * @generated from message agent.v1.PostToolUseFailureRequestResponse
 */
export type PostToolUseFailureRequestResponse = Message<"agent.v1.PostToolUseFailureRequestResponse"> & {
    /**
     * @generated from field: optional string additional_context = 1;
     */
    additionalContext?: string | undefined;
};
/**
 * Describes the message agent.v1.PostToolUseFailureRequestResponse.
 * Use `create(PostToolUseFailureRequestResponseSchema)` to create a new message.
 */
export declare const PostToolUseFailureRequestResponseSchema: GenMessage<PostToolUseFailureRequestResponse>;
/**
 * @generated from message agent.v1.BeforeSubmitPromptRequestResponse
 */
export type BeforeSubmitPromptRequestResponse = Message<"agent.v1.BeforeSubmitPromptRequestResponse"> & {
    /**
     * @generated from field: optional bool continue = 1;
     */
    continue?: boolean | undefined;
    /**
     * @generated from field: optional string user_message = 2;
     */
    userMessage?: string | undefined;
    /**
     * @generated from field: optional string additional_context = 3;
     */
    additionalContext?: string | undefined;
};
/**
 * Describes the message agent.v1.BeforeSubmitPromptRequestResponse.
 * Use `create(BeforeSubmitPromptRequestResponseSchema)` to create a new message.
 */
export declare const BeforeSubmitPromptRequestResponseSchema: GenMessage<BeforeSubmitPromptRequestResponse>;
/**
 * @generated from message agent.v1.AfterAgentResponseRequestResponse
 */
export type AfterAgentResponseRequestResponse = Message<"agent.v1.AfterAgentResponseRequestResponse"> & {};
/**
 * Describes the message agent.v1.AfterAgentResponseRequestResponse.
 * Use `create(AfterAgentResponseRequestResponseSchema)` to create a new message.
 */
export declare const AfterAgentResponseRequestResponseSchema: GenMessage<AfterAgentResponseRequestResponse>;
/**
 * @generated from message agent.v1.AfterAgentThoughtRequestResponse
 */
export type AfterAgentThoughtRequestResponse = Message<"agent.v1.AfterAgentThoughtRequestResponse"> & {};
/**
 * Describes the message agent.v1.AfterAgentThoughtRequestResponse.
 * Use `create(AfterAgentThoughtRequestResponseSchema)` to create a new message.
 */
export declare const AfterAgentThoughtRequestResponseSchema: GenMessage<AfterAgentThoughtRequestResponse>;
/**
 * @generated from message agent.v1.StopRequestResponse
 */
export type StopRequestResponse = Message<"agent.v1.StopRequestResponse"> & {
    /**
     * @generated from field: optional string followup_message = 1;
     */
    followupMessage?: string | undefined;
};
/**
 * Describes the message agent.v1.StopRequestResponse.
 * Use `create(StopRequestResponseSchema)` to create a new message.
 */
export declare const StopRequestResponseSchema: GenMessage<StopRequestResponse>;
/**
 * @generated from message agent.v1.ExecuteHookRequest
 */
export type ExecuteHookRequest = Message<"agent.v1.ExecuteHookRequest"> & {
    /**
     * @generated from oneof agent.v1.ExecuteHookRequest.request
     */
    request: {
        /**
         * @generated from field: agent.v1.PreCompactRequestQuery pre_compact = 1;
         */
        value: PreCompactRequestQuery;
        case: "preCompact";
    } | {
        /**
         * @generated from field: agent.v1.SubagentStartRequestQuery subagent_start = 2;
         */
        value: SubagentStartRequestQuery;
        case: "subagentStart";
    } | {
        /**
         * @generated from field: agent.v1.SubagentStopRequestQuery subagent_stop = 3;
         */
        value: SubagentStopRequestQuery;
        case: "subagentStop";
    } | {
        /**
         * @generated from field: agent.v1.PreToolUseRequestQuery pre_tool_use = 4;
         */
        value: PreToolUseRequestQuery;
        case: "preToolUse";
    } | {
        /**
         * @generated from field: agent.v1.PostToolUseRequestQuery post_tool_use = 5;
         */
        value: PostToolUseRequestQuery;
        case: "postToolUse";
    } | {
        /**
         * @generated from field: agent.v1.PostToolUseFailureRequestQuery post_tool_use_failure = 6;
         */
        value: PostToolUseFailureRequestQuery;
        case: "postToolUseFailure";
    } | {
        /**
         * @generated from field: agent.v1.BeforeSubmitPromptRequestQuery before_submit_prompt = 7;
         */
        value: BeforeSubmitPromptRequestQuery;
        case: "beforeSubmitPrompt";
    } | {
        /**
         * @generated from field: agent.v1.AfterAgentResponseRequestQuery after_agent_response = 8;
         */
        value: AfterAgentResponseRequestQuery;
        case: "afterAgentResponse";
    } | {
        /**
         * @generated from field: agent.v1.AfterAgentThoughtRequestQuery after_agent_thought = 9;
         */
        value: AfterAgentThoughtRequestQuery;
        case: "afterAgentThought";
    } | {
        /**
         * @generated from field: agent.v1.StopRequestQuery stop = 11;
         */
        value: StopRequestQuery;
        case: "stop";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ExecuteHookRequest.
 * Use `create(ExecuteHookRequestSchema)` to create a new message.
 */
export declare const ExecuteHookRequestSchema: GenMessage<ExecuteHookRequest>;
/**
 * @generated from message agent.v1.ExecuteHookResponse
 */
export type ExecuteHookResponse = Message<"agent.v1.ExecuteHookResponse"> & {
    /**
     * @generated from oneof agent.v1.ExecuteHookResponse.response
     */
    response: {
        /**
         * @generated from field: agent.v1.PreCompactRequestResponse pre_compact = 1;
         */
        value: PreCompactRequestResponse;
        case: "preCompact";
    } | {
        /**
         * @generated from field: agent.v1.SubagentStartRequestResponse subagent_start = 2;
         */
        value: SubagentStartRequestResponse;
        case: "subagentStart";
    } | {
        /**
         * @generated from field: agent.v1.SubagentStopRequestResponse subagent_stop = 3;
         */
        value: SubagentStopRequestResponse;
        case: "subagentStop";
    } | {
        /**
         * @generated from field: agent.v1.PreToolUseRequestResponse pre_tool_use = 4;
         */
        value: PreToolUseRequestResponse;
        case: "preToolUse";
    } | {
        /**
         * @generated from field: agent.v1.PostToolUseRequestResponse post_tool_use = 5;
         */
        value: PostToolUseRequestResponse;
        case: "postToolUse";
    } | {
        /**
         * @generated from field: agent.v1.PostToolUseFailureRequestResponse post_tool_use_failure = 6;
         */
        value: PostToolUseFailureRequestResponse;
        case: "postToolUseFailure";
    } | {
        /**
         * @generated from field: agent.v1.BeforeSubmitPromptRequestResponse before_submit_prompt = 7;
         */
        value: BeforeSubmitPromptRequestResponse;
        case: "beforeSubmitPrompt";
    } | {
        /**
         * @generated from field: agent.v1.AfterAgentResponseRequestResponse after_agent_response = 8;
         */
        value: AfterAgentResponseRequestResponse;
        case: "afterAgentResponse";
    } | {
        /**
         * @generated from field: agent.v1.AfterAgentThoughtRequestResponse after_agent_thought = 9;
         */
        value: AfterAgentThoughtRequestResponse;
        case: "afterAgentThought";
    } | {
        /**
         * @generated from field: agent.v1.StopRequestResponse stop = 11;
         */
        value: StopRequestResponse;
        case: "stop";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ExecuteHookResponse.
 * Use `create(ExecuteHookResponseSchema)` to create a new message.
 */
export declare const ExecuteHookResponseSchema: GenMessage<ExecuteHookResponse>;
/**
 * @generated from message agent.v1.ExecuteHookArgs
 */
export type ExecuteHookArgs = Message<"agent.v1.ExecuteHookArgs"> & {
    /**
     * @generated from field: agent.v1.ExecuteHookRequest request = 1;
     */
    request?: ExecuteHookRequest | undefined;
};
/**
 * Describes the message agent.v1.ExecuteHookArgs.
 * Use `create(ExecuteHookArgsSchema)` to create a new message.
 */
export declare const ExecuteHookArgsSchema: GenMessage<ExecuteHookArgs>;
/**
 * @generated from message agent.v1.ExecuteHookResult
 */
export type ExecuteHookResult = Message<"agent.v1.ExecuteHookResult"> & {
    /**
     * @generated from field: agent.v1.ExecuteHookResponse response = 1;
     */
    response?: ExecuteHookResponse | undefined;
};
/**
 * Describes the message agent.v1.ExecuteHookResult.
 * Use `create(ExecuteHookResultSchema)` to create a new message.
 */
export declare const ExecuteHookResultSchema: GenMessage<ExecuteHookResult>;
/**
 * Subset: arguments=2 (google.protobuf.Struct) decodes into unknown fields; do not reuse.
 *
 * @generated from message agent.v1.SmartModeRiskTarget
 */
export type SmartModeRiskTarget = Message<"agent.v1.SmartModeRiskTarget"> & {
    /**
     * @generated from field: string action = 1;
     */
    action: string;
};
/**
 * Describes the message agent.v1.SmartModeRiskTarget.
 * Use `create(SmartModeRiskTargetSchema)` to create a new message.
 */
export declare const SmartModeRiskTargetSchema: GenMessage<SmartModeRiskTarget>;
/**
 * @generated from message agent.v1.SmartModeClassifierConversationMessage
 */
export type SmartModeClassifierConversationMessage = Message<"agent.v1.SmartModeClassifierConversationMessage"> & {
    /**
     * @generated from field: string role = 1;
     */
    role: string;
    /**
     * @generated from field: string content = 2;
     */
    content: string;
};
/**
 * Describes the message agent.v1.SmartModeClassifierConversationMessage.
 * Use `create(SmartModeClassifierConversationMessageSchema)` to create a new message.
 */
export declare const SmartModeClassifierConversationMessageSchema: GenMessage<SmartModeClassifierConversationMessage>;
/**
 * @generated from message agent.v1.SmartModeClassifierArgs
 */
export type SmartModeClassifierArgs = Message<"agent.v1.SmartModeClassifierArgs"> & {
    /**
     * @generated from field: string tool_call_id = 1;
     */
    toolCallId: string;
    /**
     * @generated from field: optional string parent_conversation_id = 2;
     */
    parentConversationId?: string | undefined;
    /**
     * @generated from field: agent.v1.SmartModeRiskTarget target = 3;
     */
    target?: SmartModeRiskTarget | undefined;
    /**
     * @generated from field: repeated agent.v1.SmartModeClassifierConversationMessage conversation_context = 4;
     */
    conversationContext: SmartModeClassifierConversationMessage[];
};
/**
 * Describes the message agent.v1.SmartModeClassifierArgs.
 * Use `create(SmartModeClassifierArgsSchema)` to create a new message.
 */
export declare const SmartModeClassifierArgsSchema: GenMessage<SmartModeClassifierArgs>;
/**
 * @generated from message agent.v1.SmartModeClassifierSuccess
 */
export type SmartModeClassifierSuccess = Message<"agent.v1.SmartModeClassifierSuccess"> & {
    /**
     * @generated from field: agent.v1.SmartModeClassifierDecision decision = 1;
     */
    decision: SmartModeClassifierDecision;
    /**
     * @generated from field: optional string block_reason = 2;
     */
    blockReason?: string | undefined;
};
/**
 * Describes the message agent.v1.SmartModeClassifierSuccess.
 * Use `create(SmartModeClassifierSuccessSchema)` to create a new message.
 */
export declare const SmartModeClassifierSuccessSchema: GenMessage<SmartModeClassifierSuccess>;
/**
 * @generated from message agent.v1.SmartModeClassifierError
 */
export type SmartModeClassifierError = Message<"agent.v1.SmartModeClassifierError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.SmartModeClassifierError.
 * Use `create(SmartModeClassifierErrorSchema)` to create a new message.
 */
export declare const SmartModeClassifierErrorSchema: GenMessage<SmartModeClassifierError>;
/**
 * @generated from message agent.v1.SmartModeClassifierResult
 */
export type SmartModeClassifierResult = Message<"agent.v1.SmartModeClassifierResult"> & {
    /**
     * @generated from oneof agent.v1.SmartModeClassifierResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.SmartModeClassifierSuccess success = 1;
         */
        value: SmartModeClassifierSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.SmartModeClassifierError error = 2;
         */
        value: SmartModeClassifierError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.SmartModeClassifierResult.
 * Use `create(SmartModeClassifierResultSchema)` to create a new message.
 */
export declare const SmartModeClassifierResultSchema: GenMessage<SmartModeClassifierResult>;
/**
 * @generated from message agent.v1.CanvasDiagnosticsArgs
 */
export type CanvasDiagnosticsArgs = Message<"agent.v1.CanvasDiagnosticsArgs"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string tool_call_id = 2;
     */
    toolCallId: string;
};
/**
 * Describes the message agent.v1.CanvasDiagnosticsArgs.
 * Use `create(CanvasDiagnosticsArgsSchema)` to create a new message.
 */
export declare const CanvasDiagnosticsArgsSchema: GenMessage<CanvasDiagnosticsArgs>;
/**
 * @generated from message agent.v1.CanvasDiagnosticsSuccess
 */
export type CanvasDiagnosticsSuccess = Message<"agent.v1.CanvasDiagnosticsSuccess"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: repeated agent.v1.Diagnostic diagnostics = 2;
     */
    diagnostics: Diagnostic[];
};
/**
 * Describes the message agent.v1.CanvasDiagnosticsSuccess.
 * Use `create(CanvasDiagnosticsSuccessSchema)` to create a new message.
 */
export declare const CanvasDiagnosticsSuccessSchema: GenMessage<CanvasDiagnosticsSuccess>;
/**
 * @generated from message agent.v1.CanvasDiagnosticsError
 */
export type CanvasDiagnosticsError = Message<"agent.v1.CanvasDiagnosticsError"> & {
    /**
     * @generated from field: string path = 1;
     */
    path: string;
    /**
     * @generated from field: string error = 2;
     */
    error: string;
};
/**
 * Describes the message agent.v1.CanvasDiagnosticsError.
 * Use `create(CanvasDiagnosticsErrorSchema)` to create a new message.
 */
export declare const CanvasDiagnosticsErrorSchema: GenMessage<CanvasDiagnosticsError>;
/**
 * @generated from message agent.v1.CanvasDiagnosticsResult
 */
export type CanvasDiagnosticsResult = Message<"agent.v1.CanvasDiagnosticsResult"> & {
    /**
     * @generated from oneof agent.v1.CanvasDiagnosticsResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.CanvasDiagnosticsSuccess success = 1;
         */
        value: CanvasDiagnosticsSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.CanvasDiagnosticsError error = 2;
         */
        value: CanvasDiagnosticsError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.CanvasDiagnosticsResult.
 * Use `create(CanvasDiagnosticsResultSchema)` to create a new message.
 */
export declare const CanvasDiagnosticsResultSchema: GenMessage<CanvasDiagnosticsResult>;
/**
 * @generated from message agent.v1.ConversationSearchHit
 */
export type ConversationSearchHit = Message<"agent.v1.ConversationSearchHit"> & {
    /**
     * @generated from field: string conversation_id = 1;
     */
    conversationId: string;
    /**
     * @generated from field: string title = 2;
     */
    title: string;
    /**
     * @generated from field: agent.v1.ConversationSearchSource source = 3;
     */
    source: ConversationSearchSource;
    /**
     * @generated from field: int64 updated_at_ms = 4;
     */
    updatedAtMs: bigint;
    /**
     * @generated from field: optional string snippet = 5;
     */
    snippet?: string | undefined;
};
/**
 * Describes the message agent.v1.ConversationSearchHit.
 * Use `create(ConversationSearchHitSchema)` to create a new message.
 */
export declare const ConversationSearchHitSchema: GenMessage<ConversationSearchHit>;
/**
 * @generated from message agent.v1.ConversationSearchSuccess
 */
export type ConversationSearchSuccess = Message<"agent.v1.ConversationSearchSuccess"> & {
    /**
     * @generated from field: repeated agent.v1.ConversationSearchHit hits = 1;
     */
    hits: ConversationSearchHit[];
    /**
     * @generated from field: bool truncated = 2;
     */
    truncated: boolean;
    /**
     * @generated from field: bool partial = 3;
     */
    partial: boolean;
    /**
     * @generated from field: bool rebuilding = 4;
     */
    rebuilding: boolean;
};
/**
 * Describes the message agent.v1.ConversationSearchSuccess.
 * Use `create(ConversationSearchSuccessSchema)` to create a new message.
 */
export declare const ConversationSearchSuccessSchema: GenMessage<ConversationSearchSuccess>;
/**
 * @generated from message agent.v1.ConversationSearchError
 */
export type ConversationSearchError = Message<"agent.v1.ConversationSearchError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.ConversationSearchError.
 * Use `create(ConversationSearchErrorSchema)` to create a new message.
 */
export declare const ConversationSearchErrorSchema: GenMessage<ConversationSearchError>;
/**
 * @generated from message agent.v1.ConversationSearchArgs
 */
export type ConversationSearchArgs = Message<"agent.v1.ConversationSearchArgs"> & {
    /**
     * @generated from field: string query = 1;
     */
    query: string;
    /**
     * @generated from field: string tool_call_id = 2;
     */
    toolCallId: string;
    /**
     * @generated from field: optional int32 limit = 3;
     */
    limit?: number | undefined;
};
/**
 * Describes the message agent.v1.ConversationSearchArgs.
 * Use `create(ConversationSearchArgsSchema)` to create a new message.
 */
export declare const ConversationSearchArgsSchema: GenMessage<ConversationSearchArgs>;
/**
 * @generated from message agent.v1.ConversationSearchResult
 */
export type ConversationSearchResult = Message<"agent.v1.ConversationSearchResult"> & {
    /**
     * @generated from oneof agent.v1.ConversationSearchResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.ConversationSearchSuccess success = 1;
         */
        value: ConversationSearchSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.ConversationSearchError error = 2;
         */
        value: ConversationSearchError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ConversationSearchResult.
 * Use `create(ConversationSearchResultSchema)` to create a new message.
 */
export declare const ConversationSearchResultSchema: GenMessage<ConversationSearchResult>;
/**
 * @generated from message agent.v1.AgentStoreConflictCursor
 */
export type AgentStoreConflictCursor = Message<"agent.v1.AgentStoreConflictCursor"> & {
    /**
     * @generated from field: string journal_epoch = 1;
     */
    journalEpoch: string;
    /**
     * @generated from field: uint64 seq = 2;
     */
    seq: bigint;
    /**
     * @generated from field: string last_event_id = 3;
     */
    lastEventId: string;
};
/**
 * Describes the message agent.v1.AgentStoreConflictCursor.
 * Use `create(AgentStoreConflictCursorSchema)` to create a new message.
 */
export declare const AgentStoreConflictCursorSchema: GenMessage<AgentStoreConflictCursor>;
/**
 * @generated from message agent.v1.AgentStoreConflictEvent
 */
export type AgentStoreConflictEvent = Message<"agent.v1.AgentStoreConflictEvent"> & {
    /**
     * @generated from field: uint32 v = 1;
     */
    v: number;
    /**
     * @generated from field: string event_id = 2;
     */
    eventId: string;
    /**
     * @generated from field: string journal_epoch = 3;
     */
    journalEpoch: string;
    /**
     * @generated from field: uint64 seq = 4;
     */
    seq: bigint;
    /**
     * @generated from field: uint64 ts_ms = 5;
     */
    tsMs: bigint;
    /**
     * @generated from field: string kind = 6;
     */
    kind: string;
    /**
     * @generated from field: optional string store_id = 7;
     */
    storeId?: string | undefined;
    /**
     * @generated from field: optional string original_rel_path = 8;
     */
    originalRelPath?: string | undefined;
    /**
     * @generated from field: optional string conflict_rel_path = 9;
     */
    conflictRelPath?: string | undefined;
    /**
     * @generated from field: optional string original_abs_path = 10;
     */
    originalAbsPath?: string | undefined;
    /**
     * @generated from field: optional string conflict_abs_path = 11;
     */
    conflictAbsPath?: string | undefined;
    /**
     * @generated from field: optional uint64 preserved_bytes = 12;
     */
    preservedBytes?: bigint | undefined;
};
/**
 * Describes the message agent.v1.AgentStoreConflictEvent.
 * Use `create(AgentStoreConflictEventSchema)` to create a new message.
 */
export declare const AgentStoreConflictEventSchema: GenMessage<AgentStoreConflictEvent>;
/**
 * @generated from message agent.v1.AgentStoreConflictSuccess
 */
export type AgentStoreConflictSuccess = Message<"agent.v1.AgentStoreConflictSuccess"> & {
    /**
     * @generated from field: repeated agent.v1.AgentStoreConflictEvent events = 1;
     */
    events: AgentStoreConflictEvent[];
    /**
     * @generated from field: agent.v1.AgentStoreConflictCursor next_cursor = 2;
     */
    nextCursor?: AgentStoreConflictCursor | undefined;
    /**
     * @generated from field: bool gap = 3;
     */
    gap: boolean;
};
/**
 * Describes the message agent.v1.AgentStoreConflictSuccess.
 * Use `create(AgentStoreConflictSuccessSchema)` to create a new message.
 */
export declare const AgentStoreConflictSuccessSchema: GenMessage<AgentStoreConflictSuccess>;
/**
 * @generated from message agent.v1.AgentStoreConflictError
 */
export type AgentStoreConflictError = Message<"agent.v1.AgentStoreConflictError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.AgentStoreConflictError.
 * Use `create(AgentStoreConflictErrorSchema)` to create a new message.
 */
export declare const AgentStoreConflictErrorSchema: GenMessage<AgentStoreConflictError>;
/**
 * @generated from message agent.v1.AgentStoreConflictArgs
 */
export type AgentStoreConflictArgs = Message<"agent.v1.AgentStoreConflictArgs"> & {
    /**
     * @generated from field: optional agent.v1.AgentStoreConflictCursor cursor = 1;
     */
    cursor?: AgentStoreConflictCursor | undefined;
    /**
     * @generated from field: optional bool advance = 2;
     */
    advance?: boolean | undefined;
};
/**
 * Describes the message agent.v1.AgentStoreConflictArgs.
 * Use `create(AgentStoreConflictArgsSchema)` to create a new message.
 */
export declare const AgentStoreConflictArgsSchema: GenMessage<AgentStoreConflictArgs>;
/**
 * @generated from message agent.v1.AgentStoreConflictResult
 */
export type AgentStoreConflictResult = Message<"agent.v1.AgentStoreConflictResult"> & {
    /**
     * @generated from oneof agent.v1.AgentStoreConflictResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.AgentStoreConflictSuccess success = 1;
         */
        value: AgentStoreConflictSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.AgentStoreConflictError error = 2;
         */
        value: AgentStoreConflictError;
        case: "error";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.AgentStoreConflictResult.
 * Use `create(AgentStoreConflictResultSchema)` to create a new message.
 */
export declare const AgentStoreConflictResultSchema: GenMessage<AgentStoreConflictResult>;
/**
 * @generated from message agent.v1.FileDiff_Chunk
 */
export type FileDiff_Chunk = Message<"agent.v1.FileDiff_Chunk"> & {
    /**
     * @generated from field: string content = 1;
     */
    content: string;
    /**
     * @generated from field: repeated string lines = 2;
     */
    lines: string[];
    /**
     * @generated from field: int32 old_start = 3;
     */
    oldStart: number;
    /**
     * @generated from field: int32 old_lines = 4;
     */
    oldLines: number;
    /**
     * @generated from field: int32 new_start = 5;
     */
    newStart: number;
    /**
     * @generated from field: int32 new_lines = 6;
     */
    newLines: number;
};
/**
 * Describes the message agent.v1.FileDiff_Chunk.
 * Use `create(FileDiff_ChunkSchema)` to create a new message.
 */
export declare const FileDiff_ChunkSchema: GenMessage<FileDiff_Chunk>;
/**
 * @generated from message agent.v1.FileDiff
 */
export type FileDiff = Message<"agent.v1.FileDiff"> & {
    /**
     * @generated from field: int32 added = 4;
     */
    added: number;
    /**
     * @generated from field: int32 removed = 5;
     */
    removed: number;
    /**
     * @generated from field: string from = 1;
     */
    from: string;
    /**
     * @generated from field: string to = 2;
     */
    to: string;
    /**
     * @generated from field: repeated agent.v1.FileDiff_Chunk chunks = 3;
     */
    chunks: FileDiff_Chunk[];
    /**
     * @generated from field: optional string before_file_contents = 6;
     */
    beforeFileContents?: string | undefined;
    /**
     * @generated from field: optional string after_file_contents = 7;
     */
    afterFileContents?: string | undefined;
    /**
     * @generated from field: optional bool is_generated = 8;
     */
    isGenerated?: boolean | undefined;
};
/**
 * Describes the message agent.v1.FileDiff.
 * Use `create(FileDiffSchema)` to create a new message.
 */
export declare const FileDiffSchema: GenMessage<FileDiff>;
/**
 * @generated from message agent.v1.GitDiff
 */
export type GitDiff = Message<"agent.v1.GitDiff"> & {
    /**
     * @generated from field: repeated agent.v1.FileDiff diffs = 1;
     */
    diffs: FileDiff[];
    /**
     * @generated from field: agent.v1.GitDiff_DiffType diff_type = 2;
     */
    diffType: GitDiff_DiffType;
};
/**
 * Describes the message agent.v1.GitDiff.
 * Use `create(GitDiffSchema)` to create a new message.
 */
export declare const GitDiffSchema: GenMessage<GitDiff>;
/**
 * @generated from message agent.v1.GetDiffResponse_SubmoduleDiff
 */
export type GetDiffResponse_SubmoduleDiff = Message<"agent.v1.GetDiffResponse_SubmoduleDiff"> & {
    /**
     * @generated from field: string relative_path = 1;
     */
    relativePath: string;
    /**
     * @generated from field: agent.v1.GitDiff diff = 2;
     */
    diff?: GitDiff | undefined;
    /**
     * @generated from field: bool errored = 3;
     */
    errored: boolean;
};
/**
 * Describes the message agent.v1.GetDiffResponse_SubmoduleDiff.
 * Use `create(GetDiffResponse_SubmoduleDiffSchema)` to create a new message.
 */
export declare const GetDiffResponse_SubmoduleDiffSchema: GenMessage<GetDiffResponse_SubmoduleDiff>;
/**
 * @generated from message agent.v1.GetDiffRequest
 */
export type GetDiffRequest = Message<"agent.v1.GetDiffRequest"> & {
    /**
     * @generated from field: string cwd = 1;
     */
    cwd: string;
    /**
     * @generated from field: string ref = 2;
     */
    ref: string;
    /**
     * @generated from field: string base_ref = 3;
     */
    baseRef: string;
    /**
     * @generated from field: bool merge_base = 4;
     */
    mergeBase: boolean;
    /**
     * @generated from field: repeated string target_paths = 5;
     */
    targetPaths: string[];
    /**
     * @generated from field: optional int32 unified_context_lines = 6;
     */
    unifiedContextLines?: number | undefined;
    /**
     * @generated from field: int32 max_untracked_files = 7;
     */
    maxUntrackedFiles: number;
    /**
     * @generated from field: int32 submodule_recurse_depth = 9;
     */
    submoduleRecurseDepth: number;
    /**
     * @generated from field: bool include_space_changes = 10;
     */
    includeSpaceChanges: boolean;
    /**
     * @generated from field: bool committed_only = 11;
     */
    committedOnly: boolean;
    /**
     * @generated from field: bool compute_patch_id = 12;
     */
    computePatchId: boolean;
    /**
     * @generated from field: optional bool return_head_sha = 13;
     */
    returnHeadSha?: boolean | undefined;
    /**
     * @generated from field: optional int32 max_response_bytes = 14;
     */
    maxResponseBytes?: number | undefined;
    /**
     * @generated from field: optional agent.v1.GetDiffRequest_OutputFormat output_format = 8;
     */
    outputFormat?: GetDiffRequest_OutputFormat | undefined;
};
/**
 * Describes the message agent.v1.GetDiffRequest.
 * Use `create(GetDiffRequestSchema)` to create a new message.
 */
export declare const GetDiffRequestSchema: GenMessage<GetDiffRequest>;
/**
 * @generated from message agent.v1.GetDiffResponse
 */
export type GetDiffResponse = Message<"agent.v1.GetDiffResponse"> & {
    /**
     * @generated from field: agent.v1.GitDiff diff = 1;
     */
    diff?: GitDiff | undefined;
    /**
     * @generated from field: repeated agent.v1.GetDiffResponse_SubmoduleDiff submodule_diffs = 2;
     */
    submoduleDiffs: GetDiffResponse_SubmoduleDiff[];
    /**
     * @generated from field: optional string patch_id = 3;
     */
    patchId?: string | undefined;
    /**
     * @generated from field: optional string head_sha = 4;
     */
    headSha?: string | undefined;
    /**
     * @generated from field: optional bool has_uncommitted_changes = 5;
     */
    hasUncommittedChanges?: boolean | undefined;
};
/**
 * Describes the message agent.v1.GetDiffResponse.
 * Use `create(GetDiffResponseSchema)` to create a new message.
 */
export declare const GetDiffResponseSchema: GenMessage<GetDiffResponse>;
/**
 * @generated from message agent.v1.PiReadToolCall
 */
export type PiReadToolCall = Message<"agent.v1.PiReadToolCall"> & {
    /**
     * @generated from field: agent.v1.PiReadExecArgs args = 1;
     */
    args?: PiReadExecArgs | undefined;
    /**
     * @generated from field: agent.v1.PiReadExecResult result = 2;
     */
    result?: PiReadExecResult | undefined;
};
/**
 * Describes the message agent.v1.PiReadToolCall.
 * Use `create(PiReadToolCallSchema)` to create a new message.
 */
export declare const PiReadToolCallSchema: GenMessage<PiReadToolCall>;
/**
 * @generated from message agent.v1.PiBashToolCall
 */
export type PiBashToolCall = Message<"agent.v1.PiBashToolCall"> & {
    /**
     * @generated from field: agent.v1.PiBashExecArgs args = 1;
     */
    args?: PiBashExecArgs | undefined;
    /**
     * @generated from field: agent.v1.PiBashExecResult result = 2;
     */
    result?: PiBashExecResult | undefined;
};
/**
 * Describes the message agent.v1.PiBashToolCall.
 * Use `create(PiBashToolCallSchema)` to create a new message.
 */
export declare const PiBashToolCallSchema: GenMessage<PiBashToolCall>;
/**
 * @generated from message agent.v1.PiEditToolCall
 */
export type PiEditToolCall = Message<"agent.v1.PiEditToolCall"> & {
    /**
     * @generated from field: agent.v1.PiEditExecArgs args = 1;
     */
    args?: PiEditExecArgs | undefined;
    /**
     * @generated from field: agent.v1.PiEditExecResult result = 2;
     */
    result?: PiEditExecResult | undefined;
};
/**
 * Describes the message agent.v1.PiEditToolCall.
 * Use `create(PiEditToolCallSchema)` to create a new message.
 */
export declare const PiEditToolCallSchema: GenMessage<PiEditToolCall>;
/**
 * @generated from message agent.v1.PiWriteToolCall
 */
export type PiWriteToolCall = Message<"agent.v1.PiWriteToolCall"> & {
    /**
     * @generated from field: agent.v1.PiWriteExecArgs args = 1;
     */
    args?: PiWriteExecArgs | undefined;
    /**
     * @generated from field: agent.v1.PiWriteExecResult result = 2;
     */
    result?: PiWriteExecResult | undefined;
};
/**
 * Describes the message agent.v1.PiWriteToolCall.
 * Use `create(PiWriteToolCallSchema)` to create a new message.
 */
export declare const PiWriteToolCallSchema: GenMessage<PiWriteToolCall>;
/**
 * @generated from message agent.v1.PiGrepToolCall
 */
export type PiGrepToolCall = Message<"agent.v1.PiGrepToolCall"> & {
    /**
     * @generated from field: agent.v1.PiGrepExecArgs args = 1;
     */
    args?: PiGrepExecArgs | undefined;
    /**
     * @generated from field: agent.v1.PiGrepExecResult result = 2;
     */
    result?: PiGrepExecResult | undefined;
};
/**
 * Describes the message agent.v1.PiGrepToolCall.
 * Use `create(PiGrepToolCallSchema)` to create a new message.
 */
export declare const PiGrepToolCallSchema: GenMessage<PiGrepToolCall>;
/**
 * @generated from message agent.v1.PiFindToolCall
 */
export type PiFindToolCall = Message<"agent.v1.PiFindToolCall"> & {
    /**
     * @generated from field: agent.v1.PiFindExecArgs args = 1;
     */
    args?: PiFindExecArgs | undefined;
    /**
     * @generated from field: agent.v1.PiFindExecResult result = 2;
     */
    result?: PiFindExecResult | undefined;
};
/**
 * Describes the message agent.v1.PiFindToolCall.
 * Use `create(PiFindToolCallSchema)` to create a new message.
 */
export declare const PiFindToolCallSchema: GenMessage<PiFindToolCall>;
/**
 * @generated from message agent.v1.PiLsToolCall
 */
export type PiLsToolCall = Message<"agent.v1.PiLsToolCall"> & {
    /**
     * @generated from field: agent.v1.PiLsExecArgs args = 1;
     */
    args?: PiLsExecArgs | undefined;
    /**
     * @generated from field: agent.v1.PiLsExecResult result = 2;
     */
    result?: PiLsExecResult | undefined;
};
/**
 * Describes the message agent.v1.PiLsToolCall.
 * Use `create(PiLsToolCallSchema)` to create a new message.
 */
export declare const PiLsToolCallSchema: GenMessage<PiLsToolCall>;
/**
 * @generated from message agent.v1.SearchConversationsToolCall
 */
export type SearchConversationsToolCall = Message<"agent.v1.SearchConversationsToolCall"> & {
    /**
     * @generated from field: agent.v1.ConversationSearchArgs args = 1;
     */
    args?: ConversationSearchArgs | undefined;
    /**
     * @generated from field: agent.v1.ConversationSearchResult result = 2;
     */
    result?: ConversationSearchResult | undefined;
};
/**
 * Describes the message agent.v1.SearchConversationsToolCall.
 * Use `create(SearchConversationsToolCallSchema)` to create a new message.
 */
export declare const SearchConversationsToolCallSchema: GenMessage<SearchConversationsToolCall>;
/**
 * @generated from message agent.v1.ConnectScmGithubRepository
 */
export type ConnectScmGithubRepository = Message<"agent.v1.ConnectScmGithubRepository"> & {
    /**
     * @generated from field: string owner = 1;
     */
    owner: string;
    /**
     * @generated from field: string repo = 2;
     */
    repo: string;
};
/**
 * Describes the message agent.v1.ConnectScmGithubRepository.
 * Use `create(ConnectScmGithubRepositorySchema)` to create a new message.
 */
export declare const ConnectScmGithubRepositorySchema: GenMessage<ConnectScmGithubRepository>;
/**
 * @generated from message agent.v1.ConnectScmGithub
 */
export type ConnectScmGithub = Message<"agent.v1.ConnectScmGithub"> & {
    /**
     * @generated from field: agent.v1.ConnectScmGithubRepository repository = 1;
     */
    repository?: ConnectScmGithubRepository | undefined;
    /**
     * @generated from field: optional string ghe_application = 2;
     */
    gheApplication?: string | undefined;
};
/**
 * Describes the message agent.v1.ConnectScmGithub.
 * Use `create(ConnectScmGithubSchema)` to create a new message.
 */
export declare const ConnectScmGithubSchema: GenMessage<ConnectScmGithub>;
/**
 * @generated from message agent.v1.ConnectScmArgs
 */
export type ConnectScmArgs = Message<"agent.v1.ConnectScmArgs"> & {
    /**
     * @generated from field: string tool_call_id = 1;
     */
    toolCallId: string;
    /**
     * @generated from oneof agent.v1.ConnectScmArgs.target
     */
    target: {
        /**
         * @generated from field: agent.v1.ConnectScmGithub github = 2;
         */
        value: ConnectScmGithub;
        case: "github";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ConnectScmArgs.
 * Use `create(ConnectScmArgsSchema)` to create a new message.
 */
export declare const ConnectScmArgsSchema: GenMessage<ConnectScmArgs>;
/**
 * @generated from message agent.v1.ConnectScmSuccess
 */
export type ConnectScmSuccess = Message<"agent.v1.ConnectScmSuccess"> & {};
/**
 * Describes the message agent.v1.ConnectScmSuccess.
 * Use `create(ConnectScmSuccessSchema)` to create a new message.
 */
export declare const ConnectScmSuccessSchema: GenMessage<ConnectScmSuccess>;
/**
 * @generated from message agent.v1.ConnectScmError
 */
export type ConnectScmError = Message<"agent.v1.ConnectScmError"> & {
    /**
     * @generated from field: string error = 1;
     */
    error: string;
};
/**
 * Describes the message agent.v1.ConnectScmError.
 * Use `create(ConnectScmErrorSchema)` to create a new message.
 */
export declare const ConnectScmErrorSchema: GenMessage<ConnectScmError>;
/**
 * @generated from message agent.v1.ConnectScmRejected
 */
export type ConnectScmRejected = Message<"agent.v1.ConnectScmRejected"> & {
    /**
     * @generated from field: string reason = 1;
     */
    reason: string;
};
/**
 * Describes the message agent.v1.ConnectScmRejected.
 * Use `create(ConnectScmRejectedSchema)` to create a new message.
 */
export declare const ConnectScmRejectedSchema: GenMessage<ConnectScmRejected>;
/**
 * @generated from message agent.v1.ConnectScmResult
 */
export type ConnectScmResult = Message<"agent.v1.ConnectScmResult"> & {
    /**
     * @generated from oneof agent.v1.ConnectScmResult.result
     */
    result: {
        /**
         * @generated from field: agent.v1.ConnectScmSuccess success = 1;
         */
        value: ConnectScmSuccess;
        case: "success";
    } | {
        /**
         * @generated from field: agent.v1.ConnectScmError error = 2;
         */
        value: ConnectScmError;
        case: "error";
    } | {
        /**
         * @generated from field: agent.v1.ConnectScmRejected rejected = 3;
         */
        value: ConnectScmRejected;
        case: "rejected";
    } | {
        case: undefined;
        value?: undefined;
    };
};
/**
 * Describes the message agent.v1.ConnectScmResult.
 * Use `create(ConnectScmResultSchema)` to create a new message.
 */
export declare const ConnectScmResultSchema: GenMessage<ConnectScmResult>;
/**
 * @generated from message agent.v1.ConnectScmToolCall
 */
export type ConnectScmToolCall = Message<"agent.v1.ConnectScmToolCall"> & {
    /**
     * @generated from field: agent.v1.ConnectScmArgs args = 1;
     */
    args?: ConnectScmArgs | undefined;
    /**
     * @generated from field: agent.v1.ConnectScmResult result = 2;
     */
    result?: ConnectScmResult | undefined;
};
/**
 * Describes the message agent.v1.ConnectScmToolCall.
 * Use `create(ConnectScmToolCallSchema)` to create a new message.
 */
export declare const ConnectScmToolCallSchema: GenMessage<ConnectScmToolCall>;
/**
 * @generated from enum agent.v1.AppliedAgentChange_ChangeType
 */
export declare enum AppliedAgentChange_ChangeType {
    /**
     * @generated from enum value: CHANGE_TYPE_UNSPECIFIED = 0;
     */
    CHANGE_TYPE_UNSPECIFIED = 0,
    /**
     * @generated from enum value: CHANGE_TYPE_CREATED = 1;
     */
    CHANGE_TYPE_CREATED = 1,
    /**
     * @generated from enum value: CHANGE_TYPE_MODIFIED = 2;
     */
    CHANGE_TYPE_MODIFIED = 2,
    /**
     * @generated from enum value: CHANGE_TYPE_DELETED = 3;
     */
    CHANGE_TYPE_DELETED = 3
}
/**
 * Describes the enum agent.v1.AppliedAgentChange_ChangeType.
 */
export declare const AppliedAgentChange_ChangeTypeSchema: GenEnum<AppliedAgentChange_ChangeType>;
/**
 * @generated from enum agent.v1.MouseButton
 */
export declare enum MouseButton {
    /**
     * @generated from enum value: MOUSE_BUTTON_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from enum value: MOUSE_BUTTON_LEFT = 1;
     */
    LEFT = 1,
    /**
     * @generated from enum value: MOUSE_BUTTON_RIGHT = 2;
     */
    RIGHT = 2,
    /**
     * @generated from enum value: MOUSE_BUTTON_MIDDLE = 3;
     */
    MIDDLE = 3,
    /**
     * @generated from enum value: MOUSE_BUTTON_BACK = 4;
     */
    BACK = 4,
    /**
     * @generated from enum value: MOUSE_BUTTON_FORWARD = 5;
     */
    FORWARD = 5
}
/**
 * Describes the enum agent.v1.MouseButton.
 */
export declare const MouseButtonSchema: GenEnum<MouseButton>;
/**
 * @generated from enum agent.v1.ScrollDirection
 */
export declare enum ScrollDirection {
    /**
     * @generated from enum value: SCROLL_DIRECTION_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from enum value: SCROLL_DIRECTION_UP = 1;
     */
    UP = 1,
    /**
     * @generated from enum value: SCROLL_DIRECTION_DOWN = 2;
     */
    DOWN = 2,
    /**
     * @generated from enum value: SCROLL_DIRECTION_LEFT = 3;
     */
    LEFT = 3,
    /**
     * @generated from enum value: SCROLL_DIRECTION_RIGHT = 4;
     */
    RIGHT = 4
}
/**
 * Describes the enum agent.v1.ScrollDirection.
 */
export declare const ScrollDirectionSchema: GenEnum<ScrollDirection>;
/**
 * @generated from enum agent.v1.CursorRuleSource
 */
export declare enum CursorRuleSource {
    /**
     * @generated from enum value: CURSOR_RULE_SOURCE_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from enum value: CURSOR_RULE_SOURCE_TEAM = 1;
     */
    TEAM = 1,
    /**
     * @generated from enum value: CURSOR_RULE_SOURCE_USER = 2;
     */
    USER = 2
}
/**
 * Describes the enum agent.v1.CursorRuleSource.
 */
export declare const CursorRuleSourceSchema: GenEnum<CursorRuleSource>;
/**
 * @generated from enum agent.v1.DiagnosticSeverity
 */
export declare enum DiagnosticSeverity {
    /**
     * @generated from enum value: DIAGNOSTIC_SEVERITY_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from enum value: DIAGNOSTIC_SEVERITY_ERROR = 1;
     */
    ERROR = 1,
    /**
     * @generated from enum value: DIAGNOSTIC_SEVERITY_WARNING = 2;
     */
    WARNING = 2,
    /**
     * @generated from enum value: DIAGNOSTIC_SEVERITY_INFORMATION = 3;
     */
    INFORMATION = 3,
    /**
     * @generated from enum value: DIAGNOSTIC_SEVERITY_HINT = 4;
     */
    HINT = 4
}
/**
 * Describes the enum agent.v1.DiagnosticSeverity.
 */
export declare const DiagnosticSeveritySchema: GenEnum<DiagnosticSeverity>;
/**
 * @generated from enum agent.v1.RecordingMode
 */
export declare enum RecordingMode {
    /**
     * @generated from enum value: RECORDING_MODE_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from enum value: RECORDING_MODE_START_RECORDING = 1;
     */
    START_RECORDING = 1,
    /**
     * @generated from enum value: RECORDING_MODE_SAVE_RECORDING = 2;
     */
    SAVE_RECORDING = 2,
    /**
     * @generated from enum value: RECORDING_MODE_DISCARD_RECORDING = 3;
     */
    DISCARD_RECORDING = 3
}
/**
 * Describes the enum agent.v1.RecordingMode.
 */
export declare const RecordingModeSchema: GenEnum<RecordingMode>;
/**
 * @generated from enum agent.v1.RequestedFilePathRejectedReason
 */
export declare enum RequestedFilePathRejectedReason {
    /**
     * @generated from enum value: REQUESTED_FILE_PATH_REJECTED_REASON_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from enum value: REQUESTED_FILE_PATH_REJECTED_REASON_SLASHES_NOT_ALLOWED = 1;
     */
    SLASHES_NOT_ALLOWED = 1
}
/**
 * Describes the enum agent.v1.RequestedFilePathRejectedReason.
 */
export declare const RequestedFilePathRejectedReasonSchema: GenEnum<RequestedFilePathRejectedReason>;
/**
 * @generated from enum agent.v1.PackageType
 */
export declare enum PackageType {
    /**
     * @generated from enum value: PACKAGE_TYPE_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from enum value: PACKAGE_TYPE_CURSOR_PROJECT = 1;
     */
    CURSOR_PROJECT = 1,
    /**
     * @generated from enum value: PACKAGE_TYPE_CURSOR_PERSONAL = 2;
     */
    CURSOR_PERSONAL = 2,
    /**
     * @generated from enum value: PACKAGE_TYPE_CLAUDE_SKILL = 3;
     */
    CLAUDE_SKILL = 3,
    /**
     * @generated from enum value: PACKAGE_TYPE_CLAUDE_PLUGIN = 4;
     */
    CLAUDE_PLUGIN = 4
}
/**
 * Describes the enum agent.v1.PackageType.
 */
export declare const PackageTypeSchema: GenEnum<PackageType>;
/**
 * @generated from enum agent.v1.SandboxPolicy_Type
 */
export declare enum SandboxPolicy_Type {
    /**
     * @generated from enum value: TYPE_UNSPECIFIED = 0;
     */
    TYPE_UNSPECIFIED = 0,
    /**
     * @generated from enum value: TYPE_INSECURE_NONE = 1;
     */
    TYPE_INSECURE_NONE = 1,
    /**
     * @generated from enum value: TYPE_WORKSPACE_READWRITE = 2;
     */
    TYPE_WORKSPACE_READWRITE = 2,
    /**
     * @generated from enum value: TYPE_WORKSPACE_READONLY = 3;
     */
    TYPE_WORKSPACE_READONLY = 3
}
/**
 * Describes the enum agent.v1.SandboxPolicy_Type.
 */
export declare const SandboxPolicy_TypeSchema: GenEnum<SandboxPolicy_Type>;
/**
 * @generated from enum agent.v1.TimeoutBehavior
 */
export declare enum TimeoutBehavior {
    /**
     * @generated from enum value: TIMEOUT_BEHAVIOR_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from enum value: TIMEOUT_BEHAVIOR_CANCEL = 1;
     */
    CANCEL = 1,
    /**
     * @generated from enum value: TIMEOUT_BEHAVIOR_BACKGROUND = 2;
     */
    BACKGROUND = 2
}
/**
 * Describes the enum agent.v1.TimeoutBehavior.
 */
export declare const TimeoutBehaviorSchema: GenEnum<TimeoutBehavior>;
/**
 * @generated from enum agent.v1.ShellAbortReason
 */
export declare enum ShellAbortReason {
    /**
     * @generated from enum value: SHELL_ABORT_REASON_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from enum value: SHELL_ABORT_REASON_USER_ABORT = 1;
     */
    USER_ABORT = 1,
    /**
     * @generated from enum value: SHELL_ABORT_REASON_TIMEOUT = 2;
     */
    TIMEOUT = 2
}
/**
 * Describes the enum agent.v1.ShellAbortReason.
 */
export declare const ShellAbortReasonSchema: GenEnum<ShellAbortReason>;
/**
 * @generated from enum agent.v1.CustomSubagentPermissionMode
 */
export declare enum CustomSubagentPermissionMode {
    /**
     * @generated from enum value: CUSTOM_SUBAGENT_PERMISSION_MODE_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from enum value: CUSTOM_SUBAGENT_PERMISSION_MODE_DEFAULT = 1;
     */
    DEFAULT = 1,
    /**
     * @generated from enum value: CUSTOM_SUBAGENT_PERMISSION_MODE_READONLY = 2;
     */
    READONLY = 2
}
/**
 * Describes the enum agent.v1.CustomSubagentPermissionMode.
 */
export declare const CustomSubagentPermissionModeSchema: GenEnum<CustomSubagentPermissionMode>;
/**
 * @generated from enum agent.v1.TodoStatus
 */
export declare enum TodoStatus {
    /**
     * @generated from enum value: TODO_STATUS_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from enum value: TODO_STATUS_PENDING = 1;
     */
    PENDING = 1,
    /**
     * @generated from enum value: TODO_STATUS_IN_PROGRESS = 2;
     */
    IN_PROGRESS = 2,
    /**
     * @generated from enum value: TODO_STATUS_COMPLETED = 3;
     */
    COMPLETED = 3,
    /**
     * @generated from enum value: TODO_STATUS_CANCELLED = 4;
     */
    CANCELLED = 4
}
/**
 * Describes the enum agent.v1.TodoStatus.
 */
export declare const TodoStatusSchema: GenEnum<TodoStatus>;
/**
 * @generated from enum agent.v1.ClientOS
 */
export declare enum ClientOS {
    /**
     * @generated from enum value: CLIENT_OS_UNSPECIFIED = 0;
     */
    CLIENT_OS_UNSPECIFIED = 0,
    /**
     * @generated from enum value: CLIENT_OS_WINDOWS = 1;
     */
    CLIENT_OS_WINDOWS = 1,
    /**
     * @generated from enum value: CLIENT_OS_MACOS = 2;
     */
    CLIENT_OS_MACOS = 2,
    /**
     * @generated from enum value: CLIENT_OS_LINUX = 3;
     */
    CLIENT_OS_LINUX = 3
}
/**
 * Describes the enum agent.v1.ClientOS.
 */
export declare const ClientOSSchema: GenEnum<ClientOS>;
/**
 * @generated from enum agent.v1.ArtifactUploadDispatchStatus
 */
export declare enum ArtifactUploadDispatchStatus {
    /**
     * @generated from enum value: ARTIFACT_UPLOAD_DISPATCH_STATUS_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from enum value: ARTIFACT_UPLOAD_DISPATCH_STATUS_ACCEPTED = 1;
     */
    ACCEPTED = 1,
    /**
     * @generated from enum value: ARTIFACT_UPLOAD_DISPATCH_STATUS_REJECTED = 2;
     */
    REJECTED = 2,
    /**
     * @generated from enum value: ARTIFACT_UPLOAD_DISPATCH_STATUS_SKIPPED_ALREADY_IN_PROGRESS = 3;
     */
    SKIPPED_ALREADY_IN_PROGRESS = 3
}
/**
 * Describes the enum agent.v1.ArtifactUploadDispatchStatus.
 */
export declare const ArtifactUploadDispatchStatusSchema: GenEnum<ArtifactUploadDispatchStatus>;
/**
 * @generated from enum agent.v1.Frame_Kind
 */
export declare enum Frame_Kind {
    /**
     * @generated from enum value: KIND_UNSPECIFIED = 0;
     */
    KIND_UNSPECIFIED = 0,
    /**
     * @generated from enum value: KIND_REQUEST = 1;
     */
    KIND_REQUEST = 1,
    /**
     * @generated from enum value: KIND_RESPONSE = 2;
     */
    KIND_RESPONSE = 2,
    /**
     * @generated from enum value: KIND_ERROR = 3;
     */
    KIND_ERROR = 3
}
/**
 * Describes the enum agent.v1.Frame_Kind.
 */
export declare const Frame_KindSchema: GenEnum<Frame_Kind>;
/**
 * @generated from enum agent.v1.BugbotDeeplinkEventKind
 */
export declare enum BugbotDeeplinkEventKind {
    /**
     * @generated from enum value: BUGBOT_DEEPLINK_EVENT_KIND_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from enum value: BUGBOT_DEEPLINK_EVENT_KIND_CLICKED = 1;
     */
    CLICKED = 1,
    /**
     * @generated from enum value: BUGBOT_DEEPLINK_EVENT_KIND_HANDLED_DIALOG_SHOWN = 2;
     */
    HANDLED_DIALOG_SHOWN = 2,
    /**
     * @generated from enum value: BUGBOT_DEEPLINK_EVENT_KIND_HANDLED_CHAT_CREATED = 3;
     */
    HANDLED_CHAT_CREATED = 3,
    /**
     * @generated from enum value: BUGBOT_DEEPLINK_EVENT_KIND_ERROR = 4;
     */
    ERROR = 4,
    /**
     * @generated from enum value: BUGBOT_DEEPLINK_EVENT_KIND_HANDLED_FIX_IN_WEB = 5;
     */
    HANDLED_FIX_IN_WEB = 5
}
/**
 * Describes the enum agent.v1.BugbotDeeplinkEventKind.
 */
export declare const BugbotDeeplinkEventKindSchema: GenEnum<BugbotDeeplinkEventKind>;
/**
 * @generated from enum agent.v1.CommandClassifierResult_SuggestedSandboxMode
 */
export declare enum CommandClassifierResult_SuggestedSandboxMode {
    /**
     * @generated from enum value: SUGGESTED_SANDBOX_MODE_UNSPECIFIED = 0;
     */
    SUGGESTED_SANDBOX_MODE_UNSPECIFIED = 0,
    /**
     * @generated from enum value: SUGGESTED_SANDBOX_MODE_SANDBOX = 1;
     */
    SUGGESTED_SANDBOX_MODE_SANDBOX = 1,
    /**
     * @generated from enum value: SUGGESTED_SANDBOX_MODE_NO_SANDBOX = 2;
     */
    SUGGESTED_SANDBOX_MODE_NO_SANDBOX = 2,
    /**
     * @generated from enum value: SUGGESTED_SANDBOX_MODE_UNDETERMINED = 3;
     */
    SUGGESTED_SANDBOX_MODE_UNDETERMINED = 3
}
/**
 * Describes the enum agent.v1.CommandClassifierResult_SuggestedSandboxMode.
 */
export declare const CommandClassifierResult_SuggestedSandboxModeSchema: GenEnum<CommandClassifierResult_SuggestedSandboxMode>;
/**
 * @generated from enum agent.v1.ShellHookApprovalRequirement_Kind
 */
export declare enum ShellHookApprovalRequirement_Kind {
    /**
     * @generated from enum value: SHELL_HOOK_APPROVAL_REQUIREMENT_KIND_UNSPECIFIED = 0;
     */
    SHELL_HOOK_APPROVAL_REQUIREMENT_KIND_UNSPECIFIED = 0,
    /**
     * @generated from enum value: SHELL_HOOK_APPROVAL_REQUIREMENT_KIND_FORCE_PROMPT = 1;
     */
    SHELL_HOOK_APPROVAL_REQUIREMENT_KIND_FORCE_PROMPT = 1
}
/**
 * Describes the enum agent.v1.ShellHookApprovalRequirement_Kind.
 */
export declare const ShellHookApprovalRequirement_KindSchema: GenEnum<ShellHookApprovalRequirement_Kind>;
/**
 * @generated from enum agent.v1.ShellBackgroundReason
 */
export declare enum ShellBackgroundReason {
    /**
     * @generated from enum value: SHELL_BACKGROUND_REASON_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from enum value: SHELL_BACKGROUND_REASON_TIMEOUT = 1;
     */
    TIMEOUT = 1,
    /**
     * @generated from enum value: SHELL_BACKGROUND_REASON_USER_REQUEST = 2;
     */
    USER_REQUEST = 2
}
/**
 * Describes the enum agent.v1.ShellBackgroundReason.
 */
export declare const ShellBackgroundReasonSchema: GenEnum<ShellBackgroundReason>;
/**
 * @generated from enum agent.v1.ForceBackgroundShellStatus
 */
export declare enum ForceBackgroundShellStatus {
    /**
     * @generated from enum value: FORCE_BACKGROUND_SHELL_STATUS_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from enum value: FORCE_BACKGROUND_SHELL_STATUS_ACCEPTED = 1;
     */
    ACCEPTED = 1,
    /**
     * @generated from enum value: FORCE_BACKGROUND_SHELL_STATUS_NOT_FOUND = 2;
     */
    NOT_FOUND = 2
}
/**
 * Describes the enum agent.v1.ForceBackgroundShellStatus.
 */
export declare const ForceBackgroundShellStatusSchema: GenEnum<ForceBackgroundShellStatus>;
/**
 * @generated from enum agent.v1.SubagentBackgroundReason
 */
export declare enum SubagentBackgroundReason {
    /**
     * @generated from enum value: SUBAGENT_BACKGROUND_REASON_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from enum value: SUBAGENT_BACKGROUND_REASON_AGENT_REQUEST = 1;
     */
    AGENT_REQUEST = 1,
    /**
     * @generated from enum value: SUBAGENT_BACKGROUND_REASON_USER_REQUEST = 2;
     */
    USER_REQUEST = 2,
    /**
     * @generated from enum value: SUBAGENT_BACKGROUND_REASON_QUEUED_FOLLOW_UP = 3;
     */
    QUEUED_FOLLOW_UP = 3
}
/**
 * Describes the enum agent.v1.SubagentBackgroundReason.
 */
export declare const SubagentBackgroundReasonSchema: GenEnum<SubagentBackgroundReason>;
/**
 * @generated from enum agent.v1.ForceBackgroundSubagentStatus
 */
export declare enum ForceBackgroundSubagentStatus {
    /**
     * @generated from enum value: FORCE_BACKGROUND_SUBAGENT_STATUS_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from enum value: FORCE_BACKGROUND_SUBAGENT_STATUS_ACCEPTED = 1;
     */
    ACCEPTED = 1,
    /**
     * @generated from enum value: FORCE_BACKGROUND_SUBAGENT_STATUS_NOT_FOUND = 2;
     */
    NOT_FOUND = 2
}
/**
 * Describes the enum agent.v1.ForceBackgroundSubagentStatus.
 */
export declare const ForceBackgroundSubagentStatusSchema: GenEnum<ForceBackgroundSubagentStatus>;
/**
 * @generated from enum agent.v1.SmartModeClassifierDecision
 */
export declare enum SmartModeClassifierDecision {
    /**
     * @generated from enum value: SMART_MODE_CLASSIFIER_DECISION_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from enum value: SMART_MODE_CLASSIFIER_DECISION_ALLOW = 1;
     */
    ALLOW = 1,
    /**
     * @generated from enum value: SMART_MODE_CLASSIFIER_DECISION_BLOCK = 2;
     */
    BLOCK = 2
}
/**
 * Describes the enum agent.v1.SmartModeClassifierDecision.
 */
export declare const SmartModeClassifierDecisionSchema: GenEnum<SmartModeClassifierDecision>;
/**
 * @generated from enum agent.v1.ConversationSearchSource
 */
export declare enum ConversationSearchSource {
    /**
     * @generated from enum value: CONVERSATION_SEARCH_SOURCE_UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * @generated from enum value: CONVERSATION_SEARCH_SOURCE_LOCAL = 1;
     */
    LOCAL = 1,
    /**
     * @generated from enum value: CONVERSATION_SEARCH_SOURCE_CLOUD_CACHE = 2;
     */
    CLOUD_CACHE = 2
}
/**
 * Describes the enum agent.v1.ConversationSearchSource.
 */
export declare const ConversationSearchSourceSchema: GenEnum<ConversationSearchSource>;
/**
 * @generated from enum agent.v1.GetDiffRequest_OutputFormat
 */
export declare enum GetDiffRequest_OutputFormat {
    /**
     * @generated from enum value: OUTPUT_FORMAT_UNSPECIFIED = 0;
     */
    OUTPUT_FORMAT_UNSPECIFIED = 0,
    /**
     * @generated from enum value: OUTPUT_FORMAT_NAME_STATUS = 1;
     */
    OUTPUT_FORMAT_NAME_STATUS = 1,
    /**
     * @generated from enum value: OUTPUT_FORMAT_NAME_STATUS_AND_NUMSTAT = 2;
     */
    OUTPUT_FORMAT_NAME_STATUS_AND_NUMSTAT = 2,
    /**
     * @generated from enum value: OUTPUT_FORMAT_FILE_DIFFS = 3;
     */
    OUTPUT_FORMAT_FILE_DIFFS = 3,
    /**
     * @generated from enum value: OUTPUT_FORMAT_DIFFS_WITH_BEFORE_AND_AFTER = 4;
     */
    OUTPUT_FORMAT_DIFFS_WITH_BEFORE_AND_AFTER = 4
}
/**
 * Describes the enum agent.v1.GetDiffRequest_OutputFormat.
 */
export declare const GetDiffRequest_OutputFormatSchema: GenEnum<GetDiffRequest_OutputFormat>;
/**
 * @generated from enum agent.v1.GitDiff_DiffType
 */
export declare enum GitDiff_DiffType {
    /**
     * @generated from enum value: DIFF_TYPE_UNSPECIFIED = 0;
     */
    DIFF_TYPE_UNSPECIFIED = 0,
    /**
     * @generated from enum value: DIFF_TYPE_DIFF_TO_HEAD = 1;
     */
    DIFF_TYPE_DIFF_TO_HEAD = 1,
    /**
     * @generated from enum value: DIFF_TYPE_DIFF_FROM_BRANCH_TO_MAIN = 2;
     */
    DIFF_TYPE_DIFF_FROM_BRANCH_TO_MAIN = 2
}
/**
 * Describes the enum agent.v1.GitDiff_DiffType.
 */
export declare const GitDiff_DiffTypeSchema: GenEnum<GitDiff_DiffType>;
/**
 * Agent Service with bidirectional streaming
 *
 * @generated from service agent.v1.AgentService
 */
export declare const AgentService: GenService<{
    /**
     * @generated from rpc agent.v1.AgentService.Run
     */
    run: {
        methodKind: "unary";
        input: typeof AgentClientMessageSchema;
        output: typeof AgentServerMessageSchema;
    };
    /**
     * @generated from rpc agent.v1.AgentService.RunSSE
     */
    runSSE: {
        methodKind: "unary";
        input: typeof BidiRequestIdSchema;
        output: typeof AgentServerMessageSchema;
    };
    /**
     * Generate a very short, succinct agent name from the provided user message.
     *
     * @generated from rpc agent.v1.AgentService.NameAgent
     */
    nameAgent: {
        methodKind: "unary";
        input: typeof NameAgentRequestSchema;
        output: typeof NameAgentResponseSchema;
    };
    /**
     * @generated from rpc agent.v1.AgentService.GetUsableModels
     */
    getUsableModels: {
        methodKind: "unary";
        input: typeof GetUsableModelsRequestSchema;
        output: typeof GetUsableModelsResponseSchema;
    };
    /**
     * @generated from rpc agent.v1.AgentService.GetDefaultModelForCli
     */
    getDefaultModelForCli: {
        methodKind: "unary";
        input: typeof GetDefaultModelForCliRequestSchema;
        output: typeof GetDefaultModelForCliResponseSchema;
    };
    /**
     * Internal endpoint: returns all allowed model intents for devs
     *
     * @generated from rpc agent.v1.AgentService.GetAllowedModelIntents
     */
    getAllowedModelIntents: {
        methodKind: "unary";
        input: typeof GetAllowedModelIntentsRequestSchema;
        output: typeof GetAllowedModelIntentsResponseSchema;
    };
}>;
/**
 * @generated from service agent.v1.ControlService
 */
export declare const ControlService: GenService<{
    /**
     * Spawn
     * File read / write
     *
     * @generated from rpc agent.v1.ControlService.ReadTextFile
     */
    readTextFile: {
        methodKind: "unary";
        input: typeof ReadTextFileRequestSchema;
        output: typeof ReadTextFileResponseSchema;
    };
    /**
     * @generated from rpc agent.v1.ControlService.WriteTextFile
     */
    writeTextFile: {
        methodKind: "unary";
        input: typeof WriteTextFileRequestSchema;
        output: typeof WriteTextFileResponseSchema;
    };
    /**
     * Binary file read / write
     *
     * @generated from rpc agent.v1.ControlService.ReadBinaryFile
     */
    readBinaryFile: {
        methodKind: "unary";
        input: typeof ReadBinaryFileRequestSchema;
        output: typeof ReadBinaryFileResponseSchema;
    };
    /**
     * @generated from rpc agent.v1.ControlService.WriteBinaryFile
     */
    writeBinaryFile: {
        methodKind: "unary";
        input: typeof WriteBinaryFileRequestSchema;
        output: typeof WriteBinaryFileResponseSchema;
    };
    /**
     * Git
     *
     * @generated from rpc agent.v1.ControlService.GetWorkspaceChangesHash
     */
    getWorkspaceChangesHash: {
        methodKind: "unary";
        input: typeof GetWorkspaceChangesHashRequestSchema;
        output: typeof GetWorkspaceChangesHashResponseSchema;
    };
    /**
     * @generated from rpc agent.v1.ControlService.RefreshGithubAccessToken
     */
    refreshGithubAccessToken: {
        methodKind: "unary";
        input: typeof RefreshGithubAccessTokenRequestSchema;
        output: typeof RefreshGithubAccessTokenResponseSchema;
    };
    /**
     * Remote access
     *
     * @generated from rpc agent.v1.ControlService.WarmRemoteAccessServer
     */
    warmRemoteAccessServer: {
        methodKind: "unary";
        input: typeof WarmRemoteAccessServerRequestSchema;
        output: typeof WarmRemoteAccessServerResponseSchema;
    };
    /**
     * Artifact uploads
     *
     * @generated from rpc agent.v1.ControlService.ListArtifacts
     */
    listArtifacts: {
        methodKind: "unary";
        input: typeof ListArtifactsRequestSchema;
        output: typeof ListArtifactsResponseSchema;
    };
    /**
     * @generated from rpc agent.v1.ControlService.UploadArtifacts
     */
    uploadArtifacts: {
        methodKind: "unary";
        input: typeof UploadArtifactsRequestSchema;
        output: typeof UploadArtifactsResponseSchema;
    };
    /**
     * @generated from rpc agent.v1.ControlService.GetMcpRefreshTokens
     */
    getMcpRefreshTokens: {
        methodKind: "unary";
        input: typeof GetMcpRefreshTokensRequestSchema;
        output: typeof GetMcpRefreshTokensResponseSchema;
    };
    /**
     * Update the exec-daemon's environment variables for subsequent process spawns. This does NOT affect already-running processes.
     *
     * @generated from rpc agent.v1.ControlService.UpdateEnvironmentVariables
     */
    updateEnvironmentVariables: {
        methodKind: "unary";
        input: typeof UpdateEnvironmentVariablesRequestSchema;
        output: typeof UpdateEnvironmentVariablesResponseSchema;
    };
}>;
/**
 * Agent Service with unary RPC
 *
 * @generated from service agent.v1.ExecService
 */
export declare const ExecService: GenService<{}>;
/**
 * @generated from service agent.v1.PrivateWorkerBridgeExternalService
 */
export declare const PrivateWorkerBridgeExternalService: GenService<{
    /**
     * @generated from rpc agent.v1.PrivateWorkerBridgeExternalService.Connect
     */
    connect: {
        methodKind: "unary";
        input: typeof FrameSchema;
        output: typeof FrameSchema;
    };
}>;
/**
 * LifecycleService is exposed by the bridge *client*, in addition to ExecService (tool calls) and ControlService (control operations "within the daemon"). It operates at a similar abstraction level as AnyrunService: it represents operations similar to creating a VM, checking out a repository, etc.
 *
 * @generated from service agent.v1.LifecycleService
 */
export declare const LifecycleService: GenService<{
    /**
     * Resets a long-lived worker
     *
     * @generated from rpc agent.v1.LifecycleService.ResetInstance
     */
    resetInstance: {
        methodKind: "unary";
        input: typeof EmptySchema;
        output: typeof EmptySchema;
    };
    /**
     * Asks worker to exit(0) so that a new worker can take his place
     *
     * @generated from rpc agent.v1.LifecycleService.RenewInstance
     */
    renewInstance: {
        methodKind: "unary";
        input: typeof EmptySchema;
        output: typeof EmptySchema;
    };
}>;
//# sourceMappingURL=agent_pb.d.ts.map