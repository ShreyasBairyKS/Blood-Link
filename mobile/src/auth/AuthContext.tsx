import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import * as tokenStore from '@/auth/tokenStore';

interface AuthContextValue {
  isReady: boolean;
  isAuthenticated: boolean;
  signIn: (tokens: { accessToken: string; refreshToken: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    tokenStore.loadTokens().then((tokens) => {
      setAccessToken(tokens.accessToken);
      setIsReady(true);
    });

    return tokenStore.subscribe((tokens) => setAccessToken(tokens.accessToken));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      isAuthenticated: accessToken !== null,
      signIn: async (tokens) => {
        await tokenStore.setTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
      },
      signOut: async () => {
        await tokenStore.clearTokens();
      },
    }),
    [isReady, accessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
