# WorldBest Developer Quick Start Guide

**Welcome to the WorldBest Team!**

This guide will get you from zero to productive in under 30 minutes. Follow these steps in order to set up your development environment and start contributing.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Initial Setup](#2-initial-setup)
3. [Environment Configuration](#3-environment-configuration)
4. [Running the Application](#4-running-the-application)
5. [Project Structure Overview](#5-project-structure-overview)
6. [Technology Stack Reference](#6-technology-stack-reference)
7. [Development Workflow](#7-development-workflow)
8. [Common Tasks](#8-common-tasks)
9. [Troubleshooting](#9-troubleshooting)
10. [Additional Resources](#10-additional-resources)

---

## 1. Prerequisites

Before you begin, ensure you have the following installed on your machine:

### Required Tools

| Tool | Version | Download | Verification |
|------|---------|----------|--------------|
| Node.js | 18.x - 23.x | [nodejs.org](https://nodejs.org/) | `node --version` |
| pnpm | Latest | `npm install -g pnpm` | `pnpm --version` |
| Git | Latest | [git-scm.com](https://git-scm.com/) | `git --version` |

### Recommended Tools

| Tool | Purpose | Download |
|------|---------|----------|
| VS Code | Code editor | [code.visualstudio.com](https://code.visualstudio.com/) |
| Docker Desktop | Local services | [docker.com](https://www.docker.com/products/docker-desktop/) |
| Postman/Insomnia | API testing | [postman.com](https://www.postman.com/) |

### VS Code Extensions (Recommended)

Install these extensions for the best development experience:

```
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- GitLens
- Error Lens
- Auto Rename Tag
```

---

## 2. Initial Setup

### Step 1: Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/ReeseAstor/worldbest-deploy.git

# Or clone via SSH (if you have SSH keys configured)
git clone git@github.com:ReeseAstor/worldbest-deploy.git

# Navigate to the project directory
cd worldbest-deploy
```

### Step 2: Install Dependencies

```bash
# Install all project dependencies using pnpm
pnpm install
```

This will install:
- Main application dependencies
- Local packages (`packages/shared-types`, `packages/ui-components`)
- Development dependencies (TypeScript, ESLint, etc.)

### Step 3: Verify Installation

Run these commands to ensure everything is set up correctly:

```bash
# Check TypeScript compilation
pnpm type-check

# Check linting
pnpm lint
```

If both commands pass without errors, you're ready to proceed.

---

## 3. Environment Configuration

### Step 1: Create Local Environment File

```bash
# Copy the example environment file
cp .env.example .env.local
```

### Step 2: Understanding Environment Variables

The `.env.local` file contains all configuration needed for development. Here's what each section does:

#### Database (Supabase PostgreSQL)
```env
POSTGRES_URL="..."           # Main connection string (pooled)
POSTGRES_PRISMA_URL="..."    # For Prisma ORM (if used)
POSTGRES_URL_NON_POOLING="..." # Direct connection (for migrations)
```

#### Supabase Configuration
```env
SUPABASE_URL="..."           # Supabase project URL
SUPABASE_JWT_SECRET="..."    # JWT verification secret
SUPABASE_SERVICE_ROLE_KEY="..." # Server-side admin key (NEVER expose to frontend)
```

#### Public Variables (Frontend-safe)
```env
NEXT_PUBLIC_SUPABASE_URL="..."     # Public Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY="..." # Public anonymous key
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### Third-Party Services (Configure as needed)
```env
OPENAI_API_KEY=""            # For AI features
STRIPE_SECRET_KEY=""         # For payment processing
SENTRY_DSN=""               # For error tracking
```

### Step 3: Verify Supabase Connection

The default `.env.example` includes development credentials. For local development, these should work immediately. To verify:

1. Start the development server (next section)
2. Open the app in your browser
3. Check the browser console for any Supabase connection errors

---

## 4. Running the Application

### Start Development Server

```bash
pnpm dev
```

This starts the Next.js development server with:
- Hot Module Replacement (HMR)
- Fast Refresh
- TypeScript type checking

### Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Create production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint checks |
| `pnpm type-check` | Run TypeScript compiler checks |

### Development Server Features

- **Auto-refresh**: Changes automatically appear in the browser
- **Error overlay**: Compilation errors shown in the browser
- **API routes**: Available at `/api/*`
- **Hot reload**: State preserved on most file changes

---

## 5. Project Structure Overview

```
worldbest-deploy/
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── (auth)/              # Authentication pages (login, signup)
│   │   ├── api/                 # API route handlers
│   │   │   ├── auth/           # Auth endpoints
│   │   │   ├── chapters/       # Chapter CRUD endpoints
│   │   │   ├── projects/       # Project CRUD endpoints
│   │   │   └── health/         # Health check endpoint
│   │   ├── dashboard/           # Main dashboard
│   │   ├── projects/            # Project management pages
│   │   │   ├── [id]/write/     # Writing editor
│   │   │   └── new/            # Create new project
│   │   ├── characters/          # Character management
│   │   ├── settings/            # User settings
│   │   ├── analytics/           # Usage analytics
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Landing page
│   │   └── providers.tsx        # Client providers wrapper
│   │
│   ├── components/               # Reusable React components
│   │   ├── ui/                  # Base UI components (Button, Card, etc.)
│   │   ├── auth/                # Authentication components
│   │   ├── dashboard/           # Dashboard-specific components
│   │   ├── landing/             # Landing page components
│   │   └── websocket/           # WebSocket providers
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── queries/             # TanStack Query hooks
│   │   │   ├── use-projects.ts # Project data fetching
│   │   │   ├── use-chapters.ts # Chapter data fetching
│   │   │   ├── use-characters.ts # Character data fetching
│   │   │   ├── use-profile.ts  # User profile hooks
│   │   │   └── use-usage.ts    # Usage/subscription hooks
│   │   └── subscriptions/       # Real-time subscription hooks
│   │       ├── use-project-subscription.ts
│   │       └── use-chapter-subscription.ts
│   │
│   ├── lib/                      # Core libraries and utilities
│   │   ├── supabase/            # Supabase configuration
│   │   │   ├── client.ts       # Browser client
│   │   │   ├── server.ts       # Server client
│   │   │   ├── types.ts        # Database types
│   │   │   └── services/       # Service layer classes
│   │   │       ├── projects.ts
│   │   │       ├── characters.ts
│   │   │       ├── chapters.ts
│   │   │       ├── profiles.ts
│   │   │       └── usage.ts
│   │   ├── api/                 # Legacy API clients
│   │   └── utils.ts             # Utility functions
│   │
│   ├── stores/                   # Zustand state stores
│   │   └── ui-store.ts          # UI state (modals, toasts, theme)
│   │
│   ├── contexts/                 # React contexts
│   │   └── auth-context.tsx     # Authentication context
│   │
│   └── styles/                   # Global styles
│       └── globals.css          # Tailwind + custom CSS
│
├── packages/                     # Local packages (monorepo)
│   ├── shared-types/            # Shared TypeScript definitions
│   └── ui-components/           # Shared UI components
│
├── public/                       # Static assets
├── .env.example                  # Environment template
├── .env.local                    # Local environment (git-ignored)
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies and scripts
```

### Key Directories Explained

| Directory | Purpose |
|-----------|---------|
| `src/app/` | Pages and API routes (Next.js App Router) |
| `src/components/` | Reusable UI components |
| `src/hooks/` | Custom React hooks (data fetching, subscriptions) |
| `src/lib/supabase/` | Database services and Supabase configuration |
| `src/stores/` | Zustand state management |
| `packages/` | Shared code between packages (monorepo) |

---

## 6. Technology Stack Reference

### Frontend Framework
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript 5.3** - Type-safe JavaScript

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless accessible components
- **Lucide React** - Icon library

### State Management
- **Zustand** - Client-side state (UI, preferences)
- **TanStack Query** - Server state (data fetching, caching)

### Backend Services
- **Supabase** - PostgreSQL database + Auth + Realtime
- **Socket.IO** - WebSocket real-time communication

### Rich Text Editor
- **TipTap** - Extensible rich text editor based on ProseMirror

### Form Handling
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### Additional Libraries
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **date-fns** - Date manipulation

---

## 7. Development Workflow

### Branch Strategy

```bash
# Create a feature branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# For bug fixes
git checkout -b fix/bug-description

# For hotfixes
git checkout -b hotfix/critical-fix
```

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Feature
git commit -m "feat: add user profile editing"

# Bug fix
git commit -m "fix: resolve login redirect issue"

# Documentation
git commit -m "docs: update API documentation"

# Refactoring
git commit -m "refactor: simplify auth flow"

# Styling
git commit -m "style: format component files"

# Tests
git commit -m "test: add unit tests for auth hooks"
```

### Pull Request Process

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub

3. **PR Requirements**:
   - TypeScript compilation passes (`pnpm type-check`)
   - Linting passes (`pnpm lint`)
   - Build succeeds (`pnpm build`)
   - Describe your changes clearly
   - Request review from team lead

4. **After approval**, merge using "Squash and merge"

---

## 8. Common Tasks

### Adding a New Page

1. Create a new directory in `src/app/`
2. Add a `page.tsx` file:

```tsx
// src/app/my-new-page/page.tsx
export default function MyNewPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">My New Page</h1>
    </div>
  );
}
```

### Adding a New API Route

1. Create a new file in `src/app/api/`
2. Export HTTP method handlers:

```tsx
// src/app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello!' });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ received: body });
}
```

### Creating a New Hook

1. Add file in `src/hooks/queries/`
2. Follow existing patterns:

```tsx
// src/hooks/queries/use-my-data.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useMyData(id: string) {
  return useQuery({
    queryKey: ['my-data', id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('my_table')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
```

### Adding a New Component

1. Create component in appropriate `src/components/` subdirectory
2. Use TypeScript and follow patterns:

```tsx
// src/components/ui/my-component.tsx
interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

export function MyComponent({ title, onClick }: MyComponentProps) {
  return (
    <div 
      className="p-4 bg-white rounded-lg shadow"
      onClick={onClick}
    >
      <h2 className="text-lg font-medium">{title}</h2>
    </div>
  );
}
```

### Using Supabase Services

```tsx
// Import the service
import { projectService } from '@/lib/supabase/services/projects';

// In a server component or API route
const projects = await projectService.getAll(userId);
const project = await projectService.getById(projectId);
const newProject = await projectService.create(projectData);
```

---

## 9. Troubleshooting

### Common Issues and Solutions

#### "Module not found" errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm -rf .next
pnpm install
```

#### TypeScript errors on fresh clone

```bash
# Generate types
pnpm type-check

# If errors persist, restart your IDE
```

#### Supabase connection errors

1. Check `.env.local` exists
2. Verify environment variables are correct
3. Ensure Supabase project is active
4. Check browser console for detailed errors

#### Port 3000 already in use

```bash
# Find and kill the process (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
pnpm dev -- -p 3001
```

#### Build fails on Windows

```bash
# Clear cache and rebuild
rm -rf .next
pnpm build
```

#### Hot reload not working

1. Check for syntax errors in your code
2. Restart the dev server
3. Clear the `.next` cache folder

### Getting Help

1. **Check existing documentation**:
   - [README.md](./README.md) - Project overview
   - [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Detailed development roadmap
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions

2. **Search existing issues** on GitHub

3. **Ask the team** in your communication channel

4. **Create an issue** with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version)
   - Relevant error messages

---

## 10. Additional Resources

### Project Documentation

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Project overview and feature list |
| [EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md) | High-level project status and goals |
| [QUICK_START_CHECKLIST.md](./QUICK_START_CHECKLIST.md) | Sprint planning and task checklist |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Detailed development roadmap |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment guide |

### External Documentation

| Resource | URL |
|----------|-----|
| Next.js Docs | [nextjs.org/docs](https://nextjs.org/docs) |
| Supabase Docs | [supabase.com/docs](https://supabase.com/docs) |
| TanStack Query | [tanstack.com/query](https://tanstack.com/query) |
| Zustand | [zustand-demo.pmnd.rs](https://zustand-demo.pmnd.rs) |
| Tailwind CSS | [tailwindcss.com/docs](https://tailwindcss.com/docs) |
| Radix UI | [radix-ui.com/primitives](https://www.radix-ui.com/primitives) |
| TipTap Editor | [tiptap.dev/docs](https://tiptap.dev/docs/editor/introduction) |

### Service Dashboards

| Service | Dashboard URL |
|---------|---------------|
| Supabase | [supabase.com/dashboard](https://supabase.com/dashboard) |
| Vercel | [vercel.com/dashboard](https://vercel.com/dashboard) |
| Stripe | [dashboard.stripe.com](https://dashboard.stripe.com) |
| Sentry | [sentry.io](https://sentry.io) |

---

## Quick Reference Card

```
┌────────────────────────────────────────────────────────────────┐
│                    WorldBest Quick Reference                    │
├────────────────────────────────────────────────────────────────┤
│  SETUP                                                         │
│  ──────                                                        │
│  git clone https://github.com/ReeseAstor/worldbest-deploy.git │
│  cd worldbest-deploy                                           │
│  pnpm install                                                  │
│  cp .env.example .env.local                                    │
│  pnpm dev                                                      │
│                                                                │
│  COMMON COMMANDS                                               │
│  ───────────────                                               │
│  pnpm dev          → Start dev server                         │
│  pnpm build        → Production build                         │
│  pnpm type-check   → Check TypeScript                         │
│  pnpm lint         → Run linter                               │
│                                                                │
│  KEY DIRECTORIES                                               │
│  ───────────────                                               │
│  src/app/          → Pages & API routes                       │
│  src/components/   → React components                         │
│  src/hooks/        → Custom hooks                             │
│  src/lib/supabase/ → Database services                        │
│  src/stores/       → Zustand stores                           │
│                                                                │
│  URLs                                                          │
│  ────                                                          │
│  Local:      http://localhost:3000                             │
│  API:        http://localhost:3000/api/*                       │
│  Health:     http://localhost:3000/api/health                  │
└────────────────────────────────────────────────────────────────┘
```

---

## First Day Checklist

- [ ] Clone the repository
- [ ] Install dependencies (`pnpm install`)
- [ ] Create `.env.local` from `.env.example`
- [ ] Start development server (`pnpm dev`)
- [ ] Open http://localhost:3000 in browser
- [ ] Run type check (`pnpm type-check`)
- [ ] Explore the project structure
- [ ] Read the [README.md](./README.md)
- [ ] Review the [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
- [ ] Set up your IDE extensions
- [ ] Join the team communication channel

---

**You're all set!** Start exploring the codebase and don't hesitate to ask questions. Happy coding!

---

*Last Updated: March 2026*  
*Version: 1.0*
