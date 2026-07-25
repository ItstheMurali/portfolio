"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useSaveState } from "./AdminShell";

/* Generic collection editor: fetch, edit (auto-save 800ms debounce),
   add, delete-with-confirm, visibility toggle, up/down reorder. */

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "url" | "email" | "tags" | "select";
  options?: string[];
}

interface Row {
  id: string;
  visible: boolean;
  sort_order: number;
  [key: string]: unknown;
}

export default function CollectionEditor({
  table,
  fields,
  titleKey,
  newRow,
}: {
  table: string;
  fields: FieldDef[];
  titleKey: string;
  newRow: Record<string, unknown>;
}) {
  const supabase = getSupabase()!;
  const { setSave } = useSaveState();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      setError(
        `Could not load "${table}". Run supabase/schema.sql in the Supabase SQL editor first. (${error.message})`
      );
    } else {
      setRows((data as Row[]) ?? []);
    }
    setLoading(false);
  }, [supabase, table]);

  useEffect(() => {
    load();
  }, [load]);

  const persist = (id: string, patch: Record<string, unknown>) => {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    clearTimeout(timers.current[id]);
    setSave("saving");
    timers.current[id] = setTimeout(async () => {
      const { error } = await supabase.from(table).update(patch).eq("id", id);
      setSave(error ? "error" : "saved");
    }, 800);
  };

  const add = async () => {
    setSave("saving");
    const sort_order = rows.length
      ? Math.max(...rows.map((r) => r.sort_order)) + 1
      : 0;
    const { data, error } = await supabase
      .from(table)
      .insert({ ...newRow, sort_order })
      .select()
      .single();
    if (error) {
      setSave("error");
      setError(error.message);
    } else {
      setRows((r) => [...r, data as Row]);
      setSave("saved");
    }
  };

  const remove = async (id: string) => {
    setConfirmDelete(null);
    setSave("saving");
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) setSave("error");
    else {
      setRows((r) => r.filter((row) => row.id !== id));
      setSave("saved");
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= rows.length) return;
    const a = rows[idx];
    const b = rows[j];
    setSave("saving");
    const next = [...rows];
    next[idx] = { ...b, sort_order: a.sort_order };
    next[j] = { ...a, sort_order: b.sort_order };
    setRows(next);
    const [r1, r2] = await Promise.all([
      supabase.from(table).update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from(table).update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    setSave(r1.error || r2.error ? "error" : "saved");
  };

  if (loading)
    return <p className="font-mono text-xs text-white/40">Loading…</p>;
  if (error)
    return (
      <p className="max-w-lg font-mono text-xs leading-relaxed text-warn">
        {error}
      </p>
    );

  return (
    <div className="space-y-4">
      {rows.map((row, idx) => (
        <div
          key={row.id}
          className={`rounded-lg border p-5 transition-opacity ${
            row.visible ? "border-white/10" : "border-white/5 opacity-50"
          }`}
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className="truncate font-syne text-sm font-bold text-white">
              {String(row[titleKey] || "Untitled")}
            </span>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                onClick={() => move(idx, -1)}
                className="h-9 w-9 rounded border border-white/10 font-mono text-xs text-white/60 hover:border-pen/40"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                onClick={() => move(idx, 1)}
                className="h-9 w-9 rounded border border-white/10 font-mono text-xs text-white/60 hover:border-pen/40"
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                onClick={() => persist(row.id, { visible: !row.visible })}
                className={`h-9 rounded border px-3 font-mono text-[10px] ${
                  row.visible
                    ? "border-green-500/30 text-green-400"
                    : "border-white/10 text-white/40"
                }`}
              >
                {row.visible ? "Visible" : "Hidden"}
              </button>
              <button
                onClick={() => setConfirmDelete(row.id)}
                className="h-9 rounded border border-white/10 px-3 font-mono text-[10px] text-warn/70 hover:border-warn/40"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fields.map((f) => (
              <div
                key={f.key}
                className={f.type === "textarea" ? "md:col-span-2" : ""}
              >
                <label className="admin-label">{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea
                    className="admin-input min-h-[88px]"
                    value={String(row[f.key] ?? "")}
                    onChange={(e) => persist(row.id, { [f.key]: e.target.value })}
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
                      persist(row.id, {
                        [f.key]: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                ) : f.type === "select" ? (
                  <select
                    className="admin-input"
                    value={String(row[f.key] ?? "")}
                    onChange={(e) => persist(row.id, { [f.key]: e.target.value })}
                  >
                    {f.options?.map((o) => (
                      <option key={o} value={o} className="bg-black">
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    className="admin-input"
                    value={String(row[f.key] ?? "")}
                    onChange={(e) => persist(row.id, { [f.key]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>

          {confirmDelete === row.id && (
            <div className="mt-4 flex items-center gap-3 rounded-md border border-warn/30 bg-warn/5 p-4">
              <span className="flex-1 font-mono text-xs text-white/80">
                Are you sure? This cannot be undone.
              </span>
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded border border-white/15 px-3 py-1.5 font-mono text-[11px] text-white/70"
              >
                Cancel
              </button>
              <button
                onClick={() => remove(row.id)}
                className="rounded bg-warn px-3 py-1.5 font-mono text-[11px] font-bold text-black"
              >
                Delete permanently
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={add}
        className="w-full rounded-lg border border-dashed border-pen/30 py-4 font-mono text-xs text-pen/70 transition-colors hover:border-pen/60 hover:text-pen"
      >
        + Add new
      </button>
    </div>
  );
}
