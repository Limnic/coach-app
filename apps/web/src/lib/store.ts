import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// AUTH STORE
// ============================================

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ATHLETE' | 'COACH' | 'ADMIN';
  subscriptionStatus?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'scalefit-auth',
    }
  )
);

// ============================================
// UI STORE
// ============================================

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  unitSystem: 'metric' | 'imperial';
  setUnitSystem: (system: 'metric' | 'imperial') => void;
  language: string;
  setLanguage: (language: string) => void;
  timezone: string;
  setTimezone: (timezone: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      unitSystem: 'metric',
      setUnitSystem: (unitSystem) => set({ unitSystem }),
      language: 'en',
      setLanguage: (language) => set({ language }),
      timezone: 'UTC-5',
      setTimezone: (timezone) => set({ timezone }),
    }),
    {
      name: 'scalefit-ui',
    }
  )
);

// ============================================
// WORKOUT SESSION STORE
// ============================================

interface WorkoutSet {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  rpe?: number;
}

interface ActiveExercise {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  restSeconds: number;
  sets: WorkoutSet[];
  lastSession?: WorkoutSet[];
}

interface WorkoutSessionState {
  isActive: boolean;
  workoutId: string | null;
  workoutName: string | null;
  exercises: ActiveExercise[];
  currentExerciseIndex: number;
  restTimerActive: boolean;
  restTimeRemaining: number;
  startedAt: Date | null;
  
  startWorkout: (workoutId: string, workoutName: string, exercises: ActiveExercise[]) => void;
  endWorkout: () => void;
  completeSet: (exerciseIndex: number, setNumber: number, weight: number, reps: number, rpe?: number) => void;
  nextExercise: () => void;
  prevExercise: () => void;
  startRestTimer: (seconds: number) => void;
  tickRestTimer: () => void;
  stopRestTimer: () => void;
  swapExercise: (exerciseIndex: number, newExercise: ActiveExercise) => void;
}

export const useWorkoutSessionStore = create<WorkoutSessionState>((set, get) => ({
  isActive: false,
  workoutId: null,
  workoutName: null,
  exercises: [],
  currentExerciseIndex: 0,
  restTimerActive: false,
  restTimeRemaining: 0,
  startedAt: null,

  startWorkout: (workoutId, workoutName, exercises) =>
    set({
      isActive: true,
      workoutId,
      workoutName,
      exercises,
      currentExerciseIndex: 0,
      startedAt: new Date(),
    }),

  endWorkout: () =>
    set({
      isActive: false,
      workoutId: null,
      workoutName: null,
      exercises: [],
      currentExerciseIndex: 0,
      restTimerActive: false,
      restTimeRemaining: 0,
      startedAt: null,
    }),

  completeSet: (exerciseIndex, setNumber, weight, reps, rpe) =>
    set((state) => {
      const exercises = [...state.exercises];
      const exercise = { ...exercises[exerciseIndex] };
      exercise.sets = exercise.sets.map((s) =>
        s.setNumber === setNumber
          ? { ...s, weight, reps, completed: true, rpe }
          : s
      );
      exercises[exerciseIndex] = exercise;
      return { exercises };
    }),

  nextExercise: () =>
    set((state) => ({
      currentExerciseIndex: Math.min(
        state.currentExerciseIndex + 1,
        state.exercises.length - 1
      ),
    })),

  prevExercise: () =>
    set((state) => ({
      currentExerciseIndex: Math.max(state.currentExerciseIndex - 1, 0),
    })),

  startRestTimer: (seconds) =>
    set({ restTimerActive: true, restTimeRemaining: seconds }),

  tickRestTimer: () =>
    set((state) => {
      if (state.restTimeRemaining <= 1) {
        return { restTimerActive: false, restTimeRemaining: 0 };
      }
      return { restTimeRemaining: state.restTimeRemaining - 1 };
    }),

  stopRestTimer: () =>
    set({ restTimerActive: false, restTimeRemaining: 0 }),

  swapExercise: (exerciseIndex, newExercise) =>
    set((state) => {
      const exercises = [...state.exercises];
      exercises[exerciseIndex] = newExercise;
      return { exercises };
    }),
}));

// ============================================
// NUTRITION TRACKING STORE
// ============================================

interface NutritionLog {
  id: string;
  foodName: string;
  mealType: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionState {
  dailyTarget: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  todayLogs: NutritionLog[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  setDailyTarget: (target: NutritionState['dailyTarget']) => void;
  addLog: (log: NutritionLog) => void;
  removeLog: (id: string) => void;
  clearLogs: () => void;
  calculateTotals: () => void;
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
  dailyTarget: {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 67,
  },
  todayLogs: [],
  totals: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  },

  setDailyTarget: (target) => set({ dailyTarget: target }),

  addLog: (log) =>
    set((state) => {
      const todayLogs = [...state.todayLogs, log];
      const totals = todayLogs.reduce(
        (acc, l) => ({
          calories: acc.calories + l.calories,
          protein: acc.protein + l.protein,
          carbs: acc.carbs + l.carbs,
          fat: acc.fat + l.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
      return { todayLogs, totals };
    }),

  removeLog: (id) =>
    set((state) => {
      const todayLogs = state.todayLogs.filter((l) => l.id !== id);
      const totals = todayLogs.reduce(
        (acc, l) => ({
          calories: acc.calories + l.calories,
          protein: acc.protein + l.protein,
          carbs: acc.carbs + l.carbs,
          fat: acc.fat + l.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
      return { todayLogs, totals };
    }),

  clearLogs: () =>
    set({ todayLogs: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } }),

  calculateTotals: () =>
    set((state) => {
      const totals = state.todayLogs.reduce(
        (acc, l) => ({
          calories: acc.calories + l.calories,
          protein: acc.protein + l.protein,
          carbs: acc.carbs + l.carbs,
          fat: acc.fat + l.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
      return { totals };
    }),
}));

