import apiClient from './client';

// ── Types ──────────────────────────────────────────────────────────────

export interface ChapterCreate {
  number: number;
  title: string;
  summary?: string;
  target_word_count?: number;
  pov_character_id?: string;
}

export interface ChapterUpdate {
  number?: number;
  title?: string;
  summary?: string;
  target_word_count?: number;
  status?: string;
  pov_character_id?: string;
}

export interface ChapterContentUpdate {
  content_json: Record<string, any>;
  content_text?: string;
}

export interface ChapterOut {
  id: string;
  book_id: string;
  number: number;
  title: string;
  summary: string | null;
  word_count: number;
  target_word_count: number | null;
  status: string;
  pov_character_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChapterDetailOut extends ChapterOut {
  content_text: string;
  content_json: Record<string, any> | null;
}

// ── API Calls ──────────────────────────────────────────────────────────

export async function getChapters(bookId: string): Promise<ChapterOut[]> {
  const res = await apiClient.get<ChapterOut[]>(`/books/${bookId}/chapters`);
  return res.data;
}

export async function getChapter(chapterId: string): Promise<ChapterDetailOut> {
  const res = await apiClient.get<ChapterDetailOut>(`/chapters/${chapterId}`);
  return res.data;
}

export async function createChapter(bookId: string, data: ChapterCreate): Promise<ChapterOut> {
  const res = await apiClient.post<ChapterOut>(`/books/${bookId}/chapters`, data);
  return res.data;
}

export async function updateChapter(chapterId: string, data: ChapterUpdate): Promise<ChapterOut> {
  const res = await apiClient.put<ChapterOut>(`/chapters/${chapterId}`, data);
  return res.data;
}

export async function saveChapterContent(chapterId: string, data: ChapterContentUpdate): Promise<ChapterDetailOut> {
  const res = await apiClient.put<ChapterDetailOut>(`/chapters/${chapterId}/content`, data);
  return res.data;
}

export async function deleteChapter(chapterId: string): Promise<void> {
  await apiClient.delete(`/chapters/${chapterId}`);
}
