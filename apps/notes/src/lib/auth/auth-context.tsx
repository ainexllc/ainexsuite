"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { initAnalytics, getFirebaseAuth } from "@/lib/firebase/client-app";

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

const noop = async () => Promise.resolve();

const AuthContext = createContext<AuthContextValue>({
  status: "loading",
  user: null,
  signInWithGoogle: noop,
  signInWithEmail: async () => Promise.reject(new Error("Auth provider not ready")),
  signUpWithEmail: async () => Promise.reject(new Error("Auth provider not ready")),
  signOut: noop,
});

function mapFirebaseUser(user: User): SessionUser {
  return {
    id: user.uid,
    email: user.email ?? "",
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      try {
        const auth = await getFirebaseAuth();
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (!isMounted) {
            return;
          }

          if (firebaseUser) {
            setUser(mapFirebaseUser(firebaseUser));
            setStatus("authenticated");
          } else {
            setUser(null);
            setStatus("unauthenticated");
          }
        });

        void initAnalytics();
      } catch (error) {
        console.error("Failed to initialize Firebase auth", error);
        if (isMounted) {
          setUser(null);
          setStatus("unauthenticated");
        }
      }
    })();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const auth = await getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithPopup(auth, provider);
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const auth = await getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const auth = await getFirebaseAuth();
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const signOut = useCallback(async () => {
    const auth = await getFirebaseAuth();
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
    }),
    [status, user, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
