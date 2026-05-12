'use client';

import { useEffect, useState } from 'react';
import { Button } from '@ember/ui-components';
import { useLocation, useUpdateLocation } from '@/hooks/use-locations';
import { Save } from 'lucide-react';

interface LocationDetailProps {
  locationId: string;
  projectId: string;
}

export function LocationDetail({ locationId, projectId }: LocationDetailProps) {
  const { data: location, isLoading } = useLocation(locationId);
  const updateLocation = useUpdateLocation(projectId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [atmosphere, setAtmosphere] = useState('');
  const [significance, setSignificance] = useState('');
  const [terrain, setTerrain] = useState('');
  const [climate, setClimate] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!location) return;
    setName(location.name || '');
    setDescription(location.description || '');
    setAtmosphere(location.atmosphere || '');
    setSignificance(location.significance || '');
    setTerrain(location.geography?.terrain || '');
    setClimate(location.geography?.climate || '');
    setDirty(false);
  }, [location]);

  const markDirty = () => setDirty(true);

  const handleSave = async () => {
    await updateLocation.mutateAsync({
      locationId,
      data: {
        name,
        description: description || undefined,
        atmosphere: atmosphere || undefined,
        significance: significance || undefined,
        geography: {
          terrain: terrain || undefined,
          climate: climate || undefined,
        },
      },
    });
    setDirty(false);
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading location...</div>;
  }

  if (!location) {
    return <div className="p-6 text-sm text-muted-foreground">Location not found.</div>;
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Location Profile</h2>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!dirty || updateLocation.isPending}
          type="button"
        >
          <Save className="h-4 w-4 mr-1" />
          {updateLocation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); markDirty(); }}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => { setDescription(e.target.value); markDirty(); }}
          placeholder="Detailed description of this location..."
          rows={4}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Terrain</label>
          <input
            type="text"
            value={terrain}
            onChange={(e) => { setTerrain(e.target.value); markDirty(); }}
            placeholder="e.g., Mountain pass, Dense forest"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Climate</label>
          <input
            type="text"
            value={climate}
            onChange={(e) => { setClimate(e.target.value); markDirty(); }}
            placeholder="e.g., Temperate, Arid, Arctic"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Atmosphere</label>
        <textarea
          value={atmosphere}
          onChange={(e) => { setAtmosphere(e.target.value); markDirty(); }}
          placeholder="The mood and feel of this place..."
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Significance</label>
        <textarea
          value={significance}
          onChange={(e) => { setSignificance(e.target.value); markDirty(); }}
          placeholder="Why this location matters to the story..."
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </div>
    </div>
  );
}
