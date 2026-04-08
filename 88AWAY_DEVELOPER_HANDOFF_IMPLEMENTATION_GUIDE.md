# 88away.app — Developer Handoff & Implementation Guide

This guide bridges the gap between architecture and implementation. It includes the exact prompt/CLI sequence for Claude Code (Anthropic CLI) and prompt configurations for Google AI Studio (Gemini) so the stack can be built quickly and consistently.

---

## Phase 1: Bootstrapping with Claude Code (CLI)

> Prerequisite: place `antigravity_app_blueprint.md` and `schema.prisma` in your project root.

### 1) Initialize Monorepo & Infrastructure

```bash
claude "Read antigravity_app_blueprint.md. Initialize a modern monorepo using Turborepo. Create a Next.js (App Router) app for the frontend and a FastAPI application for the backend. Configure TailwindCSS and shadcn/ui on the frontend. Do not write the business logic yet, just set up the strict architecture, linting, and wiring."
```

### 2) Generate Enterprise Data Schema

```bash
claude "Read the provided schema.prisma file. Set up Prisma ORM in the FastAPI backend using prisma-client-py. Configure the database connection string in a .env file. Generate the migration and apply it to a local PostgreSQL instance."
```

### 3) Build Stripe Webhook & Auth Gateways

```bash
claude "Read the webhooks.py file provided earlier. Implement the Stripe Metered Billing logic. Ensure the FastAPI endpoints for subscription checkout and the webhook handler (listening for 'invoice.paid' and 'customer.subscription.updated') are fully integrated and tested with the Prisma client."
```

### 4) Construct Anti-Detection Celery Pipeline

```bash
claude "Review Section 6 of the blueprint (Originality & Anti-Detection Pipeline). Set up a Celery worker with Redis. Write a Python task that takes a newly generated chapter, pings a mock Originality.ai API to get an AI-detection score, and checks Copyscape. If the AI score is > 20%, write the loop that sends the text back to the LLM API for an aggressive rewrite. Limit to 3 loops."
```

---

## Phase 2: LLM Orchestration with Google AI Studio

Claude Code handles platform engineering and integrations. Google AI Studio is used to iterate quickly on prompt behavior and schema correctness before porting into backend services.

### Module 2: “Micro-Tuner” (HITL Chapter Tuner)

Use this as a System Instruction in AI Studio:

```text
You are an elite fiction editor for 88away.app. You will receive a draft of Chapters 1-3. Your task is to rewrite the chapters based strictly on the user's selected upgrade path: [Action-Focused, Emotion-Focused, or Pacing-Focused].

Anti-Detection Constraints (CRITICAL):
- You must exhibit extreme burstiness: mix 2-to-3 word staccato sentences directly alongside complex, multi-clause sentences.
- Avoid all typical AI predictive phrasing.
- FORBIDDEN LEXICON: Do not use the words "tapestry, delve, testament, realm, multifaceted, symphony, embark, vital, intricate."
- Focus on visceral sensory details rather than summarizing emotions.
```

Recommended generation config:
- **Model:** Gemini 1.5 Pro
- **Temperature:** 0.7–0.85
- **Response schema:** Plain text (Markdown)

### Module 3: “Persistent Context Extractor” (Series Bible)

System instruction:

```text
You are an analytical narrative extraction engine. Read the provided manuscript text (Book One). Extract all surviving characters, key geographical locations, and established world-building rules. Output strictly as structured JSON mapping to the requested schema.
```

AI Studio JSON response schema:

```json
{
  "type": "OBJECT",
  "properties": {
    "characters": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "name": { "type": "STRING" },
          "traits": { "type": "STRING" },
          "unresolved_arc": { "type": "STRING" }
        }
      }
    },
    "locations": {
      "type": "ARRAY",
      "items": { "type": "STRING" }
    },
    "world_rules": {
      "type": "ARRAY",
      "items": { "type": "STRING" }
    }
  }
}
```

---

## Phase 3: Export to Production

After validating prompt quality and JSON reliability in AI Studio:

1. Click **Get Code** in AI Studio.
2. Select the **Python** tab.
3. Copy generated SDK snippet.
4. Pass snippet to Claude Code:

```bash
claude "Take this Gemini API Python snippet and integrate it into the FastAPI backend service for the Series Bible extraction endpoint. Ensure the JSON response is mapped to our Pinecone Vector DB insertion logic."
```

---

## Delivery Notes

This workflow intentionally separates concerns:
- **Claude Code** for full-stack implementation (repo scaffolding, backend services, Stripe, workers).
- **Google AI Studio** for iterative prompt tuning and schema validation.

Used together, this reduces implementation time while preserving production rigor.
