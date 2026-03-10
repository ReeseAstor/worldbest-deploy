'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@ember/ui-components';
import {
  Sparkles, Flame, Mic2, PenTool, MessageSquare, Edit3, FileText, Zap,
  Settings, Play, Clock, CheckCircle, Loader2, Copy, BookOpen, Users,
  Heart, Wand2, Target, TrendingUp, ChevronRight, ChevronDown, Lightbulb,
  Send, X, Check, History, RefreshCw, MoreHorizontal, Feather, Theater,
  Glasses, Brain, Eye, Maximize2, Star, Image, Bot, Cpu, Palette,
  MessageCircle, PlusCircle, Trash2, Download, Share2, Bookmark,
  LayoutGrid, List, Sliders, Volume2, Layers, ArrowRight, Crown,
  Infinity, Gauge, Activity, BarChart3, PieChart, Timer, Coins
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface AIModel {
  id: string;
  name: string;
  provider: 'venice' | 'openai' | 'gemini' | 'anthropic';
  description: string;
  capabilities: string[];
  maxTokens: number;
  costPer1k: number;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'standard' | 'high' | 'premium';
  uncensored?: boolean;
  icon: string;
}

interface ImageModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  sizes: string[];
  styles: string[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  tokens?: number;
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SteamLevel {
  level: number;
  name: string;
  emoji: string;
  description: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  icon: typeof Feather;
  description: string;
  prompts: string[];
}

interface UsageStats {
  wordsGenerated: number;
  wordsLimit: number;
  imagesGenerated: number;
  imagesLimit: number;
  tokensUsed: number;
  tokensLimit: number;
  conversations: number;
  acceptanceRate: number;
}

// ============================================================================
// CONFIGURATION DATA
// ============================================================================

const AI_MODELS: AIModel[] = [
  {
    id: 'claude-opus',
    name: 'Claude Opus 4.6',
    provider: 'anthropic',
    description: 'Best-in-class creative writing with exceptional narrative understanding',
    capabilities: ['Superior Creative Writing', 'Deep Character Understanding', 'Nuanced Dialogue', 'Long-form Content'],
    maxTokens: 200000,
    costPer1k: 0.015,
    speed: 'medium',
    quality: 'premium',
    uncensored: false,
    icon: '👑',
  },
  {
    id: 'claude-sonnet',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    description: 'Balanced performance for everyday writing tasks',
    capabilities: ['Creative Writing', 'Fast Generation', 'Cost Effective'],
    maxTokens: 200000,
    costPer1k: 0.003,
    speed: 'fast',
    quality: 'high',
    uncensored: false,
    icon: '✨',
  },
  {
    id: 'venice-glm',
    name: 'GLM 4.7 Flash Heretic',
    provider: 'venice',
    description: 'Uncensored model optimized for creative romance writing',
    capabilities: ['Creative Writing', 'Romance', 'Uncensored Content', 'Fast Generation'],
    maxTokens: 32000,
    costPer1k: 0.0015,
    speed: 'fast',
    quality: 'high',
    uncensored: true,
    icon: '🔥',
  },
  {
    id: 'openai-gpt4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'OpenAI\'s flagship model for nuanced writing',
    capabilities: ['Nuanced Dialogue', 'Plot Analysis', 'Editing'],
    maxTokens: 128000,
    costPer1k: 0.005,
    speed: 'medium',
    quality: 'premium',
    uncensored: false,
    icon: '🤖',
  },
  {
    id: 'gemini-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'gemini',
    description: 'Google\'s advanced model with long context',
    capabilities: ['Long Context', 'Research', 'Analysis'],
    maxTokens: 1000000,
    costPer1k: 0.00125,
    speed: 'medium',
    quality: 'high',
    uncensored: false,
    icon: '💎',
  },
];

const IMAGE_MODELS: ImageModel[] = [
  {
    id: 'venice-flux',
    name: 'Flux Pro',
    provider: 'Venice AI',
    description: 'High-quality artistic images',
    sizes: ['1024x1024', '1024x1792', '1792x1024'],
    styles: ['Realistic', 'Artistic', 'Fantasy', 'Romantic'],
  },
  {
    id: 'openai-dalle3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    description: 'Photorealistic and creative images',
    sizes: ['1024x1024', '1024x1792', '1792x1024'],
    styles: ['Vivid', 'Natural'],
  },
];

const STEAM_LEVELS: SteamLevel[] = [
  { level: 1, name: 'Closed Door', emoji: '🚪', description: 'Fade to black' },
  { level: 2, name: 'Warm', emoji: '🌸', description: 'Sweet romance' },
  { level: 3, name: 'Steamy', emoji: '🔥', description: 'Sensual scenes' },
  { level: 4, name: 'Spicy', emoji: '🌶️', description: 'Explicit content' },
  { level: 5, name: 'Scorching', emoji: '💋', description: 'No limits' },
];

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'brainstorm',
    name: 'Brainstorm',
    icon: Lightbulb,
    description: 'Generate ideas and concepts',
    prompts: [
      'Generate 10 unique romantasy plot ideas with a [TROPE] trope',
      'Create a detailed character profile for a [ARCHETYPE] love interest',
      'Suggest 5 compelling meet-cute scenarios for my characters',
    ],
  },
  {
    id: 'outline',
    name: 'Outline',
    icon: Layers,
    description: 'Structure your story',
    prompts: [
      'Create a 3-act structure outline for my romantasy novel',
      'Generate chapter breakdowns with key beats',
      'Map the romantic tension arc across the story',
    ],
  },
  {
    id: 'draft',
    name: 'Draft',
    icon: PenTool,
    description: 'Write your manuscript',
    prompts: [
      'Continue this scene maintaining my voice: [CONTEXT]',
      'Write a [STEAM_LEVEL] romantic scene between [CHARACTERS]',
      'Generate dialogue for a confrontation scene',
    ],
  },
  {
    id: 'revise',
    name: 'Revise',
    icon: Edit3,
    description: 'Polish and improve',
    prompts: [
      'Line edit this passage for stronger prose',
      'Transform this "telling" into vivid "showing"',
      'Increase the romantic tension in this scene',
    ],
  },
  {
    id: 'analyze',
    name: 'Analyze',
    icon: Brain,
    description: 'Get feedback',
    prompts: [
      'Analyze the pacing of this chapter',
      'Check character voice consistency',
      'Identify romance tropes and suggest improvements',
    ],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AIStudioPage() {
  // Core state
  const [activeTab, setActiveTab] = useState<'chat' | 'workflow' | 'image'>('chat');
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0]);
  const [selectedImageModel, setSelectedImageModel] = useState<ImageModel>(IMAGE_MODELS[0]);
  const [steamLevel, setSteamLevel] = useState(3);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  // Chat state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  
  // Workflow state
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowStep>(WORKFLOW_STEPS[0]);
  const [workflowContext, setWorkflowContext] = useState('');
  const [workflowOutput, setWorkflowOutput] = useState('');
  
  // Image state
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('Fantasy');
  const [imageSize, setImageSize] = useState('1024x1024');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  
  // UI state
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const { toast } = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Usage stats (initialized empty - will be loaded from user's actual usage)
  const [stats, setStats] = useState<UsageStats>({
    wordsGenerated: 0,
    wordsLimit: 500000,
    imagesGenerated: 0,
    imagesLimit: 100,
    tokensUsed: 0,
    tokensLimit: 10000000,
    conversations: 0,
    acceptanceRate: 0,
  });

  // Load actual usage stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/user/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.log('Stats not available');
      }
    };
    loadStats();
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, streamingContent]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      model: selectedModel.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversation(newConversation);
    setChatInput('');
  }, [selectedModel.id]);

  const handleSendMessage = useCallback(async () => {
    if (!chatInput.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date(),
    };

    let conversation = activeConversation;
    if (!conversation) {
      conversation = {
        id: Date.now().toString(),
        title: chatInput.slice(0, 50) + (chatInput.length > 50 ? '...' : ''),
        messages: [],
        model: selectedModel.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setConversations(prev => [conversation!, ...prev]);
    }

    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, userMessage],
      updatedAt: new Date(),
    };

    setActiveConversation(updatedConversation);
    setConversations(prev =>
      prev.map(c => c.id === updatedConversation.id ? updatedConversation : c)
    );
    setChatInput('');
    setIsGenerating(true);
    setStreamingContent('');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedConversation.messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel.id,
          steamLevel,
          voiceEnabled,
        }),
      });

      if (!response.ok) throw new Error('Chat failed');

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text,
        timestamp: new Date(),
        model: selectedModel.name,
        tokens: data.tokens,
      };

      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage],
        updatedAt: new Date(),
      };

      setActiveConversation(finalConversation);
      setConversations(prev =>
        prev.map(c => c.id === finalConversation.id ? finalConversation : c)
      );

    } catch (error) {
      toast({
        title: 'Generation failed',
        description: 'Could not get AI response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setStreamingContent('');
    }
  }, [chatInput, activeConversation, selectedModel, steamLevel, voiceEnabled, isGenerating, toast]);

  const handleWorkflowGenerate = useCallback(async (prompt: string) => {
    setIsGenerating(true);
    setWorkflowOutput('');

    const fullPrompt = prompt
      .replace('[CONTEXT]', workflowContext)
      .replace('[STEAM_LEVEL]', STEAM_LEVELS[steamLevel - 1].name)
      .replace('[CHARACTERS]', 'the main characters');

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: activeWorkflow.id,
          prompt: fullPrompt + (workflowContext ? `\n\nContext:\n${workflowContext}` : ''),
          steamLevel,
          voiceEnabled,
          model: selectedModel.id,
        }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      setWorkflowOutput(data.text);

      toast({
        title: 'Generation complete',
        description: `Generated ${data.wordCount} words`,
      });
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [activeWorkflow.id, workflowContext, steamLevel, voiceEnabled, selectedModel.id, toast]);

  const handleImageGenerate = useCallback(async () => {
    if (!imagePrompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          model: selectedImageModel.id,
          style: imageStyle,
          size: imageSize,
        }),
      });

      if (!response.ok) throw new Error('Image generation failed');

      const data = await response.json();
      setGeneratedImages(prev => [data.url, ...prev]);

      toast({
        title: 'Image generated',
        description: 'Your image is ready!',
      });
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: 'Could not generate image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [imagePrompt, selectedImageModel.id, imageStyle, imageSize, toast]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderModelSelector = () => (
    <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-popover border rounded-xl shadow-xl z-50 max-h-[400px] overflow-y-auto">
      <div className="space-y-3">
        {AI_MODELS.map(model => (
          <button
            key={model.id}
            onClick={() => {
              setSelectedModel(model);
              setShowModelSelector(false);
            }}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              selectedModel.id === model.id
                ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30'
                : 'border-transparent bg-muted/50 hover:bg-muted'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{model.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{model.name}</span>
                  {model.uncensored && (
                    <Badge className="bg-rose-500 text-white text-[10px]">Uncensored</Badge>
                  )}
                  <Badge variant="outline" className="text-[10px]">
                    {model.provider}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{model.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {model.capabilities.slice(0, 3).map((cap, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">{cap}</Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Gauge className="h-3 w-3" />
                    {model.speed}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {model.quality}
                  </span>
                  <span className="flex items-center gap-1">
                    <Coins className="h-3 w-3" />
                    ${model.costPer1k}/1k
                  </span>
                </div>
              </div>
              {selectedModel.id === model.id && (
                <Check className="h-5 w-5 text-rose-500" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Studio Pro</h1>
              <p className="text-sm text-muted-foreground">Professional writing assistant</p>
            </div>
          </div>

          {/* Usage Stats Mini */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 px-4 py-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                <span className="text-sm">
                  <strong className="tabular-nums">{(stats.tokensUsed / 1000000).toFixed(1)}M</strong>
                  <span className="text-muted-foreground"> / {stats.tokensLimit / 1000000}M tokens</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-purple-500" />
                <span className="text-sm">
                  <strong className="tabular-nums">{stats.imagesGenerated}</strong>
                  <span className="text-muted-foreground"> / {stats.imagesLimit} images</span>
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-4">
          {[
            { id: 'chat', name: 'Chat', icon: MessageCircle },
            { id: 'workflow', name: 'Workflow', icon: Layers },
            { id: 'image', name: 'Images', icon: Image },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
          
          <div className="flex-1" />
          
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-all"
            >
              <span className="text-lg">{selectedModel.icon}</span>
              <span className="font-medium text-sm">{selectedModel.name}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showModelSelector ? 'rotate-180' : ''}`} />
            </button>
            {showModelSelector && renderModelSelector()}
          </div>

          {/* Steam Level Quick Select */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted">
            {STEAM_LEVELS.map(level => (
              <button
                key={level.level}
                onClick={() => setSteamLevel(level.level)}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                  steamLevel === level.level
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'hover:bg-muted-foreground/10'
                }`}
                title={`${level.name}: ${level.description}`}
              >
                {level.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* MAIN CONTENT */}
      {/* ================================================================== */}
      <div className="flex-1 min-h-0 flex gap-4">
        {/* ============================================================== */}
        {/* CHAT TAB */}
        {/* ============================================================== */}
        {activeTab === 'chat' && (
          <>
            {/* Sidebar - Conversations */}
            <div className="w-64 flex-shrink-0 flex flex-col bg-muted/30 rounded-xl border">
              <div className="p-3 border-b">
                <Button onClick={createNewConversation} className="w-full" size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-xs">Start a new chat above</p>
                  </div>
                ) : (
                  conversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConversation(conv)}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        activeConversation?.id === conv.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <p className="font-medium text-sm truncate">{conv.title}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {conv.messages.length} messages
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-background rounded-xl border">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!activeConversation || activeConversation.messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-md">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 flex items-center justify-center mx-auto mb-4">
                        <Bot className="h-8 w-8 text-rose-500" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Start a Conversation</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Ask me to help with your romantasy novel. I can assist with plotting, character development, dialogue, romantic scenes, and more.
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          'Help me write a meet-cute scene',
                          'Create a morally grey love interest',
                          'Generate dialogue with tension',
                        ].map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => setChatInput(suggestion)}
                            className="px-3 py-1.5 rounded-full bg-muted text-sm hover:bg-muted/80 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {activeConversation.messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                          {message.model && (
                            <p className="text-[10px] opacity-50 mt-2">
                              {message.model} • {message.tokens} tokens
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {isGenerating && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center">
                          <Loader2 className="h-4 w-4 text-white animate-spin" />
                        </div>
                        <div className="bg-muted rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating response...
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your message... (Shift+Enter for new line)"
                      className="w-full min-h-[44px] max-h-32 px-4 py-3 pr-12 rounded-xl border bg-background resize-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                      rows={1}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || isGenerating}
                    className="h-auto px-4 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Using {selectedModel.name} • Steam Level {steamLevel} ({STEAM_LEVELS[steamLevel - 1].name})
                </p>
              </div>
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* WORKFLOW TAB */}
        {/* ============================================================== */}
        {activeTab === 'workflow' && (
          <div className="flex-1 grid grid-cols-3 gap-4">
            {/* Workflow Steps */}
            <div className="col-span-1 bg-muted/30 rounded-xl border p-4 space-y-2">
              <h3 className="font-semibold mb-3">Creative Workflow</h3>
              {WORKFLOW_STEPS.map(step => (
                <button
                  key={step.id}
                  onClick={() => setActiveWorkflow(step)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    activeWorkflow.id === step.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <step.icon className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{step.name}</p>
                      <p className="text-xs opacity-70">{step.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Workflow Content */}
            <div className="col-span-2 flex flex-col gap-4">
              {/* Context Input */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <activeWorkflow.icon className="h-4 w-4 text-rose-500" />
                    {activeWorkflow.name}
                  </CardTitle>
                  <CardDescription>{activeWorkflow.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs">Context (paste your content here)</Label>
                    <textarea
                      value={workflowContext}
                      onChange={(e) => setWorkflowContext(e.target.value)}
                      placeholder="Paste your scene, chapter, or describe your situation..."
                      className="w-full min-h-[100px] mt-2 px-4 py-3 rounded-xl border bg-background resize-none"
                    />
                  </div>

                  <div>
                    <Label className="text-xs mb-2 block">Quick Prompts</Label>
                    <div className="space-y-2">
                      {activeWorkflow.prompts.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleWorkflowGenerate(prompt)}
                          disabled={isGenerating}
                          className="w-full p-3 rounded-lg border bg-background hover:bg-muted text-left text-sm transition-all flex items-center gap-2"
                        >
                          <Play className="h-4 w-4 text-rose-500 flex-shrink-0" />
                          {prompt.replace('[CONTEXT]', '...').replace('[STEAM_LEVEL]', STEAM_LEVELS[steamLevel - 1].name).replace('[CHARACTERS]', 'characters')}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Output */}
              {(workflowOutput || isGenerating) && (
                <Card className="flex-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Generated Content</CardTitle>
                      {workflowOutput && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(workflowOutput)}>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isGenerating ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                      </div>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap font-serif leading-relaxed p-4 rounded-xl bg-muted/50">
                          {workflowOutput}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* IMAGE TAB */}
        {/* ============================================================== */}
        {activeTab === 'image' && (
          <div className="flex-1 grid grid-cols-3 gap-4">
            {/* Image Controls */}
            <div className="col-span-1 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Image className="h-4 w-4 text-purple-500" />
                    Image Generation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs">Model</Label>
                    <select
                      value={selectedImageModel.id}
                      onChange={(e) => setSelectedImageModel(IMAGE_MODELS.find(m => m.id === e.target.value) || IMAGE_MODELS[0])}
                      className="w-full h-10 mt-2 px-3 rounded-lg border bg-background"
                    >
                      {IMAGE_MODELS.map(model => (
                        <option key={model.id} value={model.id}>{model.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs">Style</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedImageModel.styles.map(style => (
                        <button
                          key={style}
                          onClick={() => setImageStyle(style)}
                          className={`px-3 py-1.5 rounded-full text-sm ${
                            imageStyle === style
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Size</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedImageModel.sizes.map(size => (
                        <button
                          key={size}
                          onClick={() => setImageSize(size)}
                          className={`px-3 py-1.5 rounded-lg text-xs ${
                            imageSize === size
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Prompt</Label>
                    <textarea
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="Describe your image... e.g., 'A fae prince with silver hair in a moonlit forest'"
                      className="w-full min-h-[100px] mt-2 px-4 py-3 rounded-xl border bg-background resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleImageGenerate}
                    disabled={!imagePrompt.trim() || isGenerating}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    Generate Image
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Generated Images Gallery */}
            <div className="col-span-2 bg-muted/30 rounded-xl border p-4">
              <h3 className="font-semibold mb-4">Generated Images</h3>
              {generatedImages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Image className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-muted-foreground">No images generated yet</p>
                    <p className="text-sm text-muted-foreground">Create character portraits, scene visualizations, and book covers</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {generatedImages.map((url, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-muted relative group">
                      <img src={url} alt={`Generated ${i}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
