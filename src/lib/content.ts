import { getSupabase } from "./supabase";
import {
  defaultIdentity,
  defaultScaleStats,
  defaultCases,
  defaultTools,
  defaultFilms,
  defaultWorkCategories,
  sectionCopy,
  Identity,
  StatCounter,
  CaseStudy,
  Tool,
  Film,
  WorkCategory,
} from "./defaultContent";

/* Content is read from Supabase when available; any missing table or
   network failure falls back to the in-code defaults so the portfolio
   never renders a broken state. */

async function fetchTable<T>(table: string, fallback: T[]): Promise<T[]> {
  const supabase = getSupabase();
  if (!supabase) return fallback;
  try {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return fallback;
    return data as T[];
  } catch {
    return fallback;
  }
}

export async function getIdentity(): Promise<Identity> {
  const supabase = getSupabase();
  if (!supabase) return defaultIdentity;
  try {
    const { data, error } = await supabase
      .from("identity")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error || !data) return defaultIdentity;
    return { ...defaultIdentity, ...data };
  } catch {
    return defaultIdentity;
  }
}

export async function getCopy(): Promise<typeof sectionCopy> {
  const supabase = getSupabase();
  if (!supabase) return sectionCopy;
  try {
    const { data, error } = await supabase.from("copy").select("key,value");
    if (error || !data || data.length === 0) return sectionCopy;
    const merged: Record<string, string> = { ...sectionCopy };
    for (const row of data) {
      if (row.key && row.value) merged[row.key] = row.value;
    }
    return merged as typeof sectionCopy;
  } catch {
    return sectionCopy;
  }
}

export const getScaleStats = () =>
  fetchTable<StatCounter>("counters", defaultScaleStats);
export const getCases = () => fetchTable<CaseStudy>("cases", defaultCases);
export const getTools = () => fetchTable<Tool>("tools", defaultTools);
export const getFilms = () => fetchTable<Film>("films", defaultFilms);
export const getWorkCategories = () =>
  fetchTable<WorkCategory>("work_categories", defaultWorkCategories);
