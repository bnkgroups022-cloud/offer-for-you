"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.2s2.7-6.2 6-6.2c1.9 0 3.1.8 3.9 1.5l2.6-2.5C16.9 3.3 14.7 2.3 12 2.3 6.9 2.3 2.7 6.5 2.7 11.6S6.9 21 12 21c6.9 0 9.3-4.9 9.3-7.4 0-.5-.1-.9-.1-1.2H12Z"
      />
    </svg>
  );
}

export function GoogleSignInButton({ className }: { className?: string }) {
  const { signIn, actionLoading, isFirebaseConfigured } = useAuth();

  return (
    <Button
      variant="secondary"
      size="lg"
      fullWidth
      isLoading={actionLoading}
      disabled={!isFirebaseConfigured}
      onClick={signIn}
      className={className}
      title={
        isFirebaseConfigured
          ? undefined
          : "Add your Firebase config to .env.local to enable sign-in"
      }
    >
      {!actionLoading && <GoogleGlyph />}
      Continue with Google
    </Button>
  );
}
