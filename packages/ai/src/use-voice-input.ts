'use client';

import { useState, useCallback, useEffect } from 'react';

export interface UseVoiceInputOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: any) => void;
}

export function useVoiceInput({ onResult, onError }: UseVoiceInputOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = 'en-US';
        setRecognition(rec);
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (!recognition) return;

    try {
      setIsListening(true);
      setTranscript('');
      recognition.start();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            // Interim results if needed
            // setTranscript(event.results[i][0].transcript);
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          onResult?.(finalTranscript);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        setIsListening(false);
        onError?.(event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } catch (error) {
      setIsListening(false);
    }
  }, [recognition, onResult, onError]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    toggleListening: isListening ? stopListening : startListening
  };
}
