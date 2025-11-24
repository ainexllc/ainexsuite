#!/bin/bash

# AINexSuite Development Environment Setup
# This script creates .env.local files for all apps with correct port configurations

set -e

echo "🚀 Setting up development environment for AINexSuite..."

# Define port mappings for local development
PORTS_main="3000"        # Main dashboard
PORTS_notes="3001"
PORTS_journey="3002"
PORTS_todo="3003"
PORTS_track="3004"
PORTS_moments="3005"
PORTS_grow="3006"
PORTS_pulse="3007"
PORTS_fit="3008"
PORTS_projects="3009"
PORTS_calendar="3014"
PORTS_workflow="3015"
PORTS_admin="3020"       # Admin panel

# Apps directory
APPS_DIR="./apps"

# Function to create .env.local for an app
create_env_file() {
    local app_name=$1
    local port_var="PORTS_$app_name"
    local port=${!port_var}
    local env_file="$APPS_DIR/$app_name/.env.local"

    if [ ! -f "$env_file" ]; then
        echo "Creating $env_file with port $port"
        
        # Special handling for admin app
        if [ "$app_name" = "admin" ]; then
            cat > "$env_file" << EOF
# AINexSuite $app_name App
# Port configuration for local development
PORT=$port

# Firebase Configuration (add your values here)
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_ADMIN_PROJECT_ID=your-project-id
# FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
# FIREBASE_ADMIN_PRIVATE_KEY=your-private-key
# FIREBASE_ADMIN_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
# NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# GitHub Configuration (for commit activity feed)
# Defaults to ainexsuite/ainexsuite if not set
# GITHUB_REPO=owner/repo
# Or use full URL: GITHUB_REPO=https://github.com/owner/repo
# GITHUB_TOKEN=your-github-token (optional, for private repos or higher rate limits)
EOF
        else
            cat > "$env_file" << EOF
# AINexSuite $app_name App
# Port configuration for local development
PORT=$port

# Firebase Configuration (add your values here)
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_ADMIN_PROJECT_ID=your-project-id
# FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
# FIREBASE_ADMIN_PRIVATE_KEY=your-private-key
# FIREBASE_ADMIN_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
# NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# AI Configuration (if applicable)
# OPENROUTER_API_KEY=your-openrouter-key
# GROK_API_KEY=your-grok-key
EOF
        fi
    else
        echo "✓ $env_file already exists"
    fi
}

# Create .env.local files for all apps
for app in main notes journey todo track moments grow pulse fit projects calendar workflow admin; do
    if [ -d "$APPS_DIR/$app" ]; then
        create_env_file "$app"
    else
        echo "⚠️  App directory $APPS_DIR/$app not found, skipping..."
    fi
done

# Create root .env.local for shared environment variables
if [ ! -f ".env.local" ]; then
    echo "Creating root .env.local"
    cat > ".env.local" << 'EOF'
# AINexSuite Root Environment Variables
# These are shared across all apps during development

# Turbo Repo Configuration
# TURBO_REMOTE_CACHE_DISABLED=true

# Development Mode
NODE_ENV=development

# Firebase Project ID (shared across all apps)
# FIREBASE_PROJECT_ID=ainexsuite

# AI API Keys (if using shared keys)
# OPENROUTER_API_KEY=your-openrouter-key
# GROK_API_KEY=your-grok-key
EOF
fi

echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "📋 Port Configuration:"
for app in main notes journey todo track moments grow pulse fit projects calendar workflow admin; do
    if [ -d "$APPS_DIR/$app" ]; then
        port_var="PORTS_$app"
        port=${!port_var}
        printf "   %-10s → Port %s\n" "$app" "$port"
    fi
done
echo ""
echo "🔧 Next steps:"
echo "1. Add your Firebase credentials to each app's .env.local file"
echo "2. Add AI API keys if needed"
echo "3. Run 'pnpm dev' to start all apps"
echo ""
echo "💡 Tip: Use 'pnpm dev:app-name' to start individual apps"
