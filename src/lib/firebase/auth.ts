import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { firebaseAuth } from "./client";
import type { AppUser } from "@/types/user";

const googleProvider = new GoogleAuthProvider();
// Always show the account chooser instead of silently reusing the last session.
googleProvider.setCustomParameters({ prompt: "select_account" });

export function toAppUser(user: User): AppUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: user.metadata.creationTime ?? null,
  };
}

export async function signInWithGoogle(): Promise<AppUser> {
  const credential = await signInWithPopup(firebaseAuth, googleProvider);
  return toAppUser(credential.user);
}

export async function signOutUser(): Promise<void> {
  await signOut(firebaseAuth);
}
