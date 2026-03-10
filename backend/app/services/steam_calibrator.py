"""Steam calibration service – maps heat levels to writing instructions."""

from __future__ import annotations


class SteamCalibrator:
    """Provides heat-level-aware writing instructions for intimate scenes."""

    LEVEL_INSTRUCTIONS: dict[int, str] = {
        1: (
            "Closed Door: All intimate scenes fade to black. Focus on emotional "
            "tension, longing glances, and the anticipation of touch. Physical "
            "intimacy is implied but never shown. End scenes before anything "
            "explicit begins."
        ),
        2: (
            "Warm: Build-up and tension are described in detail. Use literary "
            "euphemisms and metaphor for physical encounters. Kissing and "
            "embracing can be shown. Fade to black before or during the act "
            "itself, but convey the emotional significance."
        ),
        3: (
            "Steamy: Full intimate scenes are included with direct but tasteful "
            "language. Describe sensations, emotions, and physical responses. "
            "Use anatomically accurate but not clinical terms. Balance heat "
            "with emotional connection. One to two detailed scenes per chapter "
            "maximum."
        ),
        4: (
            "Spicy: Detailed, extended intimate scenes with kink elements "
            "welcome. Use explicit but literary language. Explore power "
            "dynamics, multiple encounters, and creative scenarios. Maintain "
            "character voice and emotional depth throughout. Consent is "
            "always clear."
        ),
        5: (
            "Scorching: No restrictions within consent boundaries. Maximum "
            "explicitness with rich sensory detail. Extended scenes, multiple "
            "positions, creative scenarios, and kink exploration are encouraged. "
            "Language can be raw and visceral while maintaining literary quality. "
            "Every encounter should still serve the story and deepen character "
            "connection."
        ),
    }

    VOCABULARY_GUIDANCE: dict[int, str] = {
        1: (
            "Use no explicit terminology. Prefer: warmth, closeness, yearning, "
            "breath catching, pulse quickening, lips brushing."
        ),
        2: (
            "Mild sensual language allowed. Prefer euphemisms: his touch "
            "trailed fire, she melted against him, their bodies entwined. "
            "Avoid anatomical specifics."
        ),
        3: (
            "Direct but tasteful terms. Acceptable: breasts, hips, thighs, "
            "hardness, wetness, moan, gasp. Describe sensations vividly. "
            "Avoid crude or clinical terms."
        ),
        4: (
            "Explicit vocabulary encouraged. Use a mix of literary and direct "
            "terms. Anatomical words are fine. Include: desire, ache, thrust, "
            "stroke, climax. Character-appropriate dirty talk is welcome."
        ),
        5: (
            "Unrestricted vocabulary within literary quality. All anatomical "
            "and colloquial terms available. Visceral, raw language balanced "
            "with poetic passages. Character-voice-appropriate explicit "
            "dialogue strongly encouraged."
        ),
    }

    def get_steam_instructions(self, heat_level: int) -> str:
        """Return the writing instructions for the given heat level (1-5)."""
        level = max(1, min(5, heat_level))
        return self.LEVEL_INSTRUCTIONS[level]

    def get_vocabulary_guidance(self, heat_level: int) -> str:
        """Return vocabulary guidance for the given heat level (1-5)."""
        level = max(1, min(5, heat_level))
        return self.VOCABULARY_GUIDANCE[level]

    def get_full_instructions(self, heat_level: int) -> str:
        """Return combined instructions and vocabulary guidance."""
        return (
            f"{self.get_steam_instructions(heat_level)}\n\n"
            f"Vocabulary guidance: {self.get_vocabulary_guidance(heat_level)}"
        )
