'use client';

import { Check } from 'lucide-react';
import { cn } from '@ember/ui-components';

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

const STEPS = [
  { id: 1, label: 'Welcome' },
  { id: 2, label: 'Goals' },
  { id: 3, label: 'First Project' },
  { id: 4, label: 'Complete' },
];

export function ProgressBar({ currentStep, totalSteps = 4 }: ProgressBarProps) {
  return (
    <div className="w-full">
      {/* Mobile: Simple progress bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-muted-foreground">
            {STEPS[currentStep - 1]?.label}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-rose-500 transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: Step indicators */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted">
            <div
              className="h-full bg-rose-500 transition-all duration-300 ease-out"
              style={{
                width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Steps */}
          {STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center relative z-10"
              >
                {/* Step circle */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200',
                    isCompleted
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : isCurrent
                        ? 'bg-background border-rose-500 text-rose-500'
                        : 'bg-background border-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>

                {/* Step label */}
                <span
                  className={cn(
                    'mt-2 text-xs font-medium transition-colors',
                    isCurrent
                      ? 'text-foreground'
                      : isCompleted
                        ? 'text-rose-500'
                        : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
