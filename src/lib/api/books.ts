import apiClient from './client';

// ── Types ──────────────────────────────────────────────────────────────

export interface BookCreate {
  title: string;
  order?: number;
  blurb?: string;
  target_word_count?: number;
}

export interface BookUpdate {
  title?: string;
  order?: number;
  blurb?: string;
  target_word_count?: number;
  status?: string;
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

// ── API Calls ──────────────────────────────────────────────────────────

export async function getBooks(projectId: string): Promise<BookOut[]> {
  const res = await apiClient.get<BookOut[]>(`/projects/${projectId}/books`);
  return res.data;
}

export async function createBook(projectId: string, data: BookCreate): Promise<BookOut> {
  const res = await apiClient.post<BookOut>(`/projects/${projectId}/books`, data);
  return res.data;
}

export async function updateBook(bookId: string, data: BookUpdate): Promise<BookOut> {
  const res = await apiClient.put<BookOut>(`/books/${bookId}`, data);
  return res.data;
}
