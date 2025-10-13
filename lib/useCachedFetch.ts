"use client";
import { useEffect, useState } from "react";
import { getCache, setCache } from "./cache";

export default function useCachedFetch<T = any>(url: string, deps: any[] = [], ttlMs = 30000) {
  const cached = getCache(url);
  const [data, setData] = useState<T | null>(cached && cached.exp > Date.now() ? cached.data : null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const res = await fetch(url, { cache: "no-store" });
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setCache(url, json, ttlMs);
        }
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    // always refresh in background, but show cached immediately
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: () => setData(null) };
}
