'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@ember/ui-components';
import { useEditorStore } from '@/stores/editor-store';
import { useAIGeneration } from '@/hooks/use-ai';
import {
  Sparkles,
  X,
  Send,
  StopCircle,
  PenTool,
  BookOpen,
  GraduationCap,
} from 'lucide-react';

interface AIPanelProps {
  onInsert: (text: string) => void;
}

const PERSONAS = [
  { id: 'muse' as const, label: 'Muse', icon: Sparkles, desc: 'Creative drafting' },
  { id: 'editor' as const, label: 'Editor', icon: PenTool, desc: 'Polish & refine' },
  { id: 'coach' as const, label: 'Coach', icon: GraduationCap, desc: 'Structure & story' },
];

export function AIPanel({ onInsert }: AIPanelProps) {
  const isOpen = useEditorStore((s) => s.isAIPanelOpen);
  const togglePanel = useEditorStore((s) => s.toggleAIPanel);
  const selectedPersona = useEditorStore((s) => s.selectedPersona);
  const setSelectedPersona = useEditorStore((s) => s.setSelectedPersona);
  const currentProjectId = useEditorStore((s) => s.currentProjectId);
  const currentChapterId = useEditorStore((s) => s.currentChapterId);

  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);

  const { generate, abort, isGenerating } = useAIGeneration();

  const handleGenerate = useCallback(() => {
    if (!prompt.trim() || !currentProjectId) return;
    setOutput('');
    generate({
      request: {
        project_id: currentProjectId,
        chapter_id: currentChapterId || undefined,
        prompt: prompt.trim(),
        parameters: { persona: selectedPersona },
      },
      onChunk: (fullText) => {
        setOutput(fullText);
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
      },
    });
  }, [prompt, currentProjectId, currentChapterId, selectedPersona, generate]);

  const handleInsert = useCallback(() => {
    if (output) {
      onInsert(output);
      setOutput('');
      setPrompt('');
    }
  }, [output, onInsert]);

  if (!isOpen) return null;

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">AI Assistant</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={togglePanel} type="button">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Persona Selector */}
      <div className="flex gap-1 px-3 py-2 border-b">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPersona(p.id)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors flex-1 justify-center ${
              selectedPersona === p.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
            title={p.desc}
            type="button"
          >
            <p.icon className="h-3 w-3" />
            {p.label}
          </button>
        ))}
      </div>

      {/* Output Area */}
      <div ref={outputRef} className="flex-1 overflow-y-auto px-3 py-2 text-sm">
        {output ? (
          <div className="whitespace-pre-wrap leading-relaxed">{output}</div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center gap-2">
            <BookOpen className="h-8 w-8" />
            <p>Ask your AI co-writer for help.</p>
            <p className="text-xs">
              Describe what you need: a scene idea, character dialogue, prose continuation, etc.
            </p>
          </div>
        )}
      </div>

      {/* Insert Button (when output exists) */}
      {output && !isGenerating && (
        <div className="px-3 py-2 border-t">
          <Button
            size="sm"
            className="w-full"
            onClick={handleInsert}
            type="button"
          >
            Insert into Editor
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="px-3 py-2 border-t">
        <div className="flex gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you need..."
            className="flex-1 rounded-md border bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />
          {isGenerating ? (
            <Button variant="destructive" size="icon" onClick={abort} title="Stop" type="button">
              <StopCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={handleGenerate}
              disabled={!prompt.trim() || !currentProjectId}
              title="Generate"
              type="button"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
