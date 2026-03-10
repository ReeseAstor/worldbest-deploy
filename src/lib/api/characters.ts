import apiClient from './client';

// ── Types ──────────────────────────────────────────────────────────────

export interface CharacterCreate {
  name: string;
  aliases?: string[];
  role?: string;
  age?: number;
  gender?: string;
  appearance?: Record<string, any>;
  personality?: Record<string, any>;
  backstory?: string;
  relationships?: Record<string, any>;
  arc?: Record<string, any>;
  voice_profile?: Record<string, any>;
}

export interface CharacterUpdate {
  name?: string;
  aliases?: string[];
  role?: string;
  age?: number;
  gender?: string;
  appearance?: Record<string, any>;
  personality?: Record<string, any>;
  backstory?: string;
  relationships?: Record<string, any>;
  arc?: Record<string, any>;
  voice_profile?: Record<string, any>;
}

export interface CharacterOut {
  id: string;
  project_id: string;
  name: string;
  aliases: string[] | null;
  role: string | null;
  age: number | null;
  gender: string | null;
  appearance: Record<string, any> | null;
  personality: Record<string, any> | null;
  backstory: string | null;
  relationships: Record<string, any> | null;
  arc: Record<string, any> | null;
  voice_profile: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

// ── API Calls ──────────────────────────────────────────────────────────

export async function getCharacters(projectId: string): Promise<CharacterOut[]> {
  const res = await apiClient.get<CharacterOut[]>(`/projects/${projectId}/characters`);
  return res.data;
}

export async function getCharacter(characterId: string): Promise<CharacterOut> {
  const res = await apiClient.get<CharacterOut>(`/characters/${characterId}`);
  return res.data;
}

export async function createCharacter(projectId: string, data: CharacterCreate): Promise<CharacterOut> {
  const res = await apiClient.post<CharacterOut>(`/projects/${projectId}/characters`, data);
  return res.data;
}

export async function updateCharacter(characterId: string, data: CharacterUpdate): Promise<CharacterOut> {
  const res = await apiClient.put<CharacterOut>(`/characters/${characterId}`, data);
  return res.data;
}

export async function deleteCharacter(characterId: string): Promise<void> {
  await apiClient.delete(`/characters/${characterId}`);
}
