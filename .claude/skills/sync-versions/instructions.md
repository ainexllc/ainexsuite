# sync-versions

Bump versions across all or selected apps in the AinexSuite monorepo.

## Usage

```
/sync-versions <command> [options]
```

**Commands:**

- `patch` - Bump patch version (0.0.X)
- `minor` - Bump minor version (0.X.0)
- `major` - Bump major version (X.0.0)
- `status` - Display current versions of all apps
- `set <version>` - Set all apps to a specific version

**Options:**

- `--apps <app1> <app2> ...` - Only bump specified apps

## Examples

```bash
# Bump all apps
/sync-versions patch
/sync-versions minor
/sync-versions major

# Bump specific apps only
/sync-versions patch --apps main notes journal

# Show current versions
/sync-versions status

# Set all apps to specific version
/sync-versions set 1.2.0

# Set specific apps to version
/sync-versions set 2.0.0 --apps main notes
```

## Instructions

### All Apps to Manage

```
main, notes, journal, todo, health, album, habits, mosaic, fit, projects, flow, subs, docs, tables, calendar, admin
```

### 1. Parse Arguments

Extract from user input:

- `command`: One of `patch`, `minor`, `major`, `status`, or `set`
- `targetVersion` (for `set` command): The version string (e.g., `1.2.0`)
- `apps` (optional): Array of app names to update. If not provided, update all apps.

### 2. Execute Command

#### For `status` command:

Read all package.json files and display a formatted table:

```bash
# Read all versions
for app in main notes journal todo health album habits mosaic fit projects flow subs docs tables calendar admin; do
  version=$(cat /Users/dinohorn/ainex/ainexsuite/apps/$app/package.json | grep '"version"' | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
  echo "$app: $version"
done
```

Display as a formatted markdown table:

| App   | Version |
| ----- | ------- |
| main  | 1.0.0   |
| notes | 1.0.1   |
| ...   | ...     |

#### For `patch`, `minor`, `major` commands:

1. **Get current version** from the first app (or target app if specified)
2. **Calculate new version** based on bump type:
   - `patch`: 1.0.0 -> 1.0.1
   - `minor`: 1.0.0 -> 1.1.0
   - `major`: 1.0.0 -> 2.0.0

3. **Update each app's package.json** by editing the version field directly:

```bash
# For each app, update the version in package.json
# Use Node.js for reliable JSON manipulation:
node -e "
const fs = require('fs');
const path = '/Users/dinohorn/ainex/ainexsuite/apps/<app>/package.json';
const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
pkg.version = '<new-version>';
fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
console.log('Updated <app> to <new-version>');
"
```

4. **After all updates**, run pnpm install to update the lockfile:

```bash
cd /Users/dinohorn/ainex/ainexsuite && pnpm install
```

#### For `set <version>` command:

1. **Validate version format** - Must match semver pattern (e.g., `1.2.3`)
2. **Update each app's package.json** to the specified version
3. **Run pnpm install** to update lockfile

### 3. Version Calculation Logic

When bumping versions, use this logic:

```javascript
function bumpVersion(currentVersion, type) {
  const [major, minor, patch] = currentVersion.split(".").map(Number);
  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
  }
}
```

### 4. Output

After execution, display:

1. **Summary table** of changes:

| App   | Old Version | New Version |
| ----- | ----------- | ----------- |
| main  | 1.0.0       | 1.0.1       |
| notes | 1.0.0       | 1.0.1       |
| ...   | ...         | ...         |

2. **Confirmation message**:
   - Number of apps updated
   - Whether pnpm install succeeded

3. **Next steps reminder**:
   - "Run `pnpm build` to verify all apps build successfully"
   - "Commit with: `git commit -am 'chore: bump versions to X.X.X'`"

### 5. Error Handling

- If an app directory doesn't exist, skip it and warn
- If package.json is malformed, report error and skip
- If version format is invalid for `set` command, abort with error
- Validate app names against the known list

### 6. Validation

Before updating, verify:

- All specified apps exist in `apps/` directory
- Version string is valid semver format (X.Y.Z)
- Current versions can be read from package.json files

## App Reference

| App      | Port | Package Name         |
| -------- | ---- | -------------------- |
| main     | 3000 | @ainexsuite/main     |
| notes    | 3001 | @ainexsuite/notes    |
| journal  | 3002 | @ainexsuite/journal  |
| todo     | 3003 | @ainexsuite/todo     |
| health   | 3004 | @ainexsuite/health   |
| album    | 3005 | @ainexsuite/album    |
| habits   | 3006 | @ainexsuite/habits   |
| mosaic   | 3007 | @ainexsuite/mosaic   |
| fit      | 3008 | @ainexsuite/fit      |
| projects | 3009 | @ainexsuite/projects |
| flow     | 3010 | @ainexsuite/flow     |
| subs     | 3011 | @ainexsuite/subs     |
| docs     | 3012 | @ainexsuite/docs     |
| tables   | 3013 | @ainexsuite/tables   |
| calendar | 3014 | @ainexsuite/calendar |
| admin    | 3020 | @ainexsuite/admin    |

## Quick Reference

```bash
# Most common usage - bump all apps by patch
/sync-versions patch

# Before a release - bump minor
/sync-versions minor

# Check what versions are currently set
/sync-versions status

# Sync all apps to same version after drift
/sync-versions set 1.2.0
```
