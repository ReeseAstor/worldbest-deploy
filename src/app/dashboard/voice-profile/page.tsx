'use client';

import { useState } from 'react';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import {
  useVoiceProfiles,
  useCreateVoiceProfile,
  useUpdateVoiceProfile,
  useAnalyzeVoiceProfile,
  useActivateVoiceProfile,
  useDeleteVoiceProfile,
} from '@/hooks/use-voice-profiles';
import {
  Fingerprint,
  Plus,
  Trash2,
  CheckCircle,
  Loader2,
  Sparkles,
  Save,
} from 'lucide-react';

export default function VoiceProfilePage() {
  const { data: profiles, isLoading } = useVoiceProfiles();
  const createProfile = useCreateVoiceProfile();
  const updateProfile = useUpdateVoiceProfile();
  const analyzeProfile = useAnalyzeVoiceProfile();
  const activateProfile = useActivateVoiceProfile();
  const deleteProfile = useDeleteVoiceProfile();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editExcerpts, setEditExcerpts] = useState('');
  const [dirty, setDirty] = useState(false);

  const selected = profiles?.find((p) => p.id === selectedId);

  const handleCreate = async () => {
    const result = await createProfile.mutateAsync({ name: 'New Voice Profile' });
    setSelectedId(result.id);
    setEditName(result.name);
    setEditExcerpts('');
    setDirty(false);
  };

  const handleSelect = (id: string) => {
    const p = profiles?.find((x) => x.id === id);
    if (!p) return;
    setSelectedId(id);
    setEditName(p.name);
    setEditExcerpts(p.sample_excerpts?.join('\n\n---\n\n') || '');
    setDirty(false);
  };

  const handleSave = async () => {
    if (!selectedId) return;
    const excerpts = editExcerpts
      .split('---')
      .map((s) => s.trim())
      .filter(Boolean);
    await updateProfile.mutateAsync({
      profileId: selectedId,
      data: { name: editName, sample_excerpts: excerpts },
    });
    setDirty(false);
  };

  const handleAnalyze = async () => {
    if (!selectedId) return;
    await analyzeProfile.mutateAsync(selectedId);
  };

  const handleActivate = async (id: string) => {
    await activateProfile.mutateAsync(id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this voice profile?')) return;
    await deleteProfile.mutateAsync(id);
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Fingerprint className="h-7 w-7 text-primary" />
            Voice Fingerprinting
          </h1>
          <p className="text-muted-foreground mt-1">
            Train Ember to write in your unique voice. Paste excerpts from your published work, then analyze.
          </p>
        </div>
        <Button onClick={handleCreate} disabled={createProfile.isPending} type="button">
          <Plus className="h-4 w-4 mr-1" />
          New Profile
        </Button>
      </div>

      <div className="flex gap-6 h-[calc(100vh-14rem)]">
        {/* Profile list */}
        <div className="w-72 border rounded-lg flex flex-col">
          <div className="px-3 py-2 border-b text-sm font-semibold">
            Your Profiles ({profiles?.length ?? 0})
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-sm text-muted-foreground">Loading...</div>
            ) : profiles?.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No voice profiles yet.
              </div>
            ) : (
              profiles?.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p.id)}
                  className={`flex items-center justify-between px-3 py-2.5 cursor-pointer border-b border-border/50 group transition-colors ${
                    selectedId === p.id ? 'bg-accent' : 'hover:bg-accent/50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm truncate">{p.name}</span>
                      {p.is_active && (
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.fingerprint ? 'Analyzed' : `${p.sample_excerpts?.length ?? 0} excerpts`}
                    </div>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    {!p.is_active && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); handleActivate(p.id); }}
                        title="Set as active"
                        type="button"
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                      type="button"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail / editor */}
        <div className="flex-1 border rounded-lg overflow-y-auto">
          {selected ? (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1.5 flex-1 mr-4">
                  <label className="text-sm font-medium">Profile Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => { setEditName(e.target.value); setDirty(true); }}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex gap-2 pt-5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSave}
                    disabled={!dirty || updateProfile.isPending}
                    type="button"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAnalyze}
                    disabled={analyzeProfile.isPending || !selected.sample_excerpts?.length}
                    type="button"
                  >
                    {analyzeProfile.isPending ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-1" />
                    )}
                    Analyze Voice
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Sample Excerpts
                  <span className="font-normal text-muted-foreground ml-2">
                    Separate multiple excerpts with ---
                  </span>
                </label>
                <textarea
                  value={editExcerpts}
                  onChange={(e) => { setEditExcerpts(e.target.value); setDirty(true); }}
                  placeholder={"Paste 2-5 excerpts of your published writing here (500-1000 words each).\n\nSeparate each excerpt with a line containing only ---\n\nThe more representative the excerpts, the better Ember can match your voice."}
                  rows={14}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none font-mono"
                />
              </div>

              {/* Fingerprint results */}
              {selected.fingerprint && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Fingerprint className="h-5 w-5 text-primary" />
                      Voice Fingerprint
                    </CardTitle>
                    <CardDescription>
                      Analysis of your writing style, used to guide AI generation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <Metric label="Avg Sentence Length" value={`${selected.fingerprint.sentence_length_avg ?? '—'} words`} />
                      <Metric label="Avg Paragraph Length" value={`${selected.fingerprint.paragraph_length_avg ?? '—'} sentences`} />
                      <Metric label="Dialogue : Narration" value={`${((selected.fingerprint.dialogue_to_narration_ratio ?? 0) * 100).toFixed(0)}%`} />
                      <Metric label="Metaphor Density" value={`${((selected.fingerprint.metaphor_density ?? 0) * 100).toFixed(1)}%`} />
                      <Metric label="POV Tendency" value={selected.fingerprint.pov_tendency ?? '—'} />
                      <Metric label="Tense Preference" value={selected.fingerprint.tense_preference ?? '—'} />
                      <Metric label="Vocabulary Complexity" value={`${selected.fingerprint.vocabulary_complexity_score ?? '—'}/10`} />
                    </div>
                    {selected.fingerprint.distinctive_phrases?.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-medium mb-1">Distinctive Phrases</div>
                        <div className="flex flex-wrap gap-1.5">
                          {selected.fingerprint.distinctive_phrases.map((p: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
              <Fingerprint className="h-12 w-12" />
              <p className="text-lg font-medium">Voice Fingerprinting</p>
              <p className="text-sm text-center max-w-md">
                Select a voice profile to edit, or create a new one. Paste excerpts of your writing and let Ember learn your style.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="font-medium capitalize">{value}</div>
    </div>
  );
}
