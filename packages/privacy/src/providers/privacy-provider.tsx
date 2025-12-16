'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { useAuth } from '@ainexsuite/auth';
import { db } from '@ainexsuite/firebase';
import { useToast } from '@ainexsuite/ui';
import { doc, getDoc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import bcryptjs from 'bcryptjs';
import type { PrivacyContextValue, PrivacyProviderConfig } from '../types';

const PrivacyContext = createContext<PrivacyContextValue | undefined>(undefined);

const DEFAULT_SESSION_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const DEFAULT_SETTINGS_COLLECTION = 'user_settings';

const DEFAULT_MESSAGES = {
  passcodeSet: 'Passcode set',
  passcodeSetDescription: 'Your privacy passcode has been set successfully.',
  passcodeRemoved: 'Passcode removed',
  passcodeRemovedDescription: 'Your privacy passcode has been removed.',
  unlocked: 'Unlocked',
  unlockedDescription: 'Private entries unlocked for 15 minutes.',
  sessionExtended: 'Session extended',
  sessionExtendedDescription: 'Private entries will remain unlocked for another 15 minutes.',
  incorrectPasscode: 'Incorrect passcode',
  incorrectPasscodeDescription: 'Please try again.',
  error: 'Error',
  errorDescription: 'An error occurred. Please try again.',
};

interface PrivacyProviderProps {
  children: ReactNode;
  config: PrivacyProviderConfig;
}

export function PrivacyProvider({ children, config }: PrivacyProviderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [hasPasscode, setHasPasscode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionEndTime, setSessionEndTime] = useState<number | null>(null);
  const [passcodeHash, setPasscodeHash] = useState<string | null>(null);

  const sessionDuration = config.sessionDuration ?? DEFAULT_SESSION_DURATION;
  const settingsCollection = config.settingsCollection ?? DEFAULT_SETTINGS_COLLECTION;
  const messages = { ...DEFAULT_MESSAGES, ...config.messages };

  // Helper to get settings document reference
  const getSettingsRef = (userId: string) => {
    return doc(db, settingsCollection, userId);
  };

  // Load user's passcode settings
  useEffect(() => {
    if (user) {
      loadPasscodeSettings();
    } else {
      setIsLoading(false);
      setHasPasscode(false);
      setIsUnlocked(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Timer countdown
  useEffect(() => {
    if (!sessionEndTime || !isUnlocked) {
      setRemainingTime(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = sessionEndTime - Date.now();
      if (remaining <= 0) {
        lockNow();
      } else {
        setRemainingTime(Math.floor(remaining / 1000)); // Convert to seconds
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionEndTime, isUnlocked]);

  const loadPasscodeSettings = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const settingsRef = getSettingsRef(user.uid);
      const docSnap = await getDoc(settingsRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // Use app-namespaced field for passcode
        const passcodeField = `${config.appName}PrivacyPasscode`;

        if (data?.[passcodeField]) {
          setHasPasscode(true);
          setPasscodeHash(data[passcodeField]);
        } else if (data?.privacyPasscode) {
          // Fallback to legacy field name for backward compatibility
          setHasPasscode(true);
          setPasscodeHash(data.privacyPasscode);
        } else {
          setHasPasscode(false);
        }
      } else {
        setHasPasscode(false);
      }
    } catch {
      // Ignore setting loading error
    } finally {
      setIsLoading(false);
    }
  };

  const setupPasscode = async (passcode: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Hash the passcode
      const salt = await bcryptjs.genSalt(10);
      const hash = await bcryptjs.hash(passcode, salt);

      const settingsRef = getSettingsRef(user.uid);
      const passcodeField = `${config.appName}PrivacyPasscode`;
      const createdAtField = `${config.appName}PrivacyPasscodeCreatedAt`;

      // Check if document exists
      const docSnap = await getDoc(settingsRef);

      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(settingsRef, {
          [passcodeField]: hash,
          [createdAtField]: Timestamp.now(),
        });
      } else {
        // Create new document
        await setDoc(settingsRef, {
          userId: user.uid,
          [passcodeField]: hash,
          [createdAtField]: Timestamp.now(),
          lastUpdated: Timestamp.now(),
        });
      }

      setHasPasscode(true);
      setPasscodeHash(hash);

      toast({
        title: messages.passcodeSet,
        description: messages.passcodeSetDescription,
        variant: 'success',
      });

      return true;
    } catch {
      toast({
        title: messages.error,
        description: messages.errorDescription,
        variant: 'error',
      });
      return false;
    }
  };

  const verifyPasscode = async (passcode: string): Promise<boolean> => {
    if (!passcodeHash) return false;

    try {
      const isValid = await bcryptjs.compare(passcode, passcodeHash);

      if (isValid) {
        const endTime = Date.now() + sessionDuration;
        setSessionEndTime(endTime);
        setIsUnlocked(true);
        setRemainingTime(sessionDuration / 1000);

        const durationMinutes = Math.floor(sessionDuration / 60000);
        toast({
          title: messages.unlocked,
          description: messages.unlockedDescription.replace('15', String(durationMinutes)),
          variant: 'success',
        });

        return true;
      } else {
        toast({
          title: messages.incorrectPasscode,
          description: messages.incorrectPasscodeDescription,
          variant: 'error',
        });
        return false;
      }
    } catch {
      return false;
    }
  };

  const lockNow = () => {
    setIsUnlocked(false);
    setSessionEndTime(null);
    setRemainingTime(0);
  };

  const extendSession = () => {
    if (isUnlocked) {
      const endTime = Date.now() + sessionDuration;
      setSessionEndTime(endTime);
      setRemainingTime(sessionDuration / 1000);

      const durationMinutes = Math.floor(sessionDuration / 60000);
      toast({
        title: messages.sessionExtended,
        description: messages.sessionExtendedDescription.replace('15', String(durationMinutes)),
        variant: 'success',
      });
    }
  };

  const removePasscode = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const settingsRef = getSettingsRef(user.uid);
      const passcodeField = `${config.appName}PrivacyPasscode`;
      const createdAtField = `${config.appName}PrivacyPasscodeCreatedAt`;

      await updateDoc(settingsRef, {
        [passcodeField]: null,
        [createdAtField]: null,
      });

      setHasPasscode(false);
      setPasscodeHash(null);
      lockNow();

      toast({
        title: messages.passcodeRemoved,
        description: messages.passcodeRemovedDescription,
        variant: 'success',
      });

      return true;
    } catch {
      toast({
        title: messages.error,
        description: messages.errorDescription,
        variant: 'error',
      });
      return false;
    }
  };

  return (
    <PrivacyContext.Provider
      value={{
        isUnlocked,
        remainingTime,
        hasPasscode,
        isLoading,
        setupPasscode,
        verifyPasscode,
        lockNow,
        extendSession,
        removePasscode,
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy(): PrivacyContextValue {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
}
