# Enhanced Status Line Configuration

This document contains the complete enhanced status line configuration for Claude Code.

## Overview

The enhanced status line displays:
- 📁 Full directory path (with `/Users/dino/` prefix removed)
- 🌿 Git branch and dirty status
- 💚 Node.js version
- 📦 Package manager (pnpm/yarn/npm)
- 🚀 Running dev servers with app names and ports (current app highlighted in yellow)
- 🔥 Active Firebase project
- 🕐 Current time

## Example Output

```
➜  📁 ainex/ainexsuite/apps/workflow 🌿 git:(main) Node ⬢ v20.11.0 📦 pnpm 🚀 projects:3009 workflow:3010 🔥 ainexsuite 🕐 15:45
```

## Installation

Run this command to create the status line script:

```bash
cat > ~/.claude/statusline-command.sh << 'EOF'
#!/bin/bash

# Enhanced robbyrussell-style status line for Claude Code
# Includes: directory, git, Node.js, package manager, dev servers, project context, Firebase, time

# Read JSON input from stdin
input=$(cat)

# Extract data from JSON
cwd=$(echo "$input" | jq -r '.workspace.current_dir')

# Change to the working directory
cd "$cwd" 2>/dev/null || true

# Get directory path with /Users/dino/ stripped
if [[ "$cwd" == /Users/dino/* ]]; then
  dir="${cwd#/Users/dino/}"
else
  dir="$cwd"
fi

# Colors (matching robbyrussell theme)
GREEN='\033[1;32m'
CYAN='\033[36m'
BLUE='\033[1;34m'
RED='\033[31m'
YELLOW='\033[33m'
MAGENTA='\033[35m'
GRAY='\033[90m'
RESET='\033[0m'

# Start building the status line
status=""

# 1. Green arrow and directory path (robbyrussell style)
status+="${GREEN}➜${RESET}  📁 ${CYAN}${dir}${RESET}"

# 2. Git information (robbyrussell style)
if git rev-parse --git-dir > /dev/null 2>&1; then
    branch=$(git -c core.fileMode=false rev-parse --abbrev-ref HEAD 2>/dev/null)
    if [ -n "$(git -c core.fileMode=false status --porcelain 2>/dev/null)" ]; then
        status+=" 🌿 ${BLUE}git:(${RED}${branch}${BLUE})${RESET}${YELLOW} ✗${RESET}"
    else
        status+=" 🌿 ${BLUE}git:(${RED}${branch}${BLUE})${RESET}"
    fi
fi

# 3. Extract current app name for highlighting
current_app=""
if [[ "$cwd" == *"/ainexsuite/apps/"* ]]; then
    current_app=$(echo "$cwd" | sed 's|.*/ainexsuite/apps/\([^/]*\).*|\1|')
fi

# 4. Node.js version
node_version=$(node --version 2>/dev/null)
if [ -n "$node_version" ]; then
    status+=" ${GREEN}Node ⬢ ${node_version}${RESET}"
fi

# 5. Package manager indicator
if [ -f "pnpm-lock.yaml" ]; then
    status+=" 📦 ${YELLOW}pnpm${RESET}"
elif [ -f "yarn.lock" ]; then
    status+=" 📦 ${YELLOW}yarn${RESET}"
elif [ -f "package-lock.json" ]; then
    status+=" 📦 ${YELLOW}npm${RESET}"
fi

# 6. Active dev server ports with app names
# Get all Node processes listening on TCP ports
port_info=$(lsof -nP -iTCP -sTCP:LISTEN 2>/dev/null | grep node | awk '!seen[$9]++' || true)

if [ -n "$port_info" ]; then
    # Array to store app:port pairs
    port_parts=()

    while IFS= read -r line; do
        pid=$(echo "$line" | awk '{print $2}')
        port=$(echo "$line" | awk '{print $9}' | cut -d':' -f2)

        # Get working directory of the process
        proc_dir=$(lsof -p "$pid" -a -d cwd 2>/dev/null | tail -n 1 | awk '{print $NF}')

        # Extract app name if in ainexsuite
        if [[ "$proc_dir" == *"/ainexsuite/apps/"* ]]; then
            app_name=$(echo "$proc_dir" | sed 's|.*/ainexsuite/apps/\([^/]*\).*|\1|')

            # Highlight current app in yellow, others in cyan
            if [ "$app_name" = "$current_app" ]; then
                port_parts+=("${YELLOW}${app_name}:${port}${RESET}")
            else
                port_parts+=("${CYAN}${app_name}:${port}${RESET}")
            fi
        else
            # Not in ainexsuite, just show port
            port_parts+=("${CYAN}:${port}${RESET}")
        fi
    done <<< "$port_info"

    # Join array elements with spaces
    if [ ${#port_parts[@]} -gt 0 ]; then
        status+=" 🚀 "
        for i in "${!port_parts[@]}"; do
            if [ $i -eq 0 ]; then
                status+="${port_parts[$i]}"
            else
                status+=" ${port_parts[$i]}"
            fi
        done
    fi
fi

# 7. Firebase project
firebase_project=""
if [ -f ".firebaserc" ]; then
    firebase_project=$(jq -r '.projects.default // empty' .firebaserc 2>/dev/null)
elif command -v firebase &> /dev/null; then
    firebase_project=$(firebase use 2>/dev/null | grep "Active project" | awk '{print $NF}' | tr -d '()')
fi
if [ -n "$firebase_project" ]; then
    status+=" ${RED}🔥 ${firebase_project}${RESET}"
fi

# 8. Current time
current_time=$(date +%H:%M)
status+=" ${GRAY}🕐 ${current_time}${RESET}"

# Print the final status line
printf "%b" "$status"
EOF

chmod +x ~/.claude/statusline-command.sh
```

## Features

### 1. Directory Path (📁)
- Shows full path with `/Users/dino/` prefix removed
- Example: `ainex/ainexsuite/apps/workflow`
- Color: Cyan

### 2. Git Information (🌿)
- Branch name in format: `git:(branch-name)`
- Yellow ✗ indicator when there are uncommitted changes
- Colors: Blue for "git:", Red for branch name, Yellow for dirty indicator

### 3. Node.js Version (💚)
- Displays current Node version with hexagon icon
- Format: `Node ⬢ v20.11.0`
- Color: Green

### 4. Package Manager (📦)
- Automatically detects: pnpm, yarn, or npm
- Based on lock file presence
- Color: Yellow

### 5. Dev Servers (🚀)
- Shows running Node processes with app names and ports
- **Current app highlighted in yellow**
- Other apps shown in cyan
- Format: `app:port` (e.g., `workflow:3010`)
- Detects apps in ainexsuite monorepo automatically

### 6. Firebase Project (🔥)
- Shows active Firebase project ID
- Reads from `.firebaserc` or Firebase CLI
- Color: Red

### 7. Current Time (🕐)
- HH:MM format
- Updates automatically
- Color: Gray

## Configuration

The status line configuration is stored in:
- **Script**: `~/.claude/statusline-command.sh`
- **Settings**: `~/.claude/settings.json`

## Customization

To modify the status line:

1. Edit `~/.claude/statusline-command.sh`
2. Adjust colors, emojis, or add new sections
3. Changes take effect immediately

### Color Codes

```bash
GREEN='\033[1;32m'   # Green (arrow, Node version)
CYAN='\033[36m'      # Cyan (path, ports)
BLUE='\033[1;34m'    # Blue (git label)
RED='\033[31m'       # Red (branch, Firebase)
YELLOW='\033[33m'    # Yellow (dirty status, current app, package manager)
MAGENTA='\033[35m'   # Magenta (reserved)
GRAY='\033[90m'      # Gray (time)
RESET='\033[0m'      # Reset colors
```

## Troubleshooting

### Status line not updating
- Restart Claude Code
- Check script permissions: `ls -la ~/.claude/statusline-command.sh`
- Should be executable (`-rwxr-xr-x`)

### Ports not showing
- Verify `lsof` is available: `which lsof`
- Check if Node processes are running: `lsof -nP -iTCP -sTCP:LISTEN | grep node`

### Colors not displaying
- Ensure terminal supports ANSI color codes
- Check Claude Code settings for color support

## Related Documentation

- Global CLAUDE.md: `~/.claude/CLAUDE.md`
- Claude Code Settings: `~/.claude/settings.json`
- Status line script: `~/.claude/statusline-command.sh`

---

*Last updated: November 14, 2025*
