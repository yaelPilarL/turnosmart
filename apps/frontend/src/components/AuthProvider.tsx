'use client';

import type { Session } from '@supabase/supabase-js';
import type { MeResponse } from '@turnosmart/shared';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { getSupabase } from '@/lib/supabase';

type Status = 'loading' | 'signedOut' | 'signedIn';

interface AuthValue {
  status: Status;
  session: Session | null;
  me: MeResponse | null;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  refreshMe(): Promise<MeResponse | null>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  const refreshMe = useCallback(async () => {
    try {
      const result = await api<MeResponse>('/api/me');
      setMe(result);
      return result;
    } catch {
      setMe(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    let active = true;

    // Recuperación de sesión al recargar la página.
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) await refreshMe();
      if (active) setStatus(data.session ? 'signedIn' : 'signedOut');
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === 'SIGNED_OUT') {
        setMe(null);
        setStatus('signedOut');
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [refreshMe]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos' : error.message);
      setSession(data.session);
      await refreshMe();
      setStatus('signedIn');
    },
    [refreshMe],
  );

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
    setMe(null);
    setSession(null);
    setStatus('signedOut');
  }, []);

  const value = useMemo(
    () => ({ status, session, me, signIn, signOut, refreshMe }),
    [status, session, me, signIn, signOut, refreshMe],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
