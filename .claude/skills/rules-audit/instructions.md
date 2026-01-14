# rules-audit

Analyze Firebase security rules for issues, vulnerabilities, and improvements.

## Usage

```
/rules-audit firestore     # Audit Firestore rules
/rules-audit storage       # Audit Storage rules
/rules-audit validate      # Validate syntax with Firebase MCP
/rules-audit report        # Generate full security report
/rules-audit all           # Run all audits
```

## Instructions

Parse the subcommand from the user's input and perform the corresponding audit.

---

## 1. Firestore Rules Audit (`/rules-audit firestore`)

Read and analyze `/Users/dinohorn/ainex/ainexsuite/firestore.rules` (main rules file, ~861 lines).

### Security Checks to Perform

#### HIGH Severity Issues

| Issue                 | Pattern to Find                            | Why It's Bad           |
| --------------------- | ------------------------------------------ | ---------------------- |
| Public write          | `allow write: if true`                     | Anyone can modify data |
| Public delete         | `allow delete: if true`                    | Anyone can delete data |
| Missing auth on write | `allow write` without `request.auth` check | Unauthenticated writes |
| Wildcard write        | `match /{document=**}` with `allow write`  | Catches all documents  |

#### MEDIUM Severity Issues

| Issue                   | Pattern to Find                                                         | Why It's Bad                |
| ----------------------- | ----------------------------------------------------------------------- | --------------------------- |
| Public read (sensitive) | `allow read: if true` on user data                                      | Exposes private data        |
| Missing ownership check | `allow update` without `resource.data.ownerId`                          | Users can edit others' data |
| Mutable ownerId         | Update without `request.resource.data.ownerId == resource.data.ownerId` | Owner can be changed        |
| Missing exists() check  | Space membership without `exists()`                                     | Fails on deleted spaces     |

#### LOW Severity Issues

| Issue                 | Pattern to Find                                 | Why It's Bad            |
| --------------------- | ----------------------------------------------- | ----------------------- |
| No input validation   | Create without field validation                 | Bad data can be written |
| Missing rate limiting | No comment about rate limits                    | DoS vulnerability       |
| Inconsistent patterns | Different auth patterns for similar collections | Maintenance risk        |

### Space Types to Verify Consistency

Check that these space collections follow the same patterns:

- `spaces` (Habits/Grow app)
- `fit_spaces` (Fit app)
- `todo_spaces` (Todo app)
- `journalSpaces` (Journal app)
- `healthSpaces` (Health app)
- `pulse_spaces` (Pulse app)
- `workflow_spaces` / `workflowSpaces` (Flow app)
- `moments_spaces` (Moments app)
- `project_spaces` (Projects app)
- `noteSpaces` (Notes app)
- `tableSpaces` (Tables app)

### Expected Space Pattern

```javascript
match /<space_collection>/{spaceId} {
  allow read: if isAuthenticated() && request.auth.uid in resource.data.memberUids;
  allow create: if isAuthenticated() && request.auth.uid in request.resource.data.memberUids;
  allow update: if isAuthenticated() && request.auth.uid in resource.data.memberUids;
  allow delete: if isAuthenticated() && resource.data.createdBy == request.auth.uid;
}
```

### Admin Pattern Check

Verify the `isAdmin()` helper function exists and is used correctly:

```javascript
function isAdmin() {
  return isAuthenticated() &&
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

Collections that should allow admin access:

- `apps/{appId}` - read: public, write: admin
- `settings/{settingId}` - read: public, write: admin
- `config/{configId}` - read: auth, write: admin
- `backgrounds/{backgroundId}` - read: auth, write: admin
- `covers/{coverId}` - read: public, write: admin
- `video-backgrounds/{videoId}` - read: public, write: admin
- `system_updates/{updateId}` - read: public, write: admin
- `users/{userId}` - list: admin
- `subscriptions/{userId}` - read: owner or admin, write: admin
- `admin_logs/{logId}` - read/create: admin

---

## 2. Storage Rules Audit (`/rules-audit storage`)

Read and analyze `/Users/dinohorn/ainex/ainexsuite/storage.rules` (~115 lines).

### Security Checks

#### HIGH Severity

| Issue                 | Pattern                              | Location         |
| --------------------- | ------------------------------------ | ---------------- |
| Public write          | `allow write: if true`               | Global paths     |
| Missing auth on write | `allow write` without `request.auth` | Any path         |
| Large file limits     | `request.resource.size` > 100MB      | Should be capped |

#### MEDIUM Severity

| Issue                             | Pattern                                | Location                               |
| --------------------------------- | -------------------------------------- | -------------------------------------- |
| Auth-only write (should be admin) | `allow write: if request.auth != null` | backgrounds, covers, video-backgrounds |
| Missing size limits               | No `request.resource.size` check       | User uploads                           |

#### Path Ownership Checks

Verify these paths enforce owner-only access:

- `/users/{userId}/backgrounds/` - owner only
- `/users/{userId}/notes/` - owner only
- `/moments/{userId}/` - read: auth, write: owner
- `/profile-images/{userId}/` - read: public, write: owner
- `/animated-avatars/{userId}/` - read: public, write: owner

### File Size Limits Reference

| Path             | Expected Limit | Reason                |
| ---------------- | -------------- | --------------------- |
| User backgrounds | 5MB            | Reasonable image size |
| Note attachments | 10MB           | Documents, images     |
| Moment photos    | 10MB           | High-res photos       |
| Profile images   | 2MB            | Avatar size           |
| Member avatars   | 2MB            | Avatar size           |
| Animated avatars | 100MB          | 1080p 8s videos       |

---

## 3. Validate Syntax (`/rules-audit validate`)

Use the Firebase MCP to validate rules syntax.

### Firestore Rules

```
Call: firebase_validate_security_rules
Parameters:
  type: "firestore"
  source_file: "firestore.rules"
```

### Storage Rules

```
Call: firebase_validate_security_rules
Parameters:
  type: "storage"
  source_file: "storage.rules"
```

### App-Specific Rules

Also validate:

- `apps/mosaic/firestore.rules`

Report any syntax errors or warnings returned.

---

## 4. Generate Report (`/rules-audit report`)

Combine all findings into a comprehensive security report.

### Report Format

````
================================================================================
                    FIREBASE SECURITY RULES AUDIT REPORT
================================================================================
Generated: <timestamp>
Project: ainexsuite

SUMMARY
--------------------------------------------------------------------------------
Firestore Rules: X issues (H high, M medium, L low)
Storage Rules: X issues (H high, M medium, L low)
Syntax Validation: Pass/Fail

CRITICAL FINDINGS (Action Required)
--------------------------------------------------------------------------------
[If any HIGH severity issues found]

| # | Severity | Rule File | Line | Issue | Recommendation |
|---|----------|-----------|------|-------|----------------|
| 1 | HIGH     | firestore | 123  | ...   | ...            |

WARNINGS (Should Review)
--------------------------------------------------------------------------------
[MEDIUM severity issues]

| # | Severity | Rule File | Line | Issue | Recommendation |
|---|----------|-----------|------|-------|----------------|
| 1 | MEDIUM   | storage   | 45   | ...   | ...            |

SUGGESTIONS (Nice to Have)
--------------------------------------------------------------------------------
[LOW severity issues]

| # | Severity | Rule File | Line | Issue | Recommendation |
|---|----------|-----------|------|-------|----------------|
| 1 | LOW      | firestore | 200  | ...   | ...            |

SPACE CONSISTENCY CHECK
--------------------------------------------------------------------------------
| Space Collection | Read | Create | Update | Delete | Status |
|------------------|------|--------|--------|--------|--------|
| spaces           | OK   | OK     | OK     | OK     | Pass   |
| fit_spaces       | OK   | OK     | OK     | MISS   | WARN   |
| ...              | ...  | ...    | ...    | ...    | ...    |

ADMIN PATTERN CHECK
--------------------------------------------------------------------------------
| Collection | Expected Access | Actual Access | Status |
|------------|-----------------|---------------|--------|
| apps       | public/admin    | public/admin  | Pass   |
| settings   | public/admin    | public/admin  | Pass   |
| ...        | ...             | ...           | ...    |

DETAILED FINDINGS
--------------------------------------------------------------------------------

### Finding #1: <Title>

**Location:** `firestore.rules` line 123
**Severity:** HIGH
**Rule:**
```javascript
// Code snippet showing the problematic rule
````

**Issue:** <Description of the problem>

**Recommendation:**

```javascript
// Suggested fix
```

---

## BEST PRACTICES COMPARISON

| Practice           | Status | Notes                         |
| ------------------ | ------ | ----------------------------- |
| Deny by default    | Pass   | Catch-all deny exists         |
| Auth on all writes | WARN   | 2 exceptions found            |
| Owner validation   | Pass   | All collections check ownerId |
| Input validation   | WARN   | Missing on some creates       |
| Size limits        | Pass   | Storage has limits            |

================================================================================
END OF REPORT
================================================================================

````

---

## 5. All Audits (`/rules-audit all`)

Run all audits in sequence:
1. `/rules-audit firestore`
2. `/rules-audit storage`
3. `/rules-audit validate`
4. Combine into `/rules-audit report`

---

## Quick Reference

### Files to Analyze

| File | Lines | Purpose |
|------|-------|---------|
| `/Users/dinohorn/ainex/ainexsuite/firestore.rules` | ~861 | Main Firestore rules |
| `/Users/dinohorn/ainex/ainexsuite/storage.rules` | ~115 | Storage rules |
| `/Users/dinohorn/ainex/ainexsuite/apps/mosaic/firestore.rules` | ~23 | Mosaic-specific rules |

### Firebase MCP Tools

| Tool | Purpose |
|------|---------|
| `firebase_validate_security_rules` | Syntax validation |
| `firebase_get_security_rules` | Get deployed rules |

### Common Vulnerability Patterns

```javascript
// BAD: Public write
allow write: if true;

// BAD: Auth but no ownership
allow write: if request.auth != null;

// BAD: Missing exists check
request.auth.uid in get(/databases/$(database)/documents/spaces/$(resource.data.spaceId)).data.memberUids

// GOOD: With exists check
exists(/databases/$(database)/documents/spaces/$(resource.data.spaceId)) &&
request.auth.uid in get(/databases/$(database)/documents/spaces/$(resource.data.spaceId)).data.memberUids
````

### Rule Analysis Approach

1. **Read the file** using the Read tool
2. **Parse rule blocks** - identify each `match` block
3. **Check each operation** - read, create, update, delete
4. **Verify conditions** - auth, ownership, validation
5. **Cross-reference** - compare similar collections
6. **Document findings** - severity, location, fix

---

## Example Output

When run without arguments, show usage:

```
Firebase Security Rules Audit

Usage:
  /rules-audit firestore   - Audit Firestore rules for security issues
  /rules-audit storage     - Audit Storage rules for security issues
  /rules-audit validate    - Validate syntax with Firebase
  /rules-audit report      - Generate comprehensive security report
  /rules-audit all         - Run all audits

Files analyzed:
  - /Users/dinohorn/ainex/ainexsuite/firestore.rules (861 lines)
  - /Users/dinohorn/ainex/ainexsuite/storage.rules (115 lines)
  - /Users/dinohorn/ainex/ainexsuite/apps/mosaic/firestore.rules (23 lines)
```

---

## Notes

- Always show line numbers when referencing issues
- Include code snippets for context
- Provide actionable fix recommendations
- Compare against the patterns in `/firebase-security` skill
- Use severity levels consistently (HIGH/MEDIUM/LOW)
- Flag any rules that differ from the expected patterns
