'use client';

import { useState } from 'react';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth/auth-provider';
import { User, Mail, PenTool, Save, Camera } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [penName, setPenName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // TODO: Save to Supabase
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your author profile</p>
      </div>

      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Your avatar shown across Ember</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <User className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-2">
            <Button variant="outline" size="sm">
              <Camera className="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
            <p className="text-xs text-muted-foreground">JPG, PNG. Max 2MB.</p>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Your public author information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{user?.email}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="penName">Pen Name</Label>
            <Input
              id="penName"
              value={penName}
              onChange={(e) => setPenName(e.target.value)}
              placeholder="Your author pen name"
            />
            <p className="text-xs text-muted-foreground">Used in published works</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell readers about yourself..."
              className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Writing Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Writing Statistics</CardTitle>
          <CardDescription>Your lifetime achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Total Words</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">AI Sessions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
