'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Button } from '@ember/ui-components';
import { Play, Users, FileText, Star, ArrowRight } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '10,000+',
    label: 'Writers',
  },
  {
    icon: FileText,
    value: '1M+',
    label: 'Words Generated',
  },
  {
    icon: Star,
    value: '4.9★',
    label: 'Rating',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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

export function DemoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="container py-20 md:py-32 border-t">
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="max-w-4xl mx-auto"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See Ember in Action
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Watch how Ember transforms your writing workflow in 60 seconds
          </p>
        </motion.div>

        {/* Video Placeholder */}
        <motion.div
          variants={itemVariants}
          className="relative aspect-video rounded-2xl overflow-hidden mb-10"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 via-purple-500/10 to-indigo-500/20" />
          
          {/* Inner Frame */}
          <div className="absolute inset-2 md:inset-4 rounded-xl bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm border border-white/10 flex items-center justify-center">
            {/* Play Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-rose-500 shadow-lg shadow-rose-500/30 hover:bg-rose-600 transition-colors"
            >
              <Play className="h-8 w-8 md:h-10 md:w-10 text-white fill-white ml-1" />
              
              {/* Pulse Animation */}
              <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-20" />
            </motion.button>
          </div>

          {/* Corner Decorations */}
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-4 left-4 w-2 h-2 rounded-full bg-rose-400"
          />
          <motion.div
            animate={{
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
            className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-purple-400"
          />

          {/* Glow Effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-rose-500/10 via-transparent to-purple-500/10 rounded-3xl blur-2xl -z-10" />
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <Button size="lg" className="bg-rose-500 hover:bg-rose-600">
            Start Your Free Trial <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>

        {/* Stats Badges */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-4 md:gap-8"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 px-5 py-3 rounded-full bg-muted/50 border border-border/50"
            >
              <stat.icon className="h-5 w-5 text-rose-500" />
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-lg">{stat.value}</span>
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
