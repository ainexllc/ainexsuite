# AiNex App Style Guide

**Complete documentation for building identical Next.js applications with consistent design, structure, and functionality.**

This style guide captures every design decision, component pattern, and architectural choice from NoteNex, enabling you to build apps (like TaskNex, HabitNex, etc.) with the exact same look, feel, and behavior.

## Quick Start

1. **Clone the starter template**: `/Users/dino/ainex/ainex-app-starter`
2. **Customize app name**: Update logo, navigation, and branding
3. **Build features**: Use component templates and patterns from this guide
4. **Deploy**: Follow the Vercel deployment guide

## Documentation Structure

### Core Documentation

| Document | Description |
|----------|-------------|
| [Design System](./design-system.md) | Colors, typography, spacing, shadows, breakpoints |
| [Components](./components.md) | Complete component library with props and usage |
| [Layouts](./layouts.md) | Layout patterns, containers, grid systems |
| [Navigation](./navigation.md) | Top nav, slide-out panels, mobile behavior |
| [UI Patterns](./ui-patterns.md) | Buttons, forms, cards, modals, badges |
| [Icons](./icons.md) | Lucide React icon inventory and sizing |
| [Animations](./animations.md) | Transitions, motion design, hover effects |
| [Theming](./theming.md) | Dark/light mode system and implementation |
| [Functional Patterns](./functional-patterns.md) | Auth, data fetching, state management |
| [Page Templates](./page-templates.md) | Homepage, workspace, board layouts |
| [Dependencies](./dependencies.md) | Tech stack and package versions |
| [Project Structure](./project-structure.md) | File organization and naming conventions |

### Setup Guides

| Guide | Description |
|-------|-------------|
| [Local Development](./setup-guides/local-development.md) | Getting started with development |
| [Firebase Setup](./setup-guides/firebase-setup.md) | Configure Firebase project and services |
| [Vercel Deployment](./setup-guides/vercel-deployment.md) | Deploy to production |
| [Environment Variables](./setup-guides/environment-variables.md) | All env vars explained |

### Advanced Patterns

| Pattern | Description |
|---------|-------------|
| [Error Handling](./advanced-patterns/error-handling.md) | Error boundaries and fallback UI |
| [Loading States](./advanced-patterns/loading-states.md) | Skeletons, suspense, loading patterns |
| [Form Validation](./advanced-patterns/form-validation.md) | React Hook Form + Zod examples |
| [Accessibility](./advanced-patterns/accessibility.md) | ARIA, keyboard nav, screen readers |
| [Hooks Patterns](./advanced-patterns/hooks-patterns.md) | Custom hook creation patterns |
| [Utilities](./advanced-patterns/utilities.md) | Common utility functions |

## Templates

Ready-to-use component templates are available in [`/docs/templates`](./templates):

### Component Templates

- **Layout**: `app-shell`, `top-nav`, `navigation-panel`, `container`, `settings-panel`
- **Branding**: `logo-wordmark`
- **UI**: `button`, `input`, `modal`, `card`, `empty-state`
- **Providers**: `app-providers`, `theme-provider`, `auth-provider`

### Page Templates

- `landing-page` - Public homepage structure
- `workspace-page` - Main app workspace layout
- `item-board` - Generic board/grid view
- `item-card` - Generic item card component

### Configuration Templates

- `tailwind.config.ts` - Complete Tailwind setup
- `next.config.ts` - Next.js configuration
- `globals.css` - Global styles and CSS variables
- `firebase.json` - Firebase hosting config
- `.env.example` - Environment variables
- `package.json` - Dependencies list

## Design Principles

### 1. **Consistency First**
Every app should look and feel identical in structure, even if the content differs. Same navigation, same panels, same responsive behavior.

### 2. **Customizable Branding**
Easy to swap: app name, accent color, logo. Hard to change: layout dimensions, component structure.

### 3. **Mobile-First Responsive**
All layouts adapt gracefully from mobile (320px) to desktop (1920px+).

### 4. **Dark Mode by Default**
Theme system with automatic system preference detection and manual toggle.

### 5. **Accessibility Built-In**
ARIA labels, keyboard navigation, screen reader support in all components.

### 6. **Performance Optimized**
Code splitting, lazy loading, optimized images, minimal bundle size.

## Key Specifications

### Layout Dimensions

| Element | Dimension | Behavior |
|---------|-----------|----------|
| Top Nav | 64px height | Fixed, spans full width |
| Left Panel | 280px width | Slide-out, rounded-r-3xl |
| Right Panels | 480px width | Slide-out, rounded-l-3xl |
| Container (default) | 560px → 880px | Responsive max-width |
| Container (wide) | 700px → 1440px | Responsive max-width |
| Container (narrow) | 520px → 1200px | Responsive max-width |

### Color System

| Color | Hex | Usage |
|-------|-----|-------|
| Accent (Orange) | `#F97316` | Primary interactions, CTAs |
| Surface Base | `#141416` | Main background (dark mode) |
| Surface Muted | `#1C1C1F` | Secondary surfaces |
| Surface Elevated | `#24242A` | Cards, modals, panels |
| Ink 900 | `#F7F7FA` | Primary text (dark mode) |
| Ink 600 | `#89898C` | Secondary text |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Headings | Geist Sans | 24-32px | 600-700 |
| Body | Geist Sans | 14-16px | 400-500 |
| Branding | Kanit | 20-28px | 600-700 |
| Code | Geist Mono | 14px | 400 |

### Breakpoints

| Name | Min Width | Usage |
|------|-----------|-------|
| sm | 640px | Tablets and up |
| md | 768px | Small laptops |
| lg | 1024px | Desktops |
| xl | 1280px | Large screens |
| 2xl | 1536px | Extra large |

## Starter Boilerplate

**Location**: `/Users/dino/ainex/ainex-app-starter`

A minimal, production-ready Next.js template with:
- ✅ Design system configured
- ✅ Firebase authentication working
- ✅ Navigation structure implemented
- ✅ Public homepage template
- ✅ Example workspace page
- ✅ Dark/light mode toggle
- ✅ Fully responsive
- ✅ All dependencies installed

**To use:**
```bash
# Copy the starter template
cp -r /Users/dino/ainex/ainex-app-starter /Users/dino/ainex/tasknex-app

# Install dependencies
cd /Users/dino/ainex/tasknex-app
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Start development
npm run dev
```

## Common Use Cases

### Building a Tasks App

1. Clone `ainex-app-starter` to `tasknex-app`
2. Update logo: "NoteNex" → "TaskNex"
3. Change accent color (optional): Orange → Blue
4. Modify navigation items: Notes → Tasks, Reminders → Deadlines
5. Build task-specific components using `item-board` and `item-card` templates
6. Deploy to Vercel

### Building a Habit Tracker

1. Clone `ainex-app-starter` to `habitnex-app`
2. Update logo: "NoteNex" → "HabitNex"
3. Change accent color (optional): Orange → Green
4. Modify navigation items: Notes → Habits, Archive → History
5. Build habit-specific components (calendar, streaks, etc.)
6. Deploy to Vercel

## Support & Updates

- **Source project**: `/Users/dino/ainex/notenex_app`
- **Starter template**: `/Users/dino/ainex/ainex-app-starter`
- **Documentation**: This directory (`/docs`)

When NoteNex is updated with new patterns or components, update:
1. Relevant documentation files
2. Template files in `/docs/templates`
3. Starter boilerplate project

---

**Version**: 1.0.0
**Last Updated**: January 2025
**Maintained by**: AiNex LLC
