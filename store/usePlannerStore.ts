import { create } from 'zustand';
import { DEFAULT_PREFERENCES, DEFAULT_WEIGHTS } from '../lib/data/defaultPreferences';
import { Module5Weights, PipelineResult, UserPreferences } from '../types/tourism';
import { rescore, runPipeline } from '../utils/pipeline';

export const MODULE_STEPS = [
  { key: 'decision', module: 'Module 4', title: 'Decision', path: '/decision' },
  { key: 'network', module: 'Module 3', title: 'Network', path: '/network' },
  { key: 'route', module: 'Module 1', title: 'Route', path: '/route' },
  { key: 'resources', module: 'Module 2', title: 'Resources', path: '/resources' },
  { key: 'optimization', module: 'Module 5', title: 'Optimization', path: '/optimization' }
] as const;

export type ModuleKey = (typeof MODULE_STEPS)[number]['key'];

interface PlannerState {
  preferences: UserPreferences;
  weights: Module5Weights;
  result: PipelineResult | null;
  isRunning: boolean;
  runStage: number;
  completed: ModuleKey[];
  activePlanId: string | null;
  
  setPreferences: (update: Partial<UserPreferences>) => void;
  setWeights: (weights: Module5Weights) => void;
  generate: (onDone?: () => void) => void;
  markCompleted: (key: ModuleKey) => void;
  setActivePlanId: (id: string | null) => void;
  reset: () => void;
}

let activeTimers: number[] = [];

export const usePlannerStore = create<PlannerState>((set, get) => ({
  preferences: DEFAULT_PREFERENCES,
  weights: DEFAULT_WEIGHTS,
  result: null,
  isRunning: false,
  runStage: 0,
  completed: [],
  activePlanId: null,

  setPreferences: (update) => {
    set((state) => ({
      preferences: { ...state.preferences, ...update }
    }));
  },

  setWeights: (nextWeights) => {
    set((state) => ({
      weights: nextWeights,
      result: state.result ? rescore(state.result, nextWeights) : state.result
    }));
  },

  generate: (onDone) => {
    activeTimers.forEach((t) => clearTimeout(t));
    activeTimers = [];

    set({
      isRunning: true,
      runStage: 1,
      completed: []
    });

    const state = get();
    const computed = runPipeline(state.preferences, state.weights);

    MODULE_STEPS.forEach((_, index) => {
      const timer = window.setTimeout(() => {
        set({ runStage: index + 1 });
      }, index * 380);
      activeTimers.push(timer);
    });

    const finish = window.setTimeout(() => {
      set({
        result: computed,
        activePlanId: computed.recommendedPlanId ?? computed.plans[0]?.id ?? null,
        completed: ['decision'],
        isRunning: false,
        runStage: MODULE_STEPS.length
      });
      onDone?.();
    }, MODULE_STEPS.length * 380 + 220);
    activeTimers.push(finish);
  },

  markCompleted: (key) => {
    set((state) => ({
      completed: state.completed.includes(key) ? state.completed : [...state.completed, key]
    }));
  },

  setActivePlanId: (id) => set({ activePlanId: id }),

  reset: () => {
    activeTimers.forEach((t) => clearTimeout(t));
    activeTimers = [];
    set({
      result: null,
      completed: [],
      activePlanId: null,
      runStage: 0,
      isRunning: false,
      preferences: DEFAULT_PREFERENCES,
      weights: DEFAULT_WEIGHTS
    });
  }
}));
