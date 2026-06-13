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
    staffById,
    requests,
    createForm,
    setCreateForm,
    successToast,
    openCreate,
    closeCreate,
    sendRequest,
  } = useEmployeeRequests();

  const createOpen = createForm.type !== null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col">
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
