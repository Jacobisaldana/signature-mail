import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initError: string | null;
};

const AuthContext = createContext<AuthContextValue>({ user: null, session: null, loading: true, initError: null });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let subscription: ReturnType<typeof supabase.auth.onAuthStateChange>['data']['subscription'] | null = null;
    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;
        if (error) {
          console.error('Could not retrieve auth session', error);
          setInitError(error.message);
        }
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (err: any) {
        if (mounted) {
          console.error('Auth session check failed', err);
          setInitError(err?.message || 'No se pudo verificar la sesión.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
    });
    subscription = sub?.subscription ?? null;
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ user, session, loading, initError }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
