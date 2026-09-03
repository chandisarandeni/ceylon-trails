'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CompassIcon, MenuIcon, RotateCcwIcon, XIcon, UserIcon, LogOutIcon } from 'lucide-react';
import { usePlannerStore } from '../store/usePlannerStore';
import { useAuthStore } from '../store/useAuthStore';
import { Button, ButtonLink } from './ui/Button';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/planner', label: 'Trip Planner' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/compare', label: 'Compare Plans' },
  { href: '/itinerary', label: 'Final Itinerary' }
];

export function Header() {
  const { result, reset, preferences } = usePlannerStore();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest-700 text-white">
            <CompassIcon className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold leading-tight text-ink">
              Ceylon Trails
            </span>
            <span className="block font-mono text-[10px] leading-tight text-forest-500">
              Smart Sri Lanka Travel Planner
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ease-out ${
                  isActive
                    ? 'bg-forest-50 text-forest-700'
                    : 'text-ink-muted hover:bg-canvas hover:text-ink'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">


          {result ? (
            <Button variant="secondary" size="sm" onClick={reset}>
              <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden />
              Reset
            </Button>
          ) : (
            <ButtonLink href="/planner" size="sm">
              Start Planning
            </ButtonLink>
          )}

          {user ? (
            <div className="flex items-center gap-2 border-l border-line pl-2">
              <Link
                href="/profile"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-forest-700 hover:bg-forest-50"
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span>{user.firstName} {user.lastName}</span>
              </Link>
              <button
                onClick={logout}
                title="Logout"
                className="rounded-lg p-1.5 text-ink-muted hover:bg-alert-50 hover:text-alert-600"
              >
                <LogOutIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-forest-700 hover:bg-forest-50"
            >
              Sign In
            </Link>
          )}

          <button
            type="button"
            className="rounded-lg border border-line p-2 text-ink-muted lg:hidden cursor-pointer"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? (
              <XIcon className="h-4 w-4" aria-hidden />
            ) : (
              <MenuIcon className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav aria-label="Mobile" className="border-t border-line px-4 pb-3 pt-2 lg:hidden">
          <ul className="grid gap-1 sm:grid-cols-2">
            {NAV.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive ? 'bg-forest-50 text-forest-700' : 'text-ink-muted'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
