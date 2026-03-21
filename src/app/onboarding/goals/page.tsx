'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Film, PenTool, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@ember/ui-components';
import { GoalCard } from '@/components/onboarding/goal-card';
import { useOnboardingStore, type WritingGoal } from '@/stores/onboarding-store';

const GOALS = [
  {
    id: 'novel' as WritingGoal,
    icon: BookOpen,
    title: 'Novel / Series',
    description: 'Write your next bestselling novel or series',
  },
  {
    id: 'short-story' as WritingGoal,
    icon: FileText,
    title: 'Short Story',
    description: 'Craft compelling short fiction',
  },
  {
    id: 'screenplay' as WritingGoal,
    icon: Film,
    title: 'Screenplay',
    description: 'Write scripts and screenplays',
  },
  {
    id: 'other' as WritingGoal,
    icon: PenTool,
    title: 'Other',
    description: 'Blog posts, articles, or other creative writing',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

export default function GoalsPage() {
  const router = useRouter();
  const { writingGoal, setWritingGoal, setCurrentStep } = useOnboardingStore();

  const handleGoalSelect = (goal: WritingGoal) => {
    setWritingGoal(goal);
  };

  const handleContinue = () => {
    if (!writingGoal) return;
    setCurrentStep(3);
    router.push('/onboarding/first-project');
  };

  const handleBack = () => {
    setCurrentStep(1);
    router.push('/onboarding/welcome');
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          What are you working on?
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          This helps us customize your experience and suggest the right tools.
        </p>
      </motion.div>

      {/* Goal Cards Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {GOALS.map((goal) => (
          <motion.div key={goal.id} variants={itemVariants}>
            <GoalCard
              icon={goal.icon}
              title={goal.title}
              description={goal.description}
              selected={writingGoal === goal.id}
              onClick={() => handleGoalSelect(goal.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Navigation Buttons */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between pt-4"
      >
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-muted-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!writingGoal}
          className="bg-rose-500 hover:bg-rose-600"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
