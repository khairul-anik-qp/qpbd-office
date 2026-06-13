import { SHARED_VERSION } from "@office/shared";
import { Button } from "@/components/ui/button";
import { TokensPage } from "@/dev/TokensPage";

// Scaffold placeholder + dev token gallery. Role shells (employee/staff/admin)
// and a real router land in later phases.
export function App() {
  if (typeof window !== "undefined" && window.location.pathname === "/dev/tokens") {
    return <TokensPage />;
  }
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-[32px] font-normal leading-10">QuestionPro · Office Requests</h1>
      <p className="mt-1 text-lead">Scaffold OK. @office/shared v{SHARED_VERSION}</p>
      <div className="mt-5">
        <Button asChild>
          <a href="/dev/tokens">View design tokens →</a>
        </Button>
      </div>
    </main>
  );
}
