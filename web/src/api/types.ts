export type HospitalStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface HospitalOnboardInput {
  name: string;
  license_no: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  point: GeoPoint;
}

export interface Hospital {
  id: string;
  name: string;
  license_no: string;
  status: HospitalStatus;
  verified_at: string | null;
  created_at: string;
}
