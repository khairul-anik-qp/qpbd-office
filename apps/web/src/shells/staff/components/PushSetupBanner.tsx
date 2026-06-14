import { useCallback, useState } from "react";
import { Icon } from "@/components/Icon";
import { usePushSetupContext } from "@/context/PushSetupContext";

const DISMISS_KEY = "office_push_banner_dismissed";

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function PushSetupBanner() {
  const ctx = usePushSetupContext();
  const [dismissed, setDismissed] = useState(wasDismissed);
  const [busy, setBusy] = useState(false);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  if (!ctx || ctx.status === "subscribed" || dismissed) return null;

  const { status, enablePush } = ctx;

  const copy =
    status === "denied"
      ? {
          bn: "নোটিফিকেশন বন্ধ আছে — ব্রাউজার সেটিংস থেকে চালু করুন",
          en: "Notifications blocked — enable them in browser settings",
        }
      : status === "no-vapid"
        ? {
            bn: "পুশ নোটিফিকেশন সার্ভারে সেটআপ করা নেই",
            en: "Push notifications are not configured on the server",
          }
        : status === "unsupported"
          ? {
              bn: "এই ব্রাউজার পুশ নোটিফিকেশন সাপোর্ট করে না",
              en: "This browser does not support push notifications",
            }
          : {
              bn: "অ্যাপ বন্ধ থাকলেও সতর্কতা পেতে নোটিফিকেশন চালু করুন",
              en: "Enable notifications to get alerts when the app is closed",
            };

  const canEnable = status === "prompt";

  return (
    <div
      role="region"
      aria-label="Notification setup"
      className="mx-3 mt-2.5 rounded-xl border border-electric/25 bg-electric-soft px-3.5 py-3"
    >
      <div className="flex items-start gap-2.5">
        <Icon
          name="notifications"
          className="mt-0.5 size-5 shrink-0 text-electric"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-5 text-ink">{copy.bn}</p>
          <p className="text-xs leading-4 text-lead">{copy.en}</p>
          {canEnable ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void enablePush().finally(() => setBusy(false));
              }}
              className="mt-2.5 rounded-lg bg-electric px-3 py-2 text-xs font-medium leading-4 text-white disabled:opacity-60"
            >
              {busy ? "…" : "চালু করুন · Enable"}
            </button>
          ) : null}
        </div>
        {status !== "prompt" ? (
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded p-1 text-muted-gray hover:text-lead"
            aria-label="Dismiss"
          >
            <Icon name="close" className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}
