# Environment Variables to Add to Vercel Projects

Add these to **ALL 7 projects** (main, journey, notes, todo, moments, grow, track)

## How to Add in Vercel Dashboard

For each project:
1. Go to project Settings → Environment Variables
2. Add each variable below
3. Select **Production, Preview, and Development** for each
4. Mark the three Firebase Admin variables as **Sensitive**

---

## Public Environment Variables

Add these exactly as shown (same for all 7 projects):

### 1. NEXT_PUBLIC_MAIN_DOMAIN
```
NEXT_PUBLIC_MAIN_DOMAIN
www.ainexsuite.com
```

### 2. NEXT_PUBLIC_FIREBASE_API_KEY
```
NEXT_PUBLIC_FIREBASE_API_KEY
AIzaSyAvYZXrWGomqINh20NNiMlWxddm5eetkKc
```

### 3. NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
```
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
alnexsuite.firebaseapp.com
```

### 4. NEXT_PUBLIC_FIREBASE_PROJECT_ID
```
NEXT_PUBLIC_FIREBASE_PROJECT_ID
alnexsuite
```

### 5. NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
```
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
alnexsuite.firebasestorage.app
```

### 6. NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
```
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
1062785888767
```

### 7. NEXT_PUBLIC_FIREBASE_APP_ID
```
NEXT_PUBLIC_FIREBASE_APP_ID
1:1062785888767:web:9e29360b8b12e9723a77ca
```

---

## Secret Environment Variables (Mark as Sensitive ⚠️)

You need to get these from Firebase Console first:

### Get Firebase Admin SDK Credentials

1. Go to: https://console.firebase.google.com/project/alnexsuite/settings/serviceaccounts/adminsdk
2. Click **"Generate New Private Key"**
3. Download the JSON file
4. Open it and extract these three values:

### 8. FIREBASE_ADMIN_PROJECT_ID (Mark as Sensitive)
```
FIREBASE_ADMIN_PROJECT_ID
```
Value: Copy from JSON field `project_id` (should be: `alnexsuite`)

### 9. FIREBASE_ADMIN_CLIENT_EMAIL (Mark as Sensitive)
```
FIREBASE_ADMIN_CLIENT_EMAIL
```
Value: Copy from JSON field `client_email` (looks like: `firebase-adminsdk-xxxxx@alnexsuite.iam.gserviceaccount.com`)

### 10. FIREBASE_ADMIN_PRIVATE_KEY (Mark as Sensitive)
```
FIREBASE_ADMIN_PRIVATE_KEY
```
Value: Copy from JSON field `private_key` (starts with `-----BEGIN PRIVATE KEY-----` and includes newlines)

**Important**: Copy the entire private key including:
- `-----BEGIN PRIVATE KEY-----`
- All the encrypted content (multiple lines)
- `-----END PRIVATE KEY-----`

---

## App-Specific Variable (DIFFERENT for each project)

### 11. NEXT_PUBLIC_APP_NAME

**For ainexsuite-main**:
```
NEXT_PUBLIC_APP_NAME
main
```

**For ainexsuite-journey**:
```
NEXT_PUBLIC_APP_NAME
journey
```

**For ainexsuite-notes**:
```
NEXT_PUBLIC_APP_NAME
notes
```

**For ainexsuite-todo**:
```
NEXT_PUBLIC_APP_NAME
todo
```

**For ainexsuite-moments**:
```
NEXT_PUBLIC_APP_NAME
moments
```

**For ainexsuite-grow**:
```
NEXT_PUBLIC_APP_NAME
grow
```

**For ainexsuite-track**:
```
NEXT_PUBLIC_APP_NAME
track
```

---

## Quick Checklist for Each Project

For each of the 7 projects:

- [ ] Add 8 public Firebase variables (same for all)
- [ ] Add 3 secret Firebase Admin variables (mark as Sensitive)
- [ ] Add 1 app-specific NEXT_PUBLIC_APP_NAME variable
- [ ] Apply to: Production, Preview, Development
- [ ] Total: 11 variables per project

---

## Project Links for Adding Env Variables

Click these to go directly to environment variable settings:

1. [ainexsuite-main/settings/environment-variables](https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-main/settings/environment-variables)
2. [ainexsuite-journey/settings/environment-variables](https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-journey/settings/environment-variables)
3. [ainexsuite-notes/settings/environment-variables](https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-notes/settings/environment-variables)
4. [ainexsuite-todo/settings/environment-variables](https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-todo/settings/environment-variables)
5. [ainexsuite-moments/settings/environment-variables](https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-moments/settings/environment-variables)
6. [ainexsuite-grow/settings/environment-variables](https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-grow/settings/environment-variables)
7. [ainexsuite-track/settings/environment-variables](https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite-track/settings/environment-variables)

---

## After Adding Variables

Once all environment variables are added:

1. Go back to the deployment that failed
2. Click **"Redeploy"** button
3. The build should succeed this time

Or push a new commit to trigger a fresh deployment.

---

## Security Notes

- ✅ Public variables (NEXT_PUBLIC_*) are safe to expose in browser
- ⚠️ Mark all Firebase Admin variables as Sensitive
- 🔒 Never commit the Firebase Admin SDK JSON to git
- 🗑️ Delete the downloaded JSON file after extracting values
