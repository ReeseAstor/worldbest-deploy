'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, BookHeart, Download, ArrowRight } from 'lucide-react';
import { Button } from '@ember/ui-components';
import { useOnboardingStore } from '@/stores/onboarding-store';

const BENEFITS = [
  {
    icon: Sparkles,
    title: 'AI-powered writing that understands romance',
    description:
      'Our AI is trained specifically for romance and fantasy writing, understanding tropes, pacing, and emotional beats.',
  },
  {
    icon: BookHeart,
    title: 'Organize your entire series in one place',
    description:
      'Keep track of characters, plot threads, world-building, and story bibles across your entire series.',
  },
  {
    icon: Download,
    title: 'Export directly to KDP and other platforms',
    description:
      'One-click export to Kindle Direct Publishing, ePub, and other formats. No extra tools needed.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export default function WelcomePage() {
  const router = useRouter();
  const { setCurrentStep } = useOnboardingStore();

  const handleContinue = () => {
    setCurrentStep(2);
    router.push('/onboarding/goals');
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-center space-y-8"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Welcome to Ember!{' '}
          <span role="img" aria-label="sparkles">
            ✨
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          The AI-powered writing platform designed for romance and fantasy
          authors. Let&apos;s get you set up in just a few steps.
        </p>
      </motion.div>

      {/* Benefits Grid */}
      <motion.div
        variants={containerVariants}
        className="grid gap-4 md:gap-6 py-6"
      >
        {BENEFITS.map((benefit, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="flex items-start gap-4 p-4 md:p-6 rounded-xl bg-card border text-left hover:border-rose-300 transition-colors"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
              <benefit.icon className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                {benefit.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.div variants={itemVariants}>
        <Button
          size="lg"
          onClick={handleContinue}
          className="bg-rose-500 hover:bg-rose-600 text-lg px-8 py-6 h-auto"
        >
          Let&apos;s Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">
          Takes about 2 minutes to complete
        </p>
      </motion.div>
    </motion.div>
  );
}
