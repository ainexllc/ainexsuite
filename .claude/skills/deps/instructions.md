# Deps Skill

Show dependency information for an AinexSuite app.

## Usage

```
/deps <app-name>                    # Show all dependencies
/deps <app-name> <package-name>     # Show why a specific package is installed
```

## Arguments

- `<app-name>`: Required. One of: main, notes, journal, todo, health, album, habits, mosaic, fit, projects, flow, subs, docs, tables, calendar, admin
- `<package-name>`: Optional. Specific package to query

## Instructions

1. Validate the app name is one of the supported apps.

2. Change to the monorepo root directory:

   ```
   /Users/dinohorn/ainex/ainexsuite
   ```

3. Based on the usage:

### Show all dependencies for an app

```bash
# List direct dependencies from package.json
cat apps/<app-name>/package.json | jq '.dependencies, .devDependencies'

# Or show workspace dependencies
pnpm list --filter @ainexsuite/<app-name> --depth 0
```

### Show why a specific package is installed

```bash
pnpm why <package-name> --filter @ainexsuite/<app-name>
```

4. Organize output into sections:

### Workspace Dependencies (internal packages)

These are packages from the monorepo:

- @ainexsuite/ui
- @ainexsuite/types
- @ainexsuite/theme
- @ainexsuite/firebase
- @ainexsuite/auth
- @ainexsuite/ai
- @ainexsuite/config

### External Dependencies

All other npm packages.

5. Example output format:

```
Dependencies for @ainexsuite/<app-name>

Workspace Dependencies:
  @ainexsuite/ui         workspace:*
  @ainexsuite/types      workspace:*
  @ainexsuite/theme      workspace:*
  @ainexsuite/firebase   workspace:*

External Dependencies:
  next                   15.x.x
  react                  19.x.x
  react-dom              19.x.x
  tailwindcss            3.x.x
  ...

Dev Dependencies:
  typescript             5.x.x
  @types/react           19.x.x
  ...
```

6. For specific package queries, show the dependency path:

```
Why is <package> installed in @ainexsuite/<app-name>?

<app-name>
  -> @ainexsuite/ui
    -> <package>@x.x.x
```
