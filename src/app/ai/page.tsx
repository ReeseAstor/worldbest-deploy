'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@ember/ui-components';
import {
  Sparkles, Flame, Mic2, PenTool, MessageSquare, Edit3, FileText, Zap,
  Settings, Play, Clock, CheckCircle, Loader2, Copy, RotateCcw, BookOpen,
  Users, Heart, Wand2, Target, TrendingUp, ChevronRight, Lightbulb,
  Send, X, Check, History, RefreshCw, MoreHorizontal, Feather, Theater,
  Glasses, Brain, Eye, ArrowRight, Maximize2, Crown, Bookmark, Star
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface SteamLevel {
  level: number;
  name: string;
  emoji: string;
  description: string;
  examples: string[];
  color: string;
  activeColor: string;
}

interface AITask {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: typeof Sparkles;
  color: string;
  bgColor: string;
  borderColor: string;
  hotkey: string;
  estimatedOutput: string;
  bestFor: string;
}

interface TaskCategory {
  id: string;
  name: string;
  icon: typeof Feather;
  description: string;
  tasks: AITask[];
}

interface Project {
  id: string;
  title: string;
  genre: string;
  wordCount: number;
}

interface Character {
  id: string;
  name: string;
  role: string;
  traits: string[];
}

interface GenerationResult {
  id: string;
  taskId: string;
  taskName: string;
  content: string;
  wordCount: number;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'rejected';
  steamLevel: number;
}

interface UsageStats {
  wordsGenerated: number;
  wordsLimit: number;
  tasksToday: number;
  acceptanceRate: number;
  streak: number;
}

// ============================================================================
// CONFIGURATION DATA
// ============================================================================

const STEAM_LEVELS: SteamLevel[] = [
  {
    level: 1,
    name: 'Closed Door',
    emoji: '🚪',
    description: 'Fade to black. Emotional tension without explicit content.',
    examples: ['Longing glances', 'A tender kiss', 'Hand-holding'],
    color: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600',
    activeColor: 'bg-slate-600 text-white',
  },
  {
    level: 2,
    name: 'Warm',
    emoji: '🌸',
    description: 'Kissing and light touching. Sweet and romantic.',
    examples: ['Passionate kisses', 'Gentle caresses', 'Romantic embraces'],
    color: 'bg-pink-50 dark:bg-pink-950 border-pink-200 dark:border-pink-800',
    activeColor: 'bg-pink-500 text-white',
  },
  {
    level: 3,
    name: 'Steamy',
    emoji: '🔥',
    description: 'Sensual scenes with suggestive content.',
    examples: ['Heated moments', 'Clothing hints', 'Building desire'],
    color: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800',
    activeColor: 'bg-orange-500 text-white',
  },
  {
    level: 4,
    name: 'Spicy',
    emoji: '🌶️',
    description: 'Explicit romantic content with tasteful detail.',
    examples: ['Explicit scenes', 'Detailed intimacy', 'Physical descriptions'],
    color: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
    activeColor: 'bg-red-500 text-white',
  },
  {
    level: 5,
    name: 'Scorching',
    emoji: '💋',
    description: 'Fully explicit. No limits on romantic content.',
    examples: ['Uninhibited passion', 'Full explicitness', 'Raw desire'],
    color: 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800',
    activeColor: 'bg-rose-600 text-white',
  },
];

const TASK_CATEGORIES: TaskCategory[] = [
  {
    id: 'creation',
    name: 'Creation',
    icon: Feather,
    description: 'Generate new content',
    tasks: [
      {
        id: 'creative-drafting',
        name: 'Continue Draft',
        shortName: 'Draft',
        description: 'Continue your manuscript maintaining voice and style',
        icon: PenTool,
        color: 'text-rose-500',
        bgColor: 'bg-rose-500/10',
        borderColor: 'border-rose-500/30',
        hotkey: 'D',
        estimatedOutput: '300-500 words',
        bestFor: 'Pushing through writer\'s block, maintaining momentum',
      },
      {
        id: 'steam-scene',
        name: 'Romance Scene',
        shortName: 'Steam',
        description: 'Generate intimate scenes at your calibrated heat level',
        icon: Flame,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        hotkey: 'S',
        estimatedOutput: '400-800 words',
        bestFor: 'Steam scenes, intimate moments, romantic tension',
      },
      {
        id: 'dialogue',
        name: 'Dialogue',
        shortName: 'Talk',
        description: 'Character-specific dialogue with distinct voices',
        icon: MessageSquare,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        hotkey: 'T',
        estimatedOutput: '200-400 words',
        bestFor: 'Banter, confessions, confrontations, witty exchanges',
      },
      {
        id: 'scene-setting',
        name: 'Scene Setting',
        shortName: 'Scene',
        description: 'Rich atmospheric descriptions and world-building',
        icon: Theater,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30',
        hotkey: 'W',
        estimatedOutput: '200-400 words',
        bestFor: 'Setting the mood, describing locations, atmosphere',
      },
    ],
  },
  {
    id: 'refinement',
    name: 'Refinement',
    icon: Glasses,
    description: 'Polish and improve',
    tasks: [
      {
        id: 'line-editing',
        name: 'Line Edit',
        shortName: 'Polish',
        description: 'Enhance prose while preserving your unique voice',
        icon: Edit3,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
        hotkey: 'E',
        estimatedOutput: 'Same length',
        bestFor: 'Tightening prose, stronger verbs, varied sentences',
      },
      {
        id: 'show-dont-tell',
        name: 'Show Don\'t Tell',
        shortName: 'Show',
        description: 'Transform telling into vivid showing',
        icon: Eye,
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/30',
        hotkey: 'H',
        estimatedOutput: '+50-100%',
        bestFor: 'Emotional beats, character reactions, sensory details',
      },
      {
        id: 'tension-boost',
        name: 'Tension Boost',
        shortName: 'Tension',
        description: 'Amplify romantic or dramatic tension',
        icon: Zap,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        hotkey: 'B',
        estimatedOutput: '+20-50%',
        bestFor: 'Slow burns, conflict scenes, will-they-won\'t-they',
      },
    ],
  },
  {
    id: 'analysis',
    name: 'Analysis',
    icon: Brain,
    description: 'Feedback and insights',
    tasks: [
      {
        id: 'developmental-edit',
        name: 'Dev Edit',
        shortName: 'Analysis',
        description: 'Structural feedback on pacing, arcs, and flow',
        icon: FileText,
        color: 'text-violet-500',
        bgColor: 'bg-violet-500/10',
        borderColor: 'border-violet-500/30',
        hotkey: 'A',
        estimatedOutput: 'Feedback',
        bestFor: 'Chapter reviews, arc analysis, pacing check',
      },
      {
        id: 'voice-check',
        name: 'Voice Check',
        shortName: 'Voice',
        description: 'Ensure character voices remain distinct',
        icon: Mic2,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10',
        borderColor: 'border-indigo-500/30',
        hotkey: 'V',
        estimatedOutput: 'Feedback',
        bestFor: 'Dialogue authenticity, POV consistency',
      },
      {
        id: 'trope-analysis',
        name: 'Trope Check',
        shortName: 'Tropes',
        description: 'Identify and enhance romance tropes',
        icon: Heart,
        color: 'text-pink-500',
        bgColor: 'bg-pink-500/10',
        borderColor: 'border-pink-500/30',
        hotkey: 'R',
        estimatedOutput: 'Feedback',
        bestFor: 'Trope execution, reader expectations, genre beats',
      },
    ],
  },
];

const SAMPLE_PROJECTS: Project[] = [
  { id: '1', title: 'Shadows of the Fae Court', genre: 'Fae Romance', wordCount: 45000 },
  { id: '2', title: 'Blood & Thorns', genre: 'Dark Romance', wordCount: 32000 },
  { id: '3', title: 'The Dragon\'s Bride', genre: 'Fantasy Romance', wordCount: 18500 },
];

const SAMPLE_CHARACTERS: Character[] = [
  { id: '1', name: 'Elena Ravencrest', role: 'Protagonist', traits: ['determined', 'magical', 'guarded'] },
  { id: '2', name: 'Lord Kael Shadowmere', role: 'Love Interest', traits: ['mysterious', 'powerful', 'protective'] },
  { id: '3', name: 'Princess Lyra', role: 'Rival', traits: ['ambitious', 'cunning', 'secretly kind'] },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AIStudioPage() {
  // State management
  const [selectedCategory, setSelectedCategory] = useState<string>('creation');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [steamLevel, setSteamLevel] = useState(3);
  const [showSteamDetails, setShowSteamDetails] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project>(SAMPLE_PROJECTS[0]);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>(['1', '2']);
  const [customContext, setCustomContext] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generationHistory, setGenerationHistory] = useState<GenerationResult[]>([]);
  const [activeGeneration, setActiveGeneration] = useState<GenerationResult | null>(null);
  const [expandedView, setExpandedView] = useState(false);
  const [wordTarget, setWordTarget] = useState(500);
  
  const { toast } = useToast();
  const outputRef = useRef<HTMLDivElement>(null);

  // Usage statistics (would come from API in production)
  const stats: UsageStats = {
    wordsGenerated: 45230,
    wordsLimit: 150000,
    tasksToday: 12,
    acceptanceRate: 82,
    streak: 7,
  };

  const usagePercent = (stats.wordsGenerated / stats.wordsLimit) * 100;
  const wordsRemaining = stats.wordsLimit - stats.wordsGenerated;

  // Get all tasks flattened and find current selections
  const allTasks = TASK_CATEGORIES.flatMap(cat => cat.tasks);
  const currentTask = allTasks.find(t => t.id === selectedTask);
  const currentCategory = TASK_CATEGORIES.find(cat => cat.id === selectedCategory);
  const currentSteamConfig = STEAM_LEVELS[steamLevel - 1];

  // ============================================================================
  // GENERATION HANDLER
  // ============================================================================

  const handleGenerate = useCallback(async () => {
    if (!selectedTask) {
      toast({
        title: 'Select a task',
        description: 'Please choose an AI task before generating.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setActiveGeneration(null);

    const taskConfig = allTasks.find(t => t.id === selectedTask);
    const selectedChars = SAMPLE_CHARACTERS.filter(c => selectedCharacters.includes(c.id));
    const steamConfig = STEAM_LEVELS[steamLevel - 1];

    // Build comprehensive context
    const contextParts = [
      `Project: ${selectedProject.title} (${selectedProject.genre})`,
      selectedChars.length > 0 ? `Characters: ${selectedChars.map(c => `${c.name} (${c.role})`).join(', ')}` : '',
      customContext ? `Scene Context: ${customContext}` : '',
      `Steam Level: ${steamLevel} - ${steamConfig.name} (${steamConfig.description})`,
      voiceEnabled ? 'Match the author\'s established voice and style.' : '',
      `Target length: approximately ${wordTarget} words`,
      customPrompt ? `\nSpecific request: ${customPrompt}` : '',
    ].filter(Boolean).join('\n');

    // Task-specific prompts
    const taskPrompts: Record<string, string> = {
      'creative-drafting': `Continue this romantasy manuscript with vivid description and emotional depth.\n\n${contextParts}`,
      'steam-scene': `Write an intimate romantic scene. ${steamConfig.description}\n\n${contextParts}`,
      'dialogue': `Generate compelling romantic dialogue with distinct character voices, tension, and subtext.\n\n${contextParts}`,
      'scene-setting': `Write rich atmospheric scene-setting with sensory details and mood.\n\n${contextParts}`,
      'line-editing': `Polish and enhance this prose while preserving voice. Focus on: sentence variety, stronger verbs, sensory details, tighter writing.\n\n${contextParts}`,
      'show-dont-tell': `Transform telling into vivid showing. Add emotional beats, physical reactions, and sensory details.\n\n${contextParts}`,
      'tension-boost': `Amplify the romantic/dramatic tension. Add subtext, longing, conflict, and anticipation.\n\n${contextParts}`,
      'developmental-edit': `Provide developmental feedback on: pacing, character arcs, romantic tension, plot structure, and reader engagement.\n\n${contextParts}`,
      'voice-check': `Analyze character voice consistency and authenticity. Check: dialogue patterns, internal monologue, POV depth.\n\n${contextParts}`,
      'trope-analysis': `Identify romance tropes and analyze their execution. Suggest enhancements for reader satisfaction.\n\n${contextParts}`,
    };

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: selectedTask,
          prompt: taskPrompts[selectedTask] || taskPrompts['creative-drafting'],
          steamLevel,
          voiceEnabled,
          wordTarget,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'AI generation failed');
      }

      const data = await response.json();
      
      const result: GenerationResult = {
        id: Date.now().toString(),
        taskId: selectedTask,
        taskName: taskConfig?.name || 'Unknown',
        content: data.text,
        wordCount: data.wordCount || data.text.split(/\s+/).filter(Boolean).length,
        timestamp: new Date(),
        status: 'pending',
        steamLevel,
      };

      setActiveGeneration(result);
      setGenerationHistory(prev => [result, ...prev.slice(0, 19)]);

      toast({
        title: 'Generation complete',
        description: `Generated ${result.wordCount} words for ${taskConfig?.name}`,
      });

      // Scroll to output
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: 'Generation failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTask, selectedProject, selectedCharacters, customContext, customPrompt, steamLevel, voiceEnabled, wordTarget, allTasks, toast]);

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

  const handleAccept = useCallback((result: GenerationResult) => {
    setGenerationHistory(prev =>
      prev.map(r => r.id === result.id ? { ...r, status: 'accepted' as const } : r)
    );
    if (activeGeneration?.id === result.id) {
      setActiveGeneration({ ...result, status: 'accepted' });
    }
    navigator.clipboard.writeText(result.content);
    toast({
      title: 'Copied to clipboard',
      description: 'Content accepted and copied. Paste into your editor.',
    });
  }, [activeGeneration, toast]);

  const handleReject = useCallback((result: GenerationResult) => {
    setGenerationHistory(prev =>
      prev.map(r => r.id === result.id ? { ...r, status: 'rejected' as const } : r)
    );
    if (activeGeneration?.id === result.id) {
      setActiveGeneration({ ...result, status: 'rejected' });
    }
    toast({
      title: 'Content rejected',
      description: 'Try regenerating with different settings.',
    });
  }, [activeGeneration, toast]);

  const handleCopyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Content copied to clipboard.',
    });
  }, [toast]);

  const toggleCharacter = useCallback((charId: string) => {
    setSelectedCharacters(prev =>
      prev.includes(charId)
        ? prev.filter(id => id !== charId)
        : [...prev, charId]
    );
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6 pb-8">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/25">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Studio</h1>
            <p className="text-muted-foreground">
              Genre-tuned AI tools for romantasy authors
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/20">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">{stats.streak} day streak</span>
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
          </div>
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* ================================================================== */}
      {/* USAGE DASHBOARD */}
      {/* ================================================================== */}
      <Card className="bg-gradient-to-br from-rose-50 via-white to-amber-50 dark:from-rose-950/50 dark:via-background dark:to-amber-950/50 border-rose-200/50 dark:border-rose-800/30 overflow-hidden">
        <CardContent className="p-6 relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-500/5 to-amber-500/5 rounded-full blur-3xl" />
          
          <div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Words Usage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Monthly Words</span>
                <Badge variant="secondary" className="text-xs font-mono">
                  {wordsRemaining.toLocaleString()} left
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold tabular-nums">{stats.wordsGenerated.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">/ {stats.wordsLimit.toLocaleString()}</span>
                </div>
                <div className="h-3 bg-white/80 dark:bg-black/20 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-amber-500' : 'bg-gradient-to-r from-rose-500 to-amber-500'
                    }`}
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tasks Today */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Tasks Today</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tabular-nums">{stats.tasksToday}</span>
                <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +3
                </span>
              </div>
              <div className="flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <div 
                    key={i}
                    className={`h-8 flex-1 rounded-sm transition-colors ${
                      i < 5 ? 'bg-gradient-to-t from-rose-500 to-rose-400' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Acceptance Rate */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Acceptance Rate</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tabular-nums">{stats.acceptanceRate}%</span>
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-xs text-muted-foreground">
                Based on your last 50 generations
              </p>
            </div>

            {/* Active Settings */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Active Settings</span>
              <div className="flex flex-wrap gap-2">
                <Badge className={`${currentSteamConfig.activeColor} border-0 shadow-sm`}>
                  {currentSteamConfig.emoji} {currentSteamConfig.name}
                </Badge>
                {voiceEnabled && (
                  <Badge variant="secondary" className="shadow-sm">
                    <Mic2 className="h-3 w-3 mr-1" />
                    Voice Match
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                Project: {selectedProject.title}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================== */}
      {/* MAIN CONTENT GRID */}
      {/* ================================================================== */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ================================================================ */}
        {/* LEFT PANEL - TASK SELECTION */}
        {/* ================================================================ */}
        <div className="lg:col-span-1 space-y-4">
          {/* Task Category Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-rose-500" />
                Select Task
              </CardTitle>
              <CardDescription>Choose what you want the AI to do</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category Pills */}
              <div className="flex gap-2">
                {TASK_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSelectedTask(null);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <category.icon className="h-3.5 w-3.5" />
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Task List */}
              <div className="space-y-2">
                {currentCategory?.tasks.map(task => {
                  const isSelected = selectedTask === task.id;
                  return (
                    <button
                      key={task.id}
                      onClick={() => setSelectedTask(isSelected ? null : task.id)}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? `${task.bgColor} ${task.borderColor}`
                          : 'border-transparent bg-muted/50 hover:bg-muted hover:border-muted'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${task.bgColor}`}>
                          <task.icon className={`h-4 w-4 ${task.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{task.name}</span>
                            <kbd className="hidden sm:inline-flex h-5 px-1.5 items-center rounded border bg-background/50 text-[10px] font-mono text-muted-foreground">
                              {task.hotkey}
                            </kbd>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {task.description}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className={`h-4 w-4 ${task.color} flex-shrink-0`} />
                        )}
                      </div>
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-current/10 space-y-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Target className="h-3 w-3" />
                            <span>~{task.estimatedOutput}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            <span className="font-medium">Best for:</span> {task.bestFor}
                          </p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Steam Level Control */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Flame className="h-4 w-4 text-red-500" />
                  Steam Level
                </CardTitle>
                <button
                  onClick={() => setShowSteamDetails(!showSteamDetails)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  {showSteamDetails ? 'Less' : 'More'}
                  <ChevronRight className={`h-3 w-3 transition-transform ${showSteamDetails ? 'rotate-90' : ''}`} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Steam Level Selector */}
              <div className="flex gap-1.5">
                {STEAM_LEVELS.map((level) => (
                  <button
                    key={level.level}
                    onClick={() => setSteamLevel(level.level)}
                    className={`flex-1 py-3 rounded-lg text-center transition-all ${
                      steamLevel === level.level
                        ? `${level.activeColor} shadow-md`
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <div className="text-lg">{level.emoji}</div>
                    <div className="text-[10px] font-medium mt-0.5">{level.level}</div>
                  </button>
                ))}
              </div>

              {/* Current Level Info */}
              <div className={`p-4 rounded-xl border-2 ${currentSteamConfig.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{currentSteamConfig.emoji}</span>
                  <span className="font-semibold">{currentSteamConfig.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentSteamConfig.description}
                </p>
                {showSteamDetails && (
                  <div className="mt-3 pt-3 border-t border-current/10">
                    <p className="text-xs font-medium mb-2 text-muted-foreground">Examples:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentSteamConfig.examples.map((ex, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {ex}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Voice Matching Toggle */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl transition-colors ${voiceEnabled ? 'bg-violet-100 dark:bg-violet-900/50' : 'bg-muted'}`}>
                    <Mic2 className={`h-5 w-5 transition-colors ${voiceEnabled ? 'text-violet-500' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Voice Matching</p>
                    <p className="text-xs text-muted-foreground">
                      {voiceEnabled ? 'AI matches your writing style' : 'Using default style'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    voiceEnabled ? 'bg-violet-500' : 'bg-muted'
                  }`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ================================================================ */}
        {/* RIGHT PANEL - CONTEXT & GENERATION */}
        {/* ================================================================ */}
        <div className="lg:col-span-2 space-y-4">
          {/* Context Configuration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-500" />
                Context & Input
              </CardTitle>
              <CardDescription>Provide context for better generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Project & Word Target */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Project</Label>
                  <select
                    value={selectedProject.id}
                    onChange={(e) => {
                      const project = SAMPLE_PROJECTS.find(p => p.id === e.target.value);
                      if (project) setSelectedProject(project);
                    }}
                    className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                  >
                    {SAMPLE_PROJECTS.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.title} ({project.genre})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Word Target</Label>
                  <div className="flex gap-2">
                    {[300, 500, 800, 1000].map(target => (
                      <button
                        key={target}
                        onClick={() => setWordTarget(target)}
                        className={`flex-1 h-10 rounded-lg text-sm font-medium transition-all ${
                          wordTarget === target
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {target}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Character Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Characters in Scene</Label>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_CHARACTERS.map(char => {
                    const isSelected = selectedCharacters.includes(char.id);
                    return (
                      <button
                        key={char.id}
                        onClick={() => toggleCharacter(char.id)}
                        className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span>{char.name}</span>
                        <Badge variant={isSelected ? "secondary" : "outline"} className="text-[10px] ml-1">
                          {char.role}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scene Context */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Scene Context (Optional)</Label>
                <textarea
                  value={customContext}
                  onChange={(e) => setCustomContext(e.target.value)}
                  placeholder="Paste your current scene text here for context, or describe the situation..."
                  className="w-full min-h-[100px] px-4 py-3 rounded-lg border bg-background text-sm resize-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                />
              </div>

              {/* Custom Instructions */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Specific Instructions (Optional)</Label>
                <Input
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g., Include a witty comeback, make it more angsty, focus on the tension..."
                  className="h-10"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!selectedTask || isGenerating}
                className="w-full h-12 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-rose-500/25 transition-all"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate {currentTask?.shortName || 'Content'}
                  </>
                )}
              </Button>

              {/* Pro Tip */}
              {!activeGeneration && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200">
                  <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-xs">
                    <strong>Pro tip:</strong> The more context you provide, the better the AI can match your story's tone and style.
                    Include recent paragraphs for best results.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ================================================================ */}
          {/* OUTPUT AREA */}
          {/* ================================================================ */}
          <div ref={outputRef}>
            {activeGeneration ? (
              <Card className="border-2 border-rose-200 dark:border-rose-800 shadow-lg shadow-rose-500/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-md">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Generated Content</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          {activeGeneration.taskName} • {activeGeneration.wordCount} words • Steam {activeGeneration.steamLevel}
                          {activeGeneration.status === 'accepted' && (
                            <Badge className="bg-emerald-500 text-white text-[10px]">Accepted</Badge>
                          )}
                          {activeGeneration.status === 'rejected' && (
                            <Badge variant="destructive" className="text-[10px]">Rejected</Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setExpandedView(!expandedView)}
                      className="h-8 w-8"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Generated Text */}
                  <div className={`relative rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border ${expandedView ? 'min-h-[400px]' : 'max-h-[300px]'} overflow-y-auto`}>
                    <div className="p-5">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap font-serif text-base leading-relaxed">
                          {activeGeneration.content}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleAccept(activeGeneration)}
                      className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 shadow-md"
                      disabled={activeGeneration.status === 'accepted'}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Accept & Copy
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                      Regenerate
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleReject(activeGeneration)}
                      disabled={activeGeneration.status === 'rejected'}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyToClipboard(activeGeneration.content)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Tips */}
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200 text-xs">
                    <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                      <strong>Pro tip:</strong> Use "Regenerate" with different custom instructions to get variations. 
                      The AI learns from your acceptance patterns to improve future generations.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-2">
                <CardContent className="py-16">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-100 to-amber-100 dark:from-rose-900/30 dark:to-amber-900/30 flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-rose-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Ready to Generate</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
                        Select a task, configure your settings, and click Generate to create content tailored to your romantasy novel.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
                      <span className="flex items-center gap-1.5">
                        <kbd className="px-2 py-1 rounded border bg-muted text-[10px] font-mono">D</kbd>
                        Draft
                      </span>
                      <span className="flex items-center gap-1.5">
                        <kbd className="px-2 py-1 rounded border bg-muted text-[10px] font-mono">S</kbd>
                        Steam
                      </span>
                      <span className="flex items-center gap-1.5">
                        <kbd className="px-2 py-1 rounded border bg-muted text-[10px] font-mono">T</kbd>
                        Dialogue
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ================================================================ */}
          {/* GENERATION HISTORY */}
          {/* ================================================================ */}
          {generationHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Recent Generations
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs h-8">
                    View All
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {generationHistory.slice(0, 5).map((item) => (
                    <button
                      key={item.id}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                      onClick={() => setActiveGeneration(item)}
                    >
                      <div className="flex items-center gap-3">
                        {item.status === 'accepted' && (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        )}
                        {item.status === 'rejected' && (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        {item.status === 'pending' && (
                          <Clock className="h-4 w-4 text-amber-500" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{item.taskName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleTimeString()} • Steam {item.steamLevel}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium tabular-nums">{item.wordCount} words</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {item.status}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
