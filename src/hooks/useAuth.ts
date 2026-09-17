import { useAuthContext } from "@/context/AuthContext";

/**
 * Public hook for consuming auth state anywhere in the app:
 *
 *   const { user, loading, signIn, signOutApp } = useAuth();
 */
export function useAuth() {
  return useAuthContext();
}
