import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNow } from "@/shells/employee/hooks/useNow";
import { StaffHeader } from "./components/StaffHeader";
import { AvailabilityControl } from "./components/AvailabilityControl";
import { StaffTabs } from "./components/StaffTabs";
import { StaffRequestCard } from "./components/StaffRequestCard";
import { ForwardBanner } from "./components/ForwardBanner";
import { EmptyTabState } from "./components/EmptyTabState";
import { PushHeadsUp } from "./components/PushHeadsUp";
import { useStaffRequests } from "./hooks/useStaffRequests";
import { loadAvailabilityOverrides } from "@/lib/availability-store";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function StaffShell() {
  const { signOut, user: authUser } = useAuth();
  const now = useNow();
  usePushNotifications(authUser?.role === "staff" && authUser?.status === "active");
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
    viewNotif,
  } = useStaffRequests();

  if (!user) return null;

  const availabilityFor = (id: string) =>
    loadAvailabilityOverrides()[id] ?? staffById.get(id)?.availability ?? "away";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div
        className={`relative mx-auto flex w-full max-w-md flex-1 flex-col bg-background ${shake ? "animate-shake" : ""}`}
      >
        <StaffHeader user={user} newCount={counts.new} />
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
          />
        ) : null}
      </div>

      <footer className="mx-auto w-full max-w-md border-t border-divider bg-card px-4 py-3">
        <Button className="w-full" variant="outline" onClick={signOut}>
          সাইন আউট · Sign out
        </Button>
      </footer>
    </div>
  );
}
