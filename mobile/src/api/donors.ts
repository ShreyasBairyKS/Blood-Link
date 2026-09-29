import { apiFetch } from '@/api/client';
import type { DonorProfile, DonorProfileInput, DonorZone, DonorZoneInput } from '@/api/types';

export function getMyProfile(): Promise<DonorProfile | null> {
  return apiFetch<DonorProfile | null>('/api/v1/donors/me');
}

export function upsertMyProfile(input: DonorProfileInput): Promise<DonorProfile> {
  return apiFetch<DonorProfile>('/api/v1/donors/me', { method: 'PUT', body: input });
}

export function addZone(input: DonorZoneInput): Promise<DonorZone> {
  return apiFetch<DonorZone>('/api/v1/donors/me/zones', { method: 'POST', body: input });
}
