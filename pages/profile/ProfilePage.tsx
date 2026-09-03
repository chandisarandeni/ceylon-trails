'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserIcon,
  LogOutIcon,
  SparklesIcon,
  SaveIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  Trash2Icon,
  GlobeIcon,
  CalendarIcon,
  PhoneIcon,
  MailIcon
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { usePlannerStore } from '../../store/usePlannerStore';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AuthGuard } from '../../components/AuthGuard';
import { updateUser, deleteUser } from '../../lib/api/users';

export function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const { preferences, result } = usePlannerStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    dateOfBirth: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      // Format dateOfBirth string for HTML date input (YYYY-MM-DD)
      let dobString = '';
      if (user.dateOfBirth) {
        try {
          const d = new Date(user.dateOfBirth);
          if (!isNaN(d.getTime())) {
            dobString = d.toISOString().split('T')[0];
          } else {
            dobString = String(user.dateOfBirth).split('T')[0];
          }
        } catch {
          dobString = '';
        }
      }

      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || '',
        dateOfBirth: dobString
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (successMsg) setSuccessMsg(null);
    if (errorMsg) setErrorMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const updatedUser = await updateUser(user.id, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        country: formData.country.trim(),
        dateOfBirth: formData.dateOfBirth
      });

      setUser(updatedUser);
      setSuccessMsg('Profile updated successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    setIsDeleting(true);
    try {
      await deleteUser(user.id);
      logout();
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete account.';
      setErrorMsg(msg);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const initials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : 'U';

  return (
    <AuthGuard>
      <div className="mx-auto max-w-3xl space-y-6 py-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-forest-700 text-xl font-bold text-white shadow-md">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge tone="forest" mono>
                  VERIFIED TOURIST
                </Badge>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-sm text-ink-muted">{user?.email}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            <LogOutIcon className="h-4 w-4" />
            Sign Out
          </Button>
        </header>

        {successMsg ? (
          <div className="rounded-xl border border-forest-200 bg-forest-50 p-4 text-sm text-forest-800 shadow-sm flex items-center gap-3">
            <CheckCircle2Icon className="h-5 w-5 text-forest-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        ) : null}

        {errorMsg ? (
          <div className="rounded-xl border border-alert-200 bg-alert-50 p-4 text-sm text-alert-800 shadow-sm flex items-center gap-3">
            <AlertCircleIcon className="h-5 w-5 text-alert-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        ) : null}

        <Card as="section">
          <CardHeader
            eyebrow="PERSONAL DETAILS"
            title="Edit Profile Information"
            subtitle="Update your personal information used across your travel bookings and itinerary recommendations."
          />
          <CardBody>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <MailIcon className="absolute left-3.5 top-3 h-4 w-4 text-ink-soft" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      disabled
                      value={formData.email}
                      className="w-full rounded-xl border border-line bg-canvas/60 pl-10 pr-3.5 py-2.5 text-sm text-ink-muted cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3.5 top-3 h-4 w-4 text-ink-soft" />
                    <input
                      id="phone"
                      name="phone"
                      type="text"
                      placeholder="+94 77 123 4567"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-line bg-surface pl-10 pr-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="country" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                    Country / Region
                  </label>
                  <div className="relative">
                    <GlobeIcon className="absolute left-3.5 top-3 h-4 w-4 text-ink-soft" />
                    <input
                      id="country"
                      name="country"
                      type="text"
                      placeholder="e.g. United Kingdom"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-line bg-surface pl-10 pr-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3.5 top-3 h-4 w-4 text-ink-soft" />
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-line bg-surface pl-10 pr-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" disabled={isSaving} className="px-6 cursor-pointer">
                  <SaveIcon className="h-4 w-4" />
                  {isSaving ? 'Saving Changes…' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>



        {result ? (
          <Card>
            <CardHeader
              eyebrow="ACTIVE PLAN"
              title={`${result.plans.length} Candidate Plans Generated`}
              subtitle="Access your recommended travel itinerary."
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
                Use our trip planner to build your custom Sri Lanka tour.
              </p>
              <ButtonLink href="/planner" size="sm">
                Start Trip Planner
              </ButtonLink>
            </CardBody>
          </Card>
        )}

        <div className="rounded-2xl border border-alert-200 bg-alert-50/50 p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-alert-800">Delete Account</h3>
            <p className="text-xs text-alert-700 mt-0.5">
              Permanently delete your profile and account information.
            </p>
          </div>
          <Button variant="secondary" size="sm" className="text-alert-700 border-alert-300 hover:bg-alert-100" onClick={() => setShowDeleteModal(true)}>
            <Trash2Icon className="h-4 w-4" />
            Delete Account
          </Button>
        </div>

        {showDeleteModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl border border-line space-y-4">
              <div className="flex items-center gap-3 text-alert-600">
                <AlertCircleIcon className="h-6 w-6 shrink-0" />
                <h3 className="text-lg font-semibold text-ink">Delete Profile Account?</h3>
              </div>
              <p className="text-sm text-ink-muted">
                Are you sure you want to delete your account? This action cannot be undone and will permanently remove your profile details.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
                  Cancel
                </Button>
                <Button size="sm" className="bg-alert-600 hover:bg-alert-700 text-white" onClick={handleDeleteAccount} disabled={isDeleting}>
                  {isDeleting ? 'Deleting…' : 'Yes, Delete Account'}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AuthGuard>
  );
}

export default ProfilePage;
