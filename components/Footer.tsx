import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface py-8 text-center text-xs text-ink-muted">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-medium text-ink">
            © {new Date().getFullYear()} Ceylon Trails • Smart Sri Lanka Travel Planner
          </p>
          <div className="flex gap-4">
            <Link href="/planner" className="hover:text-forest-700">
              Trip Planner
            </Link>
            <Link href="/dashboard" className="hover:text-forest-700">
              Dashboard
            </Link>
            <Link href="/compare" className="hover:text-forest-700">
              Compare Plans
            </Link>
            <Link href="/itinerary" className="hover:text-forest-700">
              Final Itinerary
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
