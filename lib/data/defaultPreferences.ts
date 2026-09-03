import { Module5Weights, UserPreferences } from '../../types/tourism';

export const DEFAULT_PREFERENCES: UserPreferences = {
  name: 'John',
  country: 'United Kingdom',
  days: 0,
  budget: 0,
  startHubId: 'hub-cmb',
  endHubId: 'hub-cmb',
  travelStyle: 'Balanced',
  transport: 'Public Transport',
  interests: {
    nature: 'High',
    wildlife: 'High',
    culture: 'High',
    adventure: 'Medium',
    beach: 'Medium',
    food: 'Medium',
    shopping: 'Low',
    history: 'Medium',
    religious: 'Low'
  },
  optionalInterests: [],
  maxDailyTravelHours: 5,
  emergencyReserve: 0,
  maxDestinations: 5
};

export const DEFAULT_WEIGHTS: Module5Weights = {
  interest: 0.4,
  budget: 0.25,
  travel: 0.2,
  time: 0.15
};
