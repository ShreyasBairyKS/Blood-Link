const ACCESS_KEY = 'bloodlink_admin_access_token';
const REFRESH_KEY = 'bloodlink_admin_refresh_token';

interface Tokens {
  accessToken: string | null;
  refreshToken: string | null;
}

function readStorage(): Tokens {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  return {
    accessToken: window.localStorage.getItem(ACCESS_KEY),
    refreshToken: window.localStorage.getItem(REFRESH_KEY),
  };
}

let tokens: Tokens = readStorage();
const listeners = new Set<(tokens: Tokens) => void>();

function notify() {
  for (const listener of listeners) listener(tokens);
}

export function getTokens(): Tokens {
  return tokens;
}

export function setTokens(next: Tokens): void {
  tokens = next;

  if (next.accessToken) window.localStorage.setItem(ACCESS_KEY, next.accessToken);
  else window.localStorage.removeItem(ACCESS_KEY);

  if (next.refreshToken) window.localStorage.setItem(REFRESH_KEY, next.refreshToken);
  else window.localStorage.removeItem(REFRESH_KEY);

  notify();
}

export function clearTokens(): void {
  setTokens({ accessToken: null, refreshToken: null });
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
