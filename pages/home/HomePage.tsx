'use client';

import React from 'react';
import { ArrowRightIcon, CompassIcon, MapPinIcon, NetworkIcon, RouteIcon, CalculatorIcon, BarChart3Icon } from 'lucide-react';
import { ButtonLink } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardBody } from '../../components/ui/Card';

const HERO_IMAGE = "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80";

const MODULES_OVERVIEW = [
  {
    step: 'Module 1',
    title: 'Route Optimization & Feasibility',
    icon: <RouteIcon className="h-5 w-5 text-forest-600" />,
    description: 'Calculates road distance matrices and evaluates travel time feasibility against daily transport caps.'
  },
  {
    step: 'Module 2',
    title: 'Resource Allocation (Knapsack)',
    icon: <CalculatorIcon className="h-5 w-5 text-forest-600" />,
    description: 'Uses 0/1 Knapsack dynamic programming to maximize extra experience value within unused budget.'
  },
  {
    step: 'Module 3',
    title: 'Tourism Network Analysis',
    icon: <NetworkIcon className="h-5 w-5 text-forest-600" />,
    description: 'Constructs sparse weighted graphs, centrality measurements, and degree metrics across travel hubs.'
  },
  {
    step: 'Module 4',
    title: 'Attraction Selection & Ranking',
    icon: <MapPinIcon className="h-5 w-5 text-forest-600" />,
    description: 'Generates 5 distinct candidate itineraries (Top Interest, Value, Compact Region, Balanced, Highlights).'
  },
  {
    step: 'Module 5',
    title: 'Multi-Criteria Plan Scoring (MCDM)',
    icon: <BarChart3Icon className="h-5 w-5 text-forest-600" />,
    description: 'Applies weighted sum model across interest satisfaction, budget efficiency, travel time, and pace.'
  }
];

export function HomePage() {
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
        <div className="grid lg:grid-cols-[1.05fr_1fr]">
          <div className="p-6 sm:p-10">
            <Badge tone="forest" mono>
              FIVE-MODULE DECISION SUPPORT SYSTEM
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-[2.6rem]">
              Smart Sri Lanka Tourism Decision System
            </h1>
            <p className="mt-4 max-w-xl text-base text-ink-muted sm:text-lg">
              Plan your Sri Lankan journey using intelligent destination recommendation, tourism
              network analysis, route optimization and resource allocation.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/planner" size="lg">
                Start Planning
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/system" variant="secondary" size="lg">
                View How It Works
              </ButtonLink>
            </div>
            <dl className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6">
              {[
                ['16+', 'Key Attractions Modelled'],
                ['5', 'Candidate Plans Per Run'],
                ['5', 'Algorithmic Modules']
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="tabular text-2xl font-semibold text-forest-700">{value}</dt>
                  <dd className="mt-0.5 text-xs text-ink-muted">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative min-h-[280px]">
            <img
              src={HERO_IMAGE}
              alt="Sri Lankan hill-country tea slopes with Nine Arch Bridge and Sigiriya"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/30 bg-ink/70 px-4 py-3 backdrop-blur">
              <p className="font-mono text-[11px] text-white/70">EXAMPLE TOURIST PROFILE</p>
              <p className="text-sm font-semibold text-white">
                John • United Kingdom • 7 days • Rs.150,000
              </p>
              <p className="text-xs text-white/75">
                Nature High • Wildlife High • Culture High • Public Transport
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink">Integrated Decision Pipeline</h2>
            <p className="text-sm text-ink-muted">5 specialized modules working together to build optimal trip plans.</p>
          </div>
          <CompassIcon className="h-6 w-6 text-forest-600 hidden sm:block" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES_OVERVIEW.map((mod) => (
            <Card key={mod.step} className="hover:border-forest-300 transition-colors">
              <CardBody className="p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-forest-600">{mod.step}</span>
                  <div className="rounded-lg bg-forest-50 p-2">{mod.icon}</div>
                </div>
                <h3 className="mt-3 text-base font-semibold text-ink">{mod.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">{mod.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;

