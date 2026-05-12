'use client';

import { useState, useCallback } from 'react';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Download,
  Check,
  X,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Settings,
  Type,
  BookOpen,
  FileDown,
  Loader2,
  Eye,
  Palette,
  FileType
} from 'lucide-react';

// Export format types
type ExportFormat = 'epub' | 'docx' | 'pdf' | 'kdp-print' | 'kdp-ebook';

interface TrimSize {
  width: number;
  height: number;
  name: string;
  recommended: boolean;
}

// KDP standard trim sizes
const TRIM_SIZES: TrimSize[] = [
  { width: 5, height: 8, name: '5" x 8"', recommended: false },
  { width: 5.25, height: 8, name: '5.25" x 8"', recommended: false },
  { width: 5.5, height: 8.5, name: '5.5" x 8.5"', recommended: true },
  { width: 6, height: 9, name: '6" x 9"', recommended: true },
  { width: 6.14, height: 9.21, name: '6.14" x 9.21" (US Trade)', recommended: false },
  { width: 8.5, height: 11, name: '8.5" x 11"', recommended: false },
];

interface ExportSettings {
  format: ExportFormat;
  title: string;
  subtitle?: string;
  author: string;
  series?: string;
  seriesNumber?: number;
  trimSize: TrimSize;
  fontSize: number;
  lineSpacing: number;
  fontFamily: string;
  includeDropCaps: boolean;
  includeTitlePage: boolean;
  includeTableOfContents: boolean;
  includeAboutAuthor: boolean;
  includeAlsoBy: boolean;
  chapterHeadingStyle: 'simple' | 'decorated' | 'numbered';
  pageMargins: {
    top: number;
    bottom: number;
    inside: number;
    outside: number;
  };
}

interface ExportWizardProps {
  projectId: string;
  projectTitle: string;
  authorName: string;
  chapters: Array<{
    id: string;
    title: string;
    wordCount: number;
  }>;
  onExport: (settings: ExportSettings) => Promise<Blob>;
  onClose: () => void;
}

const FONT_OPTIONS = [
  { value: 'garamond', label: 'Garamond', description: 'Classic, elegant serif' },
  { value: 'georgia', label: 'Georgia', description: 'Modern, readable serif' },
  { value: 'times', label: 'Times New Roman', description: 'Traditional, familiar' },
  { value: 'palatino', label: 'Palatino', description: 'Refined, book-friendly' },
  { value: 'baskerville', label: 'Baskerville', description: 'Sophisticated, timeless' },
];

const DEFAULT_SETTINGS: ExportSettings = {
  format: 'epub',
  title: '',
  author: '',
  trimSize: TRIM_SIZES[2], // 5.5 x 8.5
  fontSize: 11,
  lineSpacing: 1.5,
  fontFamily: 'garamond',
  includeDropCaps: true,
  includeTitlePage: true,
  includeTableOfContents: true,
  includeAboutAuthor: true,
  includeAlsoBy: true,
  chapterHeadingStyle: 'decorated',
  pageMargins: {
    top: 0.8,
    bottom: 0.8,
    inside: 0.8,
    outside: 0.6,
  },
};

export function ExportWizard({
  projectId,
  projectTitle,
  authorName,
  chapters,
  onExport,
  onClose,
}: ExportWizardProps) {
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState<ExportSettings>({
    ...DEFAULT_SETTINGS,
    title: projectTitle,
    author: authorName,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const totalWordCount = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const blob = await onExport(settings);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${settings.title.replace(/[^a-z0-9]/gi, '_')}.${settings.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Close wizard after successful export
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const updateSettings = (updates: Partial<ExportSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  // Step 1: Format Selection
  const FormatStep = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'epub', label: 'EPUB', icon: BookOpen, desc: 'eBook standard format' },
          { id: 'docx', label: 'DOCX', icon: FileText, desc: 'Microsoft Word' },
          { id: 'pdf', label: 'PDF', icon: FileType, desc: 'Print-ready PDF' },
          { id: 'kdp-ebook', label: 'KDP eBook', icon: Download, desc: 'Amazon Kindle format' },
          { id: 'kdp-print', label: 'KDP Print', icon: BookOpen, desc: 'Print-on-demand ready' },
        ].map(format => {
          const Icon = format.icon;
          const isSelected = settings.format === format.id;
          return (
            <button
              key={format.id}
              onClick={() => updateSettings({ format: format.id as ExportFormat })}
              className={`
                p-4 rounded-lg border-2 text-left transition-all
                ${isSelected 
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950' 
                  : 'border-border hover:border-rose-300'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-rose-100 dark:bg-rose-900' : 'bg-muted'}`}>
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-rose-500' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-medium">{format.label}</p>
                  <p className="text-xs text-muted-foreground">{format.desc}</p>
                </div>
              </div>
              {isSelected && (
                <Check className="absolute top-2 right-2 h-5 w-5 text-rose-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Step 2: Metadata
  const MetadataStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Book Title</label>
        <Input
          value={settings.title}
          onChange={(e) => updateSettings({ title: e.target.value })}
          placeholder="Enter book title"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Subtitle (optional)</label>
        <Input
          value={settings.subtitle || ''}
          onChange={(e) => updateSettings({ subtitle: e.target.value })}
          placeholder="Enter subtitle"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Author Name</label>
        <Input
          value={settings.author}
          onChange={(e) => updateSettings({ author: e.target.value })}
          placeholder="Enter author name"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Series Name (optional)</label>
          <Input
            value={settings.series || ''}
            onChange={(e) => updateSettings({ series: e.target.value })}
            placeholder="Series name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Book # in Series</label>
          <Input
            type="number"
            value={settings.seriesNumber || ''}
            onChange={(e) => updateSettings({ seriesNumber: parseInt(e.target.value) || undefined })}
            placeholder="1"
          />
        </div>
      </div>
    </div>
  );

  // Step 3: Formatting
  const FormattingStep = () => (
    <div className="space-y-6">
      {/* Trim Size (for print) */}
      {(settings.format === 'kdp-print' || settings.format === 'pdf') && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Trim Size</label>
          <div className="grid grid-cols-3 gap-2">
            {TRIM_SIZES.map((size) => (
              <button
                key={size.name}
                onClick={() => updateSettings({ trimSize: size })}
                className={`
                  p-3 rounded-lg border text-center text-sm transition-all
                  ${settings.trimSize.name === size.name 
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950' 
                    : 'border-border hover:border-rose-300'
                  }
                `}
              >
                {size.name}
                {size.recommended && (
                  <Badge variant="secondary" className="ml-1 text-xs">Popular</Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Font Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Font Family</label>
        <div className="grid grid-cols-2 gap-2">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.value}
              onClick={() => updateSettings({ fontFamily: font.value })}
              className={`
                p-3 rounded-lg border text-left transition-all
                ${settings.fontFamily === font.value 
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950' 
                  : 'border-border hover:border-rose-300'
                }
              `}
            >
              <p className="font-medium" style={{ fontFamily: font.value }}>{font.label}</p>
              <p className="text-xs text-muted-foreground">{font.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size & Line Spacing */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Font Size (pt)</label>
          <Input
            type="number"
            min={9}
            max={14}
            value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) || 11 })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Line Spacing</label>
          <select
            value={settings.lineSpacing}
            onChange={(e) => updateSettings({ lineSpacing: parseFloat(e.target.value) })}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          >
            <option value={1.2}>1.2 (Tight)</option>
            <option value={1.5}>1.5 (Normal)</option>
            <option value={1.8}>1.8 (Relaxed)</option>
            <option value={2.0}>2.0 (Double)</option>
          </select>
        </div>
      </div>

      {/* Chapter Heading Style */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Chapter Heading Style</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'simple', label: 'Simple', example: 'Chapter One' },
            { id: 'decorated', label: 'Decorated', example: '~ Chapter One ~' },
            { id: 'numbered', label: 'Numbered', example: 'Chapter 1' },
          ].map((style) => (
            <button
              key={style.id}
              onClick={() => updateSettings({ chapterHeadingStyle: style.id as any })}
              className={`
                p-3 rounded-lg border text-center transition-all
                ${settings.chapterHeadingStyle === style.id 
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950' 
                  : 'border-border hover:border-rose-300'
                }
              `}
            >
              <p className="font-medium text-sm">{style.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{style.example}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 4: Include Options
  const IncludesStep = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select additional sections to include in your export:
      </p>
      {[
        { key: 'includeTitlePage', label: 'Title Page', desc: 'Book title, author, and series info' },
        { key: 'includeTableOfContents', label: 'Table of Contents', desc: 'Clickable chapter list' },
        { key: 'includeDropCaps', label: 'Drop Caps', desc: 'Decorative first letter of chapters' },
        { key: 'includeAboutAuthor', label: 'About the Author', desc: 'Author bio section at the end' },
        { key: 'includeAlsoBy', label: 'Also By', desc: 'List of other books by author' },
      ].map((option) => (
        <label
          key={option.key}
          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
        >
          <div>
            <p className="font-medium text-sm">{option.label}</p>
            <p className="text-xs text-muted-foreground">{option.desc}</p>
          </div>
          <input
            type="checkbox"
            checked={settings[option.key as keyof ExportSettings] as boolean}
            onChange={(e) => updateSettings({ [option.key]: e.target.checked })}
            className="h-5 w-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
          />
        </label>
      ))}
    </div>
  );

  // Step 5: Review & Export
  const ReviewStep = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-lg">Export Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Format:</span>
            <span className="font-medium">{settings.format.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Title:</span>
            <span className="font-medium">{settings.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Author:</span>
            <span className="font-medium">{settings.author}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Chapters:</span>
            <span className="font-medium">{chapters.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Word Count:</span>
            <span className="font-medium">{totalWordCount.toLocaleString()}</span>
          </div>
          {(settings.format === 'kdp-print' || settings.format === 'pdf') && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trim Size:</span>
              <span className="font-medium">{settings.trimSize.name}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Font:</span>
            <span className="font-medium capitalize">{settings.fontFamily} {settings.fontSize}pt</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {settings.includeTitlePage && <Badge variant="secondary">Title Page</Badge>}
        {settings.includeTableOfContents && <Badge variant="secondary">TOC</Badge>}
        {settings.includeDropCaps && <Badge variant="secondary">Drop Caps</Badge>}
        {settings.includeAboutAuthor && <Badge variant="secondary">About Author</Badge>}
        {settings.includeAlsoBy && <Badge variant="secondary">Also By</Badge>}
      </div>

      {exportError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{exportError}</span>
        </div>
      )}
    </div>
  );

  const steps = [
    { id: 1, title: 'Format', component: FormatStep },
    { id: 2, title: 'Metadata', component: MetadataStep },
    { id: 3, title: 'Formatting', component: FormattingStep },
    { id: 4, title: 'Includes', component: IncludesStep },
    { id: 5, title: 'Review', component: ReviewStep },
  ];

  const CurrentStepComponent = steps[step - 1].component;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-rose-500" />
              Export Manuscript
            </CardTitle>
            <CardDescription>
              Step {step} of {steps.length}: {steps[step - 1].title}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-4 border-b">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => setStep(s.id)}
                disabled={s.id > step}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                  ${step === s.id 
                    ? 'bg-rose-500 text-white' 
                    : step > s.id 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                {step > s.id ? <Check className="h-4 w-4" /> : s.id}
              </button>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${step > s.id ? 'bg-emerald-500' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <CurrentStepComponent />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-4 border-t">
          <Button
            variant="outline"
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            disabled={step === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          {step < steps.length ? (
            <Button onClick={() => setStep(prev => Math.min(steps.length, prev + 1))}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={handleExport} 
              disabled={isExporting || !settings.title || !settings.author}
              className="bg-rose-500 hover:bg-rose-600"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

export default ExportWizard;
