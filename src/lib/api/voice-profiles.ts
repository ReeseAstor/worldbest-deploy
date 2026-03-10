import apiClient from './client';

// ── Types ──────────────────────────────────────────────────────────────

export interface VoiceProfileCreate {
  name: string;
  sample_excerpts?: string[];
}

export interface VoiceProfileUpdate {
  name?: string;
  sample_excerpts?: string[];
}

export interface VoiceProfileOut {
  id: string;
  user_id: string;
  name: string;
  sample_excerpts: string[] | null;
  fingerprint: Record<string, any> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── API Calls ──────────────────────────────────────────────────────────

export async function getVoiceProfiles(): Promise<VoiceProfileOut[]> {
  const res = await apiClient.get<VoiceProfileOut[]>('/voice-profiles');
  return res.data;
}

export async function createVoiceProfile(data: VoiceProfileCreate): Promise<VoiceProfileOut> {
  const res = await apiClient.post<VoiceProfileOut>('/voice-profiles', data);
  return res.data;
}

export async function updateVoiceProfile(profileId: string, data: VoiceProfileUpdate): Promise<VoiceProfileOut> {
  const res = await apiClient.put<VoiceProfileOut>(`/voice-profiles/${profileId}`, data);
  return res.data;
}

export async function analyzeVoiceProfile(profileId: string): Promise<VoiceProfileOut> {
  const res = await apiClient.post<VoiceProfileOut>(`/voice-profiles/${profileId}/analyze`);
  return res.data;
}

export async function activateVoiceProfile(profileId: string): Promise<VoiceProfileOut> {
  const res = await apiClient.post<VoiceProfileOut>(`/voice-profiles/${profileId}/activate`);
  return res.data;
}

export async function deleteVoiceProfile(profileId: string): Promise<void> {
  await apiClient.delete(`/voice-profiles/${profileId}`);
}
