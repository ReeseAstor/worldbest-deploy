'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { PenLine, LayoutDashboard, BookOpen, PartyPopper } from 'lucide-react';
import { Button, Card } from '@ember/ui-components';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { createClient } from '@/lib/supabase/client';

const AUTO_REDIRECT_SECONDS = 10;

interface ActionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
}

function ActionCard({ icon: Icon, title, description, onClick, primary }: ActionCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
        primary
          ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/50 dark:hover:bg-rose-950/30'
          : 'border-border hover:border-rose-300'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
            primary
              ? 'bg-rose-500 text-white'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </motion.button>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
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

export default function CompletePage() {
  const router = useRouter();
  const supabase = createClient();
  const { project, createdProjectId, markCompleted } = useOnboardingStore();
  const confettiFired = useRef(false);
  const [countdown, setCountdown] = useState(AUTO_REDIRECT_SECONDS);
  const [isPaused, setIsPaused] = useState(false);

  // Fire confetti on mount
  useEffect(() => {
    if (confettiFired.current) return;
    confettiFired.current = true;

    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const colors = ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#fff1f2'];

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const confettiInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(confettiInterval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Left side
      confetti({
        particleCount: Math.floor(particleCount / 2),
        startVelocity: 30,
        spread: 55,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors,
        zIndex: 9999,
      });

      // Right side
      confetti({
        particleCount: Math.floor(particleCount / 2),
        startVelocity: 30,
        spread: 55,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors,
        zIndex: 9999,
      });
    }, 250);

    return () => {
      clearInterval(confettiInterval);
    };
  }, []);

  // Auto-redirect countdown
  useEffect(() => {
    if (isPaused || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, countdown, router]);

  // Mark onboarding as completed
  useEffect(() => {
    const updateProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({ onboarding_completed: true })
            .eq('id', user.id);
        }
      } catch (error) {
        console.error('Failed to update profile:', error);
      }
    };

    markCompleted();
    updateProfile();
  }, [markCompleted, supabase]);

  const handleStartWriting = () => {
    setIsPaused(true);
    if (createdProjectId) {
      router.push(`/dashboard/projects/${createdProjectId}/write`);
    } else {
      router.push('/dashboard');
    }
  };

  const handleGoDashboard = () => {
    setIsPaused(true);
    router.push('/dashboard');
  };

  const handleBuildBible = () => {
    setIsPaused(true);
    if (createdProjectId) {
      router.push(`/dashboard/projects/${createdProjectId}/bible`);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-center space-y-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Success Header */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="mx-auto w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
          <PartyPopper className="w-10 h-10 text-rose-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          You&apos;re All Set!{' '}
          <span role="img" aria-label="celebration">
            🎉
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Your account is ready and your first project is created. Time to start writing!
        </p>
      </motion.div>

      {/* Project Summary */}
      {project.title && (
        <motion.div variants={itemVariants}>
          <Card className="p-4 bg-muted/50 border-dashed">
            <p className="text-sm text-muted-foreground">
              Your project:{' '}
              <span className="font-semibold text-foreground">{project.title}</span>
              {project.genre && (
                <>
                  {' '}
                  • Genre:{' '}
                  <span className="font-medium text-foreground">
                    {project.genre.replace(/-/g, ' ')}
                  </span>
                </>
              )}
            </p>
          </Card>
        </motion.div>
      )}

      {/* Action Cards */}
      <motion.div variants={containerVariants} className="space-y-3">
        <motion.div variants={itemVariants}>
          <ActionCard
            icon={PenLine}
            title="Start Writing"
            description="Jump right into your project and start crafting your story."
            onClick={handleStartWriting}
            primary
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <ActionCard
            icon={LayoutDashboard}
            title="Explore Dashboard"
            description="Get familiar with all the features available to you."
            onClick={handleGoDashboard}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <ActionCard
            icon={BookOpen}
            title="Build Your Story Bible"
            description="Create characters, locations, and plot outlines."
            onClick={handleBuildBible}
          />
        </motion.div>
      </motion.div>

      {/* Auto-redirect notice */}
      <motion.div variants={itemVariants}>
        <p className="text-sm text-muted-foreground">
          {isPaused ? (
            'Auto-redirect paused'
          ) : (
            <>
              Redirecting to dashboard in{' '}
              <span className="font-medium text-foreground">{countdown}</span> seconds...
            </>
          )}
        </p>
        <Button
          variant="link"
          onClick={handleGoDashboard}
          className="text-rose-500 hover:text-rose-600"
        >
          Go to Dashboard now
        </Button>
      </motion.div>
    </motion.div>
  );
}
