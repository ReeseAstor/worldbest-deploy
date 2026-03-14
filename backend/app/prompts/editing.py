"""Prompt templates for line editing analysis."""

LINE_EDIT_SYSTEM_PROMPT = """\
You are Ember in Editor mode, a professional fiction editor specialising in \
romantasy (romantic fantasy). Analyze the provided text and return \
suggestions as a JSON array.

Each suggestion object must have:
- "original": the exact text span to change (quote it precisely)
- "suggestion": the improved replacement text
- "explanation": a brief, encouraging explanation of why this improves the prose

Return ONLY a JSON array. No other text, no markdown fences.
"""

# ── Per-edit-type prompts ────────────────────────────────────────────────

EDIT_TYPE_PROMPTS: dict[str, str] = {
    "filter_words": """\
Identify **filter words** in the following text. Filter words are words \
that create unnecessary distance between the reader and the POV character's \
experience. Common filter words include: felt, saw, heard, noticed, \
realized, seemed, wondered, thought, knew, watched, looked, decided.

For each instance, provide the original text containing the filter word \
and a rewritten version that removes the filter and puts the reader \
directly in the character's experience.

Example:
- Original: "She felt the cold wind bite her cheeks."
- Suggestion: "The cold wind bit her cheeks."
- Explanation: "Removing 'felt' puts the reader directly in the sensation."

Text to analyze:
{text}
""",

    "show_dont_tell": """\
Identify instances of **telling instead of showing** in the following text. \
Look for:
- Emotion labels ("she was angry", "he felt sad")
- State declarations ("the room was beautiful")
- Summary of action that could be dramatised
- Adverbs doing the work that action/dialogue should do

For each instance, provide the original telling passage and a rewritten \
version that shows through action, dialogue, sensation, or specific detail.

Text to analyze:
{text}
""",

    "dialogue_tags": """\
Analyze the **dialogue tags** in the following text. Look for:
- Overuse of "said" alternatives (hissed, growled, exclaimed, etc.)
- Missing action beats between dialogue lines
- Talking head syndrome (long exchanges with no grounding)
- Tom Swifties or adverb-heavy tags ("she said angrily")

Suggest improvements that use action beats, vary the rhythm, and keep \
the reader grounded in the scene.

Text to analyze:
{text}
""",

    "pov_consistency": """\
Check the following text for **POV (point of view) consistency**. Look for:
- Head-hopping: describing what other characters think/feel when in limited POV
- Breaking limited POV by describing things the POV character cannot perceive
- Inconsistent narrative distance (switching between close and distant)
- Tense shifts (past to present or vice versa)

For each violation, explain the issue and provide a corrected version \
that maintains consistent POV.

Text to analyze:
{text}
""",

    "pacing": """\
Analyze the **pacing** of the following text. Look for:
- Passages that drag or feel repetitive
- Action scenes that are too slow or cluttered with description
- Emotional beats that are rushed and need more space
- Paragraphs that could be broken up for better rhythm
- Sections where sentence length variety would improve flow

Suggest specific changes to improve the pacing and rhythm.

Text to analyze:
{text}
""",

    "prose_rhythm": """\
Analyze the **prose rhythm** of the following text. Look for:
- Monotonous sentence length (all long or all short)
- Awkward cadence when read aloud
- Overuse of particular sentence structures
- Opportunities for sentence fragments for emphasis
- Places where a longer, flowing sentence would create atmosphere

Suggest specific rewrites that improve the musical quality of the prose.

Text to analyze:
{text}
""",
}
