#!/bin/bash

# Deployment Validation Script
# This script validates the deployment configuration and infrastructure

set -e

echo "🔍 Starting deployment validation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print success
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Check Node.js version
echo ""
echo "📋 Checking prerequisites..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    success "Node.js version: $(node -v)"
else
    error "Node.js version must be >= 18 (current: $(node -v))"
    exit 1
fi

# 2. Check pnpm installation
if command -v pnpm &> /dev/null; then
    success "pnpm installed: $(pnpm -v)"
else
    error "pnpm is not installed. Run: npm install -g pnpm"
    exit 1
fi

# 3. Check required files
echo ""
echo "📁 Checking required files..."
REQUIRED_FILES=(
    "package.json"
    "next.config.js"
    "Dockerfile"
    "vercel.json"
    ".env.example"
    "src/app/layout.tsx"
    "src/app/api/health/route.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        success "$file exists"
    else
        error "$file is missing"
        exit 1
    fi
done

# 4. Check Docker configuration
echo ""
echo "🐳 Validating Docker configuration..."
if grep -q "apps/web" Dockerfile; then
    error "Dockerfile still contains incorrect 'apps/web' paths"
    exit 1
else
    success "Dockerfile paths are correct"
fi

if grep -q "output: 'standalone'" next.config.js; then
    success "Next.js standalone mode is enabled"
else
    warning "Next.js standalone mode is not enabled in next.config.js"
fi

# 5. Check environment variables
echo ""
echo "🔐 Checking environment configuration..."
if [ -f ".env.local" ]; then
    success ".env.local exists"
    
    # Check critical variables
    REQUIRED_VARS=(
        "POSTGRES_URL"
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^$var=" .env.local; then
            success "$var is configured"
        else
            warning "$var is not set in .env.local"
        fi
    done
else
    warning ".env.local does not exist. Copy from .env.example"
fi

# 6. Install dependencies
echo ""
echo "📦 Installing dependencies..."
if pnpm install --frozen-lockfile; then
    success "Dependencies installed successfully"
else
    error "Failed to install dependencies"
    exit 1
fi

# 7. Run type check
echo ""
echo "🔧 Running TypeScript type check..."
if pnpm type-check; then
    success "TypeScript type check passed"
else
    error "TypeScript type check failed"
    exit 1
fi

# 8. Run linter
echo ""
echo "🧹 Running ESLint..."
if pnpm lint; then
    success "ESLint passed"
else
    warning "ESLint found issues (non-blocking)"
fi

# 9. Build application
echo ""
echo "🏗️  Building application..."
if pnpm build; then
    success "Application built successfully"
else
    error "Build failed"
    exit 1
fi

# 10. Check build output
echo ""
echo "📊 Checking build output..."
if [ -d ".next/standalone" ]; then
    success "Standalone build output created"
else
    warning "Standalone build output not found"
fi

if [ -d ".next/static" ]; then
    success "Static assets generated"
else
    error "Static assets not found"
    exit 1
fi

# 11. Verify bundle size
echo ""
echo "📏 Checking bundle size..."
BUNDLE_SIZE=$(du -sh .next/static | awk '{print $1}')
success "Bundle size: $BUNDLE_SIZE"

# 12. Docker build test (optional)
echo ""
echo "🐋 Docker build test..."
if command -v docker &> /dev/null; then
    if docker build -t worldbest-test:latest . > /dev/null 2>&1; then
        success "Docker image built successfully"
        docker rmi worldbest-test:latest > /dev/null 2>&1
    else
        warning "Docker build test skipped or failed"
    fi
else
    warning "Docker not installed, skipping Docker build test"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✨ Deployment validation completed successfully!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  1. Commit your changes: git add . && git commit -m 'Deploy: Infrastructure fixes'"
echo "  2. Push to deploy:"
echo "     - Preview: git push origin <your-branch>"
echo "     - Staging: git push origin develop"
echo "     - Production: git push origin main"
echo ""
echo "  3. Monitor deployment:"
echo "     - Vercel Dashboard: https://vercel.com/dashboard"
echo "     - Health Check: https://your-domain.vercel.app/api/health"
echo ""
