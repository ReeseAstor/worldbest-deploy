'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@ember/ui-components';
import { Star, BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  initials: string;
  color: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Sarah M.',
    role: 'Romance Author',
    content:
      'Ember cut my drafting time in half. The AI understands romantasy tropes better than any tool I\'ve tried.',
    rating: 5,
    initials: 'SM',
    color: 'bg-rose-500',
  },
  {
    name: 'James K.',
    role: 'Fantasy Writer',
    content:
      'The story bible feature alone is worth the subscription. No more continuity errors.',
    rating: 5,
    initials: 'JK',
    color: 'bg-violet-500',
  },
  {
    name: 'Emily R.',
    role: 'Self-Published Author',
    content:
      'Went from one book a year to three. The voice fingerprinting keeps my style consistent.',
    rating: 5,
    initials: 'ER',
    color: 'bg-amber-500',
  },
  {
    name: 'Michael T.',
    role: 'Writing Coach',
    content:
      'I recommend Ember to all my clients. The beat sheet templates are game-changing.',
    rating: 4,
    initials: 'MT',
    color: 'bg-emerald-500',
  },
  {
    name: 'Lisa P.',
    role: 'Debut Author',
    content:
      'As a new writer, the AI Coach persona helped me understand pacing and structure.',
    rating: 5,
    initials: 'LP',
    color: 'bg-sky-500',
  },
  {
    name: 'David W.',
    role: 'Series Author',
    content:
      'Managing a 10-book series was a nightmare until Ember. Now it\'s a breeze.',
    rating: 5,
    initials: 'DW',
    color: 'bg-orange-500',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? 'text-amber-400 fill-amber-400'
              : 'text-muted-foreground'
          }`}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full ${testimonial.color} flex items-center justify-center text-white font-semibold text-sm`}
          >
            {testimonial.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold truncate">{testimonial.name}</span>
              <BadgeCheck className="h-4 w-4 text-rose-500 flex-shrink-0" />
            </div>
            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
          </div>
        </div>
        <StarRating rating={testimonial.rating} />
        <p className="mt-4 text-muted-foreground leading-relaxed">
          &ldquo;{testimonial.content}&rdquo;
        </p>
      </CardContent>
    </Card>
  );
}

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  // Auto-rotate carousel on mobile
  useEffect(() => {
    if (!isMobile) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isMobile, nextSlide]);

  return (
    <section id="testimonials" className="py-20 md:py-32 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Loved by Writers Worldwide
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See what our community is saying
          </p>
        </motion.div>

        {/* Desktop Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <TestimonialCard testimonial={testimonial} />
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="px-4"
              >
                <TestimonialCard testimonial={testimonials[currentIndex]} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full border hover:bg-muted transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-rose-500' : 'bg-muted-foreground/30'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="p-2 rounded-full border hover:bg-muted transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
