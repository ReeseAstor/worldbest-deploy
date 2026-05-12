'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import {
  Thermometer,
  Heart,
  Flame,
  Sparkles,
  AlertTriangle,
  Info
} from 'lucide-react';

/** Steam level configuration */
export type SteamLevelValue = 1 | 2 | 3 | 4 | 5;

interface SteamLevelOption {
  level: SteamLevelValue;
  label: string;
  icon: typeof Thermometer;
  description: string;
  color: string;
  bgColor: string;
  examples: string[];
}

const STEAM_LEVELS: SteamLevelOption[] = [
  {
    level: 1,
    label: 'Closed Door',
    icon: Heart,
    description: 'Tension and attraction only. Scenes fade to black before anything physical beyond kissing.',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    examples: ['Emotional longing', 'Meaningful glances', 'Fade to black'],
  },
  {
    level: 2,
    label: 'Warm',
    icon: Sparkles,
    description: 'Foreplay and build-up described. The act itself is implied or briefly referenced. Literary language.',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100 dark:bg-pink-900',
    examples: ['Sensual tension', 'Euphemistic language', 'Poetic descriptions'],
  },
  {
    level: 3,
    label: 'Steamy',
    icon: Thermometer,
    description: 'Full scenes included. Moderate explicitness. Balances emotional connection with physical description.',
    color: 'text-rose-600',
    bgColor: 'bg-rose-100 dark:bg-rose-900',
    examples: ['Full scenes', 'Anatomical but tasteful', 'Emotional stakes'],
  },
  {
    level: 4,
    label: 'Spicy',
    icon: Flame,
    description: 'Detailed, extended scenes. Multiple encounters. Kink elements may be introduced. Power dynamics explored.',
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900',
    examples: ['Extended scenes', 'Explicit vocabulary', 'Kink welcome'],
  },
  {
    level: 5,
    label: 'Scorching',
    icon: AlertTriangle,
    description: 'No content limits within consent boundaries. Taboo elements, edge play, dark romance dynamics fully explored.',
    color: 'text-red-700',
    bgColor: 'bg-red-200 dark:bg-red-800',
    examples: ['Unrestricted', 'Dark elements', 'Full creative freedom'],
  },
];

interface SteamLevelSelectorProps {
  value: SteamLevelValue;
  onChange: (level: SteamLevelValue) => void;
  showDescription?: boolean;
  showExamples?: boolean;
  compact?: boolean;
  disabled?: boolean;
}

export function SteamLevelSelector({
  value,
  onChange,
  showDescription = true,
  showExamples = false,
  compact = false,
  disabled = false,
}: SteamLevelSelectorProps) {
  const [hoveredLevel, setHoveredLevel] = useState<SteamLevelValue | null>(null);

  const selectedOption = STEAM_LEVELS.find(l => l.level === value);
  const displayOption = hoveredLevel 
    ? STEAM_LEVELS.find(l => l.level === hoveredLevel) 
    : selectedOption;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Heat:</span>
        <div className="flex gap-1">
          {STEAM_LEVELS.map((option) => {
            const Icon = option.icon;
            const isSelected = value === option.level;
            return (
              <button
                key={option.level}
                type="button"
                disabled={disabled}
                onClick={() => onChange(option.level)}
                onMouseEnter={() => setHoveredLevel(option.level)}
                onMouseLeave={() => setHoveredLevel(null)}
                className={`
                  p-1.5 rounded-md transition-all
                  ${isSelected 
                    ? `${option.bgColor} ${option.color}` 
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                title={`${option.label}: ${option.description}`}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
        {displayOption && (
          <span className={`text-sm font-medium ${displayOption.color}`}>
            {displayOption.label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Level Selection */}
      <div className="grid grid-cols-5 gap-2">
        {STEAM_LEVELS.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.level;
          return (
            <button
              key={option.level}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.level)}
              onMouseEnter={() => setHoveredLevel(option.level)}
              onMouseLeave={() => setHoveredLevel(null)}
              className={`
                flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
                ${isSelected 
                  ? `border-current ${option.bgColor} ${option.color}` 
                  : 'border-transparent hover:border-muted-foreground/30 hover:bg-muted'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <Icon className={`h-6 w-6 ${isSelected ? option.color : 'text-muted-foreground'}`} />
              <span className={`text-xs font-medium ${isSelected ? option.color : 'text-muted-foreground'}`}>
                {option.level}
              </span>
            </button>
          );
        })}
      </div>

      {/* Heat Scale Visual */}
      <div className="relative h-2 rounded-full bg-gradient-to-r from-slate-300 via-pink-400 via-rose-500 via-red-500 to-red-700">
        <div
          className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white border-2 border-current shadow-md transition-all"
          style={{
            left: `${((value - 1) / 4) * 100}%`,
            transform: 'translate(-50%, -50%)',
            borderColor: selectedOption?.color.replace('text-', '').replace('-600', '') || 'gray',
          }}
        />
      </div>

      {/* Description Panel */}
      {showDescription && displayOption && (
        <Card className={`${displayOption.bgColor} border-0`}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <displayOption.icon className={`h-5 w-5 ${displayOption.color}`} />
              <CardTitle className={`text-lg ${displayOption.color}`}>
                Level {displayOption.level}: {displayOption.label}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-foreground/80">
              {displayOption.description}
            </CardDescription>
            
            {showExamples && (
              <div className="mt-3 flex flex-wrap gap-2">
                {displayOption.examples.map((example, i) => (
                  <span
                    key={i}
                    className={`text-xs px-2 py-1 rounded-full ${displayOption.bgColor} ${displayOption.color} border border-current/20`}
                  >
                    {example}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Note */}
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          Steam level affects AI vocabulary, scene detail, and content boundaries. 
          You can override this per-scene in the editor.
        </p>
      </div>
    </div>
  );
}

/** Compact steam badge for display purposes */
interface SteamBadgeProps {
  level: SteamLevelValue;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SteamBadge({ level, showLabel = true, size = 'md' }: SteamBadgeProps) {
  const option = STEAM_LEVELS.find(l => l.level === level);
  if (!option) return null;

  const Icon = option.icon;
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs gap-1',
    md: 'px-2 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${option.bgColor} ${option.color} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{option.label}</span>}
    </span>
  );
}

/** Scene heat indicator for the editor */
interface SceneHeatIndicatorProps {
  level: SteamLevelValue;
  isOverride?: boolean;
  onClick?: () => void;
}

export function SceneHeatIndicator({ level, isOverride = false, onClick }: SceneHeatIndicatorProps) {
  const option = STEAM_LEVELS.find(l => l.level === level);
  if (!option) return null;

  const Icon = option.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors
        ${option.bgColor} ${option.color}
        ${onClick ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}
        ${isOverride ? 'ring-2 ring-offset-1 ring-amber-400' : ''}
      `}
      title={isOverride ? 'Scene override active' : `Heat Level: ${option.label}`}
    >
      <Icon className="h-3 w-3" />
      <span>{level}</span>
      {isOverride && <span className="text-amber-600">*</span>}
    </button>
  );
}

export default SteamLevelSelector;
