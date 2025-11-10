#!/bin/bash

# Add Environment Variables to All Vercel Projects
# This script adds environment variables to all 7 AinexSuite Vercel projects

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  Add Environment Variables${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Check if Firebase credentials are provided
if [ -z "$FIREBASE_ADMIN_CLIENT_EMAIL" ] || [ -z "$FIREBASE_ADMIN_PRIVATE_KEY" ]; then
    echo -e "${RED}Error: Firebase Admin credentials not set${NC}"
    echo ""
    echo "Please set these environment variables first:"
    echo ""
    echo "  export FIREBASE_ADMIN_PROJECT_ID='alnexsuite'"
    echo "  export FIREBASE_ADMIN_CLIENT_EMAIL='<from-firebase-json>'"
    echo "  export FIREBASE_ADMIN_PRIVATE_KEY='<from-firebase-json>'"
    echo ""
    echo "Or run this script with credentials:"
    echo "  FIREBASE_ADMIN_CLIENT_EMAIL='...' FIREBASE_ADMIN_PRIVATE_KEY='...' ./add-env-variables.sh"
    exit 1
fi

# Public Firebase variables (same for all apps)
PUBLIC_VARS=(
    "NEXT_PUBLIC_MAIN_DOMAIN=www.ainexsuite.com"
    "NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAvYZXrWGomqINh20NNiMlWxddm5eetkKc"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=alnexsuite.firebaseapp.com"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID=alnexsuite"
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=alnexsuite.firebasestorage.app"
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1062785888767"
    "NEXT_PUBLIC_FIREBASE_APP_ID=1:1062785888767:web:9e29360b8b12e9723a77ca"
)

# Secret Firebase variables (same for all apps)
SECRET_VARS=(
    "FIREBASE_ADMIN_PROJECT_ID=${FIREBASE_ADMIN_PROJECT_ID:-alnexsuite}"
    "FIREBASE_ADMIN_CLIENT_EMAIL=${FIREBASE_ADMIN_CLIENT_EMAIL}"
    "FIREBASE_ADMIN_PRIVATE_KEY=${FIREBASE_ADMIN_PRIVATE_KEY}"
)

# Apps to configure
declare -A APPS=(
    ["main"]="ainexsuite-main"
    ["journey"]="ainexsuite-journey"
    ["notes"]="ainexsuite-notes"
    ["todo"]="ainexsuite-todo"
    ["moments"]="ainexsuite-moments"
    ["grow"]="ainexsuite-grow"
    ["track"]="ainexsuite-track"
)

# Function to add environment variable to a project
add_env_var() {
    local app_dir=$1
    local project_name=$2
    local var_name=$3
    local var_value=$4
    local is_secret=${5:-false}

    cd "$app_dir"

    # Add to all three environments: production, preview, development
    for env in production preview development; do
        if [ "$is_secret" = "true" ]; then
            # For secret variables, use sensitive flag
            echo "$var_value" | vercel env add "$var_name" "$env" --sensitive --yes 2>&1 | grep -v "Warning" || true
        else
            # For public variables
            echo "$var_value" | vercel env add "$var_name" "$env" --yes 2>&1 | grep -v "Warning" || true
        fi
    done

    cd - > /dev/null
}

# Function to process an app
process_app() {
    local app_name=$1
    local project_name=$2
    local app_dir="apps/${app_name}"

    echo -e "${BLUE}Processing: ${project_name}${NC}"

    if [ ! -d "$app_dir" ]; then
        echo -e "${RED}  ✗ Directory not found: ${app_dir}${NC}"
        return 1
    fi

    # Add public variables
    echo -e "${YELLOW}  → Adding public environment variables...${NC}"
    for var in "${PUBLIC_VARS[@]}"; do
        var_name=$(echo "$var" | cut -d'=' -f1)
        var_value=$(echo "$var" | cut -d'=' -f2-)
        echo -e "     Adding: $var_name"
        add_env_var "$app_dir" "$project_name" "$var_name" "$var_value" "false"
    done

    # Add app-specific variable
    echo -e "     Adding: NEXT_PUBLIC_APP_NAME"
    add_env_var "$app_dir" "$project_name" "NEXT_PUBLIC_APP_NAME" "$app_name" "false"

    # Add secret variables
    echo -e "${YELLOW}  → Adding secret environment variables...${NC}"
    for var in "${SECRET_VARS[@]}"; do
        var_name=$(echo "$var" | cut -d'=' -f1)
        var_value=$(echo "$var" | cut -d'=' -f2-)
        echo -e "     Adding: $var_name (sensitive)"
        add_env_var "$app_dir" "$project_name" "$var_name" "$var_value" "true"
    done

    echo -e "${GREEN}  ✓ Environment variables added to ${project_name}${NC}"
    echo ""
}

# Process each app
for app_name in "${!APPS[@]}"; do
    project_name="${APPS[$app_name]}"
    process_app "$app_name" "$project_name"
done

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  ✓ All environment variables added!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo "Next steps:"
echo "1. Connect GitHub integration to all projects"
echo "2. Configure custom domains in Vercel dashboard"
echo "3. Set up DNS records"
echo ""
echo "See MANUAL_SETUP_CHECKLIST.md for details"
