'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BuildingIcon,
  LeafIcon,
  LandmarkIcon,
  MountainSnowIcon,
  PawPrintIcon,
  ShoppingBagIcon,
  SparklesIcon,
  UmbrellaIcon,
  UtensilsIcon,
  ScrollTextIcon,
  AlertCircleIcon
} from 'lucide-react';
import { HUBS } from '../../lib/data/attractions';
import { InterestLevel, ScoreKey, TransportMode, TravelStyle } from '../../types/tourism';
import { usePlannerStore } from '../../store/usePlannerStore';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import {
  NumberField,
  RangeField,
  SegmentedControl,
  SelectField
} from '../../components/ui/Fields';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const ALL_INTERESTS: { key: ScoreKey; label: string; icon: React.ReactNode }[] = [
  { key: 'nature', label: 'Nature', icon: <LeafIcon className="h-4 w-4" aria-hidden /> },
  { key: 'wildlife', label: 'Wildlife', icon: <PawPrintIcon className="h-4 w-4" aria-hidden /> },
  { key: 'culture', label: 'Culture', icon: <LandmarkIcon className="h-4 w-4" aria-hidden /> },
  { key: 'adventure', label: 'Adventure', icon: <MountainSnowIcon className="h-4 w-4" aria-hidden /> },
  { key: 'beach', label: 'Beach', icon: <UmbrellaIcon className="h-4 w-4" aria-hidden /> },
  { key: 'food', label: 'Food', icon: <UtensilsIcon className="h-4 w-4" aria-hidden /> },
  { key: 'shopping', label: 'Shopping', icon: <ShoppingBagIcon className="h-4 w-4" aria-hidden /> },
  { key: 'history', label: 'History', icon: <ScrollTextIcon className="h-4 w-4" aria-hidden /> },
  { key: 'religious', label: 'Religious sites', icon: <BuildingIcon className="h-4 w-4" aria-hidden /> }
];

const LEVELS: { value: InterestLevel; label: string }[] = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' }
];

export function PlannerPage() {
  const { preferences, setPreferences, generate, isRunning } = usePlannerStore();
  const router = useRouter();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const hubOptions = HUBS.map((hub) => ({ value: hub.id, label: `${hub.name} – ${hub.city}` }));

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!preferences.days || preferences.days <= 0) {
      newErrors.days = 'Please enter a valid trip duration (e.g. 7 days).';
    }
    if (!preferences.budget || preferences.budget <= 0) {
      newErrors.budget = 'Please enter your total travel budget (e.g. Rs.150,000).';
    }
    if (preferences.emergencyReserve === undefined || preferences.emergencyReserve === null || preferences.emergencyReserve <= 0) {
      newErrors.emergencyReserve = 'Please enter a minimum emergency reserve (e.g. Rs.10,000).';
    }
    if (!preferences.startHubId) {
      newErrors.startHubId = 'Starting location is required.';
    }
    if (!preferences.endHubId) {
      newErrors.endHubId = 'Ending location is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreferenceChange = (update: Partial<typeof preferences>) => {
    setPreferences(update);
    const keys = Object.keys(update);
    setErrors((prev) => {
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });
  };

  const onGenerate = () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    generate(() => router.push('/decision'));
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <Badge tone="forest" mono>
          STEP 0 • USER INPUT
        </Badge>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Trip Planner
        </h1>
        <p className="mt-2 text-base text-ink-muted">
          Fill in your travel preferences, trip duration, and budget to generate custom Sri Lanka travel itineraries.
        </p>
      </header>

      {hasErrors ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm flex items-start gap-3">
          <AlertCircleIcon className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold">Please complete all required trip fields</h3>
            <p className="mt-1 text-xs text-red-700">
              Highlighted fields in red require valid values before generating candidate travel plans.
            </p>
          </div>
        </div>
      ) : null}

      <div className="space-y-5">
        <Card as="section">
          <CardHeader
            eyebrow="SECTION A"
            title="Trip details"
            subtitle="Duration, budget and the fixed start / end points of the journey."
          />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="days"
              label="Trip duration"
              placeholder="e.g. 7"
              value={preferences.days}
              min={1}
              max={30}
              suffix="days"
              error={errors.days}
              onChange={(days) => handlePreferenceChange({ days })}
            />

            <NumberField
              id="budget"
              label="Total budget"
              placeholder="e.g. 150000"
              value={preferences.budget}
              min={10000}
              max={5000000}
              step={5000}
              prefix="Rs."
              error={errors.budget}
              onChange={(budget) => handlePreferenceChange({ budget })}
            />

            <SelectField
              id="start"
              label="Starting location"
              value={preferences.startHubId}
              options={hubOptions}
              error={errors.startHubId}
              onChange={(startHubId) => handlePreferenceChange({ startHubId })}
            />

            <SelectField
              id="end"
              label="Ending location"
              value={preferences.endHubId}
              options={hubOptions}
              error={errors.endHubId}
              onChange={(endHubId) => handlePreferenceChange({ endHubId })}
            />

            <SegmentedControl<TravelStyle>
              label="Travel style"
              hint="Select your preferred comfort and pace level."
              value={preferences.travelStyle}
              options={[
                { value: 'Budget', label: 'Budget' },
                { value: 'Balanced', label: 'Balanced' },
                { value: 'Comfort', label: 'Comfort' }
              ]}
              onChange={(travelStyle) => handlePreferenceChange({ travelStyle })}
            />

            <SelectField<TransportMode>
              id="transport"
              label="Preferred transportation"
              hint="Select your preferred transport mode."
              value={preferences.transport}
              options={[
                { value: 'Public Transport', label: 'Public Transport (Bus & Train)' },
                { value: 'Private Transport', label: 'Private Transport (Car & Van)' }
              ]}
              onChange={(transport) => handlePreferenceChange({ transport })}
            />
          </CardBody>
        </Card>

        <Card as="section">
          <CardHeader
            eyebrow="SECTION B"
            title="Interests"
            subtitle="Select interest levels (Low, Medium, High) for all category preferences."
          />
          <CardBody className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {ALL_INTERESTS.map((interest) => (
                <div key={interest.key} className="rounded-xl border border-line p-3">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
                    <span className="text-forest-600">{interest.icon}</span>
                    {interest.label}
                  </p>
                  <SegmentedControl<InterestLevel>
                    label={`${interest.label} level`}
                    value={preferences.interests[interest.key] || 'Low'}
                    options={LEVELS}
                    onChange={(level) =>
                      handlePreferenceChange({
                        interests: { ...preferences.interests, [interest.key]: level }
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card as="section">
          <CardHeader
            eyebrow="SECTION C"
            title="Constraints"
            subtitle="Hard limits checked by Module 2 before a plan can reach the final decision."
          />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <RangeField
              id="maxTravel"
              label="Maximum daily travel time"
              value={preferences.maxDailyTravelHours}
              min={2}
              max={10}
              step={0.5}
              display={`${preferences.maxDailyTravelHours}h / day`}
              onChange={(maxDailyTravelHours) => handlePreferenceChange({ maxDailyTravelHours })}
            />

            <RangeField
              id="maxDest"
              label="Maximum number of destinations"
              value={preferences.maxDestinations}
              min={3}
              max={30}
              display={`${preferences.maxDestinations} sites`}
              onChange={(maxDestinations) => handlePreferenceChange({ maxDestinations })}
            />

            <NumberField
              id="reserve"
              label="Minimum emergency reserve"
              hint="Held back from all spending."
              placeholder="e.g. 10000"
              value={preferences.emergencyReserve}
              min={0}
              max={1000000}
              step={1000}
              prefix="Rs."
              error={errors.emergencyReserve}
              onChange={(emergencyReserve) => handlePreferenceChange({ emergencyReserve })}
            />
          </CardBody>
        </Card>

        <div className="pt-2">
          <Button onClick={onGenerate} size="lg" className="w-full py-4 text-base font-semibold shadow-md cursor-pointer" disabled={isRunning}>
            <SparklesIcon className="h-5 w-5" aria-hidden />
            {isRunning ? 'Running pipeline…' : 'Generate Smart Travel Plans'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PlannerPage;
