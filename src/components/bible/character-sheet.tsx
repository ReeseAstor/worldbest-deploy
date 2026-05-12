'use client';

import { useState } from 'react';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User,
  Heart,
  MessageSquare,
  Sparkles,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  BookHeart,
  Users
} from 'lucide-react';

interface CharacterSheetProps {
  character?: Character;
  onSave: (character: Character) => void;
  onCancel: () => void;
}

interface Character {
  id: string;
  name: string;
  aliases: string[];
  age?: number;
  gender?: string;
  romanceRole: 'FMC' | 'MMC' | 'love-interest' | 'rival' | 'best-friend' | 'antagonist' | 'supporting';
  appearance: {
    height?: string;
    build?: string;
    hair?: string;
    eyes?: string;
    distinguishingFeatures?: string[];
    description?: string;
  };
  personality: {
    coreTraits: string[];
    quirks: string[];
    fears: string[];
    desires: string[];
    flaws: string[];
  };
  speechPatterns: {
    catchphrases: string[];
    formality: 'casual' | 'neutral' | 'formal';
    dialectNotes?: string;
  };
  romanceAttributes: {
    loveLanguage?: 'words' | 'acts' | 'gifts' | 'time' | 'touch';
    attachmentStyle?: 'secure' | 'anxious' | 'avoidant' | 'disorganized';
    relationshipBaggage?: string[];
    dealbreakers?: string[];
  };
  povVoiceNotes?: string;
  backstory?: string;
}

const ROMANCE_ROLES = [
  { value: 'FMC', label: 'Female Main Character (FMC)' },
  { value: 'MMC', label: 'Male Main Character (MMC)' },
  { value: 'love-interest', label: 'Secondary Love Interest' },
  { value: 'rival', label: 'Romantic Rival' },
  { value: 'best-friend', label: 'Best Friend' },
  { value: 'antagonist', label: 'Antagonist' },
  { value: 'supporting', label: 'Supporting Character' },
];

const LOVE_LANGUAGES = [
  { value: 'words', label: 'Words of Affirmation' },
  { value: 'acts', label: 'Acts of Service' },
  { value: 'gifts', label: 'Receiving Gifts' },
  { value: 'time', label: 'Quality Time' },
  { value: 'touch', label: 'Physical Touch' },
];

const ATTACHMENT_STYLES = [
  { value: 'secure', label: 'Secure' },
  { value: 'anxious', label: 'Anxious' },
  { value: 'avoidant', label: 'Avoidant' },
  { value: 'disorganized', label: 'Disorganized' },
];

export function CharacterSheet({ character, onSave, onCancel }: CharacterSheetProps) {
  const [formData, setFormData] = useState<Character>(
    character || {
      id: '',
      name: '',
      aliases: [],
      romanceRole: 'supporting',
      appearance: {
        distinguishingFeatures: [],
      },
      personality: {
        coreTraits: [],
        quirks: [],
        fears: [],
        desires: [],
        flaws: [],
      },
      speechPatterns: {
        catchphrases: [],
        formality: 'neutral',
      },
      romanceAttributes: {
        relationshipBaggage: [],
        dealbreakers: [],
      },
    }
  );

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basics: true,
    appearance: true,
    personality: false,
    speech: false,
    romance: false,
    backstory: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateField = (path: string, value: any) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newData;
    });
  };

  const addToArray = (path: string, value: string) => {
    if (!value.trim()) return;
    const keys = path.split('.');
    let current: any = formData;
    for (const key of keys) {
      current = current[key];
    }
    updateField(path, [...(current || []), value.trim()]);
  };

  const removeFromArray = (path: string, index: number) => {
    const keys = path.split('.');
    let current: any = formData;
    for (const key of keys) {
      current = current[key];
    }
    updateField(path, current.filter((_: any, i: number) => i !== index));
  };

  const SectionHeader = ({ 
    title, 
    icon: Icon, 
    section 
  }: { 
    title: string; 
    icon: any; 
    section: string;
  }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="flex w-full items-center justify-between py-2 text-left"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-rose-500" />
        <span className="font-semibold">{title}</span>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      )}
    </button>
  );

  const TagInput = ({ 
    label, 
    path, 
    placeholder 
  }: { 
    label: string; 
    path: string; 
    placeholder: string;
  }) => {
    const [inputValue, setInputValue] = useState('');
    const keys = path.split('.');
    let values: string[] = formData as any;
    for (const key of keys) {
      values = (values as any)[key];
    }
    values = values || [];

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addToArray(path, inputValue);
                setInputValue('');
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              addToArray(path, inputValue);
              setInputValue('');
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {values.map((item: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-sm text-rose-700 dark:bg-rose-900 dark:text-rose-300"
            >
              {item}
              <button
                type="button"
                onClick={() => removeFromArray(path, index)}
                className="hover:text-rose-900"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basics Section */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader title="Basic Information" icon={User} section="basics" />
        </CardHeader>
        {expandedSections.basics && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Character name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Romance Role *</Label>
                <select
                  id="role"
                  value={formData.romanceRole}
                  onChange={(e) => updateField('romanceRole', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  {ROMANCE_ROLES.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <TagInput
              label="Aliases / Nicknames"
              path="aliases"
              placeholder="Add alias..."
            />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => updateField('age', parseInt(e.target.value) || undefined)}
                  placeholder="Age"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  value={formData.gender || ''}
                  onChange={(e) => updateField('gender', e.target.value)}
                  placeholder="Gender identity"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Appearance Section */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader title="Physical Appearance" icon={User} section="appearance" />
        </CardHeader>
        {expandedSections.appearance && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  value={formData.appearance.height || ''}
                  onChange={(e) => updateField('appearance.height', e.target.value)}
                  placeholder="e.g., 5 foot 8, tall, petite"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="build">Build</Label>
                <Input
                  id="build"
                  value={formData.appearance.build || ''}
                  onChange={(e) => updateField('appearance.build', e.target.value)}
                  placeholder="e.g., athletic, slender, muscular"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hair">Hair</Label>
                <Input
                  id="hair"
                  value={formData.appearance.hair || ''}
                  onChange={(e) => updateField('appearance.hair', e.target.value)}
                  placeholder="e.g., long black waves, silver streaked"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eyes">Eyes</Label>
                <Input
                  id="eyes"
                  value={formData.appearance.eyes || ''}
                  onChange={(e) => updateField('appearance.eyes', e.target.value)}
                  placeholder="e.g., piercing violet, warm amber"
                />
              </div>
            </div>

            <TagInput
              label="Distinguishing Features"
              path="appearance.distinguishingFeatures"
              placeholder="Add feature..."
            />

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description</Label>
              <textarea
                id="description"
                value={formData.appearance.description || ''}
                onChange={(e) => updateField('appearance.description', e.target.value)}
                placeholder="Full physical description for AI reference..."
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Personality Section */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader title="Personality" icon={Sparkles} section="personality" />
        </CardHeader>
        {expandedSections.personality && (
          <CardContent className="space-y-4">
            <TagInput
              label="Core Traits"
              path="personality.coreTraits"
              placeholder="e.g., fiercely loyal, stubborn..."
            />
            <TagInput
              label="Quirks"
              path="personality.quirks"
              placeholder="e.g., always taps fingers when thinking..."
            />
            <TagInput
              label="Fears"
              path="personality.fears"
              placeholder="e.g., abandonment, failure..."
            />
            <TagInput
              label="Deepest Desires"
              path="personality.desires"
              placeholder="e.g., to be truly seen, to protect those she loves..."
            />
            <TagInput
              label="Flaws"
              path="personality.flaws"
              placeholder="e.g., trust issues, impulsiveness..."
            />
          </CardContent>
        )}
      </Card>

      {/* Speech Patterns Section */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader title="Speech & Voice" icon={MessageSquare} section="speech" />
        </CardHeader>
        {expandedSections.speech && (
          <CardContent className="space-y-4">
            <TagInput
              label="Catchphrases / Verbal Tics"
              path="speechPatterns.catchphrases"
              placeholder='e.g., "By the gods...", always clears throat before lying'
            />

            <div className="space-y-2">
              <Label>Formality Level</Label>
              <div className="flex gap-4">
                {['casual', 'neutral', 'formal'].map((level) => (
                  <label key={level} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="formality"
                      value={level}
                      checked={formData.speechPatterns.formality === level}
                      onChange={(e) => updateField('speechPatterns.formality', e.target.value)}
                    />
                    <span className="capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dialect">Dialect / Accent Notes</Label>
              <textarea
                id="dialect"
                value={formData.speechPatterns.dialectNotes || ''}
                onChange={(e) => updateField('speechPatterns.dialectNotes', e.target.value)}
                placeholder="Notes on how they speak, accent characteristics, word choices..."
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="povNotes">POV Voice Notes</Label>
              <textarea
                id="povNotes"
                value={formData.povVoiceNotes || ''}
                onChange={(e) => updateField('povVoiceNotes', e.target.value)}
                placeholder="Notes for when this character is the POV narrator. How do they observe the world? What do they notice first?"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Romance Attributes Section */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader title="Romance Attributes" icon={Heart} section="romance" />
        </CardHeader>
        {expandedSections.romance && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Love Language</Label>
                <select
                  value={formData.romanceAttributes.loveLanguage || ''}
                  onChange={(e) => updateField('romanceAttributes.loveLanguage', e.target.value || undefined)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="">Select...</option>
                  {LOVE_LANGUAGES.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Attachment Style</Label>
                <select
                  value={formData.romanceAttributes.attachmentStyle || ''}
                  onChange={(e) => updateField('romanceAttributes.attachmentStyle', e.target.value || undefined)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="">Select...</option>
                  {ATTACHMENT_STYLES.map(style => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <TagInput
              label="Relationship Baggage"
              path="romanceAttributes.relationshipBaggage"
              placeholder="Past hurts, trust issues, ex drama..."
            />

            <TagInput
              label="Dealbreakers"
              path="romanceAttributes.dealbreakers"
              placeholder="What would make them walk away..."
            />
          </CardContent>
        )}
      </Card>

      {/* Backstory Section */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader title="Backstory" icon={BookHeart} section="backstory" />
        </CardHeader>
        {expandedSections.backstory && (
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="backstory">Character History</Label>
              <textarea
                id="backstory"
                value={formData.backstory || ''}
                onChange={(e) => updateField('backstory', e.target.value)}
                placeholder="Full backstory, formative experiences, how they became who they are..."
                className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          Save Character
        </Button>
      </div>
    </form>
  );
}

export default CharacterSheet;
