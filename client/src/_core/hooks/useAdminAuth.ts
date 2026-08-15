import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo } from "react";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "super_admin";
  status: "active" | "inactive";
};

/**
 * Admin portal auth hook. Uses the separate `admins` table (email/password
 * login via an httpOnly `admin_session_id` cookie). This is fully independent
 * from the public OAuth `users` auth flow.
 */
export function useAdminAuth() {
  const utils = trpc.useUtils();

  const meQuery = trpc.admin.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.admin.auth.logout.useMutation();

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Session may already be invalid — still clear locally.
    } finally {
      await utils.admin.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(
    () => ({
      admin: (meQuery.data ?? null) as AdminUser | null,
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
    if (state.admin) return;
    if (typeof window === "undefined") return;
    // Redirect to the admin login page when not authenticated.
    if (window.location.pathname !== "/admin/login") {
      window.location.href = "/admin/login";
    }
  }, [meQuery.isLoading, logoutMutation.isPending, state.admin]);

return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
