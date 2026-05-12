'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { ExportWizard } from '@/components/export/export-wizard';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  FileText,
  BookOpen,
  FileType,
  CheckCircle,
  Clock,
  ChevronRight,
  Sparkles,
  Settings
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  wordCount: number;
  chapters: number;
  lastExported?: Date;
  status: string;
}

// Mock projects
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Shadows of the Fae Court',
    wordCount: 78500,
    chapters: 24,
    lastExported: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'drafting',
  },
  {
    id: '2',
    title: 'Blood & Thorns',
    wordCount: 45200,
    chapters: 15,
    status: 'drafting',
  },
  {
    id: '3',
    title: 'The Warlord\'s Bride',
    wordCount: 92000,
    chapters: 28,
    lastExported: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    status: 'complete',
  },
];

const EXPORT_FORMATS = [
  { id: 'epub', name: 'EPUB', icon: BookOpen, description: 'Standard eBook format' },
  { id: 'docx', name: 'DOCX', icon: FileText, description: 'Microsoft Word' },
  { id: 'pdf', name: 'PDF', icon: FileType, description: 'Print-ready PDF' },
  { id: 'kdp-ebook', name: 'KDP eBook', icon: Download, description: 'Amazon Kindle' },
  { id: 'kdp-print', name: 'KDP Print', icon: BookOpen, description: 'Print-on-demand' },
];

export default function ExportPage() {
  const [projects] = useState(mockProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  const handleExport = async (settings: any): Promise<Blob> => {
    // Mock export - in real app, this calls the backend
    await new Promise(resolve => setTimeout(resolve, 2000));
    return new Blob(['Export content'], { type: 'application/octet-stream' });
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Download className="h-7 w-7 text-rose-500" />
              Export Center
            </h1>
            <p className="text-muted-foreground">
              Export your manuscripts for publishing on Amazon KDP and other platforms
            </p>
          </div>
        </div>

        {/* Quick Export Formats */}
        <div className="grid gap-4 md:grid-cols-5">
          {EXPORT_FORMATS.map(format => {
            const Icon = format.icon;
            return (
              <Card key={format.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Icon className="h-8 w-8 mx-auto mb-2 text-rose-500" />
                  <p className="font-medium text-sm">{format.name}</p>
                  <p className="text-xs text-muted-foreground">{format.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Projects List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Projects</CardTitle>
            <CardDescription>Select a project to export</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projects.map(project => (
                <div
                  key={project.id}
                  className={`
                    flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer
                    ${selectedProject?.id === project.id 
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950' 
                      : 'hover:border-rose-300'
                    }
                  `}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900">
                      <BookOpen className="h-5 w-5 text-rose-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">{project.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {project.wordCount.toLocaleString()} words • {project.chapters} chapters
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {project.lastExported ? (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Last exported</p>
                        <p className="text-sm">{project.lastExported.toLocaleDateString()}</p>
                      </div>
                    ) : (
                      <Badge variant="outline">Never exported</Badge>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Project Actions */}
        {selectedProject && (
          <Card className="bg-gradient-to-br from-rose-50 to-amber-50 dark:from-rose-950 dark:to-amber-950 border-rose-200 dark:border-rose-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Export: {selectedProject.title}</span>
                <Badge>{selectedProject.status}</Badge>
              </CardTitle>
              <CardDescription>
                {selectedProject.wordCount.toLocaleString()} words ready for export
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20">
                  <p className="text-sm text-muted-foreground">Word Count</p>
                  <p className="text-xl font-bold">{selectedProject.wordCount.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20">
                  <p className="text-sm text-muted-foreground">Chapters</p>
                  <p className="text-xl font-bold">{selectedProject.chapters}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-rose-500 hover:bg-rose-600"
                  onClick={() => setShowWizard(true)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Export Wizard
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Quick Export
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Export Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              KDP Export Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                <span>Ensure your manuscript has proper chapter breaks</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                <span>Add front and back matter (title page, copyright, also by)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                <span>For print, choose a trim size that matches your genre (6x9 is popular for romance)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                <span>Test your eBook on Kindle Previewer before publishing</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-amber-500 flex-shrink-0" />
                <span>Allow 24-72 hours for KDP to process your manuscript</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Export Wizard Modal */}
      {showWizard && selectedProject && (
        <ExportWizard
          projectId={selectedProject.id}
          projectTitle={selectedProject.title}
          authorName="Author Name"
          chapters={Array.from({ length: selectedProject.chapters }, (_, i) => ({
            id: `ch-${i + 1}`,
            title: `Chapter ${i + 1}`,
            wordCount: Math.floor(selectedProject.wordCount / selectedProject.chapters),
          }))}
          onExport={handleExport}
          onClose={() => setShowWizard(false)}
        />
      )}
    </DashboardShell>
  );
}
