import { useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { DashboardView } from "./components/DashboardView";
import { CreateRequestModal } from "./components/CreateRequestModal";
import { useNow } from "./hooks/useNow";
import { useEmployeeRequests } from "./hooks/useEmployeeRequests";

export default function EmployeeShell() {
  const now = useNow();
  const {
    staff,
    staffLoading,
    staffLoadError,
    retryStaff,
    refreshStaff,
    staffById,
    requests,
    createForm,
    setCreateForm,
    successToast,
    openCreate,
    closeCreate,
    sendRequest,
    cancelRequest,
  } = useEmployeeRequests();

  const createOpen = createForm.type !== null;

  useEffect(() => {
    if (createOpen) refreshStaff();
  }, [createOpen, refreshStaff]);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-5xl min-h-0 flex-1 flex-col">
        <DashboardView
          requests={requests}
          staff={staff}
          staffLoading={staffLoading}
          staffLoadError={staffLoadError}
          onRetryStaff={retryStaff}
          staffById={staffById}
          now={now}
          successToast={successToast}
          onPickCategory={openCreate}
          onCancelRequest={cancelRequest}
        />
      </main>

      <CreateRequestModal
        form={createForm}
        staff={staff}
        open={createOpen}
        onOpenChange={(open) => !open && closeCreate()}
        onChange={(patch) => setCreateForm((f) => ({ ...f, ...patch }))}
        onSend={sendRequest}
      />
    </div>
  );
}
