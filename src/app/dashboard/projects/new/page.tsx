'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardHeader, CardTitle } from '@ember/ui-components';
import { useCreateProject } from '@/hooks/use-projects';
import { HeatLevel, HEAT_LEVEL_LABELS, HEAT_LEVEL_DESCRIPTIONS } from '@ember/shared-types/src/entities';
import { ArrowLeft, Flame } from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useCreateProject();

  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [genre, setGenre] = useState('romantasy');
  const [heatLevel, setHeatLevel] = useState<HeatLevel>(HeatLevel.STEAMY);
  const [tropes, setTropes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const result = await createProject.mutateAsync({
      title: title.trim(),
      synopsis: synopsis.trim() || undefined,
      genre,
      settings: {
        steam_calibration: {
          project_heat_level: heatLevel,
          rendering_preferences: {},
        },
        trope_stack: tropes
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      },
    });
    router.push(`/dashboard/projects/${result.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} type="button">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Project</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., A Court of Thorns and Roses"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          />
        </div>

        {/* Synopsis */}
        <div className="space-y-2">
          <label htmlFor="synopsis" className="text-sm font-medium">
            Synopsis
          </label>
          <textarea
            id="synopsis"
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            placeholder="Brief overview of your story..."
            rows={4}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>

        {/* Genre */}
        <div className="space-y-2">
          <label htmlFor="genre" className="text-sm font-medium">
            Genre
          </label>
          <select
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="romantasy">Romantasy</option>
            <option value="romance">Romance</option>
            <option value="fantasy-romance">Fantasy Romance</option>
            <option value="dark-romance">Dark Romance</option>
            <option value="paranormal-romance">Paranormal Romance</option>
            <option value="contemporary-romance">Contemporary Romance</option>
            <option value="historical-romance">Historical Romance</option>
          </select>
        </div>

        {/* Heat Level */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            Heat Level
          </label>
          <div className="grid gap-2">
            {Object.values(HeatLevel)
              .filter((v): v is HeatLevel => typeof v === 'number')
              .map((level) => (
                <Card
                  key={level}
                  className={`cursor-pointer transition-all ${
                    heatLevel === level
                      ? 'border-primary ring-1 ring-primary'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setHeatLevel(level)}
                >
                  <CardContent className="flex items-center gap-3 py-3 px-4">
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: `hsl(var(--heat-${level}))`,
                        color: level >= 3 ? 'white' : 'inherit',
                      }}
                    >
                      {level}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {HEAT_LEVEL_LABELS[level]}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {HEAT_LEVEL_DESCRIPTIONS[level]}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Tropes */}
        <div className="space-y-2">
          <label htmlFor="tropes" className="text-sm font-medium">
            Trope Stack
          </label>
          <input
            id="tropes"
            type="text"
            value={tropes}
            onChange={(e) => setTropes(e.target.value)}
            placeholder="e.g., enemies to lovers, forced proximity, fated mates"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated list of tropes to guide AI generation.
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim() || createProject.isPending}>
            {createProject.isPending ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  );
}
