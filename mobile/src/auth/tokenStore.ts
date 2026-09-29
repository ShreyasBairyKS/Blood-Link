import { secureStorage } from '@/auth/secureStorage';

const ACCESS_KEY = 'bloodlink_access_token';
const REFRESH_KEY = 'bloodlink_refresh_token';

interface Tokens {
  accessToken: string | null;
  refreshToken: string | null;
}

let tokens: Tokens = { accessToken: null, refreshToken: null };
let loaded = false;
const listeners = new Set<(tokens: Tokens) => void>();

function notify() {
  for (const listener of listeners) listener(tokens);
}

export async function loadTokens(): Promise<Tokens> {
  if (loaded) return tokens;

  const [accessToken, refreshToken] = await Promise.all([
    secureStorage.getItemAsync(ACCESS_KEY),
    secureStorage.getItemAsync(REFRESH_KEY),
  ]);
  tokens = { accessToken, refreshToken };
  loaded = true;
  return tokens;
}

export async function setTokens(next: Tokens): Promise<void> {
  tokens = next;
  await Promise.all([
    next.accessToken
      ? secureStorage.setItemAsync(ACCESS_KEY, next.accessToken)
      : secureStorage.deleteItemAsync(ACCESS_KEY),
    next.refreshToken
      ? secureStorage.setItemAsync(REFRESH_KEY, next.refreshToken)
      : secureStorage.deleteItemAsync(REFRESH_KEY),
  ]);
  notify();
}

export async function clearTokens(): Promise<void> {
  await setTokens({ accessToken: null, refreshToken: null });
}

export function getAccessToken(): string | null {
  return tokens.accessToken;
}

export function getRefreshToken(): string | null {
  return tokens.refreshToken;
}

export function subscribe(listener: (tokens: Tokens) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
