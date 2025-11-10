# Cross-App Testing Checklist

Use this checklist when making changes that affect multiple apps in the ainexsuite monorepo.

## Pre-Change Checklist

Before making any cross-app changes:

- [ ] **Identify Affected Apps**
  - [ ] List all apps that use the component/feature being changed
  - [ ] Document theme-specific variations (Journey: Orange, Notes: Blue)
  - [ ] Check if change affects shared packages (@ainexsuite/ui, types, config)

- [ ] **Check for Existing Skills**
  - [ ] Search `~/.claude/skills/` for relevant cross-app skills
  - [ ] Use `cross-app-navigation-sync` for navigation changes
  - [ ] Use `theme-consistency-enforcer` for theme changes
  - [ ] Use `monorepo-consistency-audit` for audits

- [ ] **Plan Rollout Strategy**
  - [ ] Test in development app first (notes or journey)
  - [ ] Apply to main app
  - [ ] Roll out to remaining apps
  - [ ] Document any issues encountered

## Build Testing

After making changes, verify builds:

- [ ] **Clean Build All Apps**
  ```bash
  pnpm clean && pnpm build
  ```
  - [ ] All apps compile without errors
  - [ ] No TypeScript errors
  - [ ] No missing dependencies

- [ ] **Build Individual Apps**
  - [ ] `pnpm --filter @ainexsuite/main build`
  - [ ] `pnpm --filter @ainexsuite/journey build`
  - [ ] `pnpm --filter @ainexsuite/notes build`
  - [ ] `pnpm --filter @ainexsuite/todo build`
  - [ ] `pnpm --filter @ainexsuite/track build`
  - [ ] `pnpm --filter @ainexsuite/pulse build`
  - [ ] `pnpm --filter @ainexsuite/fit build`
  - [ ] `pnpm --filter @ainexsuite/grow build`
  - [ ] `pnpm --filter @ainexsuite/moments build`
  - [ ] `pnpm --filter @ainexsuite/notenex build`

## Visual Testing

Test key pages in each affected app:

### Main App
- [ ] Dashboard (/) loads correctly
- [ ] Settings page works
- [ ] Theme switcher functions
- [ ] Navigation links work

### Journey App (Orange/Forest Theme)
- [ ] Workspace view displays correctly
- [ ] Entry creation works
- [ ] Orange (#f97316) primary color preserved
- [ ] Forest (#22c55e) secondary color preserved
- [ ] Glassmorphism effects intact

### Notes App (Blue Theme)
- [ ] Notes list displays correctly
- [ ] Note editor functions properly
- [ ] Blue (#3b82f6) primary color preserved
- [ ] Clean professional styling maintained

### Other Apps
- [ ] Todo: Task list and creation
- [ ] Track: Tracking dashboard
- [ ] Pulse: Health metrics view
- [ ] Fit: Fitness dashboard
- [ ] Grow: Growth tracking
- [ ] Moments: Photo gallery

## Component Testing

Verify shared components render correctly:

- [ ] **Navigation Components**
  - [ ] TopNav displays in all apps
  - [ ] NavigationPanel works (apps that use it)
  - [ ] ProfileDropdown functions correctly
  - [ ] Theme-specific styling preserved

- [ ] **Footer Component**
  - [ ] Footer displays in all apps
  - [ ] Links work correctly
  - [ ] Styling matches app theme

- [ ] **Shared UI Components**
  - [ ] Buttons render with correct styling
  - [ ] Cards display properly
  - [ ] Forms function correctly
  - [ ] Modals work as expected

## Theme Testing

Verify theme consistency across apps:

- [ ] **Color Consistency**
  - [ ] Journey: Orange (#f97316) primary, Forest (#22c55e) secondary
  - [ ] Notes: Blue (#3b82f6) primary
  - [ ] Main: Theme switcher works for all themes
  - [ ] No color bleeding between apps

- [ ] **Dark Mode**
  - [ ] Dark mode toggle works in all apps
  - [ ] Dark mode colors consistent
  - [ ] Contrast ratios acceptable
  - [ ] No white flashes on load

- [ ] **Typography**
  - [ ] Font loading consistent
  - [ ] Font sizes match scale
  - [ ] Line heights appropriate

## Functionality Testing

Test core functionality in affected apps:

- [ ] **Authentication**
  - [ ] Login works in all apps
  - [ ] Profile menu functions
  - [ ] Logout works correctly
  - [ ] Auth state persistent

- [ ] **Data Operations**
  - [ ] Create operations work
  - [ ] Read/display operations work
  - [ ] Update operations work
  - [ ] Delete operations work

- [ ] **Navigation**
  - [ ] App routing works
  - [ ] External links function
  - [ ] Back/forward browser buttons work

## Performance Testing

Check performance impact:

- [ ] **Build Performance**
  - [ ] Build time < 5 minutes for all apps
  - [ ] No significant build time increase
  - [ ] Bundle sizes reasonable

- [ ] **Runtime Performance**
  - [ ] Page load time < 3 seconds
  - [ ] No layout shift issues
  - [ ] Smooth animations/transitions

## Git Review

Review changes before committing:

- [ ] **Git Diff Review**
  ```bash
  git status
  git diff
  ```
  - [ ] Only intended files modified
  - [ ] No unintended changes
  - [ ] No debug code or console.logs
  - [ ] No commented-out code

- [ ] **Commit Checklist**
  - [ ] All tests passing
  - [ ] All builds successful
  - [ ] Visual testing complete
  - [ ] Git diff reviewed

## Success Criteria

Mark as complete when:

- [x] All apps build successfully (pnpm build passes)
- [x] All visual tests pass
- [x] All theme tests pass
- [x] All functionality tests pass
- [x] Performance within acceptable range
- [x] Git diff reviewed and approved
- [x] Changes completed in < 5 minutes using skills (or < 15 min manual)

## Common Issues and Solutions

### Build Failures
**Issue**: TypeScript errors after changes
**Solution**:
```bash
pnpm type-check
cd apps/<failing-app> && pnpm type-check
# Fix type errors in failing app
```

### Theme Bleeding
**Issue**: Wrong colors appearing in apps
**Solution**:
- Check Tailwind config extends shared config
- Verify CSS variables defined correctly
- Use `theme-consistency-enforcer` skill to audit

### Component Inconsistencies
**Issue**: Components look different across apps
**Solution**:
- Use `monorepo-consistency-audit` skill
- Check if component should be in @ainexsuite/ui
- Verify theme-specific overrides correct

### Performance Issues
**Issue**: Slow build or runtime performance
**Solution**:
```bash
pnpm clean && pnpm build  # Clean build
pnpm build --profile      # Profile build
# Check for large dependencies or circular imports
```

---
*Checklist created: November 6, 2025*
*For ainexsuite cross-app testing*
