'use client';

import type { Editor } from '@tiptap/react';
import { Button } from '@ember/ui-components';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  SeparatorHorizontal,
  Highlighter,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor;
}

interface ToolbarButton {
  icon: React.ElementType;
  label: string;
  action: () => void;
  isActive: () => boolean;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const buttons: ToolbarButton[] = [
    {
      icon: Bold,
      label: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
    },
    {
      icon: Strikethrough,
      label: 'Strikethrough',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive('strike'),
    },
    {
      icon: Highlighter,
      label: 'Highlight',
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: () => editor.isActive('highlight'),
    },
    {
      icon: Heading1,
      label: 'Heading 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 }),
    },
    {
      icon: Heading2,
      label: 'Heading 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
    },
    {
      icon: Heading3,
      label: 'Heading 3',
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive('heading', { level: 3 }),
    },
    {
      icon: List,
      label: 'Bullet List',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    {
      icon: ListOrdered,
      label: 'Ordered List',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
    },
    {
      icon: Quote,
      label: 'Blockquote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive('blockquote'),
    },
    {
      icon: SeparatorHorizontal,
      label: 'Horizontal Rule',
      action: () => editor.chain().focus().setHorizontalRule().run(),
      isActive: () => false,
    },
  ];

  return (
    <div className="flex items-center gap-0.5 border-b px-2 py-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex-wrap">
      {buttons.map((btn) => (
        <Button
          key={btn.label}
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${btn.isActive() ? 'bg-accent text-accent-foreground' : ''}`}
          onClick={btn.action}
          title={btn.label}
          type="button"
        >
          <btn.icon className="h-4 w-4" />
        </Button>
      ))}

      <div className="mx-1 h-6 w-px bg-border" />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
        type="button"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
        type="button"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
}
