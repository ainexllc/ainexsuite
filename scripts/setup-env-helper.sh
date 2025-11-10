#!/bin/bash

# Environment Variables Setup Helper
# This script helps you set up Firebase credentials and run the env setup

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

clear
echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  AinexSuite Environment Setup${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Step 1: Get Firebase Admin SDK credentials
echo -e "${YELLOW}Step 1: Get Firebase Admin Credentials${NC}"
echo ""
echo "1. Go to: https://console.firebase.google.com/project/alnexsuite/settings/serviceaccounts/adminsdk"
echo "2. Click 'Generate New Private Key'"
echo "3. Download the JSON file"
echo ""
read -p "Have you downloaded the JSON file? (y/n): " downloaded

if [ "$downloaded" != "y" ]; then
    echo -e "${RED}Please download the Firebase Admin SDK JSON file first${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Extract Credentials from JSON${NC}"
echo ""
read -p "Enter the path to the downloaded JSON file: " json_file

if [ ! -f "$json_file" ]; then
    echo -e "${RED}File not found: $json_file${NC}"
    exit 1
fi

# Extract values from JSON
echo -e "${BLUE}Extracting credentials...${NC}"

FIREBASE_ADMIN_PROJECT_ID=$(grep -o '"project_id"[[:space:]]*:[[:space:]]*"[^"]*"' "$json_file" | cut -d'"' -f4)
FIREBASE_ADMIN_CLIENT_EMAIL=$(grep -o '"client_email"[[:space:]]*:[[:space:]]*"[^"]*"' "$json_file" | cut -d'"' -f4)
FIREBASE_ADMIN_PRIVATE_KEY=$(grep -o '"private_key"[[:space:]]*:[[:space:]]*"[^"]*"' "$json_file" | cut -d'"' -f4 | sed 's/\\n/\n/g')

if [ -z "$FIREBASE_ADMIN_CLIENT_EMAIL" ] || [ -z "$FIREBASE_ADMIN_PRIVATE_KEY" ]; then
    echo -e "${RED}Failed to extract credentials from JSON file${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Credentials extracted successfully${NC}"
echo ""
echo "Project ID: $FIREBASE_ADMIN_PROJECT_ID"
echo "Client Email: $FIREBASE_ADMIN_CLIENT_EMAIL"
echo ""

# Step 3: Confirm before proceeding
echo -e "${YELLOW}Step 3: Add Environment Variables to All Projects${NC}"
echo ""
echo "This will add environment variables to all 7 Vercel projects:"
echo "  - ainexsuite-main"
echo "  - ainexsuite-journey"
echo "  - ainexsuite-notes"
echo "  - ainexsuite-todo"
echo "  - ainexsuite-moments"
echo "  - ainexsuite-grow"
echo "  - ainexsuite-track"
echo ""
echo "Total variables per project: 11 (8 public + 3 secret)"
echo "Total operations: 7 projects × 11 variables × 3 environments = 231 operations"
echo ""
read -p "Proceed with adding environment variables? (y/n): " proceed

if [ "$proceed" != "y" ]; then
    echo -e "${YELLOW}Setup cancelled${NC}"
    exit 0
fi

# Step 4: Run the env setup script
echo ""
echo -e "${BLUE}Adding environment variables...${NC}"
echo ""

# Export credentials for the add-env-variables.sh script
export FIREBASE_ADMIN_PROJECT_ID
export FIREBASE_ADMIN_CLIENT_EMAIL
export FIREBASE_ADMIN_PRIVATE_KEY

# Run the env setup script
bash "$(dirname "$0")/add-env-variables.sh"

# Step 5: Cleanup recommendation
echo ""
echo -e "${YELLOW}Step 4: Security Cleanup${NC}"
echo ""
echo "For security, you should delete the downloaded Firebase JSON file:"
echo "  rm \"$json_file\""
echo ""
read -p "Delete the Firebase JSON file now? (y/n): " delete_json

if [ "$delete_json" = "y" ]; then
    rm "$json_file"
    echo -e "${GREEN}✓ Firebase JSON file deleted${NC}"
fi

echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  ✓ Setup Complete!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo "Next manual steps:"
echo "1. Connect GitHub to all 7 projects (Settings → Git)"
echo "2. Add custom domains (Settings → Domains)"
echo "3. Configure DNS records with your registrar"
echo ""
echo "See MANUAL_SETUP_CHECKLIST.md for detailed instructions"
