'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { UserIcon, LogOutIcon, SparklesIcon } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { usePlannerStore } from '../../store/usePlannerStore';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AuthGuard } from '../../components/AuthGuard';

export function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { preferences, result } = usePlannerStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <AuthGuard>
      <div className="mx-auto max-w-3xl space-y-6 py-6">
        <header className="flex items-center justify-between">
          <div>
            <Badge tone="forest" mono>
              USER PROFILE
            </Badge>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-sm text-ink-muted">{user?.email}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            <LogOutIcon className="h-4 w-4" />
            Sign Out
          </Button>
        </header>

        <Card>
          <CardHeader title="Current Planner Preferences" subtitle="Your active search criteria." />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line p-3">
              <p className="text-xs text-ink-muted">Trip Duration</p>
              <p className="text-base font-semibold text-ink">{preferences.days} days</p>
            </div>
            <div className="rounded-xl border border-line p-3">
              <p className="text-xs text-ink-muted">Budget</p>
              <p className="text-base font-semibold text-ink">Rs. {preferences.budget.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-line p-3">
              <p className="text-xs text-ink-muted">Travel Style</p>
              <p className="text-base font-semibold text-ink">{preferences.travelStyle}</p>
            </div>
            <div className="rounded-xl border border-line p-3">
              <p className="text-xs text-ink-muted">Transportation</p>
              <p className="text-base font-semibold text-ink">{preferences.transport}</p>
            </div>
          </CardBody>
        </Card>

        {result ? (
          <Card>
            <CardHeader
              eyebrow="ACTIVE PLAN"
              title={`${result.plans.length} Candidate Plans Generated`}
              subtitle="Access your recommended itinerary."
            />
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">
                  Recommended: {result.plans.find((p) => p.id === result.recommendedPlanId)?.label || 'Plan 1'}
                </p>
                <p className="text-xs text-ink-muted">Generated recently</p>
              </div>
              <ButtonLink href="/itinerary" size="sm">
                <SparklesIcon className="h-4 w-4" />
                View Itinerary
              </ButtonLink>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody className="text-center py-8">
              <UserIcon className="mx-auto h-8 w-8 text-forest-600 mb-2" />
              <p className="text-sm font-semibold text-ink">No generated trip plans yet</p>
              <p className="text-xs text-ink-muted mt-1 mb-4">
                Use the decision support system to build your custom Sri Lanka tour.
              </p>
              <ButtonLink href="/planner" size="sm">
                Start Trip Planner
              </ButtonLink>
            </CardBody>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}

export default ProfilePage;

