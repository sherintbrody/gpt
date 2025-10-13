const store = new Map<string, { data: any; exp: number }>();
export function getCache(key: string) { return store.get(key); }
export function setCache(key: string, data: any, ttlMs = 30000) { store.set(key, { data, exp: Date.now() + ttlMs }); }
export function invalidate(pattern?: RegExp) {
  if (!pattern) return store.clear();
  for (const k of Array.from(store.keys())) { if (pattern.test(k)) store.delete(k); }
}
