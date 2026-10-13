// localStorage wrapper that never throws (private windows, blocked storage).
export const storage = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem("si_" + key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem("si_" + key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
};
