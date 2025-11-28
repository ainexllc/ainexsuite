'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Trophy, Sparkles, Calendar, MapPin, AlertCircle } from 'lucide-react';
import type { Moment } from '@ainexsuite/types';
import { cn } from '@/lib/utils';

interface TriviaGameProps {
  moments: Moment[];
  onClose: () => void;
}

type QuestionType = 'year' | 'location';

interface Question {
  moment: Moment;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
}

export function TriviaGame({ moments, onClose }: TriviaGameProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'finished'>('intro');

  // Generate questions on mount
  useEffect(() => {
    if (moments.length < 3) return;

    const shuffled = [...moments].sort(() => 0.5 - Math.random()).slice(0, 5);
    const newQuestions: Question[] = shuffled.map(moment => {
      // Decide question type based on available data
      const hasLocation = !!moment.location;
      const type: QuestionType = hasLocation && Math.random() > 0.5 ? 'location' : 'year';
      
      let correctAnswer = '';
      let options: string[] = [];

      if (type === 'year') {
        const year = new Date(moment.date).getFullYear();
        correctAnswer = year.toString();
        // Generate 3 random wrong years within +/- 5 years
        const wrongs = new Set<string>();
        while (wrongs.size < 3) {
          const wrong = (year + Math.floor(Math.random() * 10) - 5).toString();
          if (wrong !== correctAnswer) wrongs.add(wrong);
        }
        options = [...Array.from(wrongs), correctAnswer].sort();
      } else {
        correctAnswer = moment.location;
        // Pick 3 random wrong locations from other moments, or generic ones if not enough
        const otherLocations = moments
          .map(m => m.location)
          .filter(l => l && l !== correctAnswer);
        
        const wrongs = new Set<string>();
        // Fill with real locations first
        while (wrongs.size < 3 && otherLocations.length > 0) {
          const randomLoc = otherLocations[Math.floor(Math.random() * otherLocations.length)];
          wrongs.add(randomLoc);
        }
        // Fallback generic locations if needed
        const generics = ['Home', 'Park', 'Beach', 'City Center', 'School', 'Vacation'];
        while (wrongs.size < 3) {
          const generic = generics[Math.floor(Math.random() * generics.length)];
          if (generic !== correctAnswer) wrongs.add(generic);
        }
        options = [...Array.from(wrongs), correctAnswer].sort(() => 0.5 - Math.random());
      }

      return { moment, type, options, correctAnswer };
    });

    setQuestions(newQuestions);
  }, [moments]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return; // Prevent double clicking
    setSelectedAnswer(answer);
    setShowResult(true);

    if (answer === questions[currentIndex].correctAnswer) {
      setScore(s => s + 1);
    }

    // Auto advance after delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameState('finished');
      }
    }, 2000);
  };

  if (moments.length < 3) {
    return (
      <div className="fixed inset-0 bg-background/90 flex items-center justify-center z-50 p-4">
        <div className="bg-surface-card p-8 rounded-2xl max-w-md text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold">Not Enough Moments</h2>
          <p className="text-ink-600">
            You need at least 3 photos to play the trivia game. Capture some more memories first!
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-surface-elevated hover:bg-surface-hover rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'intro') {
    return (
      <div className="fixed inset-0 bg-background/90 flex items-center justify-center z-50 p-4">
        <div className="bg-surface-card p-8 rounded-2xl max-w-md text-center space-y-6 border border-outline-subtle shadow-2xl relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500" />

          <div className="relative">
            <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full" />
            <Trophy className="h-16 w-16 text-amber-500 mx-auto relative z-10" />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2">Memory Trivia</h2>
            <p className="text-ink-600">
              Test your knowledge of your family history! Can you guess when and where these photos were taken?
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setGameState('playing')}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-foreground rounded-xl font-bold shadow-lg shadow-purple-500/25 transition-all hover:scale-105 active:scale-95"
            >
              Start Game
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 bg-surface-elevated hover:bg-surface-hover text-ink-600 rounded-xl font-medium"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="fixed inset-0 bg-background/90 flex items-center justify-center z-50 p-4">
        <div className="bg-surface-card p-8 rounded-2xl max-w-md text-center space-y-6 border border-outline-subtle shadow-2xl">
          <Trophy className="h-16 w-16 text-amber-500 mx-auto" />

          <div>
            <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
            <p className="text-xl text-ink-600">
              You scored <span className="text-primary font-bold">{score}</span> out of {questions.length}
            </p>
          </div>

          <div className="p-4 bg-surface-elevated rounded-xl">
            <p className="text-sm text-ink-600 italic">
              {score === questions.length ? "Incredible! You're a true historian!" :
               score > questions.length / 2 ? "Great job! You know your stuff." :
               "Nice try! Time to browse the album more often."}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setScore(0);
                setCurrentIndex(0);
                setGameState('playing');
                // Reshuffle/regenerate logic would go here ideally
              }}
              className="flex-1 py-2 bg-primary text-foreground rounded-lg font-medium"
            >
              Play Again
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-surface-elevated hover:bg-surface-hover text-ink-600 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="fixed inset-0 bg-background/95 flex flex-col items-center justify-center z-50 p-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-foreground/10 hover:bg-foreground/20 rounded-full text-foreground"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="w-full max-w-lg space-y-6">
        {/* Progress Bar */}
        <div className="flex items-center justify-between text-muted-foreground text-sm font-medium">
          <span>Question {currentIndex + 1} / {questions.length}</span>
          <span>Score: {score}</span>
        </div>
        <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Photo Card */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-background/40 border border-border shadow-2xl">
          <Image
            src={currentQ.moment.photoUrl}
            alt="Trivia Question"
            fill
            className={cn(
              "object-cover transition-all duration-700",
              showResult ? "blur-0 scale-100" : "blur-md scale-110"
            )}
          />

          {!showResult && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border">
                <span className="text-foreground font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Guess to reveal
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Question */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            {currentQ.type === 'year' ? <Calendar className="h-6 w-6" /> : <MapPin className="h-6 w-6" />}
            {currentQ.type === 'year' ? 'When was this taken?' : 'Where was this taken?'}
          </h3>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {currentQ.options.map((option) => {
            let buttonStyle = "bg-foreground/10 hover:bg-foreground/20 text-foreground";

            if (showResult) {
              if (option === currentQ.correctAnswer) {
                buttonStyle = "bg-emerald-500 text-foreground ring-2 ring-emerald-300";
              } else if (option === selectedAnswer) {
                buttonStyle = "bg-red-500 text-foreground opacity-50";
              } else {
                buttonStyle = "bg-foreground/5 text-muted-foreground";
              }
            }

            return (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={showResult}
                className={cn(
                  "py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95",
                  buttonStyle
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
