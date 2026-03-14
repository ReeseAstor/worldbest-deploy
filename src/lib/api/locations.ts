import apiClient from './client';

// ── Types ──────────────────────────────────────────────────────────────

export interface LocationCreate {
  name: string;
  description?: string;
  geography?: Record<string, any>;
  atmosphere?: string;
  significance?: string;
}

export interface LocationUpdate {
  name?: string;
  description?: string;
  geography?: Record<string, any>;
  atmosphere?: string;
  significance?: string;
}

export interface LocationOut {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  geography: Record<string, any> | null;
  atmosphere: string | null;
  significance: string | null;
  created_at: string;
  updated_at: string;
}

// ── API Calls ──────────────────────────────────────────────────────────

export async function getLocations(projectId: string): Promise<LocationOut[]> {
  const res = await apiClient.get<LocationOut[]>(`/projects/${projectId}/locations`);
  return res.data;
}

export async function getLocation(locationId: string): Promise<LocationOut> {
  const res = await apiClient.get<LocationOut>(`/locations/${locationId}`);
  return res.data;
}

export async function createLocation(projectId: string, data: LocationCreate): Promise<LocationOut> {
  const res = await apiClient.post<LocationOut>(`/projects/${projectId}/locations`, data);
  return res.data;
}

export async function updateLocation(locationId: string, data: LocationUpdate): Promise<LocationOut> {
  const res = await apiClient.put<LocationOut>(`/locations/${locationId}`, data);
  return res.data;
}

export async function deleteLocation(locationId: string): Promise<void> {
  await apiClient.delete(`/locations/${locationId}`);
}
