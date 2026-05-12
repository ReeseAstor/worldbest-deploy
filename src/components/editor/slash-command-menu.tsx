'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { useSlashCommand } from '@/hooks/use-ai';
import { useEditorStore } from '@/stores/editor-store';
import {
  SlashCommand,
  SLASH_COMMAND_LABELS,
  SLASH_COMMAND_DESCRIPTIONS,
} from '@ember/shared-types/src/ai';
import {
  PenTool,
  Film,
  MessageCircle,
  Flame,
  Eye,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';

interface SlashCommandMenuProps {
  editor: Editor;
  onInsert: (text: string) => void;
}

const COMMAND_ICONS: Record<string, React.ElementType> = {
  [SlashCommand.DRAFT]: PenTool,
  [SlashCommand.SCENE]: Film,
  [SlashCommand.DIALOGUE]: MessageCircle,
  [SlashCommand.STEAM]: Flame,
  [SlashCommand.DESCRIBE]: Eye,
  [SlashCommand.CONTINUE]: ArrowRight,
  [SlashCommand.BRAINSTORM]: Lightbulb,
};

const COMMANDS = Object.values(SlashCommand);

export function SlashCommandMenu({ editor, onInsert }: SlashCommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const currentChapterId = useEditorStore((s) => s.currentChapterId);
  const { execute, isGenerating, abort } = useSlashCommand();

  const filtered = COMMANDS.filter((cmd) =>
    cmd.toLowerCase().includes(filter.toLowerCase()),
  );

  const handleSelect = useCallback(
    (command: SlashCommand) => {
      if (!currentChapterId) return;

      // Remove the slash text from the editor
      const { state } = editor;
      const { from } = state.selection;
      const textBefore = state.doc.textBetween(
        Math.max(0, from - 20),
        from,
      );
      const slashPos = textBefore.lastIndexOf('/');
      if (slashPos >= 0) {
        const deleteFrom = from - (textBefore.length - slashPos);
        editor.chain().focus().deleteRange({ from: deleteFrom, to: from }).run();
      }

      setIsOpen(false);
      setFilter('');

      // Get surrounding context for the AI
      const contextText = editor.getText().slice(-500);

      execute({
        request: {
          command,
          chapter_id: currentChapterId,
          context_text: contextText,
        },
        onChunk: (_fullText, chunk) => {
          onInsert(chunk);
        },
      });
    },
    [editor, currentChapterId, execute, onInsert],
  );

  // Listen for "/" keystroke to open the menu
  useEffect(() => {
    if (!editor) return;

    const handleTransaction = () => {
      if (isOpen || isGenerating) return;
      // Check if the last typed character was "/"
      const { state } = editor;
      const { from } = state.selection;
      if (from < 1) return;
      const lastChar = state.doc.textBetween(from - 1, from);
      if (lastChar === '/') {
        setIsOpen(true);
        setFilter('');
        setSelectedIndex(0);
      }
    };

    editor.on('transaction', handleTransaction);
    return () => {
      editor.off('transaction', handleTransaction);
    };
  }, [editor, isOpen, isGenerating]);

  // Handle keyboard navigation when menu is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex]);
        }
        return;
      }
      if (e.key === 'Backspace') {
        if (filter.length === 0) {
          setIsOpen(false);
        } else {
          setFilter((f) => f.slice(0, -1));
          setSelectedIndex(0);
        }
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setFilter((f) => f + e.key);
        setSelectedIndex(0);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filter, filtered, selectedIndex, handleSelect]);

  // Close menu on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!isOpen || filtered.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 w-72 rounded-lg border bg-popover p-1 shadow-lg"
      style={{ bottom: 'auto' }}
    >
      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
        AI Commands
      </div>
      {filtered.map((cmd, index) => {
        const Icon = COMMAND_ICONS[cmd] || PenTool;
        return (
          <button
            key={cmd}
            className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ${
              index === selectedIndex
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent/50'
            }`}
            onClick={() => handleSelect(cmd)}
            type="button"
          >
            <Icon className="h-4 w-4 shrink-0 text-primary" />
            <div className="text-left">
              <div className="font-medium">/{SLASH_COMMAND_LABELS[cmd]}</div>
              <div className="text-xs text-muted-foreground">
                {SLASH_COMMAND_DESCRIPTIONS[cmd]}
              </div>
            </div>
          </button>
        );
      })}
      {isGenerating && (
        <div className="flex items-center justify-between px-2 py-1.5 text-xs text-muted-foreground border-t mt-1">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Generating...
          </span>
          <button
            onClick={abort}
            className="text-destructive hover:underline"
            type="button"
          >
            Stop
          </button>
        </div>
      )}
    </div>
  );
}
