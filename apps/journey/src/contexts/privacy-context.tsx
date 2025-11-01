'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { getUserSettings, updateUserSettings } from '@/lib/firebase/settings';
import { useToast } from './toast-context';
import bcryptjs from 'bcryptjs';

interface PrivacyContextType {
  isUnlocked: boolean;
  remainingTime: number;
  hasPasscode: boolean;
  isLoading: boolean;
  setupPasscode: (passcode: string) => Promise<boolean>;
  verifyPasscode: (passcode: string) => Promise<boolean>;
  lockNow: () => void;
  extendSession: () => void;
  removePasscode: () => Promise<boolean>;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

const SESSION_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [hasPasscode, setHasPasscode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionEndTime, setSessionEndTime] = useState<number | null>(null);
  const [passcodeHash, setPasscodeHash] = useState<string | null>(null);

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
      const settings = await getUserSettings(user.uid);

      if (settings?.privacyPasscode) {
        setHasPasscode(true);
        setPasscodeHash(settings.privacyPasscode);
      } else {
        setHasPasscode(false);
      }
    } catch (error) {
      console.error('Error loading passcode settings:', error);
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

      // Save to user settings
      await updateUserSettings(user.uid, {
        privacyPasscode: hash,
        privacyPasscodeCreatedAt: new Date()
      });

      setHasPasscode(true);
      setPasscodeHash(hash);

      toast({
        title: 'Passcode set',
        description: 'Your privacy passcode has been set successfully.',
        variant: 'success',
      });

      return true;
    } catch (error) {
      console.error('Error setting passcode:', error);
      toast({
        title: 'Error',
        description: 'Failed to set passcode. Please try again.',
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
        const endTime = Date.now() + SESSION_DURATION;
        setSessionEndTime(endTime);
        setIsUnlocked(true);
        setRemainingTime(SESSION_DURATION / 1000);

        toast({
          title: 'Unlocked',
          description: 'Private entries unlocked for 15 minutes.',
          variant: 'success',
        });

        return true;
      } else {
        toast({
          title: 'Incorrect passcode',
          description: 'Please try again.',
          variant: 'error',
        });
        return false;
      }
    } catch (error) {
      console.error('Error verifying passcode:', error);
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
      const endTime = Date.now() + SESSION_DURATION;
      setSessionEndTime(endTime);
      setRemainingTime(SESSION_DURATION / 1000);

      toast({
        title: 'Session extended',
        description: 'Private entries will remain unlocked for another 15 minutes.',
        variant: 'success',
      });
    }
  };

  const removePasscode = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      await updateUserSettings(user.uid, {
        privacyPasscode: undefined,
        privacyPasscodeCreatedAt: undefined
      });

      setHasPasscode(false);
      setPasscodeHash(null);
      lockNow();

      toast({
        title: 'Passcode removed',
        description: 'Your privacy passcode has been removed.',
        variant: 'success',
      });

      return true;
    } catch (error) {
      console.error('Error removing passcode:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove passcode. Please try again.',
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

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
}
