'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardHeader, CardTitle } from '@ember/ui-components';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Swords,
  Sparkles,
  Star,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  GripVertical,
  BookOpen,
  Target,
  Flame
} from 'lucide-react';

/** Beat types for romance structure */
type BeatType = 
  | 'setup'
  | 'meet-cute'
  | 'first-spark'
  | 'resistance'
  | 'deepening'
  | 'first-kiss'
  | 'false-victory'
  | 'black-moment'
  | 'grand-gesture'
  | 'hea'
  | 'custom';

interface Beat {
  id: string;
  name: string;
  type: BeatType;
  description: string;
  targetWordCount?: number;
  actualWordCount?: number;
  chapter?: string;
  scene?: string;
  emotionalGoal?: string;
  steamLevel?: 1 | 2 | 3 | 4 | 5;
  status: 'pending' | 'drafting' | 'complete';
  notes?: string;
  order: number;
}

interface BeatTemplate {
  id: string;
  name: string;
  description: string;
  beats: Omit<Beat, 'id' | 'status' | 'actualWordCount'>[];
}

interface BeatBoardProps {
  projectId: string;
  beats: Beat[];
  onAddBeat: (beat: Omit<Beat, 'id'>) => void;
  onUpdateBeat: (id: string, updates: Partial<Beat>) => void;
  onDeleteBeat: (id: string) => void;
  onReorderBeats: (beats: Beat[]) => void;
  totalWordTarget?: number;
}

// Beat type styling
const BEAT_TYPE_CONFIG: Record<BeatType, { label: string; icon: any; color: string; bgColor: string }> = {
  'setup': { label: 'Setup', icon: BookOpen, color: 'text-slate-500', bgColor: 'bg-slate-100 dark:bg-slate-900' },
  'meet-cute': { label: 'Meet Cute', icon: Sparkles, color: 'text-pink-500', bgColor: 'bg-pink-100 dark:bg-pink-900' },
  'first-spark': { label: 'First Spark', icon: Star, color: 'text-amber-500', bgColor: 'bg-amber-100 dark:bg-amber-900' },
  'resistance': { label: 'Resistance', icon: Swords, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900' },
  'deepening': { label: 'Deepening', icon: Heart, color: 'text-rose-500', bgColor: 'bg-rose-100 dark:bg-rose-900' },
  'first-kiss': { label: 'First Kiss', icon: Heart, color: 'text-rose-600', bgColor: 'bg-rose-100 dark:bg-rose-900' },
  'false-victory': { label: 'False Victory', icon: Star, color: 'text-emerald-500', bgColor: 'bg-emerald-100 dark:bg-emerald-900' },
  'black-moment': { label: 'Black Moment', icon: Swords, color: 'text-slate-700', bgColor: 'bg-slate-200 dark:bg-slate-800' },
  'grand-gesture': { label: 'Grand Gesture', icon: Sparkles, color: 'text-violet-500', bgColor: 'bg-violet-100 dark:bg-violet-900' },
  'hea': { label: 'HEA', icon: Heart, color: 'text-rose-500', bgColor: 'bg-rose-100 dark:bg-rose-900' },
  'custom': { label: 'Custom', icon: Target, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900' },
};

// Pre-built templates
const TEMPLATES: BeatTemplate[] = [
  {
    id: 'romancing-the-beat',
    name: 'Romancing the Beat',
    description: 'Gwen Hayes 16-beat romance structure',
    beats: [
      { name: 'Setup', type: 'setup', description: 'Establish the protagonist in their ordinary world', order: 1, targetWordCount: 5000 },
      { name: 'Meet Cute', type: 'meet-cute', description: 'The first meeting between the romantic leads', order: 2, targetWordCount: 3000 },
      { name: 'No Way', type: 'resistance', description: 'Why this romance can never work', order: 3, targetWordCount: 5000 },
      { name: 'Deepening Desire', type: 'deepening', description: 'Growing attraction despite resistance', order: 4, targetWordCount: 8000 },
      { name: 'First Kiss', type: 'first-kiss', description: 'Physical intimacy milestone', order: 5, targetWordCount: 3000, steamLevel: 2 },
      { name: 'Inkling', type: 'first-spark', description: 'Emotional realization begins', order: 6, targetWordCount: 5000 },
      { name: 'Midpoint', type: 'false-victory', description: 'Relationship seems to be working', order: 7, targetWordCount: 8000, steamLevel: 3 },
      { name: 'Crisis', type: 'resistance', description: 'External or internal conflict threatens', order: 8, targetWordCount: 5000 },
      { name: 'Black Moment', type: 'black-moment', description: 'All seems lost for the relationship', order: 9, targetWordCount: 5000 },
      { name: 'Grand Gesture', type: 'grand-gesture', description: 'One lead makes a bold move', order: 10, targetWordCount: 3000 },
      { name: 'HEA/HFN', type: 'hea', description: 'Happy ending or happy for now', order: 11, targetWordCount: 5000 },
    ],
  },
  {
    id: 'dark-romance',
    name: 'Dark Romance Arc',
    description: 'Structure for morally gray or villain romances',
    beats: [
      { name: 'World of Shadows', type: 'setup', description: 'Establish the dark setting and stakes', order: 1, targetWordCount: 5000 },
      { name: 'Collision', type: 'meet-cute', description: 'Dangerous first encounter', order: 2, targetWordCount: 4000 },
      { name: 'Captivity/Proximity', type: 'resistance', description: 'Forced closeness', order: 3, targetWordCount: 8000, steamLevel: 2 },
      { name: 'Crack in the Armor', type: 'first-spark', description: 'Villain shows vulnerability', order: 4, targetWordCount: 6000 },
      { name: 'Dark Desire', type: 'deepening', description: 'Attraction despite everything', order: 5, targetWordCount: 8000, steamLevel: 4 },
      { name: 'Betrayal/Choice', type: 'black-moment', description: 'Trust is shattered', order: 6, targetWordCount: 5000 },
      { name: 'Burn It Down', type: 'grand-gesture', description: 'Destroy everything for love', order: 7, targetWordCount: 4000 },
      { name: 'Dark HEA', type: 'hea', description: 'Morally gray happy ending', order: 8, targetWordCount: 5000, steamLevel: 5 },
    ],
  },
];

export function BeatBoard({
  projectId,
  beats,
  onAddBeat,
  onUpdateBeat,
  onDeleteBeat,
  onReorderBeats,
  totalWordTarget = 80000,
}: BeatBoardProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBeat, setNewBeat] = useState<Partial<Beat>>({
    type: 'custom',
    status: 'pending',
  });
  const [expandedBeatId, setExpandedBeatId] = useState<string | null>(null);

  // Calculate progress
  const totalActualWords = useMemo(() => 
    beats.reduce((sum, b) => sum + (b.actualWordCount || 0), 0), 
    [beats]
  );
  const completedBeats = useMemo(() => 
    beats.filter(b => b.status === 'complete').length, 
    [beats]
  );
  const progressPercent = (totalActualWords / totalWordTarget) * 100;

  const handleApplyTemplate = (template: BeatTemplate) => {
    template.beats.forEach((beat, index) => {
      onAddBeat({
        ...beat,
        status: 'pending',
        order: index + 1,
      });
    });
    setSelectedTemplate(null);
  };

  const handleAddBeat = () => {
    if (newBeat.name && newBeat.type) {
      onAddBeat({
        name: newBeat.name,
        type: newBeat.type,
        description: newBeat.description || '',
        targetWordCount: newBeat.targetWordCount,
        emotionalGoal: newBeat.emotionalGoal,
        steamLevel: newBeat.steamLevel,
        status: 'pending',
        order: beats.length + 1,
      });
      setNewBeat({ type: 'custom', status: 'pending' });
      setShowAddModal(false);
    }
  };

  const BeatCard = ({ beat }: { beat: Beat }) => {
    const config = BEAT_TYPE_CONFIG[beat.type];
    const Icon = config.icon;
    const isExpanded = expandedBeatId === beat.id;
    const wordProgress = beat.targetWordCount 
      ? ((beat.actualWordCount || 0) / beat.targetWordCount) * 100 
      : 0;

    return (
      <Card className={`
        transition-all
        ${beat.status === 'complete' ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30' : ''}
        ${beat.status === 'drafting' ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/30' : ''}
      `}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="cursor-grab opacity-50 hover:opacity-100">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className={`p-1.5 rounded ${config.bgColor}`}>
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>
              <div>
                <h4 className="font-medium text-sm">{beat.name}</h4>
                <span className="text-xs text-muted-foreground">{config.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {beat.steamLevel && (
                <Badge variant="outline" className={`
                  text-xs px-1.5 py-0
                  ${beat.steamLevel >= 4 ? 'text-red-500 border-red-300' : ''}
                  ${beat.steamLevel === 3 ? 'text-rose-500 border-rose-300' : ''}
                  ${beat.steamLevel <= 2 ? 'text-pink-500 border-pink-300' : ''}
                `}>
                  <Flame className="h-3 w-3 mr-0.5" />
                  {beat.steamLevel}
                </Badge>
              )}
              <Badge 
                variant={beat.status === 'complete' ? 'default' : 'secondary'}
                className={`text-xs ${beat.status === 'complete' ? 'bg-emerald-500' : ''}`}
              >
                {beat.status}
              </Badge>
            </div>
          </div>

          {/* Word Progress */}
          {beat.targetWordCount && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{(beat.actualWordCount || 0).toLocaleString()} words</span>
                <span>{beat.targetWordCount.toLocaleString()} target</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    wordProgress >= 100 ? 'bg-emerald-500' : 'bg-rose-400'
                  }`}
                  style={{ width: `${Math.min(wordProgress, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Expandable Details */}
          <button
            onClick={() => setExpandedBeatId(isExpanded ? null : beat.id)}
            className="w-full mt-3 pt-2 border-t border-border/50 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <>Less <ChevronUp className="h-3 w-3" /></>
            ) : (
              <>More <ChevronDown className="h-3 w-3" /></>
            )}
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-3 text-sm">
              <p className="text-muted-foreground">{beat.description}</p>
              
              {beat.emotionalGoal && (
                <div>
                  <span className="text-xs font-medium">Emotional Goal:</span>
                  <p className="text-muted-foreground text-xs">{beat.emotionalGoal}</p>
                </div>
              )}

              {beat.chapter && (
                <div className="flex items-center gap-2 text-xs">
                  <BookOpen className="h-3 w-3" />
                  <span>Chapter {beat.chapter}</span>
                  {beat.scene && <span className="text-muted-foreground">Scene {beat.scene}</span>}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setEditingBeat(beat)}
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => onDeleteBeat(beat.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
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
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-rose-500" />
            Beat Sheet
          </h2>
          <p className="text-sm text-muted-foreground">
            Structure your romance arc with proven beat templates
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSelectedTemplate('select')}>
            <BookOpen className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Beat
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-br from-rose-50 to-amber-50 dark:from-rose-950 dark:to-amber-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Overall Progress</h3>
              <p className="text-sm text-muted-foreground">
                {completedBeats} of {beats.length} beats complete
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{totalActualWords.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">of {totalWordTarget.toLocaleString()} words</p>
            </div>
          </div>
          <div className="h-3 bg-white/50 dark:bg-black/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Beat List */}
      {beats.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {beats.sort((a, b) => a.order - b.order).map(beat => (
            <BeatCard key={beat.id} beat={beat} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-2">No beats yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start with a template or add beats manually
            </p>
            <Button onClick={() => setSelectedTemplate('select')}>
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Templates
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Template Selection Modal */}
      {selectedTemplate === 'select' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Choose a Beat Sheet Template</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setSelectedTemplate(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {TEMPLATES.map(template => (
                <Card 
                  key={template.id} 
                  className="cursor-pointer hover:border-rose-300 transition-colors"
                  onClick={() => handleApplyTemplate(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant="secondary">{template.beats.length} beats</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.beats.slice(0, 5).map((beat, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {beat.name}
                        </Badge>
                      ))}
                      {template.beats.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.beats.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Beat Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Add Beat</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Beat Name</label>
                <input
                  value={newBeat.name || ''}
                  onChange={(e) => setNewBeat(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., First Conflict"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Beat Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(BEAT_TYPE_CONFIG).slice(0, 9).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setNewBeat(prev => ({ ...prev, type: key as BeatType }))}
                        className={`
                          flex flex-col items-center gap-1 p-2 rounded-lg border transition-all text-xs
                          ${newBeat.type === key 
                            ? `border-rose-500 ${config.bgColor}` 
                            : 'border-transparent hover:bg-muted'
                          }
                        `}
                      >
                        <Icon className={`h-4 w-4 ${newBeat.type === key ? config.color : 'text-muted-foreground'}`} />
                        <span className="truncate w-full text-center">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={newBeat.description || ''}
                  onChange={(e) => setNewBeat(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What happens in this beat..."
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Words</label>
                  <input
                    type="number"
                    value={newBeat.targetWordCount || ''}
                    onChange={(e) => setNewBeat(prev => ({ ...prev, targetWordCount: parseInt(e.target.value) || undefined }))}
                    placeholder="5000"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Steam Level</label>
                  <select
                    value={newBeat.steamLevel || ''}
                    onChange={(e) => setNewBeat(prev => ({ ...prev, steamLevel: parseInt(e.target.value) as Beat['steamLevel'] || undefined }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="">None</option>
                    <option value="1">1 - Closed Door</option>
                    <option value="2">2 - Warm</option>
                    <option value="3">3 - Steamy</option>
                    <option value="4">4 - Spicy</option>
                    <option value="5">5 - Scorching</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBeat} disabled={!newBeat.name}>
                  Add Beat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default BeatBoard;
