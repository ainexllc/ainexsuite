# Turborepo Development Commands Reference

Complete reference for development commands in the ainexsuite monorepo.

## Running Apps

### Development Servers

```bash
# Run all apps in development mode
pnpm dev

# Run specific app
pnpm --filter @ainexsuite/main dev
pnpm --filter @ainexsuite/journey dev
pnpm --filter @ainexsuite/notes dev
pnpm --filter @ainexsuite/todo dev
pnpm --filter @ainexsuite/track dev
pnpm --filter @ainexsuite/pulse dev
pnpm --filter @ainexsuite/fit dev
pnpm --filter @ainexsuite/grow dev
pnpm --filter @ainexsuite/moments dev
pnpm --filter @ainexsuite/notenex dev
```

### Multiple Apps Simultaneously

```bash
# Run multiple apps on different ports
# Journey app on port 3001
cd apps/journey && PORT=3001 pnpm dev

# Notes app on port 3002
cd apps/notes && PORT=3002 pnpm dev

# Main app on default port 3000
cd apps/main && pnpm dev
```

## Building

### Production Builds

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter @ainexsuite/main build
pnpm --filter @ainexsuite/journey build
pnpm --filter @ainexsuite/notes build

# Build shared packages only
pnpm --filter @ainexsuite/ui build
pnpm --filter @ainexsuite/types build
pnpm --filter @ainexsuite/config build
```

### Build Verification

```bash
# Build and verify all apps
pnpm build && echo "All apps built successfully"

# Build with verbose output
pnpm build --verbose

# Clean and rebuild
pnpm clean && pnpm build
```

## Testing

### Running Tests

```bash
# Run tests across all apps
pnpm test

# Run tests for specific app
pnpm --filter @ainexsuite/main test
pnpm --filter @ainexsuite/journey test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Linting & Type Checking

```bash
# Lint all apps
pnpm lint

# Lint specific app
pnpm --filter @ainexsuite/main lint

# Fix linting issues
pnpm lint:fix

# Type check all apps
pnpm type-check

# Type check specific app
pnpm --filter @ainexsuite/journey type-check
```

## Package Management

### Installing Dependencies

```bash
# Install all dependencies
pnpm install

# Add dependency to specific app
pnpm --filter @ainexsuite/journey add <package-name>

# Add dev dependency to specific app
pnpm --filter @ainexsuite/main add -D <package-name>

# Add dependency to shared package
pnpm --filter @ainexsuite/ui add <package-name>

# Add dependency to workspace root
pnpm add -w <package-name>
```

### Removing Dependencies

```bash
# Remove dependency from specific app
pnpm --filter @ainexsuite/journey remove <package-name>

# Remove from all apps
pnpm remove <package-name> --recursive
```

## Cleaning

### Clean Build Artifacts

```bash
# Clean all build outputs
pnpm clean

# Clean node_modules
pnpm clean:modules

# Clean and reinstall
pnpm clean:modules && pnpm install

# Clean specific app
pnpm --filter @ainexsuite/main clean
```

## Turborepo-Specific Commands

### Cache Management

```bash
# Run with no cache
pnpm build --force

# Clear Turborepo cache
rm -rf .turbo

# Run with remote cache (if configured)
pnpm build --remote-cache
```

### Task Execution

```bash
# Run custom task across all apps
pnpm turbo run <task-name>

# Run task with dependencies
pnpm turbo run build --include-dependencies

# Run task in parallel
pnpm turbo run test --parallel
```

## Workspace Commands

### Package Listing

```bash
# List all packages in workspace
pnpm list --depth 0

# List packages using specific dependency
pnpm why <package-name>

# Show workspace structure
pnpm ls --depth 1
```

### Script Execution

```bash
# Run script in all apps
pnpm -r run <script-name>

# Run script in parallel
pnpm -r --parallel run <script-name>

# Run script sequentially
pnpm -r --sequential run <script-name>
```

## Deployment

### Firebase Deployment

```bash
# Deploy specific app to Firebase
cd apps/journey && pnpm deploy

# Deploy with preview
cd apps/main && firebase hosting:channel:deploy preview

# Deploy rules and indexes
firebase deploy --only firestore:rules,firestore:indexes
```

### Vercel Deployment

```bash
# Deploy to Vercel preview
cd apps/notes && vercel

# Deploy to production
cd apps/notes && vercel --prod

# Check deployment status
vercel inspect <deployment-url>
```

## Development Workflow

### Common Development Patterns

```bash
# 1. Start development with clean slate
pnpm clean && pnpm install && pnpm dev

# 2. Add feature to specific app
cd apps/journey
pnpm dev  # Start dev server
# Make changes...
pnpm lint && pnpm type-check && pnpm build  # Verify

# 3. Update shared component
cd packages/ui
# Make changes to component...
pnpm build  # Build shared package
cd ../../apps/main && pnpm dev  # Test in consuming app

# 4. Cross-app update
pnpm lint:fix  # Fix all linting issues
pnpm build  # Ensure all apps build
git status  # Review changes
```

### Troubleshooting

```bash
# Port already in use
lsof -ti:3000 | xargs kill  # Kill process on port 3000

# Module not found errors
pnpm clean && pnpm install  # Reinstall dependencies

# Build failures
pnpm clean && pnpm build --force  # Clean build without cache

# Type errors after update
pnpm type-check  # Check all type errors
cd apps/<app-name> && pnpm type-check  # Check specific app
```

## Performance Optimization

### Faster Builds

```bash
# Build with maximum parallelism
pnpm build --parallel

# Build only changed apps (requires Turborepo remote cache)
pnpm build

# Build with profiling
pnpm build --profile
```

### Faster Development

```bash
# Use Turborepo daemon for faster task execution
pnpm turbo daemon start

# Run with graph visualization
pnpm turbo run build --graph
```

## Tips & Best Practices

1. **Always use `--filter`** when working on specific apps to avoid running commands across entire monorepo
2. **Use `pnpm build` before commits** to ensure all apps build successfully
3. **Run `pnpm lint:fix`** before committing to auto-fix linting issues
4. **Check `pnpm type-check`** to catch TypeScript errors early
5. **Use parallel execution** (`pnpm -r --parallel`) for independent tasks like testing
6. **Clean node_modules** if you encounter weird dependency issues
7. **Use workspace protocol** (`workspace:*`) for internal package dependencies

---
*Reference created: November 6, 2025*
*For ainexsuite turborepo project*
