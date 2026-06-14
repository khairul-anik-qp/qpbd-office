import { useCallback } from "react";
import { useNow } from "@/shells/employee/hooks/useNow";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { useTabBadge } from "@/hooks/useTabBadge";
import { useWakeLock } from "@/hooks/useWakeLock";
import { StaffHeader } from "./components/StaffHeader";
import { AvailabilityControl } from "./components/AvailabilityControl";
import { StaffTabs } from "./components/StaffTabs";
import { StaffRequestCard } from "./components/StaffRequestCard";
import { ForwardBanner } from "./components/ForwardBanner";
import { EmptyTabState } from "./components/EmptyTabState";
import { PushHeadsUp } from "./components/PushHeadsUp";
import { PushSetupBanner } from "./components/PushSetupBanner";
import { unlockStaffAudio } from "./lib/chime";
import { useStaffRequests } from "./hooks/useStaffRequests";

export default function StaffShell() {
  const now = useNow();
  const { canInstall, promptInstall } = useInstallPrompt();
  const {
    user,
    staffById,
    otherStaff,
    requests,
    phoneTab,
    counts,
    forwardingId,
    forwardToast,
    activeNotif,
    shake,
    myAvailability,
    setAvailability,
    changeTab,
    accept,
    startForward,
    cancelForward,
    forward,
    complete,
    dismissNotif,
    viewNotif,
  } = useStaffRequests();

  useWakeLock(!!user);
  useTabBadge(counts.new);

  const onShellInteraction = useCallback(() => {
    unlockStaffAudio();
  }, []);

  if (!user) return null;

  const availabilityFor = (id: string) => staffById.get(id)?.availability ?? "away";

  return (
    <div
      className="flex min-h-screen flex-col bg-background"
      onPointerDown={onShellInteraction}
    >
      <div
        className={`relative mx-auto flex w-full max-w-md flex-1 flex-col bg-background ${shake ? "animate-shake" : ""}`}
      >
        <StaffHeader user={user} canInstall={canInstall} onInstall={() => void promptInstall()} />
        <PushSetupBanner />
        <AvailabilityControl value={myAvailability} onChange={setAvailability} />
        <StaffTabs active={phoneTab} counts={counts} onChange={changeTab} />

        <div className="flex flex-1 flex-col gap-3 overflow-auto px-3 pb-[18px] pt-3.5">
          {forwardToast ? <ForwardBanner toast={forwardToast} /> : null}

          {requests.length === 0 ? (
            <EmptyTabState tab={phoneTab} />
          ) : (
            requests.map((req) => (
              <StaffRequestCard
                key={req.id}
                request={req}
                currentStaffId={user.id}
                staffById={staffById}
                otherStaff={otherStaff}
                availabilityFor={availabilityFor}
                isForwarding={forwardingId === req.id}
                now={now}
                onAccept={() => accept(req.id)}
                onStartForward={() => startForward(req.id)}
                onCancelForward={cancelForward}
                onForward={(targetId) => forward(req.id, targetId)}
                onComplete={() => complete(req.id)}
              />
            ))
          )}
        </div>

        {activeNotif ? (
          <PushHeadsUp
            request={activeNotif}
            onView={viewNotif}
            onAccept={() => accept(activeNotif.id)}
            onDismiss={dismissNotif}
          />
        ) : null}
      </div>
    </div>
  );
}
