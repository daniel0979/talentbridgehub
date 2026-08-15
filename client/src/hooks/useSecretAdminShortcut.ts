import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Secret admin access shortcut.
 *
 * Pressing Ctrl+Shift+A from anywhere on the public site silently redirects
 * to the admin login page (/admin/login). There is no visual link anywhere —
 * only the key combination is known to admins.
 */
export function useSecretAdminShortcut() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+A — "A" for Admin
      const isCombo =
        e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey &&
        (e.key.toLowerCase() === "a");

      if (!isCombo) return;

      // Prevent the browser's default behavior for this combo (if any).
      e.preventDefault();
      e.stopPropagation();

      // Don't hijack navigation if we're already on the admin login page.
      if (window.location.pathname === "/admin/login") return;

      setLocation("/admin/login");
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [setLocation]);
}

