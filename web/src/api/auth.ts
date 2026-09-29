import { apiFetch } from '@/api/client';
import type { TokenPair } from '@/api/types';

export function requestOtp(phone: string): Promise<void> {
  return apiFetch<void>('/api/v1/auth/otp/request', {
    method: 'POST',
    body: { phone },
    auth: false,
  });
}

export function verifyOtp(phone: string, code: string): Promise<TokenPair> {
  return apiFetch<TokenPair>('/api/v1/auth/otp/verify', {
    method: 'POST',
    body: { phone, code },
    auth: false,
  });
}
