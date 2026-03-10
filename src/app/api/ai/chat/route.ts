import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// API CONFIGURATION
// ============================================================================

const VENICE_API_KEY = process.env.VENICE_API_KEY;
const VENICE_API_URL = process.env.VENICE_API_URL || 'https://api.venice.ai/api/v1';
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
    apiModel: process.env.VENICE_MODEL || 'olafangensan-glm-4.7-flash-heretic',
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
// STEAM LEVEL SYSTEM PROMPTS
// ============================================================================

const STEAM_PROMPTS: Record<number, string> = {
  1: 'Content Guidelines: "Closed Door" - Fade to black before explicit content. Focus on emotional intimacy.',
  2: 'Content Guidelines: "Warm" - Sweet romance with kissing and light touching only.',
  3: 'Content Guidelines: "Steamy" - Sensual scenes allowed, suggestive but not explicit.',
  4: 'Content Guidelines: "Spicy" - Explicit romantic content with tasteful detail.',
  5: 'Content Guidelines: "Scorching" - Fully explicit romantic content, no restrictions.',
};

// ============================================================================
// BASE SYSTEM PROMPT
// ============================================================================

const BASE_SYSTEM_PROMPT = `You are an expert romantasy author assistant. You help writers create compelling romantic fantasy fiction.

Your capabilities include:
- Creative writing and manuscript continuation
- Character development and dialogue
- Plot structure and pacing advice
- Romance trope execution
- World-building for fantasy settings
- Line editing and prose enhancement

Always maintain the author's voice when continuing their work. Be creative, engaging, and supportive.`;

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  model: string;
  steamLevel?: number;
  voiceEnabled?: boolean;
}

// ============================================================================
// API HANDLERS
// ============================================================================

async function callVeniceAPI(messages: Array<{ role: string; content: string }>, config: ModelConfig) {
  if (!VENICE_API_KEY) throw new Error('Venice API key not configured');

  const response = await fetch(`${VENICE_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${VENICE_API_KEY}`,
    },
    body: JSON.stringify({
      model: config.apiModel,
      messages,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Venice API error:', error);
    throw new Error('Venice API call failed');
  }

  const data = await response.json();
  return {
    text: data.choices?.[0]?.message?.content || '',
    tokens: data.usage?.total_tokens || 0,
  };
}

async function callOpenAIAPI(messages: Array<{ role: string; content: string }>, config: ModelConfig) {
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: config.apiModel,
      messages,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error('OpenAI API call failed');
  }

  const data = await response.json();
  return {
    text: data.choices?.[0]?.message?.content || '',
    tokens: data.usage?.total_tokens || 0,
  };
}

async function callGeminiAPI(messages: Array<{ role: string; content: string }>, config: ModelConfig) {
  if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured');

  // Convert messages to Gemini format
  const geminiMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : m.role,
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.apiModel}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: geminiMessages.filter(m => m.role !== 'system'),
        systemInstruction: geminiMessages.find(m => m.role === 'system')?.parts[0],
        generationConfig: {
          maxOutputTokens: config.maxTokens,
          temperature: config.temperature,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Gemini API error:', error);
    throw new Error('Gemini API call failed');
  }

  const data = await response.json();
  return {
    text: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    tokens: data.usageMetadata?.totalTokenCount || 0,
  };
}

async function callAnthropicAPI(messages: Array<{ role: string; content: string }>, config: ModelConfig) {
  if (!ANTHROPIC_API_KEY) throw new Error('Anthropic API key not configured');

  // Separate system message from conversation
  const systemMessage = messages.find(m => m.role === 'system');
  const conversationMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.apiModel,
      max_tokens: config.maxTokens,
      system: systemMessage?.content || '',
      messages: conversationMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Anthropic API error:', error);
    throw new Error('Anthropic API call failed');
  }

  const data = await response.json();
  return {
    text: data.content?.[0]?.text || '',
    tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
  };
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, model, steamLevel = 3, voiceEnabled = true } = body;

    // Get model configuration - default to Claude Opus
    const config = MODEL_CONFIGS[model] || MODEL_CONFIGS['claude-opus'];

    // Build system prompt
    const systemPrompt = `${BASE_SYSTEM_PROMPT}

${STEAM_PROMPTS[steamLevel]}

${voiceEnabled ? 'IMPORTANT: Match the author\'s writing style based on any provided context.' : ''}`;

    // Prepare messages with system prompt
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    // Call appropriate API
    let result;
    switch (config.provider) {
      case 'anthropic':
        result = await callAnthropicAPI(apiMessages, config);
        break;
      case 'venice':
        result = await callVeniceAPI(apiMessages, config);
        break;
      case 'openai':
        result = await callOpenAIAPI(apiMessages, config);
        break;
      case 'gemini':
        result = await callGeminiAPI(apiMessages, config);
        break;
      default:
        result = await callAnthropicAPI(apiMessages, config);
    }

    return NextResponse.json({
      text: result.text,
      tokens: result.tokens,
      model: model,
      provider: config.provider,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Chat failed' },
      { status: 500 }
    );
  }
}
