'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Check, Inbox, Lock, ShieldAlert, X } from 'lucide-react';

import { requestOtp, verifyOtp } from '@/api/auth';
import { approveHospital, listHospitals, rejectHospital } from '@/api/hospitals';
import { ApiError } from '@/api/client';
import type { Hospital, HospitalStatus } from '@/api/types';
import { useAuth } from '@/auth/AuthContext';
import { Badge, type BadgeProps, Button, Card, EmptyState, Input, Skeleton } from '@/components/ui';

export default function AdminPage() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-stone-900">Admin — Hospital approvals</h1>
      {isAuthenticated ? <HospitalQueue /> : <LoginForm />}
    </main>
  );
}

function LoginForm() {
  const { signIn } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const requestMutation = useMutation({
    mutationFn: () => requestOtp(phone),
    onSuccess: () => setStep('otp'),
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Something went wrong'),
  });

  const verifyMutation = useMutation({
    mutationFn: () => verifyOtp(phone, code),
    onSuccess: (tokens) => signIn({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token }),
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Something went wrong'),
  });

  return (
    <Card className="max-w-sm space-y-4 p-6 sm:p-8">
      <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
        <Lock className="size-5" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-stone-900">Admin sign in</h2>
        <p className="mt-1 text-sm text-stone-500">Use the phone number registered as a Blood Link admin.</p>
      </div>

      {step === 'phone' ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            requestMutation.mutate();
          }}
          className="space-y-3"
        >
          <Input
            required
            type="tel"
            placeholder="+91XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <Button type="submit" className="w-full" loading={requestMutation.isPending}>
            Send code
          </Button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            verifyMutation.mutate();
          }}
          className="space-y-3"
        >
          <p className="text-sm text-stone-500">Code sent to {phone}</p>
          <Input required placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <Button type="submit" className="w-full" loading={verifyMutation.isPending}>
            Verify
          </Button>
        </form>
      )}
    </Card>
  );
}

const TABS: HospitalStatus[] = ['pending', 'approved', 'rejected'];

const STATUS_TONE: Record<HospitalStatus, BadgeProps['tone']> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  suspended: 'neutral',
};

function HospitalQueue() {
  const { signOut } = useAuth();
  const [tab, setTab] = useState<HospitalStatus>('pending');

  const query = useQuery({
    queryKey: ['admin-hospitals', tab],
    queryFn: () => listHospitals(tab),
  });

  if (query.isError && query.error instanceof ApiError && query.error.status === 403) {
    return (
      <Card>
        <EmptyState
          icon={ShieldAlert}
          title="No admin access"
          description="This account doesn't have permission to review hospitals."
          action={
            <Button variant="secondary" size="sm" onClick={() => signOut()}>
              Sign out
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1.5 rounded-full bg-stone-100 p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-colors ${
                tab === t ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>

      <Card className="overflow-hidden">
        {query.isLoading ? (
          <div className="space-y-3 p-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : query.isError ? (
          <EmptyState
            icon={ShieldAlert}
            title="Couldn't load hospitals"
            description="Is the backend running? Check the API connection and try again."
          />
        ) : query.data && query.data.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-100 text-xs uppercase tracking-wide text-stone-400">
              <tr>
                <th className="px-5 py-3 font-medium">Hospital</th>
                <th className="px-5 py-3 font-medium">License</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Submitted</th>
                {tab === 'pending' && <th className="px-5 py-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {query.data.map((hospital) => (
                <HospitalRow key={hospital.id} hospital={hospital} showActions={tab === 'pending'} />
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState icon={Inbox} title={`No ${tab} hospitals`} description="Check back once there's activity." />
        )}
      </Card>
    </div>
  );
}

function HospitalRow({ hospital, showActions }: { hospital: Hospital; showActions: boolean }) {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-hospitals'] });

  const approveMutation = useMutation({ mutationFn: () => approveHospital(hospital.id), onSuccess: invalidate });
  const rejectMutation = useMutation({ mutationFn: () => rejectHospital(hospital.id), onSuccess: invalidate });

  const pending = approveMutation.isPending || rejectMutation.isPending;

  return (
    <tr className="transition-colors hover:bg-stone-50/80">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-500">
            <Building2 className="size-4" />
          </span>
          <span className="font-medium text-stone-800">{hospital.name}</span>
        </div>
      </td>
      <td className="px-5 py-3.5 text-stone-500">{hospital.license_no}</td>
      <td className="px-5 py-3.5">
        <Badge tone={STATUS_TONE[hospital.status]}>{hospital.status}</Badge>
      </td>
      <td className="px-5 py-3.5 text-stone-500">{new Date(hospital.created_at).toLocaleDateString()}</td>
      {showActions && (
        <td className="px-5 py-3.5">
          <div className="flex gap-2">
            <button
              onClick={() => approveMutation.mutate()}
              disabled={pending}
              className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100 disabled:opacity-50"
              aria-label="Approve"
            >
              <Check className="size-4" />
            </button>
            <button
              onClick={() => rejectMutation.mutate()}
              disabled={pending}
              className="flex size-8 items-center justify-center rounded-lg bg-stone-100 text-stone-500 transition-colors hover:bg-stone-200 disabled:opacity-50"
              aria-label="Reject"
            >
              <X className="size-4" />
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}
