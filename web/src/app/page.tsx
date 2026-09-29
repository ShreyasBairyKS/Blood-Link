'use client';

import { useState } from 'react';
import { Building2, CheckCircle2, Droplet, LocateFixed, ShieldCheck, Users } from 'lucide-react';

import { onboardHospital } from '@/api/hospitals';
import { ApiError } from '@/api/client';
import type { GeoPoint } from '@/api/types';
import { Button, Card, EmptyState, Input } from '@/components/ui';

export default function OnboardingPage() {
  const [name, setName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [point, setPoint] = useState<GeoPoint | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not available in this browser');
      return;
    }

    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPoint({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setLocationError(err.message);
        setLocating(false);
      }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!point) {
      setError('Set the facility location first');
      return;
    }

    setSubmitting(true);
    try {
      await onboardHospital({
        name,
        license_no: licenseNo,
        contact_name: contactName,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        point,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-12 lg:flex-row lg:items-center lg:gap-16 lg:py-20">
      <div className="flex-1 space-y-8">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
            <ShieldCheck className="size-3.5" />
            For hospitals & blood banks
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
            Reach verified donors, <span className="text-rose-600">the moment</span> you need them.
          </h1>
          <p className="max-w-md text-lg text-stone-500">
            Register your facility once. After review, you&apos;ll be able to raise blood requests and reach
            nearby donors on Blood Link.
          </p>
        </div>

        <dl className="grid max-w-md grid-cols-1 gap-5 sm:grid-cols-2">
          <Feature icon={Users} label="Verified donor pool" />
          <Feature icon={ShieldCheck} label="License-checked facilities" />
          <Feature icon={Building2} label="Built for Indian hospitals" />
          <Feature icon={Droplet} label="No cost to raise a request" />
        </dl>
      </div>

      <Card className="w-full max-w-md p-6 sm:p-8">
        {submitted ? (
          <EmptyState
            icon={CheckCircle2}
            title="You're in the review queue"
            description={`${name} has been submitted. Our team will verify your license and contact you shortly.`}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Register your hospital</h2>
              <p className="mt-1 text-sm text-stone-500">Takes about two minutes.</p>
            </div>

            <Input
              required
              label="Hospital / blood bank name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="City Blood Bank"
            />

            <Input
              required
              label="License / registration number"
              value={licenseNo}
              onChange={(e) => setLicenseNo(e.target.value)}
              placeholder="KA-123456"
            />

            <Input
              required
              label="Authorized contact name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Dr. A. Sharma"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                required
                type="tel"
                label="Contact phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91XXXXXXXXXX"
              />
              <Input
                required
                type="email"
                label="Contact email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="ops@hospital.org"
              />
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-stone-700">Facility location</span>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={useCurrentLocation}
                  loading={locating}
                >
                  <LocateFixed className="size-4" />
                  Use current location
                </Button>
                {point && (
                  <span className="text-sm text-stone-500">
                    {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                  </span>
                )}
              </div>
              {locationError && <p className="mt-1.5 text-sm text-rose-600">{locationError}</p>}
            </div>

            {error && <p className="text-sm text-rose-600">{error}</p>}

            <Button type="submit" className="w-full" loading={submitting}>
              Submit for review
            </Button>

            <p className="text-center text-sm text-stone-400">
              Reviewing hospitals?{' '}
              <a href="/admin" className="font-medium text-rose-600 hover:text-rose-700">
                Go to the admin queue
              </a>
            </p>
          </form>
        )}
      </Card>
    </main>
  );
}

function Feature({ icon: Icon, label }: { icon: typeof Users; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-rose-600 shadow-sm shadow-stone-900/[0.03] ring-1 ring-stone-200/80">
        <Icon className="size-4" />
      </span>
      <span className="text-sm font-medium text-stone-600">{label}</span>
    </div>
  );
}
