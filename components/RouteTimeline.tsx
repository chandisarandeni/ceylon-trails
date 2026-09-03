import React from 'react';
import { BusIcon, FlagIcon, MapPinIcon } from 'lucide-react';
import { ATTRACTION_MAP, getPoint } from '../lib/data/attractions';
import { RouteLeg } from '../types/tourism';
import { formatHours, formatKm, formatRs } from '../utils/format';

export function RouteTimeline({
  order,
  legs,
  compact = false
}: {
  order: string[];
  legs: RouteLeg[];
  compact?: boolean;
}) {
  return (
    <ol className="relative">
      {order.map((id, index) => {
        const point = getPoint(id);
        const attraction = ATTRACTION_MAP[id];
        const leg = legs[index - 1];
        const isLast = index === order.length - 1;
        return (
          <li key={`${id}-${index}`} className="relative pl-9">
            {!isLast ? (
              <span aria-hidden className="absolute left-[13px] top-6 h-[calc(100%-12px)] w-px bg-line" />
            ) : null}
            <span
              className={`absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface ${
                point.isHub ? 'bg-forest-800 text-white' : 'bg-forest-500 text-white'
              }`}
            >
              {point.isHub ? (
                <FlagIcon className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <MapPinIcon className="h-3.5 w-3.5" aria-hidden />
              )}
            </span>
            <div className={compact ? 'pb-4' : 'pb-6'}>
              {leg ? (
                <p className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                  <span className="inline-flex items-center gap-1 font-medium text-clay-600">
                    <BusIcon className="h-3.5 w-3.5" aria-hidden />
                    {leg.transport}
                  </span>
                  <span className="tabular">{formatKm(leg.distanceKm)}</span>
                  <span className="tabular">{formatHours(leg.travelHours)}</span>
                  <span className="tabular">{formatRs(leg.travelCost)}</span>
                  {leg.via.length ? (
                    <span className="text-ink-soft">
                      via {leg.via.map((v) => getPoint(v).city).join(' → ')}
                    </span>
                  ) : null}
                </p>
              ) : null}
              <p className="text-sm font-semibold text-ink">{point.name}</p>
              <p className="text-xs text-ink-muted">
                {point.city}
                {attraction
                  ? ` • ${attraction.visitDuration}h visit • ${formatRs(attraction.activityCost)}`
                  : ' • start / end point'}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
