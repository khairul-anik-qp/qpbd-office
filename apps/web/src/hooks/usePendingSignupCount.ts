import { useEffect, useState } from "react";
import { getPendingCount, subscribePendingCount } from "@/lib/pending-queue-sync";

export function usePendingSignupCount() {
  const [count, setCount] = useState(getPendingCount);
  useEffect(() => subscribePendingCount(setCount), []);
  return count;
}
