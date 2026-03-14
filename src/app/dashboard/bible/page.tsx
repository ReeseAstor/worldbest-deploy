'use client';

import { useState } from 'react';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { useProjects } from '@/hooks/use-projects';
import { useCharacters, useCreateCharacter, useDeleteCharacter } from '@/hooks/use-characters';
import { useLocations, useCreateLocation, useDeleteLocation } from '@/hooks/use-locations';
import { useBibleStore } from '@/stores/bible-store';
import {
  Users,
  MapPin,
  Plus,
  Trash2,
  ChevronRight,
  Search,
} from 'lucide-react';
import { CharacterDetail } from './character-detail';
import { LocationDetail } from './location-detail';

export default function BiblePage() {
  const { data: projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [tab, setTab] = useState<'characters' | 'locations'>('characters');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedEntity = useBibleStore((s) => s.selectedEntityId);
  const selectedEntityType = useBibleStore((s) => s.selectedEntityType);
  const selectEntity = useBibleStore((s) => s.selectEntity);
  const clearSelection = useBibleStore((s) => s.clearSelection);

  const projectId = selectedProjectId || projects?.[0]?.id || null;

  const { data: characters, isLoading: charsLoading } = useCharacters(projectId);
  const { data: locations, isLoading: locsLoading } = useLocations(projectId);
  const createCharacter = useCreateCharacter(projectId || '');
  const createLocation = useCreateLocation(projectId || '');
  const deleteCharacterMutation = useDeleteCharacter(projectId || '');
  const deleteLocationMutation = useDeleteLocation(projectId || '');

  const filteredCharacters = characters?.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredLocations = locations?.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateCharacter = async () => {
    if (!projectId) return;
    const result = await createCharacter.mutateAsync({ name: 'New Character' });
    selectEntity(result.id, 'character');
  };

  const handleCreateLocation = async () => {
    if (!projectId) return;
    const result = await createLocation.mutateAsync({ name: 'New Location' });
    selectEntity(result.id, 'location');
  };

  const handleDeleteCharacter = async (id: string) => {
    if (!confirm('Delete this character?')) return;
    await deleteCharacterMutation.mutateAsync(id);
    if (selectedEntity === id) clearSelection();
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('Delete this location?')) return;
    await deleteLocationMutation.mutateAsync(id);
    if (selectedEntity === id) clearSelection();
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0">
      {/* Left panel: list */}
      <div className="w-80 border-r flex flex-col">
        {/* Project selector */}
        <div className="px-3 py-2 border-b">
          <select
            value={projectId || ''}
            onChange={(e) => {
              setSelectedProjectId(e.target.value || null);
              clearSelection();
            }}
            className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {projects?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => { setTab('characters'); clearSelection(); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors ${
              tab === 'characters' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'
            }`}
            type="button"
          >
            <Users className="h-4 w-4" />
            Characters ({characters?.length ?? 0})
          </button>
          <button
            onClick={() => { setTab('locations'); clearSelection(); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors ${
              tab === 'locations' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'
            }`}
            type="button"
          >
            <MapPin className="h-4 w-4" />
            Locations ({locations?.length ?? 0})
          </button>
        </div>

        {/* Search + Add */}
        <div className="flex items-center gap-2 px-3 py-2 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${tab}...`}
              className="w-full pl-7 pr-2 py-1.5 text-sm rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 shrink-0"
            onClick={tab === 'characters' ? handleCreateCharacter : handleCreateLocation}
            disabled={!projectId}
            type="button"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Entity list */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'characters' ? (
            charsLoading ? (
              <div className="p-4 text-sm text-muted-foreground">Loading...</div>
            ) : filteredCharacters?.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No characters yet. Click + to add one.
              </div>
            ) : (
              filteredCharacters?.map((c) => (
                <div
                  key={c.id}
                  className={`flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors border-b border-border/50 group ${
                    selectedEntity === c.id && selectedEntityType === 'character'
                      ? 'bg-accent'
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => selectEntity(c.id, 'character')}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{c.name}</div>
                    {c.role && (
                      <div className="text-xs text-muted-foreground truncate">{c.role}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); handleDeleteCharacter(c.id); }}
                      type="button"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))
            )
          ) : locsLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading...</div>
          ) : filteredLocations?.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No locations yet. Click + to add one.
            </div>
          ) : (
            filteredLocations?.map((l) => (
              <div
                key={l.id}
                className={`flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors border-b border-border/50 group ${
                  selectedEntity === l.id && selectedEntityType === 'location'
                    ? 'bg-accent'
                    : 'hover:bg-accent/50'
                }`}
                onClick={() => selectEntity(l.id, 'location')}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{l.name}</div>
                  {l.atmosphere && (
                    <div className="text-xs text-muted-foreground truncate">{l.atmosphere}</div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); handleDeleteLocation(l.id); }}
                    type="button"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right panel: detail */}
      <div className="flex-1 overflow-y-auto">
        {selectedEntity && selectedEntityType === 'character' && projectId ? (
          <CharacterDetail characterId={selectedEntity} projectId={projectId} />
        ) : selectedEntity && selectedEntityType === 'location' && projectId ? (
          <LocationDetail locationId={selectedEntity} projectId={projectId} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <Users className="h-12 w-12" />
            <p className="text-lg font-medium">Series Bible</p>
            <p className="text-sm">Select a character or location to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
