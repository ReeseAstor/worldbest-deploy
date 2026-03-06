'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { VoiceAnalyzer } from '@/components/voice/voice-analyzer';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { Badge } from '@/components/ui/badge';
import {
  Mic2,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Settings,
  Trash2,
  Plus
} from 'lucide-react';

interface VoiceProfile {
  id: string;
  name: string;
  projectName: string;
  sampleWordCount: number;
  confidenceScore: number;
  lastAnalyzed: Date;
  isActive: boolean;
}

// Mock data
const mockProfiles: VoiceProfile[] = [
  {
    id: '1',
    name: 'My Romance Voice',
    projectName: 'Shadows of the Fae Court',
    sampleWordCount: 12500,
    confidenceScore: 87,
    lastAnalyzed: new Date(),
    isActive: true,
  },
  {
    id: '2',
    name: 'Dark Fantasy Voice',
    projectName: 'Blood & Thorns',
    sampleWordCount: 8200,
    confidenceScore: 72,
    lastAnalyzed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    isActive: false,
  },
];

export default function VoicePage() {
  const [profiles, setProfiles] = useState(mockProfiles);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  const handleProfileUpdate = (profile: any) => {
    setProfiles(prev => {
      const existing = prev.find(p => p.id === profile.id);
      if (existing) {
        return prev.map(p => p.id === profile.id ? { ...p, ...profile } : p);
      }
      return [...prev, profile];
    });
    setShowAnalyzer(false);
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
  };

  const handleSetActive = (id: string) => {
    setProfiles(prev => prev.map(p => ({ ...p, isActive: p.id === id })));
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Mic2 className="h-7 w-7 text-violet-500" />
              Voice Profiles
            </h1>
            <p className="text-muted-foreground">
              Train the AI to match your unique writing voice
            </p>
          </div>
          <Button onClick={() => setShowAnalyzer(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Voice Profile
          </Button>
        </div>

        {/* Voice Analyzer Modal */}
        {showAnalyzer && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Create Voice Profile</CardTitle>
                <CardDescription>Analyze your writing to create a voice fingerprint</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowAnalyzer(false)}>
                Cancel
              </Button>
            </CardHeader>
            <CardContent>
              <VoiceAnalyzer
                projectId="new"
                onProfileUpdate={handleProfileUpdate}
              />
            </CardContent>
          </Card>
        )}

        {/* Existing Profiles */}
        {!showAnalyzer && (
          <div className="grid gap-4 md:grid-cols-2">
            {profiles.map((profile) => (
              <Card 
                key={profile.id}
                className={profile.isActive ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-950/30' : ''}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mic2 className={`h-5 w-5 ${profile.isActive ? 'text-violet-500' : 'text-muted-foreground'}`} />
                      <CardTitle className="text-lg">{profile.name}</CardTitle>
                    </div>
                    {profile.isActive && (
                      <Badge className="bg-violet-500">Active</Badge>
                    )}
                  </div>
                  <CardDescription>{profile.projectName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Sample Size</p>
                      <p className="font-medium">{profile.sampleWordCount.toLocaleString()} words</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Confidence</p>
                      <p className="font-medium flex items-center gap-1">
                        {profile.confidenceScore >= 80 ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                        {profile.confidenceScore}%
                      </p>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Voice Confidence</span>
                      <span>{profile.confidenceScore}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          profile.confidenceScore >= 80 ? 'bg-emerald-500' : 
                          profile.confidenceScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${profile.confidenceScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {!profile.isActive && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleSetActive(profile.id)}
                      >
                        Set Active
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive"
                      onClick={() => handleDeleteProfile(profile.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Empty State */}
            {profiles.length === 0 && (
              <Card className="col-span-2 border-dashed">
                <CardContent className="p-12 text-center">
                  <Mic2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-medium mb-2">No Voice Profiles</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a voice profile to help AI match your writing style
                  </p>
                  <Button onClick={() => setShowAnalyzer(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Voice Profile
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Tips */}
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 border-violet-200 dark:border-violet-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-violet-500" />
              Tips for Better Voice Matching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-violet-500 flex-shrink-0" />
                <span>Provide at least 10,000 words of your writing for best results</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-violet-500 flex-shrink-0" />
                <span>Include a mix of dialogue, action, and introspective scenes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-violet-500 flex-shrink-0" />
                <span>Use polished, edited writing rather than rough drafts</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-violet-500 flex-shrink-0" />
                <span>Create separate profiles for different series or pen names</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
