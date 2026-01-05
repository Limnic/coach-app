'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RefreshCw,
  Check,
  ChevronDown,
  Timer,
  Dumbbell,
  History,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useWorkoutSessionStore } from '@/lib/store';

interface LastSessionData {
  setNumber: number;
  weight: number;
  reps: number;
}

interface WorkoutPlayerProps {
  exerciseId: string;
  exerciseName: string;
  videoUrl?: string;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  restSeconds: number;
  notes?: string;
  lastSession?: LastSessionData[];
  swapOptions?: { id: string; name: string }[];
  onComplete: (setData: { setNumber: number; weight: number; reps: number; rpe?: number }) => void;
  onSwap?: (newExerciseId: string) => void;
}

export default function WorkoutPlayer({
  exerciseId,
  exerciseName,
  videoUrl,
  targetSets,
  targetRepsMin,
  targetRepsMax,
  restSeconds,
  notes,
  lastSession = [],
  swapOptions = [],
  onComplete,
  onSwap,
}: WorkoutPlayerProps) {
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSets, setCompletedSets] = useState<number[]>([]);
  const [weight, setWeight] = useState<number>(lastSession[0]?.weight || 0);
  const [reps, setReps] = useState<number>(lastSession[0]?.reps || targetRepsMin);
  const [rpe, setRpe] = useState<number | undefined>(undefined);
  const [showSwapMenu, setShowSwapMenu] = useState(false);
  const [muted, setMuted] = useState(true);
  
  // Rest Timer
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(restSeconds);

  // Update weight/reps when switching sets based on last session
  useEffect(() => {
    const lastSetData = lastSession.find((s) => s.setNumber === currentSet);
    if (lastSetData) {
      setWeight(lastSetData.weight);
      setReps(lastSetData.reps);
    }
  }, [currentSet, lastSession]);

  // Rest timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restTimerActive && restTimeRemaining > 0) {
      interval = setInterval(() => {
        setRestTimeRemaining((prev) => {
          if (prev <= 1) {
            setRestTimerActive(false);
            // Play sound notification
            if (!muted) {
              const audio = new Audio('/sounds/timer-complete.mp3');
              audio.play().catch(() => {});
            }
            return restSeconds;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restTimerActive, restTimeRemaining, restSeconds, muted]);

  const handleCompleteSet = useCallback(() => {
    if (!completedSets.includes(currentSet)) {
      // Mark set as complete
      setCompletedSets((prev) => [...prev, currentSet]);
      
      // Call onComplete callback
      onComplete({
        setNumber: currentSet,
        weight,
        reps,
        rpe,
      });

      // Start rest timer
      setRestTimerActive(true);
      setRestTimeRemaining(restSeconds);

      // Move to next set if available
      if (currentSet < targetSets) {
        setTimeout(() => setCurrentSet(currentSet + 1), 500);
      }
    }
  }, [currentSet, completedSets, weight, reps, rpe, onComplete, restSeconds, targetSets]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLastSessionForSet = (setNum: number) => {
    return lastSession.find((s) => s.setNumber === setNum);
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Video Player */}
      <div className="relative aspect-video bg-surface-900">
        {videoUrl ? (
          <video
            src={videoUrl}
            autoPlay
            loop
            muted={muted}
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Dumbbell className="w-16 h-16 text-surface-700" />
          </div>
        )}
        
        {/* Video Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{exerciseName}</h3>
            <button
              onClick={() => setMuted(!muted)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {muted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Rest Timer Overlay */}
        <AnimatePresence>
          {restTimerActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-surface-950/90 flex flex-col items-center justify-center"
            >
              <Timer className="w-12 h-12 text-brand-400 mb-4" />
              <p className="text-surface-400 mb-2">Rest Timer</p>
              <motion.p
                key={restTimeRemaining}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-6xl font-display font-bold text-white"
              >
                {formatTime(restTimeRemaining)}
              </motion.p>
              <button
                onClick={() => setRestTimerActive(false)}
                className="mt-6 btn-secondary"
              >
                Skip Rest
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="p-6 space-y-6">
        {/* Set Navigator */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentSet(Math.max(1, currentSet - 1))}
            disabled={currentSet === 1}
            className="btn-ghost disabled:opacity-30"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: targetSets }, (_, i) => i + 1).map((setNum) => (
              <button
                key={setNum}
                onClick={() => setCurrentSet(setNum)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                  completedSets.includes(setNum)
                    ? 'bg-lime-500 text-white'
                    : setNum === currentSet
                    ? 'bg-brand-500 text-white scale-110'
                    : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                }`}
              >
                {completedSets.includes(setNum) ? (
                  <Check className="w-5 h-5" />
                ) : (
                  setNum
                )}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentSet(Math.min(targetSets, currentSet + 1))}
            disabled={currentSet === targetSets}
            className="btn-ghost disabled:opacity-30"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Set Details */}
        <div className="text-center">
          <p className="text-sm text-surface-500">Set {currentSet} of {targetSets}</p>
          <p className="text-lg text-surface-300">
            Target: <span className="font-semibold text-white">{targetRepsMin}-{targetRepsMax} reps</span>
          </p>
        </div>

        {/* Last Session Memory */}
        {getLastSessionForSet(currentSet) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-electric-500/10 border border-electric-500/30"
          >
            <div className="flex items-center gap-2 text-electric-400 mb-2">
              <History className="w-4 h-4" />
              <span className="text-sm font-medium">Last Session</span>
            </div>
            <p className="text-surface-100">
              <span className="font-semibold">{getLastSessionForSet(currentSet)?.weight} kg</span>
              {' × '}
              <span className="font-semibold">{getLastSessionForSet(currentSet)?.reps} reps</span>
            </p>
          </motion.div>
        )}

        {/* Weight & Reps Input */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Weight (kg)</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeight(Math.max(0, weight - 2.5))}
                className="btn-secondary px-3 py-2"
              >
                -
              </button>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="input-field text-center flex-1"
              />
              <button
                onClick={() => setWeight(weight + 2.5)}
                className="btn-secondary px-3 py-2"
              >
                +
              </button>
            </div>
          </div>
          
          <div>
            <label className="label">Reps</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReps(Math.max(1, reps - 1))}
                className="btn-secondary px-3 py-2"
              >
                -
              </button>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(parseInt(e.target.value) || 0)}
                className="input-field text-center flex-1"
              />
              <button
                onClick={() => setReps(reps + 1)}
                className="btn-secondary px-3 py-2"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* RPE Selector */}
        <div>
          <label className="label">RPE (Rate of Perceived Exertion)</label>
          <div className="flex items-center gap-2">
            {[6, 7, 8, 9, 10].map((value) => (
              <button
                key={value}
                onClick={() => setRpe(value)}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  rpe === value
                    ? 'bg-brand-500 text-white'
                    : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {/* Complete Set Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCompleteSet}
          disabled={completedSets.includes(currentSet)}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
            completedSets.includes(currentSet)
              ? 'bg-lime-500/20 text-lime-400 cursor-not-allowed'
              : 'btn-primary'
          }`}
        >
          {completedSets.includes(currentSet) ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              Set Completed
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              Mark Set as Done
            </span>
          )}
        </motion.button>

        {/* Notes & Swap */}
        <div className="flex items-center justify-between pt-4 border-t border-surface-800">
          {notes && (
            <p className="text-sm text-surface-500 italic">"{notes}"</p>
          )}
          
          {swapOptions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowSwapMenu(!showSwapMenu)}
                className="btn-ghost text-sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Swap Exercise
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
              
              <AnimatePresence>
                {showSwapMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full right-0 mb-2 w-64 glass-card p-2 space-y-1"
                  >
                    {swapOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          onSwap?.(option.id);
                          setShowSwapMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm rounded-lg hover:bg-surface-700 transition-colors"
                      >
                        {option.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

