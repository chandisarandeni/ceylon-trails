'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CompassIcon, UserPlusIcon } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { register, isLoading, setUser } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!name || !email) {
      setLocalError('Please fill in your name and email.');
      return;
    }

    try {
      await register({ name, email, country, password });
      router.push('/planner');
    } catch {
      // Fallback demo user registration
      setUser({
        id: 'demo-user-new',
        name,
        email
      });
      router.push('/planner');
    }
  };

  return (
    <div className="mx-auto max-w-md py-8 sm:py-12">
      <div className="text-center mb-6">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-700 text-white shadow-md">
          <CompassIcon className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">Create Account</h1>
        <p className="mt-1 text-sm text-ink-muted">Join Ceylon Trails for decision support planning</p>
      </div>

      <Card>
        <CardHeader title="Register User Profile" subtitle="Save and compare multi-criteria itineraries." />
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            {localError ? (
              <div className="rounded-xl border border-alert-100 bg-alert-50 p-3 text-xs text-alert-600">
                {localError}
              </div>
            ) : null}

            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                required
                className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-forest-400"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-forest-400"
              />
            </div>

            <div>
              <label htmlFor="reg-country" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                Country of Residence
              </label>
              <input
                id="reg-country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="United Kingdom"
                className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-forest-400"
              />
            </div>

            <div>
              <label htmlFor="reg-pass" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                Password
              </label>
              <input
                id="reg-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm font-medium text-ink outline-none focus:border-forest-400"
              />
            </div>

            <Button type="submit" size="lg" className="w-full mt-2" disabled={isLoading}>
              <UserPlusIcon className="h-4 w-4" />
              {isLoading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-ink-muted">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-forest-700 hover:underline">
              Sign in here
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

export default RegisterPage;

