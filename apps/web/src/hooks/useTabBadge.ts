import { useEffect } from "react";

const BASE_TITLE = "QuestionPro Office";

/** Reflect pending New-tab count in document title and app icon badge. */
export function useTabBadge(newCount: number) {
  useEffect(() => {
    document.title =
      newCount > 0 ? `(${newCount}) ${BASE_TITLE}` : BASE_TITLE;

    const nav = navigator as Navigator & {
      setAppBadge?: (count: number) => Promise<void>;
      clearAppBadge?: () => Promise<void>;
    };

    if (newCount > 0 && nav.setAppBadge) {
      void nav.setAppBadge(newCount);
    } else if (nav.clearAppBadge) {
      void nav.clearAppBadge();
    }

    return () => {
      document.title = BASE_TITLE;
      if (nav.clearAppBadge) void nav.clearAppBadge();
    };
  }, [newCount]);
}
