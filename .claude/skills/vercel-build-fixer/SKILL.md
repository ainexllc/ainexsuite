# Vercel Build Auto-Fixer Skill

## Purpose
Automatically diagnose and fix Vercel build failures on the main branch for ainexsuite projects.

## Trigger Patterns
- "vercel build failed"
- "deployment failed"
- "fix vercel build"
- "check vercel logs"
- "auto-fix build error"

## Capabilities

### 1. Diagnose Build Failures
- Fetch latest Vercel deployment logs
- Identify error type (TypeScript, dependency, Firebase, ESLint, etc.)
- Parse error messages and locate problematic files

### 2. Common Fixes
- **TypeScript Errors**: Run type checking and fix type issues
- **Dependency Errors**: Clean install and update lock files
- **Firebase Errors**: Deploy Firestore rules and indexes
- **ESLint Errors**: Run linting fixes
- **Build Timeouts**: Optimize build configuration

### 3. Auto-Fix Process
1. Detect error type from logs
2. Apply targeted fix
3. Rebuild locally to verify
4. Create commit with fix
5. Push to main (triggering Vercel redeploy)
6. Monitor deployment status

### 4. Monitoring
- Check deployment status every minute
- Alert on failures
- Track fix success rate
- Create incident reports

## Implementation

### For Immediate Build Check
```bash
npm run build
```

### To Monitor Vercel Deployments
```bash
vercel list
vercel inspect <url> --logs
```

### To Deploy Firebase (if needed)
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## Usage Examples

**User**: "The main build is failing on Vercel"
**Skill**:
1. Fetches latest Vercel logs
2. Identifies the error
3. Applies automatic fix
4. Commits and pushes
5. Monitors new deployment

**User**: "Check if ainexsuite-main deployed successfully"
**Skill**:
1. Lists recent deployments
2. Shows status and logs
3. Alerts on failures

## Key Files
- `.vercel/project.json` - Project configuration
- `vercel.json` - Build and deployment settings
- `firebase.json` - Firebase configuration
- `tsconfig.json` - TypeScript configuration

## Integration
This skill integrates with:
- Vercel API for deployment monitoring
- GitHub API for commit and push
- Firebase CLI for rules deployment
- Local build system for verification
