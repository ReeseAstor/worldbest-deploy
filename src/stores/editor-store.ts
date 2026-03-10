import { create } from 'zustand';

interface EditorState {
  currentProjectId: string | null;
  currentBookId: string | null;
  currentChapterId: string | null;
  chapterList: Array<{ id: string; number: number; title: string; wordCount: number; status: string }>;
  isSaving: boolean;
  lastSavedAt: Date | null;
  wordCount: number;
  sessionWordCount: number;
  isAIPanelOpen: boolean;
  editorMode: 'write' | 'edit';
  selectedPersona: 'muse' | 'editor' | 'coach';
  autoSaveEnabled: boolean;

  setCurrentProject: (id: string | null) => void;
  setCurrentBook: (id: string | null) => void;
  setCurrentChapter: (id: string | null) => void;
  setChapterList: (chapters: EditorState['chapterList']) => void;
  setSaving: (saving: boolean) => void;
  setLastSavedAt: (date: Date) => void;
  updateWordCount: (count: number) => void;
  incrementSessionWordCount: (delta: number) => void;
  toggleAIPanel: () => void;
  setEditorMode: (mode: 'write' | 'edit') => void;
  setSelectedPersona: (persona: 'muse' | 'editor' | 'coach') => void;
  setAutoSaveEnabled: (enabled: boolean) => void;
  reset: () => void;
}

const initialState = {
  currentProjectId: null,
  currentBookId: null,
  currentChapterId: null,
  chapterList: [],
  isSaving: false,
  lastSavedAt: null,
  wordCount: 0,
  sessionWordCount: 0,
  isAIPanelOpen: false,
  editorMode: 'write' as const,
  selectedPersona: 'muse' as const,
  autoSaveEnabled: true,
};

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,
  setCurrentProject: (id) => set({ currentProjectId: id }),
  setCurrentBook: (id) => set({ currentBookId: id }),
  setCurrentChapter: (id) => set({ currentChapterId: id }),
  setChapterList: (chapters) => set({ chapterList: chapters }),
  setSaving: (saving) => set({ isSaving: saving }),
  setLastSavedAt: (date) => set({ lastSavedAt: date }),
  updateWordCount: (count) => set({ wordCount: count }),
  incrementSessionWordCount: (delta) => set((state) => ({ sessionWordCount: state.sessionWordCount + delta })),
  toggleAIPanel: () => set((state) => ({ isAIPanelOpen: !state.isAIPanelOpen })),
  setEditorMode: (mode) => set({ editorMode: mode }),
  setSelectedPersona: (persona) => set({ selectedPersona: persona }),
  setAutoSaveEnabled: (enabled) => set({ autoSaveEnabled: enabled }),
  reset: () => set(initialState),
}));
