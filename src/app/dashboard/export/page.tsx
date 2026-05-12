'use client';

import { useState } from 'react';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { useProjects } from '@/hooks/use-projects';
import { useCreateExport, usePollExport, useDownloadExport } from '@/hooks/use-export';
import {
  Download,
  FileText,
  BookOpen,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default function ExportPage() {
  const { data: projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [format, setFormat] = useState<'docx' | 'epub'>('docx');
  const [jobId, setJobId] = useState<string | null>(null);

  const createExport = useCreateExport();
  const { data: job } = usePollExport(jobId);
  const downloadExport = useDownloadExport();

  const handleExport = async () => {
    if (!selectedProjectId) return;
    const result = await createExport.mutateAsync({
      project_id: selectedProjectId,
      format,
    });
    setJobId(result.job_id);
  };

  const handleDownload = async () => {
    if (!jobId) return;
    const blob = await downloadExport.mutateAsync(jobId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Download className="h-7 w-7 text-primary" />
          Export
        </h1>
        <p className="text-muted-foreground mt-1">
          Export your manuscript to DOCX or EPUB format.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Settings</CardTitle>
          <CardDescription>Choose a project and format to export.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Project selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select a project...</option>
              {projects?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Format */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Format</label>
            <div className="grid grid-cols-2 gap-3">
              <Card
                className={`cursor-pointer transition-all ${
                  format === 'docx' ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'
                }`}
                onClick={() => setFormat('docx')}
              >
                <CardContent className="flex items-center gap-3 py-4 px-4">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <div className="font-medium text-sm">DOCX</div>
                    <div className="text-xs text-muted-foreground">Microsoft Word</div>
                  </div>
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all ${
                  format === 'epub' ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'
                }`}
                onClick={() => setFormat('epub')}
              >
                <CardContent className="flex items-center gap-3 py-4 px-4">
                  <BookOpen className="h-8 w-8 text-green-500" />
                  <div>
                    <div className="font-medium text-sm">EPUB</div>
                    <div className="text-xs text-muted-foreground">eBook format</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={!selectedProjectId || createExport.isPending}
            className="w-full"
            type="button"
          >
            {createExport.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export as {format.toUpperCase()}
          </Button>
        </CardContent>
      </Card>

      {/* Job status */}
      {job && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {job.status === 'processing' && (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                )}
                {job.status === 'completed' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {job.status === 'failed' && (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <div>
                  <div className="font-medium text-sm capitalize">
                    Export {job.status}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Format: {job.format.toUpperCase()}
                  </div>
                </div>
              </div>

              {job.status === 'completed' && (
                <Button
                  size="sm"
                  onClick={handleDownload}
                  disabled={downloadExport.isPending}
                  type="button"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
