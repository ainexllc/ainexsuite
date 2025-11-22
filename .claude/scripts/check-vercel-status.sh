#!/bin/bash
# Check Vercel deployment status for all ainexsuite projects

set -e

TEAM_ID="team_lNWTMcQWMnIRjyREXHHLAcbr"
PROJECTS=(
  "prj_qWQuZ68lqYmfGA0hJJwygUtRW0s4:ainexsuite-main"
  "prj_7XsEd1THgJ1Z45nH6a6muuwWwPvy:ainexsuite-pulse"
  "prj_fS5vskHrC6t4P6PR9APDCFZvc1y4:ainexsuite-journey"
  "prj_2frXVyo3VBqYKGQpvukDVK7JJOL9:ainexsuite-notes"
  "prj_aL0K7qBIi0zN3ry3nLLwxzwcwAyy:ainexsuite-todo"
)

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📊 Vercel Deployment Status Report${NC}"
echo "========================================"
echo ""

check_project() {
  local project_id=$1
  local project_name=$2

  echo -n "Checking $project_name... "

  # Get deployment info using vercel CLI
  if vercel ls --scope=ainexllc --json 2>/dev/null | grep -q "$project_name"; then
    echo -e "${GREEN}✓ Active${NC}"

    # Get latest deployment
    vercel inspect --scope=ainexllc --json 2>/dev/null | head -20 || true
  else
    echo -e "${RED}✗ Not found${NC}"
  fi
}

main() {
  for project_entry in "${PROJECTS[@]}"; do
    IFS=':' read -r proj_id proj_name <<< "$project_entry"
    check_project "$proj_id" "$proj_name"
  done

  echo ""
  echo -e "${BLUE}To monitor builds in real-time:${NC}"
  echo "  vercel logs --scope=ainexllc"
  echo ""
  echo -e "${BLUE}To redeploy a project:${NC}"
  echo "  vercel --scope=ainexllc --prod"
  echo ""
}

main "$@"
