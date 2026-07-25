"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

/* Admin dashboard: quick stats + last-updated per section. */

const tables = [
  { table: "counters", label: "Numbers", href: "/admin/numbers" },
  { table: "cases", label: "Case Studies", href: "/admin/cases" },
  { table: "tools", label: "Tools", href: "/admin/tools" },
  { table: "films", label: "Films", href: "/admin/films" },
  { table: "work_categories", label: "Work Categories", href: "/admin/work" },
  { table: "copy", label: "Copy Lines", href: "/admin/copy" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<
    { label: string; href: string; count: number; updated: string | null }[]
  >([]);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    Promise.all(
      tables.map(async (t) => {
        const { data, count } = await supabase
          .from(t.table)
          .select("updated_at", { count: "exact" })
          .order("updated_at", { ascending: false })
          .limit(1);
        return {
          label: t.label,
          href: t.href,
          count: count ?? 0,
          updated: data?.[0]?.updated_at ?? null,
        };
      })
    ).then(setStats);
  }, []);

  return (
    <div>
      <h1 className="mb-8 font-syne text-xl font-bold text-white">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.length === 0 && (
          <p className="font-mono text-xs text-white/40">
            Loading… (if this never resolves, run supabase/schema.sql in the
            Supabase SQL editor)
          </p>
        )}
        {stats.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-lg border border-white/10 p-6 transition-colors hover:border-pen/40"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <span className="font-syne text-2xl font-bold text-white">
              {s.count}
            </span>
            <p className="mt-1 font-mono text-xs text-white/60">{s.label}</p>
            <p className="mt-3 font-mono text-[10px] text-white/30">
              {s.updated
                ? `Updated ${new Date(s.updated).toLocaleString()}`
                : "Never edited"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
