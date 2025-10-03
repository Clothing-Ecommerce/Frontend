const STORAGE_KEY = "checkout:last-momo-attempt";

export interface StoredMomoAttempt {
  paymentId: number;
  orderId?: number | null;
  timestamp?: string;
}

const isBrowser = typeof window !== "undefined" && typeof sessionStorage !== "undefined";

export const saveLatestMomoAttempt = (attempt: StoredMomoAttempt) => {
  if (!isBrowser) return;
  if (!attempt.paymentId) return;

  try {
    const payload: StoredMomoAttempt = {
      paymentId: attempt.paymentId,
      orderId: attempt.orderId ?? null,
      timestamp: new Date().toISOString(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Unable to persist MoMo attempt info", error);
  }
};

export const loadLatestMomoAttempt = (): StoredMomoAttempt | null => {
  if (!isBrowser) return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredMomoAttempt | null;
    if (!parsed || typeof parsed.paymentId !== "number") return null;
    return parsed;
  } catch (error) {
    console.warn("Unable to read MoMo attempt info", error);
    return null;
  }
};

export const clearLatestMomoAttempt = () => {
  if (!isBrowser) return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Unable to clear MoMo attempt info", error);
  }
};
