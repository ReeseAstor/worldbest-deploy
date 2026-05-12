'use client';

import { useEffect, useState } from 'react';
import { Button } from '@ember/ui-components';
import { useCharacter, useUpdateCharacter } from '@/hooks/use-characters';
import { Save } from 'lucide-react';

interface CharacterDetailProps {
  characterId: string;
  projectId: string;
}

export function CharacterDetail({ characterId, projectId }: CharacterDetailProps) {
  const { data: character, isLoading } = useCharacter(characterId);
  const updateCharacter = useUpdateCharacter(projectId);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [aliases, setAliases] = useState('');
  const [backstory, setBackstory] = useState('');
  const [appearanceDesc, setAppearanceDesc] = useState('');
  const [personalityTraits, setPersonalityTraits] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!character) return;
    setName(character.name || '');
    setRole(character.role || '');
    setAge(character.age?.toString() || '');
    setGender(character.gender || '');
    setAliases(character.aliases?.join(', ') || '');
    setBackstory(character.backstory || '');
    setAppearanceDesc(character.appearance?.description || '');
    setPersonalityTraits(character.personality?.core_traits?.join(', ') || '');
    setDirty(false);
  }, [character]);

  const markDirty = () => setDirty(true);

  const handleSave = async () => {
    await updateCharacter.mutateAsync({
      characterId,
      data: {
        name,
        role: role || undefined,
        age: age ? parseInt(age, 10) : undefined,
        gender: gender || undefined,
        aliases: aliases ? aliases.split(',').map((a) => a.trim()).filter(Boolean) : [],
        backstory: backstory || undefined,
        appearance: { description: appearanceDesc },
        personality: {
          core_traits: personalityTraits
            ? personalityTraits.split(',').map((t) => t.trim()).filter(Boolean)
            : [],
        },
      },
    });
    setDirty(false);
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading character...</div>;
  }

  if (!character) {
    return <div className="p-6 text-sm text-muted-foreground">Character not found.</div>;
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Character Profile</h2>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!dirty || updateCharacter.isPending}
          type="button"
        >
          <Save className="h-4 w-4 mr-1" />
          {updateCharacter.isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Name" value={name} onChange={(v) => { setName(v); markDirty(); }} />
        <Field label="Role" value={role} onChange={(v) => { setRole(v); markDirty(); }} placeholder="e.g., Protagonist, Villain, Love Interest" />
        <Field label="Age" value={age} onChange={(v) => { setAge(v); markDirty(); }} type="number" />
        <Field label="Gender" value={gender} onChange={(v) => { setGender(v); markDirty(); }} />
      </div>

      <Field
        label="Aliases"
        value={aliases}
        onChange={(v) => { setAliases(v); markDirty(); }}
        placeholder="Comma-separated: The Shadow, Dark One"
      />

      <TextareaField
        label="Appearance"
        value={appearanceDesc}
        onChange={(v) => { setAppearanceDesc(v); markDirty(); }}
        placeholder="Physical description, distinguishing features..."
        rows={3}
      />

      <Field
        label="Personality Traits"
        value={personalityTraits}
        onChange={(v) => { setPersonalityTraits(v); markDirty(); }}
        placeholder="Comma-separated: brave, stubborn, loyal"
      />

      <TextareaField
        label="Backstory"
        value={backstory}
        onChange={(v) => { setBackstory(v); markDirty(); }}
        placeholder="Character history, motivations, secrets..."
        rows={6}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
      />
    </div>
  );
}
