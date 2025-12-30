#!/bin/bash
set -e

# Pokemon TCG Forum - Automated Deployment Script
# This script automates the deployment process as much as possible

echo "🚀 Pokemon TCG Forum - Production Deployment"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${BLUE}Step 1: Running Tests${NC}"
echo "Running all tests to ensure everything works..."
npm test
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Tests failed! Please fix failing tests before deploying.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""

echo -e "${BLUE}Step 2: Building for Production${NC}"
echo "Creating production build..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed! Please fix build errors before deploying.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Production build successful!${NC}"
echo ""

echo -e "${BLUE}Step 3: Checking Git Status${NC}"
git_status=$(git status --porcelain)
if [ -n "$git_status" ]; then
    echo -e "${YELLOW}You have uncommitted changes:${NC}"
    git status --short
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Production deployment: Build and security improvements

- Fixed Turbopack build hang
- Added dynamic rendering to admin routes
- Implemented comprehensive security headers
- Created health check endpoint
- Added production documentation
- All 163 tests passing

🤖 Generated with Claude Code
https://claude.com/claude-code"
        echo -e "${GREEN}✅ Changes committed!${NC}"
    fi
else
    echo -e "${GREEN}✅ Working directory clean${NC}"
fi
echo ""

echo -e "${YELLOW}⚠️  CRITICAL SECURITY STEPS REQUIRED${NC}"
echo "=============================================="
echo ""
echo "The following steps REQUIRE your manual action:"
echo ""
echo -e "${RED}1. ROTATE SUPABASE SERVICE ROLE KEY${NC}"
echo "   Your service role key was exposed in git and MUST be changed:"
echo "   → Go to: https://supabase.com/dashboard"
echo "   → Select your project → Settings → API"
echo "   → Click 'Reset' next to Service Role Key"
echo "   → Copy the new key (you won't see it again!)"
echo ""
echo -e "${RED}2. CLEAN GIT HISTORY (OPTIONAL BUT RECOMMENDED)${NC}"
echo "   To remove secrets from git history, run:"
echo "   → git filter-branch --force --index-filter \\"
echo "     'git rm --cached --ignore-unmatch .env.local .env.production .env.production.local' \\"
echo "     --prune-empty --tag-name-filter cat -- --all"
echo "   → git push origin --force --all"
echo ""
echo -e "${YELLOW}⚠️  WARNING: This rewrites git history. Coordinate with your team!${NC}"
echo ""
echo -e "${RED}3. CONFIGURE VERCEL ENVIRONMENT VARIABLES${NC}"
echo "   In Vercel Dashboard → Settings → Environment Variables, add:"
echo "   → NEXT_PUBLIC_SUPABASE_URL (all environments)"
echo "   → NEXT_PUBLIC_SUPABASE_ANON_KEY (all environments)"
echo "   → SUPABASE_SERVICE_ROLE_KEY (production only - use NEW rotated key!)"
echo "   → NEXT_PUBLIC_SITE_URL (production: https://your-domain.com)"
echo ""
echo ""

echo -e "${BLUE}Deployment Options:${NC}"
echo "===================="
echo ""
echo "Choose your deployment method:"
echo ""
echo "A) Deploy with Vercel CLI (recommended)"
echo "   Run: npm i -g vercel && vercel --prod"
echo ""
echo "B) Deploy via GitHub + Vercel"
echo "   1. Push to GitHub: git push origin main"
echo "   2. Go to: https://vercel.com/new"
echo "   3. Import your repository"
echo "   4. Configure environment variables (see above)"
echo "   5. Click 'Deploy'"
echo ""
echo "C) Manual verification only"
echo "   Just verify the build works, deploy later"
echo ""
read -p "Enter your choice (A/B/C): " -n 1 -r
echo ""

case $REPLY in
    [Aa])
        echo ""
        echo -e "${BLUE}Installing Vercel CLI...${NC}"
        if ! command -v vercel &> /dev/null; then
            npm i -g vercel
        else
            echo -e "${GREEN}✅ Vercel CLI already installed${NC}"
        fi
        echo ""
        echo -e "${YELLOW}⚠️  Before deploying, make sure you've:${NC}"
        echo "   1. Rotated the Supabase service role key"
        echo "   2. Configured environment variables in Vercel dashboard"
        echo ""
        read -p "Have you completed these steps? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo ""
            echo -e "${GREEN}🚀 Deploying to production...${NC}"
            vercel --prod
        else
            echo ""
            echo -e "${YELLOW}Please complete the security steps first, then run:${NC}"
            echo "   vercel --prod"
        fi
        ;;
    [Bb])
        echo ""
        echo -e "${GREEN}Pushing to GitHub...${NC}"
        git push origin main
        echo ""
        echo -e "${BLUE}Next steps:${NC}"
        echo "1. Go to https://vercel.com/new"
        echo "2. Import your GitHub repository"
        echo "3. Configure environment variables (see above)"
        echo "4. Click 'Deploy'"
        echo ""
        echo -e "${YELLOW}Remember to use the NEW rotated service role key!${NC}"
        ;;
    [Cc])
        echo ""
        echo -e "${GREEN}✅ Build verified successfully!${NC}"
        echo ""
        echo "When you're ready to deploy, you can:"
        echo "1. Run this script again and choose option A or B"
        echo "2. Or manually run: vercel --prod"
        ;;
    *)
        echo ""
        echo -e "${YELLOW}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}=============================================="
echo "🎉 Deployment Process Complete!"
echo "=============================================="${NC}
echo ""
echo "Post-deployment checklist:"
echo "✓ Verify health check: curl https://your-domain.com/api/health"
echo "✓ Test admin login: https://your-domain.com/admin"
echo "✓ Check security headers: curl -I https://your-domain.com"
echo ""
echo "📚 Documentation:"
echo "   → README.md - Setup and usage guide"
echo "   → PRODUCTION_CHECKLIST.md - Detailed deployment guide"
echo "   → SECURITY_WARNING.md - Security best practices"
echo ""
echo -e "${GREEN}Happy deploying! 🚀${NC}"
