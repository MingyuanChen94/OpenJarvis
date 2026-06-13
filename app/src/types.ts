export type Role = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: Role;
  content: string;
}

export interface ToolCall {
  id: string;
  tool: string;
  arguments?: unknown;
  status: 'running' | 'success' | 'error';
  latencyMs?: number;
  result?: unknown;
}

export interface TokenUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  streaming?: boolean;
  toolCalls?: ToolCall[];
  error?: string;
  usage?: TokenUsage;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ModelInfo {
  id: string;
  object?: string;
  created?: number;
  owned_by?: string;
}

export interface ServerInfo {
  model: string;
  agent: string | null;
  engine: string;
}

export interface ProviderSavings {
  provider: string;
  label?: string;
  input_cost?: number;
  output_cost?: number;
  total_cost: number;
  energy_wh?: number;
  energy_joules?: number;
  flops?: number;
}

export interface SavingsData {
  total_calls: number;
  total_tokens: number;
  total_prompt_tokens?: number;
  total_completion_tokens?: number;
  local_cost?: number;
  per_provider: ProviderSavings[];
  token_counting_version?: number;
}

export interface EnergyStats {
  total_energy_j?: number;
  energy_per_token_j?: number;
  avg_power_w?: number;
  cpu_temp_c?: number;
  gpu_temp_c?: number;
}

export interface TelemetryStats {
  total_requests?: number;
  total_tokens?: number;
  avg_tokens_per_sec?: number;
  avg_ttft_ms?: number;
}

export interface AgentInfo {
  id: string;
  name: string;
  type?: string;
  status: 'idle' | 'running' | 'paused' | 'error';
  description?: string;
  lastActive?: number;
  tasksCompleted?: number;
}

/** A single parsed Server-Sent Events block. */
export interface SSEEvent {
  event?: string;
  data: string;
}
