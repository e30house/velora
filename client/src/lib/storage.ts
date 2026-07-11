import { useEffect, useState } from "react";
import { Battery, Fuel } from "lucide-react";
import type { Vehicle } from "../types";

// localStorage isn't available in every embed (e.g. artifact previews),
// so persistence degrades gracefully to session-only.
export const safeStorage = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* session-only */
    }
  },
};

interface StoredStateOptions<T> {
  serialize?: (value: T) => string;
  deserialize?: (raw: string) => T;
}

// Persists a piece of state to localStorage and rehydrates it on load.
// Values must be JSON-serializable (or use custom serialize/deserialize,
// e.g. to strip non-serializable icon components and reattach them by type).
export function useStoredState<T>(key: string, defaultValue: T, options: StoredStateOptions<T> = {}): [T, React.Dispatch<React.SetStateAction<T>>] {
  const serialize = options.serialize ?? ((value: T) => JSON.stringify(value));
  const deserialize = options.deserialize ?? ((raw: string) => JSON.parse(raw) as T);

  const [value, setValue] = useState<T>(() => {
    const raw = safeStorage.get(key);
    if (raw == null) return defaultValue;
    try {
      const parsed = deserialize(raw);
      return parsed == null ? defaultValue : parsed;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    safeStorage.set(key, serialize(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, value]);

  return [value, setValue];
}

export function serializeVehicle(v: Vehicle): Omit<Vehicle, "Icon"> {
  const { Icon: _Icon, ...rest } = v;
  return rest;
}

export function deserializeVehicle(v: Omit<Vehicle, "Icon">): Vehicle {
  return { ...v, Icon: v.type === "Electric" ? Battery : Fuel };
}
