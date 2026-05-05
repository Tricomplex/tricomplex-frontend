import { useUser, useClerk } from "@clerk/clerk-react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();

  return {
    user: user
      ? {
          name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress || "Usuário",
          email: user.primaryEmailAddress?.emailAddress || "",
          picture: user.imageUrl,
        }
      : null,
    isAuthenticated: !!isSignedIn,
    isLoading: !isLoaded,
    logout: () => signOut(),
  };
}