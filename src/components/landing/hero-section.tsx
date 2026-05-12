'use client';

import { motion } from 'framer-motion';
import { Button } from '@ember/ui-components';
import { ArrowRight, Play, Sparkles, Star } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
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

const sparkleVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export function HeroSection() {
  return (
    <section className="container py-20 md:py-32">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column - Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center lg:text-left"
        >
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            Finish Your Novel{' '}
            <span className="text-rose-500">3x Faster</span> with AI
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
          >
            The only AI writing platform built for steamy romantasy. Genre-tuned
            drafting, steam calibration, voice fingerprinting, and KDP-ready
            export.
          </motion.p>

          {/* Dual CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
          >
            <Button size="lg" className="bg-rose-500 hover:bg-rose-600">
              Start Writing Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="group">
              <Play className="mr-2 h-4 w-4 group-hover:text-rose-500 transition-colors" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Social Proof Row */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start"
          >
            {/* Avatar Stack */}
            <div className="flex items-center">
              <div className="flex -space-x-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-background bg-gradient-to-br from-rose-400 to-rose-600"
                    style={{
                      zIndex: 5 - i,
                    }}
                  />
                ))}
              </div>
              <span className="ml-4 text-sm font-medium text-muted-foreground">
                Join 10,000+ writers
              </span>
            </div>

            {/* Trust Badge */}
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                4.9/5 from 500+ reviews
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column - Animated Hero Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative"
        >
          <div className="relative aspect-square max-w-lg mx-auto">
            {/* Main Gradient Card */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-rose-500/20 via-rose-400/10 to-purple-500/20 backdrop-blur-sm border border-rose-500/20 overflow-hidden">
              {/* Inner Content Placeholder */}
              <div className="absolute inset-4 rounded-2xl bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <div className="text-center p-6">
                  <motion.div
                    variants={sparkleVariants}
                    animate="animate"
                    className="inline-block mb-4"
                  >
                    <Sparkles className="h-16 w-16 text-rose-500" />
                  </motion.div>
                  <p className="text-lg font-medium text-foreground/80">
                    AI-Powered Writing
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Built for Romance Authors
                  </p>
                </div>
              </div>

              {/* Animated Sparkles */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute top-8 right-8 w-4 h-4 rounded-full bg-rose-400"
              />
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
                className="absolute bottom-12 left-8 w-3 h-3 rounded-full bg-purple-400"
              />
              <motion.div
                animate={{
                  opacity: [0.4, 0.9, 0.4],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
                className="absolute top-1/3 left-6 w-2 h-2 rounded-full bg-rose-300"
              />
            </div>

            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-rose-500/10 via-transparent to-purple-500/10 rounded-3xl blur-2xl -z-10" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
