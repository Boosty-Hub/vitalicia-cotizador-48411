import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthOutcome =
  | null                                         // success
  | { kind: 'transient'; message: string }       // DB/RPC error — retry
  | { kind: 'forbidden'; message: string }       // not admin
  | { kind: 'auth'; message: string };           // Supabase auth error

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthOutcome }>;
  signInWithSession: (tokens: { access_token: string; refresh_token: string }) => Promise<{ error: AuthOutcome }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Used by onAuthStateChange and initSession — does NOT sign out on failure, just returns boolean.
  const checkAdminRole = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });

      if (error) {
        console.error("Error checking admin role:", error);
        return false;
      }
      return data === true;
    } catch (err) {
      console.error("Error in checkAdminRole:", err);
      return false;
    }
  };

  // Private helper — the single home of the sign-in security policy.
  // Calls has_role, distinguishes transient RPC error from genuine not-admin,
  // signs out in both failure cases to avoid a half-authenticated session, and
  // sets isAdmin(true) on success.
  //
  // NOTE: spec says do NOT sign out on transient RPC error; design overrides this to avoid
  // leaving a half-authenticated session. See design.md Decision 4.
  const verifyAdminOrSignOut = async (userId: string): Promise<AuthOutcome> => {
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: 'admin',
    });
    if (error) {
      console.error("verifyAdminOrSignOut — RPC error:", error);
      await supabase.auth.signOut();
      return { kind: 'transient', message: 'Error verificando permisos. Intenta de nuevo.' };
    }
    if (data !== true) {
      await supabase.auth.signOut();
      return { kind: 'forbidden', message: 'No tienes permisos de administrador.' };
    }
    setIsAdmin(true);
    return null;
  };

  useEffect(() => {
    let mounted = true;

    // Listener de cambios de auth - simple y directo
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        console.log("Auth state change:", event);

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Usar setTimeout para evitar bloqueos de Supabase
          setTimeout(async () => {
            if (!mounted) return;
            const adminStatus = await checkAdminRole(currentSession.user.id);
            if (mounted) {
              setIsAdmin(adminStatus);
              setIsLoading(false);
            }
          }, 0);
        } else {
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    // Obtener sesión inicial - con timeout para no bloquear
    const initSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const adminStatus = await checkAdminRole(initialSession.user.id);
          if (mounted) {
            setIsAdmin(adminStatus);
          }
        }
      } catch (err) {
        console.error("Error getting session:", err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Timeout de 5 segundos máximo para la carga inicial
    const loadingTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        console.log("Loading timeout - setting isLoading to false");
        setIsLoading(false);
      }
    }, 5000);

    initSession();

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: AuthOutcome }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { error: { kind: 'auth', message: error.message } };
      }
      if (!data.user) {
        return { error: { kind: 'transient', message: 'No se pudo obtener el usuario.' } };
      }
      const outcome = await verifyAdminOrSignOut(data.user.id);
      return { error: outcome };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      return { error: { kind: 'transient', message } };
    }
  };

  const signInWithSession = async (
    tokens: { access_token: string; refresh_token: string }
  ): Promise<{ error: AuthOutcome }> => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession(tokens);
      if (sessionError || !sessionData.user) {
        return {
          error: {
            kind: 'auth',
            message: sessionError?.message ?? 'No se pudo establecer la sesión.',
          },
        };
      }
      // Explicitly update user/session state so the redirect effect can fire even if
      // onAuthStateChange does not re-emit SIGNED_IN (spec: "reliable redirect").
      setUser(sessionData.user);
      setSession(sessionData.session);
      const outcome = await verifyAdminOrSignOut(sessionData.user.id);
      return { error: outcome };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      return { error: { kind: 'transient', message } };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ user, session, isAdmin, isLoading, signIn, signInWithSession, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
