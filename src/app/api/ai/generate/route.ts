import { NextRequest, NextResponse } from 'next/server';

const VENICE_API_KEY = process.env.VENICE_API_KEY;
const VENICE_API_URL = process.env.VENICE_API_URL || 'https://api.venice.ai/api/v1';
const VENICE_MODEL = process.env.VENICE_MODEL || 'glm-4.7-flash-heretic';

// Steam level descriptions for prompts
const STEAM_LEVELS: Record<number, string> = {
  1: 'Keep the scene "closed door" - fade to black before any explicit content. Focus on emotional tension and anticipation.',
  2: 'Write a "warm" scene with kissing and light touching, but no explicit content. Focus on building chemistry.',
  3: 'Write a "steamy" scene with passionate kissing, some clothing removal, and sensual touching. Suggestive but not explicit.',
  4: 'Write a "spicy" scene with explicit romantic content. Include physical descriptions and sensory details.',
  5: 'Write a "scorching" fully explicit romantic scene. Be uninhibited with physical descriptions and explicit language.',
};

export async function POST(request: NextRequest) {
  try {
    const { task, prompt, steamLevel = 3, voiceEnabled } = await request.json();

    if (!VENICE_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Build the system prompt based on task and settings
    const steamDescription = STEAM_LEVELS[steamLevel] || STEAM_LEVELS[3];
    
    const systemPrompt = `You are a skilled romantasy author helping to write compelling romantic fiction. 
You specialize in the romantasy genre - romance with fantasy elements.
Your writing should be vivid, emotionally engaging, and capture the reader's attention.

Steam Level Guidelines: ${steamDescription}

${voiceEnabled ? 'Match the author\'s established voice and style. Use similar sentence structures, vocabulary level, and narrative techniques.' : ''}

Be creative, engaging, and appropriate for the requested steam level.`;

    // Call Venice AI API
    const response = await fetch(`${VENICE_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VENICE_API_KEY}`,
      },
      body: JSON.stringify({
        model: VENICE_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Venice AI error:', errorData);
      return NextResponse.json(
        { error: 'AI generation failed' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || '';
    
    // Count words
    const wordCount = generatedText.split(/\s+/).filter(Boolean).length;

    return NextResponse.json({
      text: generatedText,
      wordCount,
      task,
      model: VENICE_MODEL,
    });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
