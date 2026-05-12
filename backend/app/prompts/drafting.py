"""Prompt templates for drafting slash commands."""

# Each template receives {context} and {parameters} via .format()

SLASH_COMMAND_TEMPLATES: dict[str, str] = {
    # ── /draft ────────────────────────────────────────────────────────
    "draft": """\
Continue drafting the next section of prose. Pick up exactly where the \
text left off and write 300-500 words of new content that advances the scene.

Existing text / context:
{context}

Additional parameters: {parameters}

Continue writing from where the text ends. Do not repeat any existing text. \
Maintain the established POV, tense, and voice.
""",

    # ── /scene ────────────────────────────────────────────────────────
    "scene": """\
Write a complete scene based on the following context and direction.

Context:
{context}

Parameters: {parameters}

Write a full scene (500-1000 words) with:
- A clear opening that establishes setting and mood
- Rising tension or emotional stakes
- Vivid sensory details
- Character-revealing dialogue or action
- A scene-ending hook or emotional beat

Maintain consistency with all story bible elements.
""",

    # ── /dialogue ─────────────────────────────────────────────────────
    "dialogue": """\
Write a dialogue exchange between characters based on the following context.

Context:
{context}

Parameters: {parameters}

Guidelines:
- Each character should have a distinct voice and speech pattern.
- Include beats (action/thought between dialogue lines).
- Dialogue should reveal character, advance plot, or build tension.
- Avoid excessive dialogue tags; use action beats instead.
- Vary the rhythm: short punchy exchanges mixed with longer speeches.
""",

    # ── /steam ────────────────────────────────────────────────────────
    "steam": """\
Write an intimate/romantic scene based on the following context. \
Follow the steam/heat level instructions provided in the system prompt precisely.

Context:
{context}

Parameters: {parameters}

Guidelines:
- Build anticipation and emotional tension before physical contact.
- Ground the scene in emotion, not just physical description.
- Use all five senses.
- Maintain character voice and personality throughout.
- Ensure consent is clear and organic to the scene.
- End the scene with emotional resonance, not just physical resolution.
""",

    # ── /describe ─────────────────────────────────────────────────────
    "describe": """\
Write a vivid description passage based on the following context.

Context:
{context}

Parameters: {parameters}

Guidelines:
- Use all five senses, not just visual.
- Weave character reaction and emotion into the description.
- Match the mood and atmosphere of the scene.
- Avoid purple prose; be vivid but purposeful.
- Every detail should serve characterisation, mood, or foreshadowing.
- Vary sentence structure for rhythm and pacing.
""",

    # ── /brainstorm ───────────────────────────────────────────────────
    "brainstorm": """\
Help me brainstorm ideas for the following:

Context:
{context}

Parameters: {parameters}

Provide 5-7 diverse ideas ranging from safe/expected to bold/surprising. \
For each idea:
1. A brief title or label
2. A 2-3 sentence description of how it would play out
3. How it connects to existing story elements
4. Potential complications or interesting consequences

Consider trope expectations and how to either satisfy or subvert them.
""",

    # ── /expand ───────────────────────────────────────────────────────
    "expand": """\
Expand the following passage with more detail, sensory information, \
and emotional depth. Keep the same events and meaning but enrich the prose.

Text to expand:
{context}

Parameters: {parameters}

Guidelines:
- Add sensory details (sight, sound, smell, touch, taste)
- Deepen internal character experience
- Strengthen the emotional beats
- Show rather than tell where possible
- Roughly double the word count of the original
""",

    # ── /summarize ────────────────────────────────────────────────────
    "summarize": """\
Create a concise summary of the following text for story bible reference.

Text to summarize:
{context}

Parameters: {parameters}

Provide:
1. A 1-2 sentence plot summary
2. Key character moments or revelations
3. Important world-building details introduced
4. Unresolved threads or foreshadowing
5. Emotional arc of the passage
""",
}
