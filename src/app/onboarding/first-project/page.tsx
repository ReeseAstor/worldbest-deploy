'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@ember/ui-components';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { cn } from '@ember/ui-components';
import {
  useOnboardingStore,
  GENRE_OPTIONS,
  WORD_COUNT_PRESETS,
  TEMPLATE_OPTIONS,
  type ProjectTemplate,
} from '@/stores/onboarding-store';

// Validation schema
const projectSchema = z.object({
  title: z.string().min(1, 'Project title is required').max(100, 'Title is too long'),
  genre: z.string().min(1, 'Please select a genre'),
  targetWordCount: z.number().nullable().optional(),
  template: z.string().default('scratch'),
});

type ProjectFormData = z.infer<typeof projectSchema>;

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

export default function FirstProjectPage() {
  const router = useRouter();
  const supabase = createClient();
  const {
    project,
    setProject,
    setCreatedProjectId,
    setCurrentStep,
  } = useOnboardingStore();

  const [loading, setLoading] = useState(false);
  const [selectedWordCount, setSelectedWordCount] = useState<number | null>(
    project.targetWordCount
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project.title,
      genre: project.genre,
      targetWordCount: project.targetWordCount,
      template: project.template,
    },
  });

  const selectedTemplate = watch('template');

  const handleWordCountPreset = (value: number) => {
    if (selectedWordCount === value) {
      setSelectedWordCount(null);
      setValue('targetWordCount', null);
    } else {
      setSelectedWordCount(value);
      setValue('targetWordCount', value);
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create project in Supabase
      const { data: newProject, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: data.title,
          genre: data.genre,
          target_word_count: data.targetWordCount,
          template: data.template,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      // Update store
      setProject({
        title: data.title,
        genre: data.genre,
        targetWordCount: data.targetWordCount ?? null,
        template: data.template as ProjectTemplate,
      });
      setCreatedProjectId(newProject.id);

      toast.success('Project created!', {
        description: 'Your first project is ready to go.',
      });

      setCurrentStep(4);
      router.push('/onboarding/complete');
    } catch (error: any) {
      toast.error('Failed to create project', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(2);
    router.push('/onboarding/goals');
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
          Create Your First Project
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Set up your project and start writing right away.
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        variants={containerVariants}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Project Title */}
        <motion.div variants={itemVariants} className="space-y-2">
          <Label htmlFor="title">Project Title *</Label>
          <Input
            id="title"
            placeholder="My Amazing Novel"
            {...register('title')}
            disabled={loading}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </motion.div>

        {/* Genre Dropdown */}
        <motion.div variants={itemVariants} className="space-y-2">
          <Label htmlFor="genre">Genre *</Label>
          <div className="relative">
            <select
              id="genre"
              {...register('genre')}
              disabled={loading}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'appearance-none cursor-pointer'
              )}
            >
              <option value="">Select a genre</option>
              {GENRE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          {errors.genre && (
            <p className="text-sm text-destructive">{errors.genre.message}</p>
          )}
        </motion.div>

        {/* Target Word Count */}
        <motion.div variants={itemVariants} className="space-y-3">
          <Label>Target Word Count (optional)</Label>
          <div className="flex flex-wrap gap-2">
            {WORD_COUNT_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                type="button"
                variant={selectedWordCount === preset.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleWordCountPreset(preset.value)}
                disabled={loading}
                className={
                  selectedWordCount === preset.value
                    ? 'bg-rose-500 hover:bg-rose-600'
                    : ''
                }
              >
                {preset.label}
              </Button>
            ))}
            <Input
              type="number"
              placeholder="Custom"
              className="w-24"
              value={
                selectedWordCount &&
                !WORD_COUNT_PRESETS.some((p) => p.value === selectedWordCount)
                  ? selectedWordCount
                  : ''
              }
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : null;
                setSelectedWordCount(value);
                setValue('targetWordCount', value);
              }}
              disabled={loading}
            />
          </div>
        </motion.div>

        {/* Template Selection */}
        <motion.div variants={itemVariants} className="space-y-3">
          <Label>Story Structure (optional)</Label>
          <div className="grid grid-cols-2 gap-3">
            {TEMPLATE_OPTIONS.map((template) => (
              <button
                key={template.value}
                type="button"
                onClick={() => setValue('template', template.value)}
                disabled={loading}
                className={cn(
                  'p-4 rounded-lg border-2 text-left transition-all',
                  'hover:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2',
                  selectedTemplate === template.value
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20'
                    : 'border-border'
                )}
              >
                <p className="font-medium text-sm">{template.label}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {template.description}
                </p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between pt-4"
        >
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={loading}
            className="text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-rose-500 hover:bg-rose-600"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Project
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}
