import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo } from "react";

type CompanyUser = {
  id: number;
  name: string;
  ownerEmail: string | null;
  contactName: string | null;
  phone: string | null;
  industry: string | null;
  town: string | null;
  description: string | null;
  website: string | null;
  logoUrl: string | null;
  status: "pending" | "approved" | "suspended";
  createdAt: Date;
};

/**
 * Company (Client) portal auth hook. Uses the `companies` table (email/password
 * login via an httpOnly `company_session_id` cookie). This is fully independent
 * from the public OAuth `users` flow and the job-seeker `job_seekers` flow.
 */
export function useCompanyAuth() {
  const utils = trpc.useUtils();

  const meQuery = trpc.company.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const registerMutation = trpc.company.auth.register.useMutation({
    onSuccess: async () => {
      await utils.company.auth.me.invalidate();
    },
  });

  const loginMutation = trpc.company.auth.login.useMutation({
    onSuccess: async () => {
      await utils.company.auth.me.invalidate();
    },
  });

const logoutMutation = trpc.company.auth.logout.useMutation();

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Session may already be invalid — still clear locally.
} finally {
      // Clear the cached company session client-side so the UI immediately
      // reflects the guest state (does not rely on a network refetch).
      // `reset()` clears the cached query data so the navigation switches
      // straight back to the guest "Sign In" state.
      utils.company.auth.me.reset();
      await utils.company.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

const state = useMemo(
    () => ({
      company: (meQuery.data ?? null) as CompanyUser | null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    }),
    [
      meQuery.data,
      meQuery.error,
      meQuery.isLoading,
      logoutMutation.error,
      logoutMutation.isPending,
    ]
  );

  useEffect(() => {
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.company) return;
    if (typeof window === "undefined") return;
    // Redirect to the company login page when not authenticated.
    if (
      window.location.pathname.startsWith("/client/") &&
      window.location.pathname !== "/client/login" &&
      window.location.pathname !== "/client/signup"
    ) {
      window.location.href = "/client/login";
    }
  }, [meQuery.isLoading, logoutMutation.isPending, state.company]);

  return {
    ...state,
    register: registerMutation.mutateAsync,
    login: loginMutation.mutateAsync,
    logout,
    refresh: () => meQuery.refetch(),
  };
}
