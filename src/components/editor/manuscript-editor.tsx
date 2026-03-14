'use client';

import { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { Button } from '@ember/ui-components';
import { Badge } from '@/components/ui/badge';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  Quote,
  Undo,
  Redo,
  Sparkles,
  Flame,
  MessageSquare,
  Mic2,
  Wand2,
  MoreHorizontal,
  Save,
  FileText,
  Target,
  AlertCircle
} from 'lucide-react';

interface ManuscriptEditorProps {
  projectId: string;
  chapterId?: string;
  initialContent?: string;
  onSave?: (content: string, wordCount: number) => void;
  onAIRequest?: (type: string, selectedText?: string) => void;
  steamLevel?: 1 | 2 | 3 | 4 | 5;
  targetWordCount?: number;
  voiceProfileActive?: boolean;
  readOnly?: boolean;
}

const STEAM_COLORS = {
  1: 'bg-slate-400',
  2: 'bg-pink-400',
  3: 'bg-rose-400',
  4: 'bg-red-500',
  5: 'bg-red-600',
};

export function ManuscriptEditor({
  projectId,
  chapterId,
  initialContent = '',
  onSave,
  onAIRequest,
  steamLevel = 3,
  targetWordCount = 5000,
  voiceProfileActive = false,
  readOnly = false,
}: ManuscriptEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your story...',
        emptyEditorClass: 'is-editor-empty',
      }),
      CharacterCount,
      Highlight.configure({
        multicolor: true,
      }),
      Typography,
    ],
    content: initialContent,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: 'manuscript-editor prose prose-lg max-w-none focus:outline-none min-h-[500px] px-8 py-6',
      },
      handleKeyDown: (view, event) => {
        // Handle slash command trigger
        if (event.key === '/' && !showSlashMenu) {
          const { from } = view.state.selection;
          const coords = view.coordsAtPos(from);
          setSlashMenuPosition({ x: coords.left, y: coords.bottom + 10 });
          setShowSlashMenu(true);
          return false;
        }
        // Close slash menu on escape
        if (event.key === 'Escape' && showSlashMenu) {
          setShowSlashMenu(false);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      // Auto-save debounce would go here
    },
  });

  // Word count
  const wordCount = editor?.storage.characterCount.words() ?? 0;
  const charCount = editor?.storage.characterCount.characters() ?? 0;
  const progress = Math.min((wordCount / targetWordCount) * 100, 100);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!editor || !onSave) return;
    setIsSaving(true);
    try {
      const content = editor.getHTML();
      await onSave(content, wordCount);
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  }, [editor, onSave, wordCount]);

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // Slash command options
  const slashCommands = [
    { 
      id: 'continue', 
      label: 'Continue Writing', 
      icon: Wand2, 
      description: 'AI continues from cursor',
      action: () => onAIRequest?.('creative-drafting')
    },
    { 
      id: 'steam', 
      label: 'Write Steam Scene', 
      icon: Flame, 
      description: `Generate at level ${steamLevel}`,
      action: () => onAIRequest?.('steam-scene')
    },
    { 
      id: 'dialogue', 
      label: 'Write Dialogue', 
      icon: MessageSquare, 
      description: 'Generate character dialogue',
      action: () => onAIRequest?.('dialogue')
    },
    { 
      id: 'voice-check', 
      label: 'Check Voice', 
      icon: Mic2, 
      description: 'Verify voice consistency',
      action: () => onAIRequest?.('voice-check', editor?.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to
      ))
    },
    { 
      id: 'beat', 
      label: 'Hit Next Beat', 
      icon: Target, 
      description: 'Write toward story beat',
      action: () => onAIRequest?.('beat-advance')
    },
  ];

  const executeSlashCommand = (command: typeof slashCommands[0]) => {
    setShowSlashMenu(false);
    // Remove the slash character
    if (editor) {
      const { from } = editor.state.selection;
      editor.chain().focus().deleteRange({ from: from - 1, to: from }).run();
    }
    command.action();
  };

  if (!editor) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="relative border rounded-lg bg-background">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2">
        <div className="flex items-center gap-1">
          {/* Formatting buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleBold().run()}
            data-active={editor.isActive('bold')}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            data-active={editor.isActive('italic')}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            data-active={editor.isActive('heading', { level: 1 })}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            data-active={editor.isActive('heading', { level: 2 })}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            data-active={editor.isActive('bulletList')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            data-active={editor.isActive('blockquote')}
          >
            <Quote className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {/* Steam Level Indicator */}
          <div className="flex items-center gap-1">
            <Flame className={`h-4 w-4 ${steamLevel >= 4 ? 'text-red-500' : 'text-rose-400'}`} />
            <Badge 
              variant="outline" 
              className={`${STEAM_COLORS[steamLevel]} text-white border-0 text-xs`}
            >
              {steamLevel}
            </Badge>
          </div>

          {/* Voice Profile Status */}
          {voiceProfileActive && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Mic2 className="h-3 w-3 text-emerald-500" />
              Voice Active
            </Badge>
          )}

          {/* Save Status */}
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-xs text-muted-foreground">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Inline selection toolbar */}
      {editor && !editor.state.selection.empty && (
        <div className="flex items-center gap-1 p-1 rounded-lg border bg-background shadow-lg absolute z-50">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-3 w-3" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              const selectedText = editor.state.doc.textBetween(
                editor.state.selection.from,
                editor.state.selection.to
              );
              onAIRequest?.('line-editing', selectedText);
            }}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Polish
          </Button>
        </div>
      )}

      {/* Editor Content */}
      <div className="relative">
        <EditorContent editor={editor} />
        
        {/* Slash Command Menu */}
        {showSlashMenu && (
          <div 
            className="absolute z-20 w-64 p-2 rounded-lg border bg-background shadow-xl"
            style={{ 
              left: Math.min(slashMenuPosition.x, window.innerWidth - 280),
              top: slashMenuPosition.y 
            }}
          >
            <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
              AI Commands
            </div>
            {slashCommands.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => executeSlashCommand(cmd)}
                  className="w-full flex items-start gap-2 p-2 rounded hover:bg-muted text-left transition-colors"
                >
                  <div className="p-1.5 rounded bg-rose-100 dark:bg-rose-900">
                    <Icon className="h-4 w-4 text-rose-500" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{cmd.label}</div>
                    <div className="text-xs text-muted-foreground">{cmd.description}</div>
                  </div>
                </button>
              );
            })}
            <div className="mt-2 pt-2 border-t">
              <div className="text-xs text-muted-foreground px-2">
                Press <kbd className="px-1 py-0.5 rounded bg-muted text-xs">Esc</kbd> to close
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="sticky bottom-0 flex items-center justify-between border-t bg-background/95 backdrop-blur p-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {wordCount.toLocaleString()} words
          </span>
          <span>{charCount.toLocaleString()} characters</span>
        </div>

        {/* Word Count Progress */}
        <div className="flex items-center gap-2">
          <span>Target: {targetWordCount.toLocaleString()}</span>
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                progress >= 100 ? 'bg-emerald-500' : 'bg-rose-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-medium">{progress.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}

export default ManuscriptEditor;
