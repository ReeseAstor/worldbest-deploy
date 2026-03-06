'use client';

import { useState, useCallback } from 'react';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardHeader, CardTitle } from '@ember/ui-components';
import {
  Heart,
  Swords,
  Users,
  UserPlus,
  Shield,
  Flame,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

/** Relationship types with visual styling */
const RELATIONSHIP_TYPES = {
  romantic: { label: 'Romantic', icon: Heart, color: 'text-rose-500', bgColor: 'bg-rose-100 dark:bg-rose-900', lineColor: '#f43f5e' },
  tension: { label: 'Romantic Tension', icon: Flame, color: 'text-amber-500', bgColor: 'bg-amber-100 dark:bg-amber-900', lineColor: '#f59e0b' },
  adversarial: { label: 'Adversarial', icon: Swords, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900', lineColor: '#dc2626' },
  familial: { label: 'Family', icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900', lineColor: '#3b82f6' },
  alliance: { label: 'Alliance', icon: Shield, color: 'text-emerald-500', bgColor: 'bg-emerald-100 dark:bg-emerald-900', lineColor: '#10b981' },
  friendship: { label: 'Friendship', icon: UserPlus, color: 'text-violet-500', bgColor: 'bg-violet-100 dark:bg-violet-900', lineColor: '#8b5cf6' },
};

type RelationshipType = keyof typeof RELATIONSHIP_TYPES;

/** Relationship stage for romance arcs */
const RELATIONSHIP_STAGES = [
  'strangers',
  'enemies', 
  'acquaintances',
  'tension',
  'attraction',
  'denial',
  'first-kiss',
  'exploration',
  'commitment',
  'conflict',
  'separation',
  'reconciliation',
  'hea'
] as const;

type RelationshipStage = typeof RELATIONSHIP_STAGES[number];

interface Character {
  id: string;
  name: string;
  romanceRole?: string;
  imageUrl?: string;
}

interface Relationship {
  id: string;
  character1Id: string;
  character2Id: string;
  type: RelationshipType;
  stage?: RelationshipStage;
  description?: string;
  dynamics?: string;
  tensionPoints?: string[];
}

interface RelationshipGraphProps {
  characters: Character[];
  relationships: Relationship[];
  onAddRelationship: (rel: Omit<Relationship, 'id'>) => void;
  onUpdateRelationship: (id: string, rel: Partial<Relationship>) => void;
  onDeleteRelationship: (id: string) => void;
  selectedCharacterId?: string;
  onSelectCharacter?: (id: string | null) => void;
}

export function RelationshipGraph({
  characters,
  relationships,
  onAddRelationship,
  onUpdateRelationship,
  onDeleteRelationship,
  selectedCharacterId,
  onSelectCharacter,
}: RelationshipGraphProps) {
  const [isAddingRelationship, setIsAddingRelationship] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<Relationship | null>(null);
  const [newRelationship, setNewRelationship] = useState<Partial<Relationship>>({
    type: 'romantic',
  });

  const getCharacterById = (id: string) => characters.find(c => c.id === id);

  const getRelationshipsForCharacter = (characterId: string) => {
    return relationships.filter(
      r => r.character1Id === characterId || r.character2Id === characterId
    );
  };

  const getOtherCharacterId = (rel: Relationship, characterId: string) => {
    return rel.character1Id === characterId ? rel.character2Id : rel.character1Id;
  };

  const handleAddRelationship = () => {
    if (newRelationship.character1Id && newRelationship.character2Id && newRelationship.type) {
      onAddRelationship({
        character1Id: newRelationship.character1Id,
        character2Id: newRelationship.character2Id,
        type: newRelationship.type,
        stage: newRelationship.stage,
        description: newRelationship.description,
      });
      setNewRelationship({ type: 'romantic' });
      setIsAddingRelationship(false);
    }
  };

  const handleUpdateRelationship = () => {
    if (editingRelationship) {
      onUpdateRelationship(editingRelationship.id, editingRelationship);
      setEditingRelationship(null);
    }
  };

  // Character Node Component
  const CharacterNode = ({ character }: { character: Character }) => {
    const isSelected = selectedCharacterId === character.id;
    const charRelationships = getRelationshipsForCharacter(character.id);
    const hasRomantic = charRelationships.some(r => r.type === 'romantic' || r.type === 'tension');

    return (
      <button
        onClick={() => onSelectCharacter?.(isSelected ? null : character.id)}
        className={`
          relative p-4 rounded-xl border-2 transition-all
          ${isSelected 
            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950 shadow-lg scale-105' 
            : 'border-border hover:border-rose-300 hover:shadow-md bg-card'
          }
        `}
      >
        {/* Character Avatar */}
        <div className={`
          w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-xl font-bold
          ${hasRomantic ? 'bg-rose-200 text-rose-700' : 'bg-muted text-muted-foreground'}
        `}>
          {character.imageUrl ? (
            <img src={character.imageUrl} alt={character.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            character.name.charAt(0).toUpperCase()
          )}
        </div>

        {/* Character Name */}
        <div className="text-center">
          <p className="font-medium text-sm">{character.name}</p>
          {character.romanceRole && (
            <span className={`
              text-xs px-2 py-0.5 rounded-full
              ${character.romanceRole === 'FMC' || character.romanceRole === 'MMC' 
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300' 
                : 'bg-muted text-muted-foreground'
              }
            `}>
              {character.romanceRole}
            </span>
          )}
        </div>

        {/* Relationship Count Badge */}
        {charRelationships.length > 0 && (
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center">
            {charRelationships.length}
          </div>
        )}
      </button>
    );
  };

  // Relationship Card Component
  const RelationshipCard = ({ relationship }: { relationship: Relationship }) => {
    const char1 = getCharacterById(relationship.character1Id);
    const char2 = getCharacterById(relationship.character2Id);
    const typeConfig = RELATIONSHIP_TYPES[relationship.type];
    const Icon = typeConfig.icon;

    if (!char1 || !char2) return null;

    return (
      <Card className={`${typeConfig.bgColor} border-0`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${typeConfig.color}`} />
              <span className={`text-sm font-medium ${typeConfig.color}`}>
                {typeConfig.label}
              </span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setEditingRelationship(relationship)}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive"
                onClick={() => onDeleteRelationship(relationship.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{char1.name}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">{char2.name}</span>
          </div>

          {relationship.stage && (
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">Stage: </span>
              <span className="text-xs font-medium capitalize">
                {relationship.stage.replace('-', ' ')}
              </span>
            </div>
          )}

          {relationship.description && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
              {relationship.description}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Relationship Map</h2>
          <p className="text-sm text-muted-foreground">
            Track romantic dynamics, alliances, and conflicts
          </p>
        </div>
        <Button onClick={() => setIsAddingRelationship(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Relationship
        </Button>
      </div>

      {/* Character Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {characters.map(character => (
          <CharacterNode key={character.id} character={character} />
        ))}
      </div>

      {/* Selected Character Relationships */}
      {selectedCharacterId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              {getCharacterById(selectedCharacterId)?.name}&apos;s Relationships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {getRelationshipsForCharacter(selectedCharacterId).map(rel => (
                <RelationshipCard key={rel.id} relationship={rel} />
              ))}
              {getRelationshipsForCharacter(selectedCharacterId).length === 0 && (
                <p className="text-muted-foreground text-sm col-span-2">
                  No relationships defined yet. Click &quot;Add Relationship&quot; to create one.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Relationships (when no character selected) */}
      {!selectedCharacterId && relationships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Relationships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {relationships.map(rel => (
                <RelationshipCard key={rel.id} relationship={rel} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Relationship Modal */}
      {isAddingRelationship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Add Relationship</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsAddingRelationship(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Character 1</label>
                  <select
                    value={newRelationship.character1Id || ''}
                    onChange={(e) => setNewRelationship(prev => ({ ...prev, character1Id: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="">Select...</option>
                    {characters.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Character 2</label>
                  <select
                    value={newRelationship.character2Id || ''}
                    onChange={(e) => setNewRelationship(prev => ({ ...prev, character2Id: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="">Select...</option>
                    {characters
                      .filter(c => c.id !== newRelationship.character1Id)
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Relationship Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(RELATIONSHIP_TYPES).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setNewRelationship(prev => ({ ...prev, type: key as RelationshipType }))}
                        className={`
                          flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all
                          ${newRelationship.type === key 
                            ? `border-current ${config.bgColor} ${config.color}` 
                            : 'border-transparent hover:bg-muted'
                          }
                        `}
                      >
                        <Icon className={`h-4 w-4 ${newRelationship.type === key ? config.color : 'text-muted-foreground'}`} />
                        <span className="text-xs">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {(newRelationship.type === 'romantic' || newRelationship.type === 'tension') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Romance Stage</label>
                  <select
                    value={newRelationship.stage || ''}
                    onChange={(e) => setNewRelationship(prev => ({ ...prev, stage: e.target.value as RelationshipStage }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="">Select stage...</option>
                    {RELATIONSHIP_STAGES.map(stage => (
                      <option key={stage} value={stage}>
                        {stage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={newRelationship.description || ''}
                  onChange={(e) => setNewRelationship(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe their dynamic..."
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingRelationship(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddRelationship}
                  disabled={!newRelationship.character1Id || !newRelationship.character2Id}
                >
                  Add Relationship
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Relationship Modal */}
      {editingRelationship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Edit Relationship</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setEditingRelationship(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{getCharacterById(editingRelationship.character1Id)?.name}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="font-medium">{getCharacterById(editingRelationship.character2Id)?.name}</span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Relationship Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(RELATIONSHIP_TYPES).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setEditingRelationship(prev => prev ? { ...prev, type: key as RelationshipType } : null)}
                        className={`
                          flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all
                          ${editingRelationship.type === key 
                            ? `border-current ${config.bgColor} ${config.color}` 
                            : 'border-transparent hover:bg-muted'
                          }
                        `}
                      >
                        <Icon className={`h-4 w-4 ${editingRelationship.type === key ? config.color : 'text-muted-foreground'}`} />
                        <span className="text-xs">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {(editingRelationship.type === 'romantic' || editingRelationship.type === 'tension') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Romance Stage</label>
                  <select
                    value={editingRelationship.stage || ''}
                    onChange={(e) => setEditingRelationship(prev => prev ? { ...prev, stage: e.target.value as RelationshipStage } : null)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="">Select stage...</option>
                    {RELATIONSHIP_STAGES.map(stage => (
                      <option key={stage} value={stage}>
                        {stage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={editingRelationship.description || ''}
                  onChange={(e) => setEditingRelationship(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Describe their dynamic..."
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingRelationship(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateRelationship}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default RelationshipGraph;
