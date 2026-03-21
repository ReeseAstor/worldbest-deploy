import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Onboarding Store
 * 
 * Manages the user's onboarding state and preferences.
 */

export type WritingGoal = 'novel' | 'short-story' | 'screenplay' | 'other';
export type ProjectTemplate = 'scratch' | 'beat-sheet' | 'three-act' | 'heros-journey';

export const GENRE_OPTIONS = [
  { value: 'romance', label: 'Romance' },
  { value: 'fantasy-romance', label: 'Fantasy Romance' },
  { value: 'dark-romance', label: 'Dark Romance' },
  { value: 'contemporary-romance', label: 'Contemporary Romance' },
  { value: 'paranormal-romance', label: 'Paranormal Romance' },
  { value: 'other', label: 'Other' },
] as const;

export const WORD_COUNT_PRESETS = [
  { value: 50000, label: '50K' },
  { value: 75000, label: '75K' },
  { value: 90000, label: '90K' },
] as const;

export const TEMPLATE_OPTIONS = [
  { value: 'scratch', label: 'Start from scratch', description: 'Begin with a blank canvas' },
  { value: 'beat-sheet', label: 'Beat Sheet', description: 'Story structure beats' },
  { value: 'three-act', label: 'Three-Act Structure', description: 'Classic beginning, middle, end' },
  { value: 'heros-journey', label: "Hero's Journey", description: 'The monomyth structure' },
] as const;

interface OnboardingProject {
  title: string;
  genre: string;
  targetWordCount: number | null;
  template: ProjectTemplate;
}

interface OnboardingState {
  // Current step (1-4)
  currentStep: number;
  
  // User's writing goal selection
  writingGoal: WritingGoal | null;
  
  // First project data
  project: OnboardingProject;
  
  // Created project ID (after project is created)
  createdProjectId: string | null;
  
  // Onboarding completed flag
  completed: boolean;

  // Actions
  setCurrentStep: (step: number) => void;
  setWritingGoal: (goal: WritingGoal) => void;
  setProject: (project: Partial<OnboardingProject>) => void;
  setCreatedProjectId: (id: string) => void;
  markCompleted: () => void;
  reset: () => void;
}

const defaultProject: OnboardingProject = {
  title: '',
  genre: '',
  targetWordCount: null,
  template: 'scratch',
};

const initialState = {
  currentStep: 1,
  writingGoal: null,
  project: defaultProject,
  createdProjectId: null,
  completed: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentStep: (step) => set({ currentStep: step }),
      
      setWritingGoal: (goal) => set({ writingGoal: goal }),
      
      setProject: (projectUpdates) => 
        set((state) => ({ 
          project: { ...state.project, ...projectUpdates } 
        })),
      
      setCreatedProjectId: (id) => set({ createdProjectId: id }),
      
      markCompleted: () => set({ completed: true }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'ember-onboarding',
      partialize: (state) => ({
        currentStep: state.currentStep,
        writingGoal: state.writingGoal,
        project: state.project,
        createdProjectId: state.createdProjectId,
        completed: state.completed,
      }),
    }
  )
);
