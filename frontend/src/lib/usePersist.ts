import { useEffect, useState } from "react";

export function usePersist<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const storageKey = `retention-lab:${key}`;
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return initial;
      const parsed = JSON.parse(raw);
      const isObj = (v: unknown) => v && typeof v === "object" && !Array.isArray(v);
      if (isObj(initial)) return isObj(parsed) ? ({ ...initial, ...parsed } as T) : initial;
      return typeof parsed === typeof initial ? (parsed as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      /* storage unavailable */
    }
  }, [storageKey, value]);
  return [value, setValue];
}
