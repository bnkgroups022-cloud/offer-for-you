/**
 * App-level user shape derived from Firebase's User object.
 * Keeping our own type means the rest of the app never imports
 * Firebase's User type directly, which keeps a future auth-provider
 * swap contained to src/lib/firebase and src/context.
 */
export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  /** ISO-ish timestamp string from Firebase's user metadata, or null. */
  createdAt: string | null;
}
