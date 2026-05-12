"""Voice analysis prompt template."""

VOICE_ANALYSIS_PROMPT = """\
Analyze the following writing samples and produce a detailed voice fingerprint.

## Writing Samples

{samples}

## Analysis Instructions

Examine these samples carefully and produce a JSON object with the following keys:

{{
  "sentence_structure": "Description of typical sentence patterns (e.g., 'Complex \
compound sentences with embedded clauses' or 'Short, punchy declarations mixed with \
flowing descriptive passages')",

  "vocabulary_level": "One of: simple, moderate, advanced, literary. With brief \
explanation.",

  "tone": "Description of the overall tone (e.g., 'warm and conversational with \
undercurrents of dark humor')",

  "pacing": "One of: slow, moderate, fast, varied. With brief explanation of how \
pacing is achieved.",

  "dialogue_style": "Description of how the author writes dialogue (e.g., \
'Snappy and subtext-heavy, rarely says what they mean')",

  "description_style": "How settings and characters are described (e.g., 'Lush \
sensory detail focused on texture and scent')",

  "distinctive_patterns": "Any unique quirks, habits, or signature moves (e.g., \
'Frequently uses one-word paragraphs for emphasis, favors em-dashes over commas')",

  "pov_tendency": "One of: first, third-close, third-omniscient, mixed. With notes.",

  "emotional_range": "How emotions are conveyed (e.g., 'Through physical sensation \
and internal monologue rather than naming emotions directly')",

  "paragraph_length": "Typical paragraph length tendency (e.g., 'Short paragraphs \
of 2-3 sentences with occasional long flowing paragraphs for emotional peaks')",

  "figurative_language": "Use of metaphor, simile, personification (e.g., 'Heavy \
use of nature metaphors, sparing with simile, frequent personification of emotions')",

  "strengths": ["List", "of", "notable", "strengths"],

  "areas_for_development": ["List", "of", "areas", "that could be strengthened"]
}}

Return ONLY the JSON object. No additional commentary.
"""
