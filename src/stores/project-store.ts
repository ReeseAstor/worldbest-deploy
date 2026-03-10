import { create } from 'zustand';

interface ProjectSummary {
  id: string;
  title: string;
  genre: string;
  wordCount: number;
  targetWordCount: number;
  status: string;
  updatedAt: string;
  heatLevel: number;
}

interface ProjectState {
  projects: ProjectSummary[];
  currentProject: ProjectSummary | null;
  isLoading: boolean;

  setProjects: (projects: ProjectSummary[]) => void;
  setCurrentProject: (project: ProjectSummary | null) => void;
  setLoading: (loading: boolean) => void;
  addProject: (project: ProjectSummary) => void;
  updateProject: (id: string, updates: Partial<ProjectSummary>) => void;
  removeProject: (id: string) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,

  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  setLoading: (loading) => set({ isLoading: loading }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      currentProject: state.currentProject?.id === id ? { ...state.currentProject, ...updates } : state.currentProject,
    })),
  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    })),
}));
