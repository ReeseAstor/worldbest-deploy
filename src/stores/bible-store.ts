import { create } from 'zustand';

interface CharacterSummary {
  id: string;
  name: string;
  role: string | null;
  aliases: string[];
}

interface LocationSummary {
  id: string;
  name: string;
  atmosphere: string | null;
}

interface BibleState {
  characters: CharacterSummary[];
  locations: LocationSummary[];
  selectedEntityId: string | null;
  selectedEntityType: 'character' | 'location' | null;
  isLoading: boolean;

  setCharacters: (characters: CharacterSummary[]) => void;
  setLocations: (locations: LocationSummary[]) => void;
  selectEntity: (id: string, type: 'character' | 'location') => void;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  addCharacter: (character: CharacterSummary) => void;
  addLocation: (location: LocationSummary) => void;
  removeCharacter: (id: string) => void;
  removeLocation: (id: string) => void;
}

export const useBibleStore = create<BibleState>((set) => ({
  characters: [],
  locations: [],
  selectedEntityId: null,
  selectedEntityType: null,
  isLoading: false,

  setCharacters: (characters) => set({ characters }),
  setLocations: (locations) => set({ locations }),
  selectEntity: (id, type) => set({ selectedEntityId: id, selectedEntityType: type }),
  clearSelection: () => set({ selectedEntityId: null, selectedEntityType: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  addCharacter: (character) => set((state) => ({ characters: [...state.characters, character] })),
  addLocation: (location) => set((state) => ({ locations: [...state.locations, location] })),
  removeCharacter: (id) => set((state) => ({ characters: state.characters.filter((c) => c.id !== id) })),
  removeLocation: (id) => set((state) => ({ locations: state.locations.filter((l) => l.id !== id) })),
}));
