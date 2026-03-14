import { createClient } from '@/lib/supabase/client';

// ── Types ──────────────────────────────────────────────────────────────

export interface AIGenerateRequest {
  project_id: string;
  chapter_id?: string;
  prompt: string;
  context_text?: string;
  voice_profile_id?: string;
  parameters?: Record<string, any>;
}

export interface SlashCommandRequest {
  command: string;
  chapter_id: string;
  context_text?: string;
  parameters?: Record<string, any>;
}

export interface LineEditRequest {
  edit_types?: string[];
}

export interface LineEditSuggestion {
  id: string;
  edit_type: string;
  original_text: string;
  suggested_text: string;
  explanation: string;
  position: { from: number; to: number } | null;
}

// ── SSE Stream Helper ──────────────────────────────────────────────────

async function getAuthHeaders(): Promise<Record<string, string>> {
  if (typeof window === 'undefined') return {};
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
}

/**
 * Opens an SSE connection and yields text chunks as they arrive.
 * Usage:
 *   for await (const chunk of streamGeneration(request)) {
 *     appendToEditor(chunk);
 *   }
 */
export async function* streamGeneration(
  endpoint: string,
  body: Record<string, any>,
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${getBaseUrl()}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI request failed (${response.status}): ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const payload = trimmed.slice(6);
      if (payload === '[DONE]') return;
      try {
        const parsed = JSON.parse(payload);
        if (parsed.content) yield parsed.content;
      } catch {
        // skip malformed SSE frames
      }
    }
  }
}

// ── High-level API Methods ─────────────────────────────────────────────

export function generateDraft(
  request: AIGenerateRequest,
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  return streamGeneration('/ai/generate', request, signal);
}

export function generateWithSlashCommand(
  request: SlashCommandRequest,
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  return streamGeneration('/ai/slash-command', request, signal);
}

export async function getLineEdits(
  chapterId: string,
  editTypes?: string[],
): Promise<LineEditSuggestion[]> {
  const headers = await getAuthHeaders();
  const body: LineEditRequest = editTypes ? { edit_types: editTypes } : {};
  const response = await fetch(`${getBaseUrl()}/ai/line-edit/${chapterId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Line edit request failed (${response.status}): ${errorText}`);
  }
  return response.json();
}

export async function handleSuggestion(
  suggestionId: string,
  action: 'accept' | 'reject',
): Promise<{ suggestion_id: string; action: string; status: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${getBaseUrl()}/ai/line-edit/suggestions/${suggestionId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ action }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Suggestion action failed (${response.status}): ${errorText}`);
  }
  return response.json();
}
