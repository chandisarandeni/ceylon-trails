'use client';

import React from 'react';
import { ArrowRightIcon, CompassIcon, MapPinIcon, RouteIcon, CalculatorIcon, SparklesIcon, CheckCircle2Icon } from 'lucide-react';
import { ButtonLink } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardBody } from '../../components/ui/Card';

const HERO_IMAGE = "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80";

const FEATURES_OVERVIEW = [
  {
    title: 'Personalized Destination Matching',
    icon: <MapPinIcon className="h-5 w-5 text-forest-600" />,
    description: 'Custom-curates ancient UNESCO fortresses, wildlife safaris, tea plantations, and pristine beaches based on your travel interests.'
  },
  {
    title: 'Smart Travel Route Optimization',
    icon: <RouteIcon className="h-5 w-5 text-forest-600" />,
    description: 'Calculates the shortest, most efficient road routes and daily travel times so you spend less time in traffic and more time exploring.'
  },
  {
    title: 'Budget & Feasibility Control',
    icon: <CalculatorIcon className="h-5 w-5 text-forest-600" />,
    description: 'Real-time estimation of entrance fees, lodging, food, and transport costs to ensure your itinerary stays strictly within budget.'
  },
  {
    title: '5 Tailored Itinerary Options',
    icon: <SparklesIcon className="h-5 w-5 text-forest-600" />,
    description: 'Generates 5 distinct travel options—from Top Highlights to Budget-Optimized and Compact Region itineraries—so you can pick your favourite.'
  }
];

export function HomePage() {
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
        <div className="grid lg:grid-cols-[1.05fr_1fr]">
          <div className="p-6 sm:p-10">
            <Badge tone="forest" mono>
              SMART SRI LANKA TRAVEL PLANNER
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-[2.6rem]">
              Discover & Build Your Perfect Sri Lankan Journey
            </h1>
            <p className="mt-4 max-w-xl text-base text-ink-muted sm:text-lg">
              Explore Sri Lanka's iconic landmarks, hidden waterfalls, ancient heritage sites, and wildlife safaris with custom travel itineraries.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/planner" size="lg">
                Start Planning Trip
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/compare" variant="secondary" size="lg">
                Explore Sample Plans
              </ButtonLink>
            </div>
            <dl className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6">
              {[
                ['450+', 'Curated Destinations'],
                ['5', 'Custom Plans Per Trip'],
                ['100%', 'Personalized Controls']
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
              <p className="font-mono text-[11px] text-white/70">FEATURED ITINERARY</p>
              <p className="text-sm font-semibold text-white">
                Sigiriya • Kandy • Ella • Mirissa • Galle
              </p>
              <p className="text-xs text-white/75">
                7 Days • Scenic Rail & Private Transport • Nature & Culture Match
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink">Why Plan Your Trip With Ceylon Trails?</h2>
            <p className="text-sm text-ink-muted">Everything you need for an unforgettable, stress-free Sri Lanka vacation.</p>
          </div>
          <CompassIcon className="h-6 w-6 text-forest-600 hidden sm:block" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES_OVERVIEW.map((feat) => (
            <Card key={feat.title} className="hover:border-forest-300 transition-colors">
              <CardBody className="p-5">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-forest-50 p-2">{feat.icon}</div>
                  <CheckCircle2Icon className="h-4 w-4 text-forest-500" />
                </div>
                <h3 className="mt-3 text-base font-semibold text-ink">{feat.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">{feat.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
