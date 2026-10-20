import { useEffect, useState } from "react";

export function usePersist<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const storageKey = `retention-lab:${key}`;
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as T) : initial;
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
