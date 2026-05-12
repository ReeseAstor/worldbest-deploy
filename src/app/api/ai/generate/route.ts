import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// CONFIGURATION
// ============================================================================

const VENICE_API_KEY = process.env.VENICE_API_KEY;
const VENICE_API_URL = process.env.VENICE_API_URL || 'https://api.venice.ai/api/v1';
const VENICE_MODEL = process.env.VENICE_MODEL || 'olafangensan-glm-4.7-flash-heretic';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// ============================================================================
// MODEL MAPPINGS
// ============================================================================

interface ModelConfig {
  provider: 'venice' | 'openai' | 'gemini' | 'anthropic';
  apiModel: string;
  maxTokens: number;
  temperature: number;
}

const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'claude-opus': {
    provider: 'anthropic',
    apiModel: 'claude-sonnet-4-20250514',
    maxTokens: 8192,
    temperature: 0.85,
  },
  'claude-sonnet': {
    provider: 'anthropic',
    apiModel: 'claude-sonnet-4-20250514',
    maxTokens: 8192,
    temperature: 0.8,
  },
  'venice-glm': {
    provider: 'venice',
    apiModel: VENICE_MODEL,
    maxTokens: 4096,
    temperature: 0.85,
  },
  'openai-gpt4o': {
    provider: 'openai',
    apiModel: 'gpt-4o',
    maxTokens: 4096,
    temperature: 0.8,
  },
  'gemini-pro': {
    provider: 'gemini',
    apiModel: 'gemini-2.0-flash',
    maxTokens: 8192,
    temperature: 0.8,
  },
};

// ============================================================================
// STEAM LEVEL CONFIGURATIONS
// ============================================================================

const STEAM_LEVEL_PROMPTS: Record<number, string> = {
  1: `Steam Level 1 - "Closed Door": Keep the scene emotionally intimate but fade to black before any explicit content. Focus on longing glances, tender touches, and emotional tension. The anticipation is the reward.`,
  
  2: `Steam Level 2 - "Warm": Include romantic kisses and light touching, but no explicit content. Focus on building chemistry through stolen glances, meaningful touches, and sweet romantic moments.`,
  
  3: `Steam Level 3 - "Steamy": Write sensual scenes with passionate kisses, some clothing removal hints, and sensual touching. Be suggestive and build desire, but stop short of explicit descriptions.`,
  
  4: `Steam Level 4 - "Spicy": Include explicit romantic content with physical descriptions and sensory details. Be descriptive about intimacy while maintaining romance and emotional connection.`,
  
  5: `Steam Level 5 - "Scorching": Write fully explicit romantic scenes with no content restrictions. Be uninhibited with physical descriptions, explicit language, and raw passion. Focus on both physical and emotional intensity.`,
};

// ============================================================================
// SYSTEM PROMPTS BY TASK TYPE
// ============================================================================

const TASK_SYSTEM_PROMPTS: Record<string, string> = {
  'creative-drafting': `You are an expert romantasy author specializing in continuing manuscripts with seamless prose. 
Your writing is vivid, emotionally engaging, and maintains consistent voice and style.
Focus on: rich sensory details, emotional depth, character authenticity, and narrative momentum.
Continue the story naturally as if you were the original author.`,

  'steam-scene': `You are an expert romance author specializing in intimate scenes for the romantasy genre.
Your writing balances physical and emotional intimacy, using rich sensory language.
Focus on: emotional connection, chemistry, sensory details, building tension, and satisfying payoff.
Respect the requested steam level while maximizing reader engagement.`,

  'dialogue': `You are an expert dialogue writer for romantasy novels.
Your dialogue is natural, character-specific, and layered with subtext.
Focus on: distinct character voices, witty banter, emotional undercurrents, and romantic tension.
Every line should reveal character or advance the relationship.`,

  'scene-setting': `You are an expert at world-building and atmospheric description for romantasy novels.
Your prose creates immersive settings that enhance mood and emotion.
Focus on: sensory details, atmosphere, mood setting, and how the environment reflects characters' emotions.
Make the setting feel alive and relevant to the romantic storyline.`,

  'line-editing': `You are a professional editor specializing in romantasy prose enhancement.
Your goal is to polish writing while preserving the author's unique voice.
Focus on: sentence variety, stronger verbs, sensory details, tighter prose, and emotional impact.
Enhance without fundamentally changing the author's style.`,

  'show-dont-tell': `You are an expert at transforming "telling" into vivid "showing" for romantasy novels.
Your rewrites add emotional beats, physical reactions, and sensory details.
Focus on: body language, internal sensations, environmental details, and subtext.
Make readers feel the emotions rather than just understand them.`,

  'tension-boost': `You are an expert at amplifying romantic and dramatic tension in romantasy novels.
Your rewrites add subtext, longing, conflict, and anticipation.
Focus on: unspoken desires, obstacles, near-misses, and will-they-won't-they moments.
Make readers desperate for the characters to connect.`,

  'developmental-edit': `You are a professional developmental editor specializing in romantasy novels.
Provide constructive feedback on story structure and romantic arc.
Focus on: pacing, character development, romantic tension arc, plot coherence, and reader engagement.
Be specific, actionable, and encouraging.`,

  'voice-check': `You are an expert at analyzing character voice consistency in romantasy novels.
Evaluate dialogue and internal monologue for authenticity and distinctiveness.
Focus on: speech patterns, vocabulary choices, emotional expression, and POV consistency.
Identify where voices blur and suggest improvements.`,

  'trope-analysis': `You are an expert on romance tropes and reader expectations in the romantasy genre.
Analyze how tropes are being used and suggest enhancements.
Focus on: trope identification, execution quality, reader satisfaction, and subversion opportunities.
Help the author maximize romantic payoff.`,
};

// ============================================================================
// REQUEST TYPES
// ============================================================================

interface GenerateRequest {
  task: string;
  prompt: string;
  steamLevel?: number;
  voiceEnabled?: boolean;
  wordTarget?: number;
  model?: string;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse and validate request
    const body: GenerateRequest = await request.json();
    const { 
      task, 
      prompt, 
      steamLevel = 3, 
      voiceEnabled = true,
      wordTarget = 500,
      model = 'claude-opus'
    } = body;

    // Get model configuration - default to Claude Opus
    const modelConfig = MODEL_CONFIGS[model] || MODEL_CONFIGS['claude-opus'];

    // Validate required fields
    if (!task || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: task and prompt are required' },
        { status: 400 }
      );
    }

    // Check API configuration
    if (!VENICE_API_KEY) {
      console.error('Venice AI API key not configured');
      return NextResponse.json(
        { error: 'AI service not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Build system prompt
    const taskSystemPrompt = TASK_SYSTEM_PROMPTS[task] || TASK_SYSTEM_PROMPTS['creative-drafting'];
    const steamPrompt = STEAM_LEVEL_PROMPTS[steamLevel] || STEAM_LEVEL_PROMPTS[3];
    
    const systemPrompt = `${taskSystemPrompt}

${steamPrompt}

${voiceEnabled ? `
VOICE MATCHING: Analyze any provided context and match the author's established style including:
- Sentence structure patterns
- Vocabulary level and word choices
- Narrative techniques and POV depth
- Dialogue formatting preferences
- Paragraph length tendencies
` : ''}

TARGET LENGTH: Approximately ${wordTarget} words.
GENRE: Romantasy (Romance + Fantasy)

Respond ONLY with the requested content. Do not include explanations, meta-commentary, or formatting instructions unless specifically asked for feedback.`;

    // Call AI API based on model provider
    let response: Response;
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ];
    const temperature = task.includes('edit') || task.includes('analysis') || task.includes('check') ? 0.7 : modelConfig.temperature;

    switch (modelConfig.provider) {
      case 'anthropic':
        if (!ANTHROPIC_API_KEY) throw new Error('Anthropic API key not configured');
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: modelConfig.apiModel,
            max_tokens: Math.max(wordTarget * 2, modelConfig.maxTokens),
            system: systemPrompt,
            messages: [{ role: 'user', content: prompt }],
          }),
        });
        break;

      case 'openai':
        if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: modelConfig.apiModel,
            messages,
            max_tokens: Math.max(wordTarget * 2, modelConfig.maxTokens),
            temperature,
          }),
        });
        break;

      case 'gemini':
        if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured');
        const geminiMessages = messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : m.role,
          parts: [{ text: m.content }],
        }));
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelConfig.apiModel}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: geminiMessages.filter(m => m.role !== 'system'),
              systemInstruction: geminiMessages.find(m => m.role === 'system')?.parts[0],
              generationConfig: {
                maxOutputTokens: Math.max(wordTarget * 2, modelConfig.maxTokens),
                temperature,
              },
            }),
          }
        );
        break;

      case 'venice':
      default:
        if (!VENICE_API_KEY) throw new Error('Venice API key not configured');
        response = await fetch(`${VENICE_API_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${VENICE_API_KEY}`,
          },
          body: JSON.stringify({
            model: modelConfig.apiModel,
            messages,
            max_tokens: Math.max(wordTarget * 2, modelConfig.maxTokens),
            temperature,
            top_p: 0.95,
            frequency_penalty: 0.3,
            presence_penalty: 0.3,
          }),
        });
        break;
    }

    // Handle API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Venice AI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        model: VENICE_MODEL,
      });

      // Parse error for user-friendly message
      let userMessage = 'AI generation failed. Please try again.';
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.includes('model not found')) {
          userMessage = 'AI model configuration error. Please contact support.';
        } else if (errorJson.error?.includes('rate limit')) {
          userMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (errorJson.error?.includes('insufficient')) {
          userMessage = 'API quota exceeded. Please upgrade your plan.';
        }
      } catch {
        // Use default message
      }

      return NextResponse.json(
        { error: userMessage },
        { status: response.status >= 500 ? 502 : response.status }
      );
    }

    // Parse successful response based on provider
    const data = await response.json();
    let generatedText: string;

    if (modelConfig.provider === 'anthropic') {
      generatedText = data.content?.[0]?.text || '';
    } else if (modelConfig.provider === 'gemini') {
      generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      generatedText = data.choices?.[0]?.message?.content || '';
    }

    if (!generatedText) {
      console.error('Empty response from Venice AI:', data);
      return NextResponse.json(
        { error: 'AI returned empty response. Please try again.' },
        { status: 500 }
      );
    }

    // Calculate metrics
    const wordCount = generatedText.split(/\s+/).filter(Boolean).length;
    const processingTime = Date.now() - startTime;

    // Log successful generation (for analytics)
    console.log('AI Generation successful:', {
      task,
      steamLevel,
      wordCount,
      processingTime: `${processingTime}ms`,
      model: VENICE_MODEL,
    });

    // Return successful response
    return NextResponse.json({
      text: generatedText,
      wordCount,
      task,
      steamLevel,
      model: modelConfig.apiModel,
      provider: modelConfig.provider,
      processingTime,
      usage: data.usage,
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    // Log detailed error
    console.error('AI generation error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      processingTime: `${processingTime}ms`,
    });

    // Return user-friendly error
    return NextResponse.json(
      { 
        error: 'Failed to generate content. Please try again.',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : undefined,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS HANDLER (CORS)
// ============================================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
