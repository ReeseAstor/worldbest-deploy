import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// API CONFIGURATION
// ============================================================================

const VENICE_API_KEY = process.env.VENICE_API_KEY;
const VENICE_API_URL = process.env.VENICE_API_URL || 'https://api.venice.ai/api/v1';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ============================================================================
// MODEL CONFIGURATIONS
// ============================================================================

interface ImageModelConfig {
  provider: 'venice' | 'openai';
  apiModel: string;
}

const IMAGE_MODEL_CONFIGS: Record<string, ImageModelConfig> = {
  'venice-flux': {
    provider: 'venice',
    apiModel: 'flux-pro',
  },
  'openai-dalle3': {
    provider: 'openai',
    apiModel: 'dall-e-3',
  },
};

// ============================================================================
// STYLE PROMPTS
// ============================================================================

const STYLE_PROMPTS: Record<string, string> = {
  'Realistic': 'photorealistic, highly detailed, professional photography',
  'Artistic': 'artistic, painterly, beautiful composition, fine art',
  'Fantasy': 'fantasy art style, magical atmosphere, ethereal lighting, romantasy aesthetic',
  'Romantic': 'romantic atmosphere, soft lighting, dreamy, emotional',
  'Vivid': 'vivid colors, high contrast, dramatic lighting',
  'Natural': 'natural lighting, realistic colors, authentic',
};

// ============================================================================
// REQUEST TYPES
// ============================================================================

interface ImageRequest {
  prompt: string;
  model: string;
  style: string;
  size: string;
}

// ============================================================================
// API HANDLERS
// ============================================================================

async function generateWithVenice(prompt: string, style: string, size: string) {
  if (!VENICE_API_KEY) throw new Error('Venice API key not configured');

  const enhancedPrompt = `${prompt}. ${STYLE_PROMPTS[style] || STYLE_PROMPTS['Fantasy']}`;

  const response = await fetch(`${VENICE_API_URL}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${VENICE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'flux-pro',
      prompt: enhancedPrompt,
      n: 1,
      size: size,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Venice Image API error:', error);
    throw new Error('Venice image generation failed');
  }

  const data = await response.json();
  return data.data?.[0]?.url || data.data?.[0]?.b64_json;
}

async function generateWithOpenAI(prompt: string, style: string, size: string) {
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');

  const enhancedPrompt = `${prompt}. ${STYLE_PROMPTS[style] || STYLE_PROMPTS['Fantasy']}`;

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      n: 1,
      size: size,
      quality: 'standard',
      style: style === 'Vivid' ? 'vivid' : 'natural',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI Image API error:', error);
    throw new Error('OpenAI image generation failed');
  }

  const data = await response.json();
  return data.data?.[0]?.url;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: ImageRequest = await request.json();
    const { prompt, model, style, size } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const config = IMAGE_MODEL_CONFIGS[model] || IMAGE_MODEL_CONFIGS['venice-flux'];
    let imageUrl: string;

    switch (config.provider) {
      case 'venice':
        imageUrl = await generateWithVenice(prompt, style, size);
        break;
      case 'openai':
        imageUrl = await generateWithOpenAI(prompt, style, size);
        break;
      default:
        imageUrl = await generateWithVenice(prompt, style, size);
    }

    return NextResponse.json({
      url: imageUrl,
      prompt,
      model,
      style,
      size,
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Image generation failed' },
      { status: 500 }
    );
  }
}
