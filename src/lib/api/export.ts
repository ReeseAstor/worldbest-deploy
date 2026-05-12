import apiClient from './client';

// ── Types ──────────────────────────────────────────────────────────────

export interface ExportRequest {
  project_id: string;
  format: 'docx' | 'epub';
  options?: Record<string, any>;
}

export interface ExportJob {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: string;
  download_url: string | null;
}

// ── API Calls ──────────────────────────────────────────────────────────

export async function createExport(data: ExportRequest): Promise<ExportJob> {
  const res = await apiClient.post<ExportJob>('/export', data);
  return res.data;
}

export async function pollExport(jobId: string): Promise<ExportJob> {
  const res = await apiClient.get<ExportJob>(`/export/${jobId}`);
  return res.data;
}

export async function downloadExport(jobId: string): Promise<Blob> {
  const res = await apiClient.get(`/export/${jobId}/download`, {
    responseType: 'blob',
  });
  return res.data;
}
