import { EmployeeHeader } from "./components/EmployeeHeader";
import { DashboardView } from "./components/DashboardView";
import { AllRequestsView } from "./components/AllRequestsView";
import { CreateRequestModal } from "./components/CreateRequestModal";
import { useNow } from "./hooks/useNow";
import { useEmployeeRequests } from "./hooks/useEmployeeRequests";

export default function EmployeeShell() {
  const now = useNow();
  const {
    staff,
    staffLoading,
    staffById,
    requests,
    webView,
    allFilter,
    setAllFilter,
    createForm,
    setCreateForm,
    successToast,
    openCreate,
    closeCreate,
    sendRequest,
    openAll,
    backToDashboard,
  } = useEmployeeRequests();

  const createOpen = createForm.type !== null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <EmployeeHeader />
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col">
        {webView === "dashboard" ? (
          <DashboardView
            requests={requests}
            staff={staff}
            staffLoading={staffLoading}
            staffById={staffById}
            now={now}
            successToast={successToast}
            onPickCategory={openCreate}
            onSeeAll={openAll}
          />
        ) : (
          <AllRequestsView
            requests={requests}
            staffById={staffById}
            now={now}
            filter={allFilter}
            onFilterChange={setAllFilter}
            onBack={backToDashboard}
          />
        )}
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
