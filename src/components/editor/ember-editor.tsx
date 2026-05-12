'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Highlight from '@tiptap/extension-highlight';
import { useCallback, useEffect } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { EditorToolbar } from './editor-toolbar';
import { WordCountBar } from './word-count-bar';
import { SlashCommandMenu } from './slash-command-menu';
import type { ChapterContentUpdate } from '@/lib/api/chapters';

interface EmberEditorProps {
  content?: Record<string, any> | null;
  editable?: boolean;
  onUpdate?: (data: ChapterContentUpdate) => void;
  placeholder?: string;
}

export function EmberEditor({
  content,
  editable = true,
  onUpdate,
  placeholder = 'Start writing your story...\n\nType / for AI commands',
}: EmberEditorProps) {
  const updateWordCount = useEditorStore((s) => s.updateWordCount);
  const editorMode = useEditorStore((s) => s.editorMode);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
      Highlight.configure({ multicolor: true }),
    ],
    content: content || {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    },
    editable,
    editorProps: {
      attributes: {
        class:
          'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[60vh] px-4 py-6',
      },
    },
    onUpdate: ({ editor: ed }) => {
      const json = ed.getJSON();
      const text = ed.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      updateWordCount(words);
      onUpdate?.({ content_json: json, content_text: text });
    },
  });

  // Sync external content changes (e.g. switching chapters)
  useEffect(() => {
    if (!editor || !content) return;
    const currentJSON = JSON.stringify(editor.getJSON());
    const incomingJSON = JSON.stringify(content);
    if (currentJSON !== incomingJSON) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  // Toggle editable based on mode
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editorMode === 'write' && editable);
  }, [editor, editorMode, editable]);

  const insertAIText = useCallback(
    (text: string) => {
      if (!editor) return;
      editor.chain().focus().insertContent(text).run();
    },
    [editor],
  );

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full">
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
        <SlashCommandMenu editor={editor} onInsert={insertAIText} />
      </div>
      <WordCountBar editor={editor} />
    </div>
  );
}
