"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

/* Admin shell: Supabase Auth gate + navigation + global save indicator. */

type SaveState = "idle" | "saving" | "saved" | "error";
const SaveContext = createContext<{ setSave: (s: SaveState) => void }>({
  setSave: () => {},
});
export const useSaveState = () => useContext(SaveContext);

const sections = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/identity", label: "Identity" },
  { href: "/admin/numbers", label: "Numbers" },
  { href: "/admin/cases", label: "Cases" },
  { href: "/admin/tools", label: "Tools" },
  { href: "/admin/films", label: "Films" },
  { href: "/admin/work", label: "Work" },
  { href: "/admin/copy", label: "Copy" },
  { href: "/admin/theme", label: "Theme" },
  { href: "/admin/scenes", label: "Scenes" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [save, setSave] = useState<SaveState>("idle");

  const supabase = getSupabase();

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s)
    );
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (save === "saved") {
      const t = setTimeout(() => setSave("idle"), 2000);
      return () => clearTimeout(t);
    }
  }, [save]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setLoginError(error.message);
  };

  if (checking) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "var(--admin-bg)" }}
      >
        <span className="font-mono text-xs text-white/40">Checking session…</span>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div
        className="flex min-h-screen items-center justify-center p-6"
        style={{ background: "var(--admin-bg)" }}
      >
        <p className="max-w-md text-center font-mono text-sm text-white/60">
          Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div
        className="flex min-h-screen items-center justify-center p-6"
        style={{ background: "var(--admin-bg)" }}
      >
        <form onSubmit={login} className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <span className="font-syne text-2xl font-bold tracking-widest text-pen">
              MK
            </span>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-white/40">
              Admin panel
            </p>
          </div>
          <label className="admin-label">Email</label>
          <input
            type="email"
            className="admin-input mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <label className="admin-label">Password</label>
          <input
            type="password"
            className="admin-input mb-6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          {loginError && (
            <p className="mb-4 font-mono text-xs text-warn">{loginError}</p>
          )}
          <button
            type="submit"
            className="h-12 w-full rounded-md bg-pen font-syne text-sm font-bold text-black transition-opacity hover:opacity-90"
          >
            Sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <SaveContext.Provider value={{ setSave }}>
      <div className="min-h-screen pb-20 md:pb-0" style={{ background: "var(--admin-bg)" }}>
        {/* top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 px-4 py-3 backdrop-blur-md md:px-8" style={{ background: "rgba(16,15,13,0.9)" }}>
          <div className="flex items-center gap-4">
            <span className="font-syne text-sm font-bold tracking-widest text-pen">
              MK · Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px]">
              {save === "saving" && (
                <span className="text-amber-400">● Saving…</span>
              )}
              {save === "saved" && <span className="text-green-400">● Saved ✓</span>}
              {save === "error" && (
                <span className="text-warn">● Save failed</span>
              )}
            </span>
            <a
              href="/"
              target="_blank"
              className="rounded border border-white/15 px-3 py-1.5 font-mono text-[11px] text-white/70 hover:border-pen/50 hover:text-pen"
            >
              View portfolio ↗
            </a>
            <button
              onClick={() => supabase.auth.signOut()}
              className="font-mono text-[11px] text-white/40 hover:text-white/80"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="flex">
          {/* desktop sidebar */}
          <nav className="sticky top-[53px] hidden h-[calc(100vh-53px)] w-48 shrink-0 flex-col gap-1 border-r border-white/10 p-4 md:flex">
            {sections.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className={`rounded px-3 py-2 font-mono text-xs transition-colors ${
                  pathname === s.href
                    ? "bg-pen/10 text-pen"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </nav>

          <div className="min-w-0 flex-1 p-4 md:p-8">{children}</div>
        </div>

        {/* mobile bottom tab bar */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex overflow-x-auto border-t border-white/10 backdrop-blur-md md:hidden" style={{ background: "rgba(16,15,13,0.95)" }}>
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={`flex h-14 min-w-[72px] flex-1 items-center justify-center font-mono text-[10px] ${
                pathname === s.href ? "text-pen" : "text-white/50"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </div>
    </SaveContext.Provider>
  );
}
