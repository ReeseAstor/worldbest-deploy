'use client';

import { type LucideIcon } from 'lucide-react';
import { cn } from '@ember/ui-components';
import { motion } from 'framer-motion';

interface GoalCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

export function GoalCard({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
}: GoalCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative w-full p-6 rounded-xl border-2 text-left transition-all duration-200',
        'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2',
        selected
          ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20'
          : 'border-border bg-card hover:border-rose-300'
      )}
    >
      {/* Selected indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center"
        >
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
      )}

      {/* Icon */}
      <div
        className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors',
          selected
            ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400'
            : 'bg-muted text-muted-foreground'
        )}
      >
        <Icon className="w-6 h-6" />
      </div>

      {/* Content */}
      <h3
        className={cn(
          'text-lg font-semibold mb-1 transition-colors',
          selected ? 'text-rose-700 dark:text-rose-300' : 'text-foreground'
        )}
      >
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.button>
  );
}
