import { checkRateLimit, getLastKnownRateLimit } from "../rateLimit";
import { useToast } from "../../contexts/ToastContext";
import { useEffect, useRef } from "react";

let warnedAt = 0;
const WARNING_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export function useRateLimitWarning() {
  const { showToast } = useToast();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const check = async () => {
      const status = await checkRateLimit();
      if (status && status.remaining <= 100) {
        const now = Date.now();
        if (now - warnedAt > WARNING_COOLDOWN_MS) {
          warnedAt = now;
          showToast(
            `API rate limit low: ${status.remaining}/${status.limit} remaining. Resets at ${status.resetAt.toLocaleTimeString()}.`,
            "warning",
          );
        }
      }
    };

    // Check immediately
    check();

    // Check every 30 seconds
    intervalRef.current = setInterval(check, 30_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [showToast]);
}

export function getRateLimitStatus() {
  return getLastKnownRateLimit();
}
