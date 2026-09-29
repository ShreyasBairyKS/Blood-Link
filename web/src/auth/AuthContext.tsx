'use client';

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';

import * as tokenStore from '@/auth/tokenStore';

interface AuthContextValue {
  isAuthenticated: boolean;
  signIn: (tokens: { accessToken: string; refreshToken: string }) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function subscribe(callback: () => void) {
  return tokenStore.subscribe(callback);
}

function getSnapshot() {
  return tokenStore.getAccessToken();
}

function getServerSnapshot() {
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // useSyncExternalStore matches server/client hydration (getServerSnapshot)
  // then immediately reconciles with the real localStorage value.
  const accessToken = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: accessToken !== null,
      signIn: (tokens) => {
        tokenStore.setTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
      },
      signOut: () => {
        tokenStore.clearTokens();
      },
    }),
    [accessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
