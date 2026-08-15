import { trpc } from "@/lib/trpc";
import { useCallback, useMemo } from "react";

export function useJobSeekerAuth() {
  const utils = trpc.useUtils();

  const meQuery = trpc.jobSeeker.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const registerMutation = trpc.jobSeeker.auth.register.useMutation({
    onSuccess: async () => {
      await utils.jobSeeker.auth.me.invalidate();
    },
  });

  const loginMutation = trpc.jobSeeker.auth.login.useMutation({
    onSuccess: async () => {
      await utils.jobSeeker.auth.me.invalidate();
    },
  });

  const logoutMutation = trpc.jobSeeker.auth.logout.useMutation();

const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // ignore — session already invalid
    } finally {
      // Clear the cached job seeker client-side so the UI immediately reflects
      // the guest state. `reset()` clears the cached query data (react-query
      // would otherwise keep the last successful data on a UNAUTHORIZED error
      // after the cookie is cleared, leaving the profile on the navigation).
      utils.jobSeeker.auth.me.reset();
      await utils.jobSeeker.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(
    () => ({
      jobSeeker: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      isAuthenticated: Boolean(meQuery.data),
      error: meQuery.error ?? null,
    }),
    [meQuery.data, meQuery.isLoading, meQuery.error, logoutMutation.isPending]
  );

  return {
    ...state,
    register: registerMutation.mutateAsync,
    login: loginMutation.mutateAsync,
    logout,
refresh: () => meQuery.refetch(),
  };
}
