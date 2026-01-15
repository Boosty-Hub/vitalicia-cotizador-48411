import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        const adminStatus = await checkAdminRole(data.user.id);
        if (!adminStatus) {
          await supabase.auth.signOut();
          return { error: new Error("No tienes permisos de administrador") };
        }
        setIsAdmin(true);
      }

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      return { error: new Error(message) };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ user, session, isAdmin, isLoading, signIn, signOut }}>
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
