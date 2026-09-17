"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import { signInWithGoogle, signOutUser, toAppUser } from "@/lib/firebase/auth";
import type { AppUser } from "@/types/user";

interface AuthContextValue {
  user: AppUser | null;
  /** True while the initial Firebase auth state is still resolving. */
  loading: boolean;
  /** True once a sign-in/out action is in flight. */
  actionLoading: boolean;
  error: string | null;
  isFirebaseConfigured: boolean;
  signIn: () => Promise<void>;
  signOutApp: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      setUser(firebaseUser ? toAppUser(firebaseUser) : null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    setError(null);
    setActionLoading(true);
    try {
      const appUser = await signInWithGoogle();
      setUser(appUser);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Google sign-in failed. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const signOutApp = async () => {
    setError(null);
    setActionLoading(true);
    try {
      await signOutUser();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-out failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      actionLoading,
      error,
      isFirebaseConfigured,
      signIn,
      signOutApp,
    }),
    [user, loading, actionLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
}
