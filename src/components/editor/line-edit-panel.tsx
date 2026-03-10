'use client';

import { useState, useCallback } from 'react';
import { Button } from '@ember/ui-components';
import { Card, CardContent } from '@ember/ui-components';
import { useEditorStore } from '@/stores/editor-store';
import { useLineEdits, useHandleSuggestion } from '@/hooks/use-ai';
import {
  LineEditType,
} from '@ember/shared-types/src/entities';
import {
  CheckCircle,
  XCircle,
  Loader2,
  Filter,
  AlertTriangle,
} from 'lucide-react';

const EDIT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  [LineEditType.FILTER_WORD]: { label: 'Filter Words', color: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' },
  [LineEditType.SHOW_DONT_TELL]: { label: "Show Don't Tell", color: 'bg-blue-500/20 text-blue-700 dark:text-blue-400' },
  [LineEditType.DIALOGUE_TAG]: { label: 'Dialogue Tags', color: 'bg-purple-500/20 text-purple-700 dark:text-purple-400' },
  [LineEditType.POV_INCONSISTENCY]: { label: 'POV Issues', color: 'bg-red-500/20 text-red-700 dark:text-red-400' },
  [LineEditType.PASSIVE_VOICE]: { label: 'Passive Voice', color: 'bg-orange-500/20 text-orange-700 dark:text-orange-400' },
  [LineEditType.ADVERB_OVERUSE]: { label: 'Adverb Overuse', color: 'bg-pink-500/20 text-pink-700 dark:text-pink-400' },
  [LineEditType.REPETITION]: { label: 'Repetition', color: 'bg-teal-500/20 text-teal-700 dark:text-teal-400' },
};

const ALL_EDIT_TYPES = Object.values(LineEditType);

interface LineEditPanelProps {
  onApplySuggestion?: (original: string, replacement: string) => void;
}

export function LineEditPanel({ onApplySuggestion }: LineEditPanelProps) {
  const currentChapterId = useEditorStore((s) => s.currentChapterId);
  const editorMode = useEditorStore((s) => s.editorMode);

  const [selectedTypes, setSelectedTypes] = useState<string[]>(ALL_EDIT_TYPES);
  const [handledIds, setHandledIds] = useState<Set<string>>(new Set());

  const {
    data: suggestions,
    isLoading,
    refetch,
    isFetching,
  } = useLineEdits(currentChapterId, selectedTypes.length < ALL_EDIT_TYPES.length ? selectedTypes : undefined);

  const handleSuggestionMutation = useHandleSuggestion();

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleAccept = useCallback(
    async (suggestionId: string, original: string, replacement: string) => {
      await handleSuggestionMutation.mutateAsync({ suggestionId, action: 'accept' });
      setHandledIds((prev) => new Set(prev).add(suggestionId));
      onApplySuggestion?.(original, replacement);
    },
    [handleSuggestionMutation, onApplySuggestion],
  );

  const handleReject = useCallback(
    async (suggestionId: string) => {
      await handleSuggestionMutation.mutateAsync({ suggestionId, action: 'reject' });
      setHandledIds((prev) => new Set(prev).add(suggestionId));
    },
    [handleSuggestionMutation],
  );

  if (editorMode !== 'edit') {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center">
        <AlertTriangle className="h-5 w-5 mx-auto mb-2" />
        Switch to Edit mode to use the line editor.
      </div>
    );
  }

  const activeSuggestions = suggestions?.filter((s) => !handledIds.has(s.id)) ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Line Editor</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching || !currentChapterId}
            type="button"
          >
            {isFetching ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Filter className="h-3.5 w-3.5 mr-1" />
            )}
            Analyze
          </Button>
        </div>

        {/* Edit type filters */}
        <div className="flex flex-wrap gap-1">
          {ALL_EDIT_TYPES.map((type) => {
            const info = EDIT_TYPE_LABELS[type];
            const active = selectedTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                  active ? info.color : 'bg-muted text-muted-foreground'
                }`}
                type="button"
              >
                {info.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggestions list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading || isFetching ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing chapter...
          </div>
        ) : activeSuggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-sm text-muted-foreground text-center px-4">
            {suggestions ? 'No suggestions found. Your prose is clean!' : 'Click Analyze to run the line editor.'}
          </div>
        ) : (
          <div className="divide-y">
            {activeSuggestions.map((s) => {
              const info = EDIT_TYPE_LABELS[s.edit_type] || { label: s.edit_type, color: 'bg-muted text-muted-foreground' };
              return (
                <div key={s.id} className="px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${info.color}`}>
                      {info.label}
                    </span>
                  </div>

                  <div className="text-sm space-y-1">
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-muted-foreground shrink-0 mt-0.5">Original:</span>
                      <span className="line-through text-red-500/80">{s.original_text}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-muted-foreground shrink-0 mt-0.5">Suggested:</span>
                      <span className="text-green-600 dark:text-green-400">{s.suggested_text}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">{s.explanation}</p>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleAccept(s.id, s.original_text, s.suggested_text)}
                      type="button"
                    >
                      <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => handleReject(s.id)}
                      type="button"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
