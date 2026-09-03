'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CompassIcon, UserPlusIcon } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!firstName.trim()) {
      setLocalError('Please enter your first name.');
      return;
    }
    if (!lastName.trim()) {
      setLocalError('Please enter your last name.');
      return;
    }
    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!phone.trim()) {
      setLocalError('Please enter your phone number.');
      return;
    }
    if (!dateOfBirth) {
      setLocalError('Please enter your date of birth.');
      return;
    }
    if (!country.trim()) {
      setLocalError('Please enter your country of residence.');
      return;
    }
    if (!password || password.length < 8) {
      setLocalError('Password must be at least 8 characters long.');
      return;
    }

    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        dateOfBirth,
        country: country.trim(),
        password
      });
      router.push('/planner');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setLocalError(msg);
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
          <form onSubmit={handleSubmit} className="space-y-3">
            {localError ? (
              <div className="rounded-xl border border-alert-100 bg-alert-50 p-3.5 text-xs font-medium text-alert-600 leading-relaxed">
                {localError}
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-fname" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                  First Name
                </label>
                <input
                  id="reg-fname"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink outline-none focus:border-forest-400"
                />
              </div>

              <div>
                <label htmlFor="reg-lname" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                  Last Name
                </label>
                <input
                  id="reg-lname"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Smith"
                  required
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink outline-none focus:border-forest-400"
                />
              </div>
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
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink outline-none focus:border-forest-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-phone" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                  Phone Number
                </label>
                <input
                  id="reg-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                  required
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink outline-none focus:border-forest-400"
                />
              </div>

              <div>
                <label htmlFor="reg-dob" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                  Date of Birth
                </label>
                <input
                  id="reg-dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink outline-none focus:border-forest-400"
                />
              </div>
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
                placeholder="Sri Lanka / United Kingdom"
                required
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink outline-none focus:border-forest-400"
              />
            </div>

            <div>
              <label htmlFor="reg-pass" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                Password (min 8 characters)
              </label>
              <input
                id="reg-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={8}
                required
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink outline-none focus:border-forest-400"
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
