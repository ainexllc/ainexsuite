# Metrics Collector Guide

This document provides the commands and benchmarks for collecting pre-analysis metrics before the deep review.

---

## Purpose

Collecting metrics before spawning review agents provides:

1. **Baseline context** for agents to understand app scale
2. **Quick wins identification** (e.g., unusually high dependency count)
3. **Health indicators** for the executive summary
4. **Historical tracking** to measure improvements over time

---

## Collection Commands

### File Structure Metrics

```bash
# Total TypeScript/React files
find apps/{app}/src -name "*.tsx" 2>/dev/null | wc -l
find apps/{app}/src -name "*.ts" 2>/dev/null | wc -l

# Component count
find apps/{app}/src/components -name "*.tsx" 2>/dev/null | wc -l

# Hooks count
find apps/{app}/src/hooks -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l

# API routes count
find apps/{app}/src/app/api -type d 2>/dev/null | wc -l

# Page count
find apps/{app}/src/app -name "page.tsx" 2>/dev/null | wc -l

# Layout count
find apps/{app}/src/app -name "layout.tsx" 2>/dev/null | wc -l

# Library/utility files
find apps/{app}/src/lib -name "*.ts" 2>/dev/null | wc -l
```

### Code Volume Metrics

```bash
# Total lines of code (TypeScript + TSX)
find apps/{app}/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec wc -l {} + 2>/dev/null | tail -1

# Largest files (potential refactoring candidates)
find apps/{app}/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec wc -l {} + 2>/dev/null | sort -rn | head -10

# Average component size
find apps/{app}/src/components -name "*.tsx" -exec wc -l {} + 2>/dev/null | awk '{sum+=$1; count++} END {print int(sum/count)}'
```

### Dependency Metrics

```bash
# Production dependencies count
jq '.dependencies | length' apps/{app}/package.json 2>/dev/null

# Dev dependencies count
jq '.devDependencies | length' apps/{app}/package.json 2>/dev/null

# List production dependencies
jq -r '.dependencies | keys[]' apps/{app}/package.json 2>/dev/null

# Check for duplicate dependencies (also in root)
jq -r '.dependencies | keys[]' apps/{app}/package.json 2>/dev/null | \
  xargs -I {} sh -c 'grep -q "{}" ../../package.json && echo "Duplicate: {}"'
```

### Package Usage Metrics

```bash
# @ainexsuite/ui imports
grep -r "@ainexsuite/ui" apps/{app}/src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l

# @ainexsuite/firebase imports
grep -r "@ainexsuite/firebase" apps/{app}/src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l

# @ainexsuite/auth imports
grep -r "@ainexsuite/auth" apps/{app}/src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l

# @ainexsuite/types imports
grep -r "@ainexsuite/types" apps/{app}/src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l

# @ainexsuite/ai imports
grep -r "@ainexsuite/ai" apps/{app}/src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l

# @ainexsuite/hooks imports (if exists)
grep -r "@ainexsuite/hooks" apps/{app}/src --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l
```

### React Pattern Metrics

```bash
# Client components ("use client" directives)
grep -r '"use client"' apps/{app}/src --include="*.tsx" 2>/dev/null | wc -l
grep -r "'use client'" apps/{app}/src --include="*.tsx" 2>/dev/null | wc -l

# Server actions ("use server" directives)
grep -r '"use server"' apps/{app}/src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l

# useState usage
grep -r "useState" apps/{app}/src --include="*.tsx" 2>/dev/null | wc -l

# useEffect usage
grep -r "useEffect" apps/{app}/src --include="*.tsx" 2>/dev/null | wc -l

# useMemo usage
grep -r "useMemo" apps/{app}/src --include="*.tsx" 2>/dev/null | wc -l

# useCallback usage
grep -r "useCallback" apps/{app}/src --include="*.tsx" 2>/dev/null | wc -l

# memo() usage
grep -r "memo(" apps/{app}/src --include="*.tsx" 2>/dev/null | wc -l

# useContext usage
grep -r "useContext" apps/{app}/src --include="*.tsx" 2>/dev/null | wc -l

# Custom hooks (files starting with use)
find apps/{app}/src -name "use*.ts" -o -name "use*.tsx" 2>/dev/null | wc -l
```

### Code Quality Indicators

```bash
# console.log statements (should be minimal in production)
grep -r "console.log" apps/{app}/src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l

# TODO comments
grep -r "TODO" apps/{app}/src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l

# FIXME comments
grep -r "FIXME" apps/{app}/src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l

# any type usage
grep -r ": any" apps/{app}/src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l

# @ts-ignore comments
grep -r "@ts-ignore" apps/{app}/src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l

# @ts-expect-error comments
grep -r "@ts-expect-error" apps/{app}/src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l
```

### Testing Metrics

```bash
# Test files count
find apps/{app}/src -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" 2>/dev/null | wc -l

# Test file to source file ratio
TEST_COUNT=$(find apps/{app}/src -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | wc -l)
SRC_COUNT=$(find apps/{app}/src -name "*.ts" -o -name "*.tsx" 2>/dev/null | grep -v test | grep -v spec | wc -l)
echo "Test coverage: $TEST_COUNT tests / $SRC_COUNT source files"
```

---

## Health Score Interpretation

Use these guidelines to assess code quality indicators:

### ✅ Healthy Indicators

- Using `@ainexsuite/ui` shared components consistently
- Memoization patterns present (useMemo/useCallback) where appropriate
- Minimal `console.log` statements (clean production code)
- Strong type safety (minimal `any` types)
- Test coverage present

### ⚠️ Warning Indicators

- Components averaging over 150 lines → Consider refactoring
- Multiple `console.log` statements → Development artifacts to clean
- Growing `any` type usage → Type safety degradation
- `@ts-ignore` comments accumulating → Type workarounds building up
- High dependency count relative to functionality

### 🔴 Critical Indicators

- No custom hooks in complex app → Business logic not extracted
- Widespread `any` type usage → Serious type safety issues
- Heavy `console.log` usage → Development code in production
- Many TODO/FIXME comments → Technical debt accumulating

---

## Metrics Report Template

```markdown
## 📊 Metrics Baseline for {app_name}

_Collected: {timestamp}_

### File Structure

| Metric       | Value |
| ------------ | ----- |
| TSX Files    | X     |
| TS Files     | X     |
| Components   | X     |
| Custom Hooks | X     |
| API Routes   | X     |
| Pages        | X     |

### Code Volume

| Metric             | Value   | Notes              |
| ------------------ | ------- | ------------------ |
| Lines of Code      | X       | -                  |
| Avg Component Size | X lines | Target: <150 lines |
| Largest File       | X lines | Target: <300 lines |

### Dependencies

| Metric          | Value |
| --------------- | ----- |
| Production Deps | X     |
| Dev Deps        | X     |

### Package Integration

| Package              | Imports |
| -------------------- | ------- |
| @ainexsuite/ui       | X       |
| @ainexsuite/firebase | X       |
| @ainexsuite/auth     | X       |
| @ainexsuite/types    | X       |

### React Patterns

| Pattern      | Count |
| ------------ | ----- |
| "use client" | X     |
| useState     | X     |
| useEffect    | X     |
| useMemo      | X     |
| useCallback  | X     |

### Code Quality

| Indicator   | Count | Target          |
| ----------- | ----- | --------------- |
| console.log | X     | Minimize        |
| any type    | X     | Minimize        |
| @ts-ignore  | X     | Minimize        |
| TODO/FIXME  | X     | Track & resolve |

### Testing

| Metric     | Value |
| ---------- | ----- |
| Test Files | X     |
```

---

## Quick Analysis Script

For rapid collection, use this combined script:

```bash
#!/bin/bash
APP=$1

echo "=== Metrics for $APP ==="
echo ""
echo "File Structure:"
echo "  TSX Files: $(find apps/$APP/src -name '*.tsx' 2>/dev/null | wc -l | tr -d ' ')"
echo "  TS Files: $(find apps/$APP/src -name '*.ts' 2>/dev/null | wc -l | tr -d ' ')"
echo "  Components: $(find apps/$APP/src/components -name '*.tsx' 2>/dev/null | wc -l | tr -d ' ')"
echo "  Hooks: $(find apps/$APP/src/hooks -name '*.ts' 2>/dev/null | wc -l | tr -d ' ')"
echo "  API Routes: $(find apps/$APP/src/app/api -type d 2>/dev/null | wc -l | tr -d ' ')"
echo ""
echo "Dependencies:"
echo "  Production: $(jq '.dependencies | length' apps/$APP/package.json 2>/dev/null)"
echo "  Dev: $(jq '.devDependencies | length' apps/$APP/package.json 2>/dev/null)"
echo ""
echo "React Patterns:"
echo "  'use client': $(grep -r '"use client"' apps/$APP/src --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ')"
echo "  useState: $(grep -r 'useState' apps/$APP/src --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ')"
echo "  useEffect: $(grep -r 'useEffect' apps/$APP/src --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ')"
echo "  useMemo: $(grep -r 'useMemo' apps/$APP/src --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ')"
echo ""
echo "Code Quality:"
echo "  console.log: $(grep -r 'console.log' apps/$APP/src --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ')"
echo "  any type: $(grep -r ': any' apps/$APP/src --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ')"
echo "  @ts-ignore: $(grep -r '@ts-ignore' apps/$APP/src --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ')"
```

---

## See Also

- [SKILL.md](SKILL.md) - Main skill orchestration
- [review-criteria.md](review-criteria.md) - Detailed review criteria
- [auto-fixes.md](auto-fixes.md) - Auto-fix patterns
