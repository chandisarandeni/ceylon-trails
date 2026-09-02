import { getPoint } from '../lib/data/attractions';
import { TransportMode, TravelStyle } from '../types/tourism';

const EARTH_RADIUS_KM = 6371;
/** Sri Lankan roads are rarely direct – inflate great-circle distance. */
const ROAD_FACTOR = 1.34;

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function roadDistanceKm(fromId: string, toId: string): number {
  const a = getPoint(fromId);
  const b = getPoint(toId);
  return Math.round(haversineKm(a, b) * ROAD_FACTOR * 10) / 10;
}

interface TransportProfile {
  label: string;
  avgSpeedKmh: number;
  costPerKm: number;
  baseFare: number;
}

export const TRANSPORT_PROFILES: Record<TransportMode, TransportProfile> = {
  'Public Transport': { label: 'Public Transport (Bus / Train)', avgSpeedKmh: 38, costPerKm: 30, baseFare: 800 },
  'Private Transport': { label: 'Private Transport (Car / Van)', avgSpeedKmh: 55, costPerKm: 80, baseFare: 2000 }
};

const SHORT_HOP = {
  label: 'Tuk-tuk / Local Bus',
  avgSpeedKmh: 28,
  costPerKm: 60,
  baseFare: 300
};

export interface EdgeCost {
  distanceKm: number;
  travelHours: number;
  travelCost: number;
  transport: string;
}

export function edgeCost(fromId: string, toId: string, mode: TransportMode): EdgeCost {
  const distanceKm = roadDistanceKm(fromId, toId);
  const profile = distanceKm < 25 ? SHORT_HOP : TRANSPORT_PROFILES[mode];
  const travelHours = Math.round((distanceKm / profile.avgSpeedKmh) * 10) / 10;
  const travelCost = Math.round((profile.baseFare + distanceKm * profile.costPerKm) / 50) * 50;
  return { distanceKm, travelHours, travelCost, transport: profile.label };
}

export const STYLE_PROFILES: Record<
  TravelStyle,
  { nightRate: number; foodPerDay: number; label: string }
> = {
  Budget: { nightRate: 4500, foodPerDay: 2500, label: 'Guesthouses & local eateries' },
  Balanced: { nightRate: 8000, foodPerDay: 4200, label: 'Mid-range hotels & mixed dining' },
  Comfort: { nightRate: 15500, foodPerDay: 7500, label: 'Boutique hotels & resort dining' }
};

/** Lodging is not uniform across the island. */
export const PROVINCE_LODGING_MULTIPLIER: Record<string, number> = {
  Southern: 1.12,
  Central: 1.05,
  Western: 1.15,
  Uva: 0.95,
  'North Central': 0.92,
  'North Western': 0.9,
  Sabaragamuwa: 0.9,
  Eastern: 0.95
};

/** Project geo coordinates into an SVG box. */
export function projectPoints(
  points: { id: string; lat: number; lng: number }[],
  width: number,
  height: number,
  pad = 46
): Record<string, { x: number; y: number }> {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const spanLat = Math.max(maxLat - minLat, 0.35);
  const spanLng = Math.max(maxLng - minLng, 0.35);
  const result: Record<string, { x: number; y: number }> = {};
  points.forEach((p) => {
    result[p.id] = {
      x: pad + ((p.lng - minLng) / spanLng) * (width - pad * 2),
      y: pad + ((maxLat - p.lat) / spanLat) * (height - pad * 2)
    };
  });
  return result;
}
