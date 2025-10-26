'use client';

/**
 * Auth Context Provider for React apps
 * Manages authentication state across the application
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@ainexsuite/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { User } from '@ainexsuite/types';
import { setSessionCookie, removeSessionCookie } from './session';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Get ID token and create session cookie
          const idToken = await firebaseUser.getIdToken();

          // Call Cloud Function to generate session cookie
          const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          if (response.ok) {
            const { sessionCookie, user: userData } = await response.json();
            setSessionCookie(sessionCookie);
            setUser(userData);
          } else {
            // Fallback: Create minimal user object from Firebase user
            console.warn('Session endpoint failed, using Firebase user data');
            const now = Date.now();
            const userData: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email || 'User',
              photoURL: firebaseUser.photoURL || '',
              preferences: {
                theme: 'dark',
                language: 'en',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                notifications: {
                  email: true,
                  push: false,
                  inApp: true,
                },
              },
              createdAt: now,
              lastLoginAt: now,
              apps: {
                notes: false,
                journey: false,
                todo: false,
                track: false,
                moments: false,
                grow: false,
                pulse: false,
                fit: false,
              },
              appPermissions: {},
              appsUsed: {},
              trialStartDate: now,
              subscriptionStatus: 'trial',
              suiteAccess: false,
            };
            setUser(userData);
          }
        } catch (error) {
          // Fallback: Create minimal user object from Firebase user
          console.error('Session creation error:', error);
          const now = Date.now();
          const userData: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || firebaseUser.email || 'User',
            photoURL: firebaseUser.photoURL || '',
            preferences: {
              theme: 'dark',
              language: 'en',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              notifications: {
                email: true,
                push: false,
                inApp: true,
              },
            },
            createdAt: now,
            lastLoginAt: now,
            apps: {
              notes: false,
              journey: false,
              todo: false,
              track: false,
              moments: false,
              grow: false,
              pulse: false,
              fit: false,
            },
            appPermissions: {},
            appsUsed: {},
            trialStartDate: now,
            subscriptionStatus: 'trial',
            suiteAccess: false,
          };
          setUser(userData);
        }
      } else {
        removeSessionCookie();
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOutUser = useCallback(async () => {
    await firebaseSignOut(auth);
    removeSessionCookie();
    setUser(null);
    setFirebaseUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signOut: signOutUser,
        logout: signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
