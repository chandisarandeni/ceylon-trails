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
  ScrollTextIcon
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
  const [, setTouched] = useState(false);

  const hubOptions = HUBS.map((hub) => ({ value: hub.id, label: `${hub.name} – ${hub.city}` }));

  const onGenerate = () => {
    setTouched(true);
    generate(() => router.push('/decision'));
  };

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
          Everything the five modules consume comes from this form. Change any value and re-run the
          pipeline to see different candidate plans, routes, costs and the final recommendation.
        </p>
      </header>

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
              value={preferences.days}
              min={2}
              max={21}
              suffix="days"
              onChange={(days) => setPreferences({ days })}
            />

            <NumberField
              id="budget"
              label="Total budget"
              value={preferences.budget}
              min={30000}
              max={1000000}
              step={5000}
              prefix="Rs."
              onChange={(budget) => setPreferences({ budget })}
            />

            <SelectField
              id="start"
              label="Starting location"
              value={preferences.startHubId}
              options={hubOptions}
              onChange={(startHubId) => setPreferences({ startHubId })}
            />

            <SelectField
              id="end"
              label="Ending location"
              value={preferences.endHubId}
              options={hubOptions}
              onChange={(endHubId) => setPreferences({ endHubId })}
            />

            <SegmentedControl<TravelStyle>
              label="Travel style"
              hint="Drives accommodation and food rates in Module 2."
              value={preferences.travelStyle}
              options={[
                { value: 'Budget', label: 'Budget' },
                { value: 'Balanced', label: 'Balanced' },
                { value: 'Comfort', label: 'Comfort' }
              ]}
              onChange={(travelStyle) => setPreferences({ travelStyle })}
            />

            <SelectField<TransportMode>
              id="transport"
              label="Preferred transportation"
              hint="Sets edge speed and cost per km in the tourism network."
              value={preferences.transport}
              options={[
                { value: 'Public Transport', label: 'Public Transport' },
                { value: 'Private Transport', label: 'Private Transport' }
              ]}
              onChange={(transport) => setPreferences({ transport })}
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
                      setPreferences({
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
              onChange={(maxDailyTravelHours) => setPreferences({ maxDailyTravelHours })}
            />

            <RangeField
              id="maxDest"
              label="Maximum number of destinations"
              value={preferences.maxDestinations}
              min={3}
              max={8}
              display={`${preferences.maxDestinations} sites`}
              onChange={(maxDestinations) => setPreferences({ maxDestinations })}
            />

            <NumberField
              id="reserve"
              label="Minimum emergency reserve"
              hint="Held back from all spending."
              value={preferences.emergencyReserve}
              min={0}
              max={100000}
              step={1000}
              prefix="Rs."
              onChange={(emergencyReserve) => setPreferences({ emergencyReserve })}
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

