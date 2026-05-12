'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@ember/ui-components';
import {
  Sparkles,
  BookHeart,
  Users,
  MessageSquare,
  Download,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Sparkles,
    title: 'AI Writing Assistant',
    description:
      'Three AI personas — Muse, Editor, Coach — that understand romantasy tropes and pacing.',
  },
  {
    icon: BookHeart,
    title: 'Story Bible Management',
    description:
      'Track characters, locations, timelines, and continuity rules across your entire series.',
  },
  {
    icon: Users,
    title: 'Character Development',
    description:
      'Rich character profiles with relationship arcs, speech patterns, and POV consistency.',
  },
  {
    icon: MessageSquare,
    title: 'Real-time Collaboration',
    description:
      'Co-write with your team. Track changes, leave comments, and merge seamlessly.',
  },
  {
    icon: Download,
    title: 'Export to ePub/PDF',
    description:
      'One-click export formatted for Amazon KDP, Apple Books, and more.',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    description:
      'Track word counts, writing streaks, and project milestones with visual dashboards.',
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

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="h-full hover:border-rose-500/50 transition-colors duration-300">
        <CardHeader>
          <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-rose-500/10">
            <feature.icon className="h-6 w-6 text-rose-500" />
          </div>
          <CardTitle className="text-lg">{feature.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {feature.description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="container py-20 md:py-32 border-t">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Everything You Need to Write Your Bestseller
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Powerful tools designed specifically for romance and romantasy authors
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </motion.div>
    </section>
  );
}
