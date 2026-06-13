import type {
  AgentInfo,
  EnergyStats,
  ModelInfo,
  SavingsData,
  ServerInfo,
  SSEEvent,
  TelemetryStats,
} from '@/types';
import type { ChatRequest } from '@/lib/sse';

export const mockModels: ModelInfo[] = [
  { id: 'qwen2.5:7b', owned_by: 'ollama' },
  { id: 'llama3.1:8b', owned_by: 'ollama' },
  { id: 'phi4:14b', owned_by: 'ollama' },
  { id: 'gpt-4o-mini', owned_by: 'openai' },
];

export const mockServerInfo: ServerInfo = {
  model: 'qwen2.5:7b',
  agent: 'simple',
  engine: 'ollama (demo)',
};

export const mockSavings: SavingsData = {
  total_calls: 1284,
  total_tokens: 2_940_000,
  total_prompt_tokens: 1_810_000,
  total_completion_tokens: 1_130_000,
  local_cost: 0,
  token_counting_version: 2,
  per_provider: [
    { provider: 'claude-opus', label: 'Claude Opus', total_cost: 88.2, energy_wh: 540, flops: 4.1e17 },
    { provider: 'gpt-4o', label: 'GPT-4o', total_cost: 52.6, energy_wh: 410, flops: 3.0e17 },
    { provider: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', total_cost: 31.4, energy_wh: 360, flops: 2.4e17 },
  ],
};

export const mockEnergy: EnergyStats = {
  total_energy_j: 18_400,
  energy_per_token_j: 0.0063,
  avg_power_w: 41.8,
  cpu_temp_c: 54,
  gpu_temp_c: 61,
};

export const mockStats: TelemetryStats = {
  total_requests: 1284,
  total_tokens: 2_940_000,
  avg_tokens_per_sec: 47.5,
  avg_ttft_ms: 320,
};

export const mockAgents: AgentInfo[] = [
  {
    id: 'agent-digest',
    name: 'Morning Digest',
    type: 'scheduler',
    status: 'idle',
    description: 'Summarizes overnight news, calendar, and inbox at 7:00am.',
    lastActive: Date.now() - 1000 * 60 * 60 * 5,
    tasksCompleted: 142,
  },
  {
    id: 'agent-research',
    name: 'Research Scout',
    type: 'deep_research',
    status: 'running',
    description: 'Tracks new arXiv papers matching your saved interests.',
    lastActive: Date.now() - 1000 * 60 * 3,
    tasksCompleted: 27,
  },
  {
    id: 'agent-inbox',
    name: 'Inbox Triage',
    type: 'operative',
    status: 'paused',
    description: 'Flags urgent email and drafts replies locally.',
    lastActive: Date.now() - 1000 * 60 * 60 * 26,
    tasksCompleted: 318,
  },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function craftReply(prompt: string): string {
  const p = prompt.toLowerCase();
  if (/\b(hi|hello|hey|yo)\b/.test(p)) {
    return `Hey! 👋 I'm running in **demo mode**, so this reply is simulated locally — no model or network involved.\n\nStart \`jarvis serve\` and I'll stream real tokens through the same interface. Ask me anything to see the streaming, tool-call cards, and markdown rendering in action.`;
  }
  if (/code|function|python|javascript|typescript|write/.test(p)) {
    return `Here's a small example you can drop in:\n\n\`\`\`python\ndef greet(name: str) -> str:\n    """Return a friendly greeting."""\n    return f"Hello, {name}! Running locally on OpenJarvis."\n\nprint(greet("world"))\n\`\`\`\n\nA few notes:\n\n- It's fully typed and side-effect free.\n- Swap in your own logic where you'd call the model.\n- In demo mode this is canned — the **real** backend would generate it token by token.`;
  }
  if (/weather|search|news|look up|find/.test(p)) {
    return `I checked a tool for that (see the card above).\n\n**Summary**\n\n1. This demo simulates a \`tool_call\` so you can see the animated status card.\n2. With a live backend, agents call real tools — web search, calculator, file readers, MCP servers.\n3. Results stream back inline, exactly like this.`;
  }
  return `That's a great question. In **demo mode** I return a canned, streamed answer so every part of the UI is interactive without a backend.\n\nWhat OpenJarvis does for real:\n\n- Runs models **locally first** (Ollama, vLLM, MLX…), falling back to the cloud only when needed.\n- Treats **energy, cost, latency** as first-class — see the Dashboard.\n- Streams tokens and tool calls over an OpenAI-compatible API.\n\nConnect a backend with \`jarvis serve\` to replace me with the real thing.`;
}

function chunk(obj: unknown): SSEEvent {
  return { data: JSON.stringify(obj) };
}

/** Mock streaming chat that yields the same SSE shapes as the real backend. */
export async function* mockStreamChat(
  req: ChatRequest,
  signal?: AbortSignal,
): AsyncGenerator<SSEEvent> {
  const prompt = req.messages[req.messages.length - 1]?.content ?? '';
  const reply = craftReply(prompt);

  yield chunk({ choices: [{ delta: { role: 'assistant' }, finish_reason: null }] });
  await delay(140);

  if (/weather|search|news|look up|find/i.test(prompt)) {
    yield { event: 'tool_call_start', data: JSON.stringify({ tool: 'web_search', arguments: { query: prompt.slice(0, 48) } }) };
    await delay(620);
    if (signal?.aborted) return;
    yield { event: 'tool_call_end', data: JSON.stringify({ tool: 'web_search', success: true, latency: 590, result: '3 relevant results' }) };
    await delay(180);
  }

  const tokens = reply.match(/\s*\S+/g) ?? [reply];
  let completion = 0;
  for (const tok of tokens) {
    if (signal?.aborted) return;
    completion += 1;
    yield chunk({ choices: [{ delta: { content: tok }, finish_reason: null }] });
    await delay(18 + Math.random() * 38);
  }

  yield chunk({
    choices: [{ delta: {}, finish_reason: 'stop' }],
    usage: {
      prompt_tokens: Math.max(8, Math.round(prompt.length / 4)),
      completion_tokens: completion,
      total_tokens: Math.max(8, Math.round(prompt.length / 4)) + completion,
    },
  });
}

/** Slightly perturb telemetry each poll so demo charts visibly animate. */
export function driftEnergy(base: EnergyStats): EnergyStats {
  const jitter = (v: number, pct: number) => v * (1 + (Math.random() - 0.5) * pct);
  return {
    ...base,
    avg_power_w: Math.round(jitter(base.avg_power_w ?? 40, 0.12) * 10) / 10,
    total_energy_j: Math.round(jitter(base.total_energy_j ?? 18000, 0.02)),
    cpu_temp_c: Math.round(jitter(base.cpu_temp_c ?? 54, 0.05)),
    gpu_temp_c: Math.round(jitter(base.gpu_temp_c ?? 61, 0.05)),
  };
}
