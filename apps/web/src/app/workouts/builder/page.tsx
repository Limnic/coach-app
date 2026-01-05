'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
  ArrowLeft,
  Plus,
  Search,
  GripVertical,
  Trash2,
  Copy,
  Settings,
  Play,
  Save,
  ChevronDown,
  ChevronUp,
  X,
  Dumbbell,
  Timer,
  Target,
  Zap,
  Check,
  CheckCircle,
  Pencil,
} from 'lucide-react';

// Mock exercise library
const exerciseLibrary = [
  { id: 'ex1', name: 'Bench Press', muscle: 'Chest', equipment: 'Barbell', videoUrl: null },
  { id: 'ex2', name: 'Incline Dumbbell Press', muscle: 'Chest', equipment: 'Dumbbell', videoUrl: null },
  { id: 'ex3', name: 'Cable Flyes', muscle: 'Chest', equipment: 'Cable', videoUrl: null },
  { id: 'ex4', name: 'Push-ups', muscle: 'Chest', equipment: 'Bodyweight', videoUrl: null },
  { id: 'ex5', name: 'Squat', muscle: 'Quadriceps', equipment: 'Barbell', videoUrl: null },
  { id: 'ex6', name: 'Leg Press', muscle: 'Quadriceps', equipment: 'Machine', videoUrl: null },
  { id: 'ex7', name: 'Lunges', muscle: 'Quadriceps', equipment: 'Dumbbell', videoUrl: null },
  { id: 'ex8', name: 'Deadlift', muscle: 'Back', equipment: 'Barbell', videoUrl: null },
  { id: 'ex9', name: 'Pull-ups', muscle: 'Back', equipment: 'Bodyweight', videoUrl: null },
  { id: 'ex10', name: 'Barbell Rows', muscle: 'Back', equipment: 'Barbell', videoUrl: null },
  { id: 'ex11', name: 'Lat Pulldown', muscle: 'Back', equipment: 'Cable', videoUrl: null },
  { id: 'ex12', name: 'Shoulder Press', muscle: 'Shoulders', equipment: 'Dumbbell', videoUrl: null },
  { id: 'ex13', name: 'Lateral Raises', muscle: 'Shoulders', equipment: 'Dumbbell', videoUrl: null },
  { id: 'ex14', name: 'Face Pulls', muscle: 'Shoulders', equipment: 'Cable', videoUrl: null },
  { id: 'ex15', name: 'Bicep Curls', muscle: 'Biceps', equipment: 'Dumbbell', videoUrl: null },
  { id: 'ex16', name: 'Hammer Curls', muscle: 'Biceps', equipment: 'Dumbbell', videoUrl: null },
  { id: 'ex17', name: 'Tricep Pushdowns', muscle: 'Triceps', equipment: 'Cable', videoUrl: null },
  { id: 'ex18', name: 'Skull Crushers', muscle: 'Triceps', equipment: 'Barbell', videoUrl: null },
  { id: 'ex19', name: 'Leg Curls', muscle: 'Hamstrings', equipment: 'Machine', videoUrl: null },
  { id: 'ex20', name: 'Romanian Deadlift', muscle: 'Hamstrings', equipment: 'Barbell', videoUrl: null },
];

const muscleGroups = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quadriceps', 'Hamstrings', 'Glutes', 'Core'];

interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  muscle: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  notes: string;
}

interface WorkoutDay {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
  isExpanded: boolean;
}

// Mock existing plans data
const existingPlans: Record<string, { name: string; description: string; days: WorkoutDay[] }> = {
  '1': {
    name: 'Push/Pull/Legs Split',
    description: '3-day split focusing on compound movements',
    days: [
      { 
        id: 'day1', 
        name: 'Day 1 - Push', 
        isExpanded: true,
        exercises: [
          { id: 'e1', exerciseId: 'ex1', name: 'Bench Press', muscle: 'Chest', sets: 4, repsMin: 8, repsMax: 10, restSeconds: 90, notes: 'Control the negative' },
          { id: 'e2', exerciseId: 'ex2', name: 'Incline Dumbbell Press', muscle: 'Chest', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60, notes: '' },
          { id: 'e3', exerciseId: 'ex12', name: 'Shoulder Press', muscle: 'Shoulders', sets: 3, repsMin: 8, repsMax: 10, restSeconds: 90, notes: '' },
          { id: 'e4', exerciseId: 'ex17', name: 'Tricep Pushdowns', muscle: 'Triceps', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 45, notes: '' },
        ],
      },
      { 
        id: 'day2', 
        name: 'Day 2 - Pull', 
        isExpanded: false,
        exercises: [
          { id: 'e5', exerciseId: 'ex8', name: 'Deadlift', muscle: 'Back', sets: 4, repsMin: 5, repsMax: 6, restSeconds: 180, notes: 'Keep back straight' },
          { id: 'e6', exerciseId: 'ex9', name: 'Pull-ups', muscle: 'Back', sets: 3, repsMin: 8, repsMax: 10, restSeconds: 90, notes: '' },
          { id: 'e7', exerciseId: 'ex10', name: 'Barbell Rows', muscle: 'Back', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60, notes: '' },
          { id: 'e8', exerciseId: 'ex15', name: 'Bicep Curls', muscle: 'Biceps', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 45, notes: '' },
        ],
      },
      { 
        id: 'day3', 
        name: 'Day 3 - Legs', 
        isExpanded: false,
        exercises: [
          { id: 'e9', exerciseId: 'ex5', name: 'Squat', muscle: 'Quadriceps', sets: 4, repsMin: 6, repsMax: 8, restSeconds: 180, notes: 'Go deep' },
          { id: 'e10', exerciseId: 'ex6', name: 'Leg Press', muscle: 'Quadriceps', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, notes: '' },
          { id: 'e11', exerciseId: 'ex19', name: 'Leg Curls', muscle: 'Hamstrings', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 45, notes: '' },
          { id: 'e12', exerciseId: 'ex20', name: 'Romanian Deadlift', muscle: 'Hamstrings', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60, notes: '' },
        ],
      },
    ],
  },
  '2': {
    name: 'Hypertrophy Max',
    description: 'Advanced muscle building program with progressive overload',
    days: [
      { 
        id: 'day1', 
        name: 'Day 1 - Chest & Triceps', 
        isExpanded: true,
        exercises: [
          { id: 'e1', exerciseId: 'ex1', name: 'Bench Press', muscle: 'Chest', sets: 4, repsMin: 8, repsMax: 10, restSeconds: 90, notes: '' },
          { id: 'e2', exerciseId: 'ex2', name: 'Incline Dumbbell Press', muscle: 'Chest', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60, notes: '' },
          { id: 'e3', exerciseId: 'ex3', name: 'Cable Flyes', muscle: 'Chest', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 45, notes: '' },
          { id: 'e4', exerciseId: 'ex17', name: 'Tricep Pushdowns', muscle: 'Triceps', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 45, notes: '' },
          { id: 'e5', exerciseId: 'ex18', name: 'Skull Crushers', muscle: 'Triceps', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60, notes: '' },
        ],
      },
      { 
        id: 'day2', 
        name: 'Day 2 - Back & Biceps', 
        isExpanded: false,
        exercises: [
          { id: 'e6', exerciseId: 'ex8', name: 'Deadlift', muscle: 'Back', sets: 4, repsMin: 6, repsMax: 8, restSeconds: 120, notes: '' },
          { id: 'e7', exerciseId: 'ex10', name: 'Barbell Rows', muscle: 'Back', sets: 4, repsMin: 8, repsMax: 10, restSeconds: 90, notes: '' },
          { id: 'e8', exerciseId: 'ex11', name: 'Lat Pulldown', muscle: 'Back', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60, notes: '' },
          { id: 'e9', exerciseId: 'ex15', name: 'Bicep Curls', muscle: 'Biceps', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 45, notes: '' },
          { id: 'e10', exerciseId: 'ex16', name: 'Hammer Curls', muscle: 'Biceps', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 45, notes: '' },
        ],
      },
      { 
        id: 'day3', 
        name: 'Day 3 - Shoulders', 
        isExpanded: false,
        exercises: [
          { id: 'e11', exerciseId: 'ex12', name: 'Shoulder Press', muscle: 'Shoulders', sets: 4, repsMin: 8, repsMax: 10, restSeconds: 90, notes: '' },
          { id: 'e12', exerciseId: 'ex13', name: 'Lateral Raises', muscle: 'Shoulders', sets: 4, repsMin: 12, repsMax: 15, restSeconds: 45, notes: '' },
          { id: 'e13', exerciseId: 'ex14', name: 'Face Pulls', muscle: 'Shoulders', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 45, notes: '' },
        ],
      },
      { 
        id: 'day4', 
        name: 'Day 4 - Legs', 
        isExpanded: false,
        exercises: [
          { id: 'e14', exerciseId: 'ex5', name: 'Squat', muscle: 'Quadriceps', sets: 4, repsMin: 8, repsMax: 10, restSeconds: 120, notes: '' },
          { id: 'e15', exerciseId: 'ex6', name: 'Leg Press', muscle: 'Quadriceps', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, notes: '' },
          { id: 'e16', exerciseId: 'ex7', name: 'Lunges', muscle: 'Quadriceps', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60, notes: '' },
          { id: 'e17', exerciseId: 'ex19', name: 'Leg Curls', muscle: 'Hamstrings', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 45, notes: '' },
          { id: 'e18', exerciseId: 'ex20', name: 'Romanian Deadlift', muscle: 'Hamstrings', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60, notes: '' },
        ],
      },
    ],
  },
  '3': {
    name: 'PPL Split',
    description: 'Push/Pull/Legs split for balanced muscle development',
    days: [
      { 
        id: 'day1', 
        name: 'Day 1 - Push', 
        isExpanded: true,
        exercises: [
          { id: 'e1', exerciseId: 'ex1', name: 'Bench Press', muscle: 'Chest', sets: 4, repsMin: 8, repsMax: 10, restSeconds: 90, notes: '' },
          { id: 'e2', exerciseId: 'ex2', name: 'Incline Dumbbell Press', muscle: 'Chest', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60, notes: '' },
          { id: 'e3', exerciseId: 'ex12', name: 'Shoulder Press', muscle: 'Shoulders', sets: 3, repsMin: 8, repsMax: 10, restSeconds: 90, notes: '' },
          { id: 'e4', exerciseId: 'ex13', name: 'Lateral Raises', muscle: 'Shoulders', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 45, notes: '' },
          { id: 'e5', exerciseId: 'ex17', name: 'Tricep Pushdowns', muscle: 'Triceps', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 45, notes: '' },
        ],
      },
      { 
        id: 'day2', 
        name: 'Day 2 - Pull', 
        isExpanded: false,
        exercises: [
          { id: 'e6', exerciseId: 'ex9', name: 'Pull-ups', muscle: 'Back', sets: 4, repsMin: 8, repsMax: 10, restSeconds: 90, notes: '' },
          { id: 'e7', exerciseId: 'ex10', name: 'Barbell Rows', muscle: 'Back', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60, notes: '' },
          { id: 'e8', exerciseId: 'ex14', name: 'Face Pulls', muscle: 'Shoulders', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 45, notes: '' },
          { id: 'e9', exerciseId: 'ex15', name: 'Bicep Curls', muscle: 'Biceps', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 45, notes: '' },
        ],
      },
      { 
        id: 'day3', 
        name: 'Day 3 - Legs', 
        isExpanded: false,
        exercises: [
          { id: 'e10', exerciseId: 'ex5', name: 'Squat', muscle: 'Quadriceps', sets: 4, repsMin: 8, repsMax: 10, restSeconds: 120, notes: '' },
          { id: 'e11', exerciseId: 'ex6', name: 'Leg Press', muscle: 'Quadriceps', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, notes: '' },
          { id: 'e12', exerciseId: 'ex20', name: 'Romanian Deadlift', muscle: 'Hamstrings', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60, notes: '' },
          { id: 'e13', exerciseId: 'ex19', name: 'Leg Curls', muscle: 'Hamstrings', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 45, notes: '' },
        ],
      },
    ],
  },
  '4': {
    name: 'Strength & Tone',
    description: 'Maintain muscle while improving definition',
    days: [
      { 
        id: 'day1', 
        name: 'Day 1 - Full Body A', 
        isExpanded: true,
        exercises: [
          { id: 'e1', exerciseId: 'ex1', name: 'Bench Press', muscle: 'Chest', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60, notes: '' },
          { id: 'e2', exerciseId: 'ex5', name: 'Squat', muscle: 'Quadriceps', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60, notes: '' },
          { id: 'e3', exerciseId: 'ex10', name: 'Barbell Rows', muscle: 'Back', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60, notes: '' },
        ],
      },
      { 
        id: 'day2', 
        name: 'Day 2 - Full Body B', 
        isExpanded: false,
        exercises: [
          { id: 'e4', exerciseId: 'ex12', name: 'Shoulder Press', muscle: 'Shoulders', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60, notes: '' },
          { id: 'e5', exerciseId: 'ex8', name: 'Deadlift', muscle: 'Back', sets: 3, repsMin: 8, repsMax: 10, restSeconds: 90, notes: '' },
          { id: 'e6', exerciseId: 'ex9', name: 'Pull-ups', muscle: 'Back', sets: 3, repsMin: 8, repsMax: 10, restSeconds: 60, notes: '' },
        ],
      },
    ],
  },
  '5': {
    name: 'Power Building',
    description: 'Combine powerlifting with bodybuilding for strength and size',
    days: [
      { 
        id: 'day1', 
        name: 'Day 1 - Heavy Upper', 
        isExpanded: true,
        exercises: [
          { id: 'e1', exerciseId: 'ex1', name: 'Bench Press', muscle: 'Chest', sets: 5, repsMin: 3, repsMax: 5, restSeconds: 180, notes: 'Heavy compound' },
          { id: 'e2', exerciseId: 'ex10', name: 'Barbell Rows', muscle: 'Back', sets: 5, repsMin: 3, repsMax: 5, restSeconds: 180, notes: '' },
          { id: 'e3', exerciseId: 'ex12', name: 'Shoulder Press', muscle: 'Shoulders', sets: 4, repsMin: 6, repsMax: 8, restSeconds: 120, notes: '' },
        ],
      },
      { 
        id: 'day2', 
        name: 'Day 2 - Heavy Lower', 
        isExpanded: false,
        exercises: [
          { id: 'e4', exerciseId: 'ex5', name: 'Squat', muscle: 'Quadriceps', sets: 5, repsMin: 3, repsMax: 5, restSeconds: 180, notes: 'Heavy compound' },
          { id: 'e5', exerciseId: 'ex8', name: 'Deadlift', muscle: 'Back', sets: 5, repsMin: 3, repsMax: 5, restSeconds: 180, notes: '' },
        ],
      },
      { 
        id: 'day3', 
        name: 'Day 3 - Hypertrophy Upper', 
        isExpanded: false,
        exercises: [
          { id: 'e6', exerciseId: 'ex2', name: 'Incline Dumbbell Press', muscle: 'Chest', sets: 4, repsMin: 10, repsMax: 12, restSeconds: 60, notes: '' },
          { id: 'e7', exerciseId: 'ex11', name: 'Lat Pulldown', muscle: 'Back', sets: 4, repsMin: 10, repsMax: 12, restSeconds: 60, notes: '' },
          { id: 'e8', exerciseId: 'ex13', name: 'Lateral Raises', muscle: 'Shoulders', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 45, notes: '' },
          { id: 'e9', exerciseId: 'ex15', name: 'Bicep Curls', muscle: 'Biceps', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 45, notes: '' },
          { id: 'e10', exerciseId: 'ex17', name: 'Tricep Pushdowns', muscle: 'Triceps', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 45, notes: '' },
        ],
      },
      { 
        id: 'day4', 
        name: 'Day 4 - Hypertrophy Lower', 
        isExpanded: false,
        exercises: [
          { id: 'e11', exerciseId: 'ex6', name: 'Leg Press', muscle: 'Quadriceps', sets: 4, repsMin: 10, repsMax: 12, restSeconds: 60, notes: '' },
          { id: 'e12', exerciseId: 'ex7', name: 'Lunges', muscle: 'Quadriceps', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, notes: '' },
          { id: 'e13', exerciseId: 'ex20', name: 'Romanian Deadlift', muscle: 'Hamstrings', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60, notes: '' },
          { id: 'e14', exerciseId: 'ex19', name: 'Leg Curls', muscle: 'Hamstrings', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 45, notes: '' },
        ],
      },
    ],
  },
  '6': {
    name: 'Cardio Blitz',
    description: 'High-energy cardio program for endurance and fat loss',
    days: [
      { 
        id: 'day1', 
        name: 'Day 1 - HIIT Circuit', 
        isExpanded: true,
        exercises: [
          { id: 'e1', exerciseId: 'ex4', name: 'Push-ups', muscle: 'Chest', sets: 4, repsMin: 15, repsMax: 20, restSeconds: 30, notes: '' },
          { id: 'e2', exerciseId: 'ex5', name: 'Squat', muscle: 'Quadriceps', sets: 4, repsMin: 15, repsMax: 20, restSeconds: 30, notes: 'Bodyweight' },
          { id: 'e3', exerciseId: 'ex7', name: 'Lunges', muscle: 'Quadriceps', sets: 4, repsMin: 12, repsMax: 15, restSeconds: 30, notes: '' },
        ],
      },
      { 
        id: 'day2', 
        name: 'Day 2 - Cardio Mix', 
        isExpanded: false,
        exercises: [
          { id: 'e4', exerciseId: 'ex9', name: 'Pull-ups', muscle: 'Back', sets: 3, repsMin: 8, repsMax: 12, restSeconds: 45, notes: '' },
          { id: 'e5', exerciseId: 'ex4', name: 'Push-ups', muscle: 'Chest', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 30, notes: '' },
        ],
      },
    ],
  },
};

function WorkoutBuilderContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  
  const [planName, setPlanName] = useState('New Workout Plan');
  const [planDescription, setPlanDescription] = useState('');
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([
    { id: 'day1', name: 'Day 1 - Push', exercises: [], isExpanded: true },
    { id: 'day2', name: 'Day 2 - Pull', exercises: [], isExpanded: false },
    { id: 'day3', name: 'Day 3 - Legs', exercises: [], isExpanded: false },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load existing plan data if editing
  useEffect(() => {
    if (editId && existingPlans[editId]) {
      const plan = existingPlans[editId];
      setPlanName(plan.name);
      setPlanDescription(plan.description);
      setWorkoutDays(plan.days);
      setIsEditMode(true);
    }
  }, [editId]);

  const filteredExercises = exerciseLibrary.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.muscle === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const addExercise = (exercise: typeof exerciseLibrary[0]) => {
    if (!activeDay) return;

    const newExercise: WorkoutExercise = {
      id: `${exercise.id}-${Date.now()}`,
      exerciseId: exercise.id,
      name: exercise.name,
      muscle: exercise.muscle,
      sets: 3,
      repsMin: 8,
      repsMax: 12,
      restSeconds: 90,
      notes: '',
    };

    setWorkoutDays(prev => prev.map(day => 
      day.id === activeDay 
        ? { ...day, exercises: [...day.exercises, newExercise] }
        : day
    ));
  };

  const removeExercise = (dayId: string, exerciseId: string) => {
    setWorkoutDays(prev => prev.map(day =>
      day.id === dayId
        ? { ...day, exercises: day.exercises.filter(ex => ex.id !== exerciseId) }
        : day
    ));
  };

  const updateExercise = (dayId: string, exerciseId: string, updates: Partial<WorkoutExercise>) => {
    setWorkoutDays(prev => prev.map(day =>
      day.id === dayId
        ? {
            ...day,
            exercises: day.exercises.map(ex =>
              ex.id === exerciseId ? { ...ex, ...updates } : ex
            ),
          }
        : day
    ));
  };

  const toggleDayExpanded = (dayId: string) => {
    setWorkoutDays(prev => prev.map(day =>
      day.id === dayId ? { ...day, isExpanded: !day.isExpanded } : day
    ));
  };

  const addNewDay = () => {
    const newDay: WorkoutDay = {
      id: `day${workoutDays.length + 1}-${Date.now()}`,
      name: `Day ${workoutDays.length + 1}`,
      exercises: [],
      isExpanded: true,
    };
    setWorkoutDays(prev => [...prev, newDay]);
  };

  const removeDay = (dayId: string) => {
    setWorkoutDays(prev => prev.filter(day => day.id !== dayId));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const reorderExercises = (dayId: string, newOrder: WorkoutExercise[]) => {
    setWorkoutDays(prev => prev.map(day =>
      day.id === dayId ? { ...day, exercises: newOrder } : day
    ));
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/workouts" className="p-2 rounded-lg hover:bg-surface-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-surface-400" />
            </Link>
            <div>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="text-2xl font-display font-bold text-surface-100 bg-transparent border-none focus:outline-none focus:ring-0"
              />
              <p className="text-surface-400">{isEditMode ? 'Editing Workout Plan' : 'Create New Workout Plan'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary">
              <Play className="w-4 h-4 mr-2" />
              Preview
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`btn-primary ${saveSuccess ? 'bg-lime-600 hover:bg-lime-500' : ''}`}
            >
              {isSaving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                  </motion.div>
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Plan
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Main Builder Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Plan Settings */}
          <div className="glass-card p-6 mb-6">
            <h3 className="text-lg font-semibold text-surface-100 mb-4">Plan Settings</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Plan Name</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Duration</label>
                <select className="input-field">
                  <option>4 weeks</option>
                  <option>6 weeks</option>
                  <option>8 weeks</option>
                  <option>12 weeks</option>
                </select>
              </div>
              <div>
                <label className="label">Difficulty</label>
                <select className="input-field">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="label">Description</label>
              <textarea
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                placeholder="Describe this workout plan..."
                rows={2}
                className="input-field resize-none"
              />
            </div>
          </div>

          {/* Workout Days */}
          <div className="space-y-4">
            {workoutDays.map((day, dayIndex) => (
              <motion.div
                key={day.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIndex * 0.1 }}
                className="glass-card overflow-hidden"
              >
                {/* Day Header */}
                <div 
                  className="flex items-center justify-between p-4 bg-surface-800/30 cursor-pointer"
                  onClick={() => toggleDayExpanded(day.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-brand-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 group/name">
                        {editingDayId === day.id ? (
                          <input
                            type="text"
                            value={day.name}
                            onChange={(e) => {
                              setWorkoutDays(prev => prev.map(d =>
                                d.id === day.id ? { ...d, name: e.target.value } : d
                              ));
                            }}
                            onBlur={() => setEditingDayId(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setEditingDayId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            className="font-semibold text-surface-100 bg-surface-700 px-2 py-0.5 rounded-lg border border-brand-500 focus:outline-none focus:ring-0"
                          />
                        ) : (
                          <>
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingDayId(day.id);
                              }}
                              className="font-semibold text-surface-100 cursor-pointer hover:text-brand-400 transition-colors"
                            >
                              {day.name}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingDayId(day.id);
                              }}
                              className="p-1 rounded opacity-0 group-hover/name:opacity-100 hover:bg-surface-700 transition-all"
                            >
                              <Pencil className="w-3 h-3 text-surface-400" />
                            </button>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-surface-500">{day.exercises.length} exercises</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDay(day.id);
                      }}
                      className="p-2 rounded-lg hover:bg-surface-700 transition-colors text-surface-500 hover:text-coral-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {day.isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-surface-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-surface-500" />
                    )}
                  </div>
                </div>

                {/* Day Content */}
                <AnimatePresence>
                  {day.isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 space-y-3">
                        {/* Exercises List */}
                        <Reorder.Group
                          axis="y"
                          values={day.exercises}
                          onReorder={(newOrder) => reorderExercises(day.id, newOrder)}
                          className="space-y-3"
                        >
                          {day.exercises.map((exercise, exIndex) => (
                            <Reorder.Item
                              key={exercise.id}
                              value={exercise}
                              className="flex items-center gap-4 p-4 rounded-xl bg-surface-800/50 border border-surface-700/50 group"
                            >
                              <div className="cursor-grab active:cursor-grabbing text-surface-600 hover:text-surface-400">
                                <GripVertical className="w-5 h-5" />
                              </div>
                              <div className="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center text-sm font-medium text-surface-300">
                                {exIndex + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-surface-100">{exercise.name}</p>
                                <p className="text-sm text-surface-500">{exercise.muscle}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={exercise.sets}
                                    onChange={(e) => updateExercise(day.id, exercise.id, { sets: parseInt(e.target.value) || 0 })}
                                    className="w-14 input-field py-1 px-2 text-center text-sm"
                                  />
                                  <span className="text-xs text-surface-500">sets</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={exercise.repsMin}
                                    onChange={(e) => updateExercise(day.id, exercise.id, { repsMin: parseInt(e.target.value) || 0 })}
                                    className="w-12 input-field py-1 px-2 text-center text-sm"
                                  />
                                  <span className="text-surface-500">-</span>
                                  <input
                                    type="number"
                                    value={exercise.repsMax}
                                    onChange={(e) => updateExercise(day.id, exercise.id, { repsMax: parseInt(e.target.value) || 0 })}
                                    className="w-12 input-field py-1 px-2 text-center text-sm"
                                  />
                                  <span className="text-xs text-surface-500">reps</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Timer className="w-4 h-4 text-surface-500" />
                                  <input
                                    type="number"
                                    value={exercise.restSeconds}
                                    onChange={(e) => updateExercise(day.id, exercise.id, { restSeconds: parseInt(e.target.value) || 0 })}
                                    className="w-14 input-field py-1 px-2 text-center text-sm"
                                  />
                                  <span className="text-xs text-surface-500">s</span>
                                </div>
                                <button
                                  onClick={() => removeExercise(day.id, exercise.id)}
                                  className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-700 transition-all text-surface-500 hover:text-coral-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </Reorder.Item>
                          ))}
                        </Reorder.Group>

                        {/* Add Exercise Button */}
                        <button
                          onClick={() => {
                            setActiveDay(day.id);
                            setShowExerciseModal(true);
                          }}
                          className="w-full py-4 rounded-xl border-2 border-dashed border-surface-700 text-surface-500 hover:border-brand-500/50 hover:text-brand-400 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Add Exercise
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {/* Add Day Button */}
            <button
              onClick={addNewDay}
              className="w-full py-6 rounded-xl border-2 border-dashed border-surface-700 text-surface-500 hover:border-brand-500/50 hover:text-brand-400 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Workout Day
            </button>
          </div>
        </div>

        {/* Exercise Library Sidebar */}
        <div className="w-80 bg-surface-900/50 border-l border-surface-800/50 flex flex-col">
          <div className="p-4 border-b border-surface-800/50">
            <h3 className="font-semibold text-surface-100 mb-3">Exercise Library</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-9 py-2 text-sm"
              />
            </div>
          </div>

          {/* Muscle Filter */}
          <div className="p-4 border-b border-surface-800/50">
            <div className="flex flex-wrap gap-2">
              {muscleGroups.slice(0, 6).map((muscle) => (
                <button
                  key={muscle}
                  onClick={() => setSelectedMuscle(muscle)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedMuscle === muscle
                      ? 'bg-brand-500 text-white'
                      : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                  }`}
                >
                  {muscle}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredExercises.map((exercise) => (
              <motion.div
                key={exercise.id}
                whileHover={{ scale: 1.02 }}
                className="p-3 rounded-xl bg-surface-800/50 border border-surface-700/50 cursor-pointer hover:border-brand-500/30 transition-all group"
                onClick={() => {
                  if (workoutDays.some(d => d.isExpanded)) {
                    const expandedDay = workoutDays.find(d => d.isExpanded);
                    if (expandedDay) {
                      setActiveDay(expandedDay.id);
                      addExercise(exercise);
                    }
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-surface-100 text-sm">{exercise.name}</p>
                    <p className="text-xs text-surface-500">{exercise.muscle} • {exercise.equipment}</p>
                  </div>
                  <Plus className="w-4 h-4 text-surface-500 group-hover:text-brand-400 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise Selection Modal */}
      <AnimatePresence>
        {showExerciseModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExerciseModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-surface-900 rounded-2xl border border-surface-800 z-50 overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-surface-800">
                <h2 className="text-xl font-display font-bold text-surface-100">Add Exercise</h2>
                <button
                  onClick={() => setShowExerciseModal(false)}
                  className="p-2 rounded-lg hover:bg-surface-800 transition-colors"
                >
                  <X className="w-5 h-5 text-surface-400" />
                </button>
              </div>
              
              <div className="p-4 border-b border-surface-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                  <input
                    type="text"
                    placeholder="Search exercises..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-12"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {muscleGroups.map((muscle) => (
                    <button
                      key={muscle}
                      onClick={() => setSelectedMuscle(muscle)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedMuscle === muscle
                          ? 'bg-brand-500 text-white'
                          : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                      }`}
                    >
                      {muscle}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
                {filteredExercises.map((exercise) => (
                  <motion.button
                    key={exercise.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      addExercise(exercise);
                      setShowExerciseModal(false);
                    }}
                    className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/50 hover:border-brand-500/30 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-700 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
                        <Dumbbell className="w-5 h-5 text-surface-400 group-hover:text-brand-400 transition-colors" />
                      </div>
                      <div>
                        <p className="font-medium text-surface-100">{exercise.name}</p>
                        <p className="text-sm text-surface-500">{exercise.muscle} • {exercise.equipment}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

export default function WorkoutBuilderPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      </DashboardLayout>
    }>
      <WorkoutBuilderContent />
    </Suspense>
  );
}

