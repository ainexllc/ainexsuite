# Functional Patterns

Core functionality patterns for authentication, Firebase integration, state management, and data operations.

## Authentication Patterns

### Auth Context Structure

```tsx
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type SessionUser = {
  id: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
};

export type AuthContextValue = {
  status: AuthStatus;
  user: SessionUser | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};
```

### Auth Provider Implementation

**File:** `src/lib/auth/auth-context.tsx`

```tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client-app";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<SessionUser | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      const auth = await getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (!isMounted) return;

        if (firebaseUser) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email ?? "",
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
          setStatus("authenticated");
        } else {
          setUser(null);
          setStatus("unauthenticated");
        }
      });
    })();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);

  const signInWithGoogle = async () => {
    const auth = await getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    const auth = await getFirebaseAuth();
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ status, user, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

### Using Auth in Components

```tsx
import { useAuth } from "@/lib/auth/auth-context";

export function ProfileButton() {
  const { status, user, signInWithGoogle, signOut } = useAuth();

  if (status === "loading") {
    return <Spinner />;
  }

  if (status === "unauthenticated") {
    return <button onClick={signInWithGoogle}>Sign In</button>;
  }

  return (
    <div>
      <p>{user?.displayName}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Protected Routes

```tsx
"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return <Loader />;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
```

---

## Firebase Patterns

### Client-Side Firebase Initialization

**File:** `src/lib/firebase/client-app.ts`

```tsx
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

export function getFirebaseApp() {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
}

export async function getFirebaseAuth() {
  if (!auth) {
    const { getAuth } = await import("firebase/auth");
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export async function getFirebaseDb() {
  if (!db) {
    const { getFirestore } = await import("firebase/firestore");
    db = getFirestore(getFirebaseApp());
  }
  return db;
}
```

### Firestore CRUD Operations

```tsx
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "./client-app";

// Create
export async function createNote(userId: string, data: NoteDraft) {
  const db = await getFirebaseDb();
  const notesRef = collection(db, "users", userId, "notes");

  const docRef = await addDoc(notesRef, {
    ...data,
    createdAt: Timestamp.now().toMillis(),
    updatedAt: Timestamp.now().toMillis(),
  });

  return docRef.id;
}

// Read
export async function getNote(userId: string, noteId: string) {
  const db = await getFirebaseDb();
  const noteRef = doc(db, "users", userId, "notes", noteId);
  const snapshot = await getDoc(noteRef);

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() } as Note;
}

// Update
export async function updateNote(userId: string, noteId: string, updates: Partial<Note>) {
  const db = await getFirebaseDb();
  const noteRef = doc(db, "users", userId, "notes", noteId);

  await updateDoc(noteRef, {
    ...updates,
    updatedAt: Timestamp.now().toMillis(),
  });
}

// Delete
export async function deleteNote(userId: string, noteId: string) {
  const db = await getFirebaseDb();
  const noteRef = doc(db, "users", userId, "notes", noteId);
  await deleteDoc(noteRef);
}
```

### Real-Time Subscriptions

```tsx
import { onSnapshot } from "firebase/firestore";

export function subscribeToNotes(userId: string, callback: (notes: Note[]) => void) {
  const notesRef = collection(db, "users", userId, "notes");
  const q = query(
    notesRef,
    where("deleted", "==", false),
    orderBy("updatedAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Note[];

    callback(notes);
  });

  return unsubscribe; // Call to stop listening
}
```

---

## State Management Patterns

### Context Provider Pattern

```tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";

type NotesContextValue = {
  notes: Note[];
  loading: boolean;
  createNote: (data: NoteDraft) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
};

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToNotes(user.id, (freshNotes) => {
      setNotes(freshNotes);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const createNote = async (data: NoteDraft) => {
    if (!user) return;
    await createNoteMutation(user.id, data);
    // Real-time listener will update state
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    if (!user) return;
    await updateNoteMutation(user.id, id, updates);
  };

  const deleteNote = async (id: string) => {
    if (!user) return;
    await deleteNoteMutation(user.id, id);
  };

  return (
    <NotesContext.Provider value={{ notes, loading, createNote, updateNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within NotesProvider");
  }
  return context;
}
```

### Search and Filter Pattern

```tsx
export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLabelIds, setActiveLabelIds] = useState<string[]>([]);

  // Computed filtered notes
  const filteredNotes = useMemo(() => {
    let result = notes;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.body.toLowerCase().includes(query)
      );
    }

    // Filter by labels
    if (activeLabelIds.length > 0) {
      result = result.filter(note =>
        note.labelIds?.some(id => activeLabelIds.includes(id))
      );
    }

    return result;
  }, [notes, searchQuery, activeLabelIds]);

  // Separate pinned and others
  const pinned = useMemo(() =>
    filteredNotes.filter(n => n.pinned && !n.archived),
    [filteredNotes]
  );

  const others = useMemo(() =>
    filteredNotes.filter(n => !n.pinned && !n.archived),
    [filteredNotes]
  );

  return (
    <NotesContext.Provider value={{
      notes: filteredNotes,
      pinned,
      others,
      searchQuery,
      setSearchQuery,
      activeLabelIds,
      setActiveLabelIds,
    }}>
      {children}
    </NotesContext.Provider>
  );
}
```

---

## Form Patterns (React Hook Form + Zod)

### Form with Validation

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await signInWithEmail(data.email, data.password);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          {...register("email")}
          type="email"
          placeholder="Email"
          className="w-full rounded-lg border px-3 py-2"
        />
        {errors.email && <p className="text-sm text-danger">{errors.email.message}</p>}
      </div>

      <div>
        <input
          {...register("password")}
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border px-3 py-2"
        />
        {errors.password && <p className="text-sm text-danger">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-accent-500 px-4 py-2 text-white"
      >
        {isSubmitting ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
```

---

## Data Fetching Patterns

### Client-Side Fetching

```tsx
export function NotesList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchNotes = async () => {
      try {
        const data = await getNotes(userId);
        if (isMounted) {
          setNotes(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    fetchNotes();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  return <NotesGrid notes={notes} />;
}
```

---

## Implementation Checklist

- [ ] Set up AuthProvider with Firebase Auth
- [ ] Implement Google OAuth and email/password auth
- [ ] Create protected route wrapper
- [ ] Initialize Firebase client SDK
- [ ] Implement Firestore CRUD operations
- [ ] Set up real-time subscriptions
- [ ] Create feature providers (Notes, Reminders, etc.)
- [ ] Implement search and filter logic
- [ ] Add React Hook Form + Zod validation
- [ ] Handle loading and error states
- [ ] Test authentication flow end-to-end
- [ ] Verify real-time updates work

---

**Next Steps:**
- [Components →](./components.md) - Provider components
- [Setup Guides →](./setup-guides/firebase-setup.md) - Firebase configuration
- [Form Validation →](./advanced-patterns/form-validation.md) - Advanced form patterns
