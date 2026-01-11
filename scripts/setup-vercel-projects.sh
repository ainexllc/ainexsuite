#!/usr/bin/env bash
# AinexSuite Vercel Projects Setup Script
# This script creates Vercel projects for all apps in the monorepo

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}AinexSuite Vercel Projects Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if vercel CLI is installed and authenticated
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Error: Vercel CLI not found. Please install it:${NC}"
    echo "npm install -g vercel"
    exit 1
fi

# Check authentication
echo -e "${YELLOW}Checking Vercel authentication...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with Vercel. Please run:${NC}"
    echo "vercel login"
    exit 1
fi

echo -e "${GREEN}✓ Authenticated as: $(vercel whoami)${NC}\n"

# Project definitions - all apps in the monorepo
APPS="main notes journal todo health album habits mosaic fit projects flow subs docs tables calendar admin"

# Function to create or link project
create_or_link_project() {
    local app_name=$1
    local app_dir="apps/${app_name}"
    local project_name="ainexsuite-${app_name}"

    echo -e "${BLUE}Processing: ${app_name}${NC}"

    if [ ! -d "$app_dir" ]; then
        echo -e "${RED}  ✗ Directory not found: ${app_dir}${NC}"
        return 1
    fi

    cd "$app_dir"

    # Check if already linked
    if [ -f ".vercel/project.json" ]; then
        local existing_project=$(cat .vercel/project.json | grep -o '"projectName":"[^"]*"' | cut -d'"' -f4)
        echo -e "${YELLOW}  ℹ Already linked to: ${existing_project}${NC}"
    else
        echo -e "${YELLOW}  → Linking to Vercel project...${NC}"
        # This will create a new project if it doesn't exist
        vercel link --yes --project "$project_name" 2>&1 | grep -v "Warning" || true
        echo -e "${GREEN}  ✓ Linked to: ${project_name}${NC}"
    fi

    cd ../..
}

# Function to add environment variables (you'll need to do this manually or via API)
show_env_vars() {
    local app_name=$1
    echo -e "${BLUE}Environment Variables for ${app_name}:${NC}"
    echo -e "${YELLOW}  You'll need to add these in the Vercel dashboard:${NC}"
    echo "  - NEXT_PUBLIC_APP_NAME=${app_name}"
    echo "  - NEXT_PUBLIC_MAIN_DOMAIN=www.ainexspace.com"
    echo "  - NEXT_PUBLIC_FIREBASE_API_KEY=<your-api-key>"
    echo "  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=alnexsuite.firebaseapp.com"
    echo "  - NEXT_PUBLIC_FIREBASE_PROJECT_ID=alnexsuite"
    echo "  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=alnexsuite.firebasestorage.app"
    echo "  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1062785888767"
    echo "  - NEXT_PUBLIC_FIREBASE_APP_ID=1:1062785888767:web:9e29360b8b12e9723a77ca"
    echo "  - FIREBASE_ADMIN_PROJECT_ID=alnexsuite (SECRET)"
    echo "  - FIREBASE_ADMIN_CLIENT_EMAIL=<from-firebase-console> (SECRET)"
    echo "  - FIREBASE_ADMIN_PRIVATE_KEY=<from-firebase-console> (SECRET)"
    echo ""
}

# Main execution
echo -e "${YELLOW}This script will link all apps to Vercel projects.${NC}"
echo -e "${YELLOW}Note: You'll still need to:${NC}"
echo -e "${YELLOW}  1. Configure environment variables in Vercel dashboard${NC}"
echo -e "${YELLOW}  2. Connect GitHub integration for auto-deploy${NC}"
echo -e "${YELLOW}  3. Add custom domains${NC}\n"

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# Process each app
for app_name in $APPS; do
    create_or_link_project "$app_name"
    echo ""
done

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}Next Steps:${NC}"
echo -e "${YELLOW}1. Configure Environment Variables${NC}"
echo "   For each project, go to: https://vercel.com/dashboard"
echo "   → Select project → Settings → Environment Variables"
echo ""

echo -e "${YELLOW}2. Connect GitHub Integration (if not already connected)${NC}"
echo "   → Project Settings → Git → Connect GitHub Repository"
echo "   → Repository: ainexllc/ainexsuite"
echo "   → Root Directory: apps/[app-name]"
echo ""

echo -e "${YELLOW}3. Add Custom Domains${NC}"
echo "   → Project Settings → Domains → Add Domain"
echo "   All apps use *.ainexspace.com subdomains:"
echo "   main:     ainexspace.com, www.ainexspace.com"
echo "   notes:    notes.ainexspace.com"
echo "   journal:  journal.ainexspace.com"
echo "   todo:     todo.ainexspace.com"
echo "   health:   health.ainexspace.com"
echo "   album:    album.ainexspace.com"
echo "   habits:   habits.ainexspace.com"
echo "   mosaic:   mosaic.ainexspace.com"
echo "   fit:      fit.ainexspace.com"
echo "   projects: projects.ainexspace.com"
echo "   flow:     flow.ainexspace.com"
echo "   subs:     subs.ainexspace.com"
echo "   docs:     docs.ainexspace.com"
echo "   tables:   tables.ainexspace.com"
echo "   calendar: calendar.ainexspace.com"
echo "   admin:    admin.ainexspace.com"
echo ""

echo -e "${YELLOW}4. Configure DNS Records${NC}"
echo "   See VERCEL_DEPLOYMENT_ACTION_PLAN.md for complete DNS configuration"
echo ""

echo -e "${GREEN}Deployment documentation: VERCEL_DEPLOYMENT_ACTION_PLAN.md${NC}"
