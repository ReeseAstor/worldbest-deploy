import apiClient from './client';

// ── Types ──────────────────────────────────────────────────────────────

export interface ProjectCreate {
  title: string;
  synopsis?: string;
  genre?: string;
  subgenres?: string[];
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ProjectUpdate {
  title?: string;
  synopsis?: string;
  genre?: string;
  subgenres?: string[];
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ProjectOut {
  id: string;
  owner_id: string;
  title: string;
  synopsis: string | null;
  genre: string;
  subgenres: string[] | null;
  settings: Record<string, any> | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface BookOut {
  id: string;
  project_id: string;
  title: string;
  order: number;
  blurb: string | null;
  target_word_count: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetailOut extends ProjectOut {
  books: BookOut[];
}

// ── API Calls ──────────────────────────────────────────────────────────

export async function getProjects(): Promise<ProjectOut[]> {
  const res = await apiClient.get<ProjectOut[]>('/projects');
  return res.data;
}

export async function getProject(projectId: string): Promise<ProjectDetailOut> {
  const res = await apiClient.get<ProjectDetailOut>(`/projects/${projectId}`);
  return res.data;
}

export async function createProject(data: ProjectCreate): Promise<ProjectOut> {
  const res = await apiClient.post<ProjectOut>('/projects', data);
  return res.data;
}

export async function updateProject(projectId: string, data: ProjectUpdate): Promise<ProjectOut> {
  const res = await apiClient.put<ProjectOut>(`/projects/${projectId}`, data);
  return res.data;
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}`);
}
