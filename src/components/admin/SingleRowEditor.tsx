"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useSaveState } from "./AdminShell";
import type { FieldDef } from "./CollectionEditor";

/* Editor for single-row tables (identity, theme). Auto-creates the row. */

export default function SingleRowEditor({
  table,
  fields,
}: {
  table: string;
  fields: FieldDef[];
}) {
  const supabase = getSupabase()!;
  const { setSave } = useSaveState();
  const [row, setRow] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) {
      setError(
        `Could not load "${table}". Run supabase/schema.sql first. (${error.message})`
      );
      return;
    }
    if (!data) {
      const { data: created, error: e2 } = await supabase
        .from(table)
        .insert({})
        .select()
        .single();
      if (e2) setError(e2.message);
      else setRow(created);
    } else {
      setRow(data);
    }
  }, [supabase, table]);

  useEffect(() => {
    load();
  }, [load]);

  const persist = (patch: Record<string, unknown>) => {
    if (!row) return;
    const next = { ...row, ...patch };
    setRow(next);
    clearTimeout(timer.current);
    setSave("saving");
    timer.current = setTimeout(async () => {
      const { error } = await supabase
        .from(table)
        .update(patch)
        .eq("id", row.id as string);
      setSave(error ? "error" : "saved");
    }, 800);
  };

  if (error)
    return (
      <p className="max-w-lg font-mono text-xs leading-relaxed text-warn">
        {error}
      </p>
    );
  if (!row) return <p className="font-mono text-xs text-white/40">Loading…</p>;

  return (
    <div className="grid max-w-3xl grid-cols-1 gap-5 md:grid-cols-2">
      {fields.map((f) => (
        <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : ""}>
          <label className="admin-label">{f.label}</label>
          {f.type === "textarea" ? (
            <textarea
              className="admin-input min-h-[88px]"
              value={String(row[f.key] ?? "")}
              onChange={(e) => persist({ [f.key]: e.target.value })}
            />
          ) : f.type === "tags" ? (
            <input
              type="text"
              className="admin-input"
              value={
                Array.isArray(row[f.key])
                  ? (row[f.key] as string[]).join(", ")
                  : String(row[f.key] ?? "")
              }
              placeholder="Comma separated"
              onChange={(e) =>
                persist({
                  [f.key]: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          ) : (
            <input
              type={f.type === "select" ? "text" : f.type}
              className="admin-input"
              value={String(row[f.key] ?? "")}
              onChange={(e) => persist({ [f.key]: e.target.value })}
            />
          )}
        </div>
      ))}
    </div>
  );
}
