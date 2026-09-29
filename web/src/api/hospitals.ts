import { apiFetch } from '@/api/client';
import type { Hospital, HospitalOnboardInput, HospitalStatus } from '@/api/types';

export function onboardHospital(input: HospitalOnboardInput): Promise<Hospital> {
  return apiFetch<Hospital>('/api/v1/hospitals/onboard', { method: 'POST', body: input, auth: false });
}

export function listHospitals(status?: HospitalStatus): Promise<Hospital[]> {
  const query = status ? `?status_filter=${status}` : '';
  return apiFetch<Hospital[]>(`/api/v1/admin/hospitals${query}`);
}

export function approveHospital(id: string): Promise<Hospital> {
  return apiFetch<Hospital>(`/api/v1/admin/hospitals/${id}/approve`, { method: 'POST' });
}

export function rejectHospital(id: string): Promise<Hospital> {
  return apiFetch<Hospital>(`/api/v1/admin/hospitals/${id}/reject`, { method: 'POST' });
}
