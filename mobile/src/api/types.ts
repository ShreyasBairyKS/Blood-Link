export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AccessToken {
  access_token: string;
  token_type: string;
}

export interface DonorProfile {
  id: string;
  blood_group: BloodGroup;
  date_of_birth: string; // YYYY-MM-DD
  weight_kg: number;
  last_donation_at: string | null;
  available: boolean;
  verification_level: number;
  reliability_score: number;
}

export interface DonorProfileInput {
  blood_group: BloodGroup;
  date_of_birth: string;
  weight_kg: number;
  available: boolean;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface DonorZone {
  id: string;
  label: string;
  radius_km: number;
}

export interface DonorZoneInput {
  label: string;
  point: GeoPoint;
  radius_km: number;
}
