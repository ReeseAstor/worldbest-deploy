'use client';

import { useState, useEffect } from 'react';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { Badge } from '@/components/ui/badge';
import {
  Mic2,
  FileText,
  Sparkles,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  MessageSquare,
  Type,
  Quote,
  Palette,
  Eye
} from 'lucide-react';

/** Voice fingerprinting metrics from user's writing samples */
interface VoiceMetrics {
  avgSentenceLength: number;
  avgParagraphLength: number;
  dialogueToNarrationRatio: number;
  contractionFrequency: number;
  passiveVoicePercentage: number;
  metaphorDensity: number;
  adverbUsage: 'minimal' | 'moderate' | 'heavy';
  showVsTellRatio: number;
}

/** Voice patterns for author style */
interface VoicePatterns {
  commonPhrases: string[];
  avoidedWords: string[];
  signatureStyles: string[];
  dialogueTags: string[];
  povDepthPreference: 'shallow' | 'medium' | 'deep' | 'deep-omniscient';
}

interface VoiceProfile {
  id: string;
  projectId: string;
  name: string;
  metrics: VoiceMetrics;
  patterns: VoicePatterns;
  sampleWordCount: number;
  lastAnalyzed: Date;
  confidenceScore: number;
  deviationThreshold: number;
}

interface VoiceAnalyzerProps {
  projectId: string;
  existingProfile?: VoiceProfile;
  onProfileUpdate: (profile: VoiceProfile) => void;
}

const METRIC_LABELS: Record<keyof VoiceMetrics, { label: string; icon: any; description: string }> = {
  avgSentenceLength: { label: 'Sentence Length', icon: Type, description: 'Average words per sentence' },
  avgParagraphLength: { label: 'Paragraph Length', icon: FileText, description: 'Average sentences per paragraph' },
  dialogueToNarrationRatio: { label: 'Dialogue Ratio', icon: MessageSquare, description: 'Percentage of dialogue vs narration' },
  contractionFrequency: { label: 'Contractions', icon: Quote, description: 'Usage of contractions' },
  passiveVoicePercentage: { label: 'Passive Voice', icon: Eye, description: 'Percentage of passive constructions' },
  metaphorDensity: { label: 'Figurative Language', icon: Palette, description: 'Metaphor and simile frequency' },
  adverbUsage: { label: 'Adverb Usage', icon: Type, description: 'Adverb frequency in narrative' },
  showVsTellRatio: { label: 'Show vs Tell', icon: Eye, description: 'Balance of showing vs telling' },
};

export function VoiceAnalyzer({ projectId, existingProfile, onProfileUpdate }: VoiceAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sampleText, setSampleText] = useState('');
  const [profile, setProfile] = useState<VoiceProfile | null>(existingProfile || null);
  const [expandedMetrics, setExpandedMetrics] = useState(true);
  const [expandedPatterns, setExpandedPatterns] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const minWordCount = 5000; // Minimum words for reliable analysis
  const wordCount = sampleText.trim().split(/\s+/).filter(Boolean).length;
  const isEnoughText = wordCount >= minWordCount;

  const handleAnalyze = async () => {
    if (!isEnoughText) return;
    
    setIsAnalyzing(true);
    setError(null);

    try {
      // TODO: Call actual AI analysis API
      // Simulating analysis
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newProfile: VoiceProfile = {
        id: profile?.id || crypto.randomUUID(),
        projectId,
        name: 'My Voice Profile',
        sampleWordCount: wordCount,
        lastAnalyzed: new Date(),
        confidenceScore: Math.min(95, 70 + (wordCount / 1000)),
        deviationThreshold: 15,
        metrics: {
          avgSentenceLength: 14.2 + Math.random() * 8,
          avgParagraphLength: 3.5 + Math.random() * 2,
          dialogueToNarrationRatio: 35 + Math.random() * 20,
          contractionFrequency: 60 + Math.random() * 30,
          passiveVoicePercentage: 5 + Math.random() * 10,
          metaphorDensity: 2 + Math.random() * 3,
          adverbUsage: Math.random() > 0.6 ? 'minimal' : Math.random() > 0.3 ? 'moderate' : 'heavy',
          showVsTellRatio: 60 + Math.random() * 25,
        },
        patterns: {
          commonPhrases: ['in the darkness', 'her heart raced', 'a wry smile'],
          avoidedWords: ['very', 'really', 'just', 'suddenly'],
          signatureStyles: ['Short, punchy dialogue', 'Internal monologue in italics', 'Sensory-rich descriptions'],
          dialogueTags: ['said', 'murmured', 'whispered'],
          povDepthPreference: 'deep',
        },
      };

      setProfile(newProfile);
      onProfileUpdate(newProfile);
    } catch (err) {
      setError('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const MetricBar = ({ value, max = 100, label }: { value: number; max?: number; label?: string }) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-rose-400 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {label && <span className="text-xs text-muted-foreground w-16 text-right">{label}</span>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Mic2 className="h-5 w-5 text-rose-500" />
            Voice Fingerprint
          </h2>
          <p className="text-sm text-muted-foreground">
            Analyze your writing style for AI to match your voice
          </p>
        </div>
        {profile && (
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-emerald-500" />
            Profile Active
          </Badge>
        )}
      </div>

      {/* Sample Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Writing Sample</CardTitle>
          <CardDescription>
            Paste at least 5,000 words of your existing writing for accurate analysis.
            The more you provide, the better the AI can match your voice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            placeholder="Paste your writing sample here... Ideally include dialogue, action scenes, and introspective moments for comprehensive analysis."
            className="w-full h-48 p-4 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <span className={wordCount >= minWordCount ? 'text-emerald-500 font-medium' : 'text-muted-foreground'}>
                  {wordCount.toLocaleString()}
                </span>
                <span className="text-muted-foreground"> / {minWordCount.toLocaleString()} words minimum</span>
              </span>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!isEnoughText || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze Voice
                </>
              )}
            </Button>
          </div>

          {!isEnoughText && wordCount > 0 && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              Add {(minWordCount - wordCount).toLocaleString()} more words for reliable analysis
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Voice Profile Results */}
      {profile && (
        <>
          {/* Confidence Score */}
          <Card className="bg-gradient-to-br from-rose-50 to-amber-50 dark:from-rose-950 dark:to-amber-950 border-rose-200 dark:border-rose-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Profile Confidence</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on {profile.sampleWordCount.toLocaleString()} words analyzed
                  </p>
                </div>
                <div className="text-3xl font-bold text-rose-600">
                  {profile.confidenceScore.toFixed(0)}%
                </div>
              </div>
              <MetricBar value={profile.confidenceScore} />
              <p className="text-xs text-muted-foreground mt-2">
                Add more writing samples to improve confidence. 10,000+ words recommended.
              </p>
            </CardContent>
          </Card>

          {/* Voice Metrics */}
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => setExpandedMetrics(!expandedMetrics)}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Voice Metrics</CardTitle>
                {expandedMetrics ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
              <CardDescription>Quantified characteristics of your writing style</CardDescription>
            </CardHeader>
            {expandedMetrics && (
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(profile.metrics).map(([key, value]) => {
                    const metricKey = key as keyof VoiceMetrics;
                    const info = METRIC_LABELS[metricKey];
                    const Icon = info.icon;

                    return (
                      <div key={key} className="space-y-2 p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-rose-500" />
                          <span className="font-medium text-sm">{info.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{info.description}</p>
                        {typeof value === 'number' ? (
                          <div className="flex items-center justify-between">
                            <MetricBar value={value} max={key.includes('Ratio') || key.includes('Percentage') ? 100 : 50} />
                            <span className="text-sm font-medium ml-3">
                              {value.toFixed(1)}{key.includes('Ratio') || key.includes('Percentage') ? '%' : ''}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="secondary" className="capitalize">{value}</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Voice Patterns */}
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => setExpandedPatterns(!expandedPatterns)}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Voice Patterns</CardTitle>
                {expandedPatterns ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
              <CardDescription>Distinctive elements of your writing style</CardDescription>
            </CardHeader>
            {expandedPatterns && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Common Phrases</label>
                  <div className="flex flex-wrap gap-2">
                    {profile.patterns.commonPhrases.map((phrase, i) => (
                      <Badge key={i} variant="secondary">{phrase}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Avoided Words</label>
                  <div className="flex flex-wrap gap-2">
                    {profile.patterns.avoidedWords.map((word, i) => (
                      <Badge key={i} variant="outline" className="text-amber-600 border-amber-300">{word}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Signature Styles</label>
                  <div className="flex flex-wrap gap-2">
                    {profile.patterns.signatureStyles.map((style, i) => (
                      <Badge key={i} variant="secondary" className="bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300">
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Preferred Dialogue Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {profile.patterns.dialogueTags.map((tag, i) => (
                      <Badge key={i} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">POV Depth Preference</label>
                  <Badge className="capitalize bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                    {profile.patterns.povDepthPreference}
                  </Badge>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Deviation Threshold */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deviation Threshold</CardTitle>
              <CardDescription>
                How much the AI can vary from your voice before flagging for review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={profile.deviationThreshold}
                  onChange={(e) => {
                    const updated = { ...profile, deviationThreshold: parseInt(e.target.value) };
                    setProfile(updated);
                    onProfileUpdate(updated);
                  }}
                  className="flex-1"
                />
                <span className="text-lg font-medium w-12">{profile.deviationThreshold}%</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Strict matching</span>
                <span>More creative freedom</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default VoiceAnalyzer;
