import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function EmployeeShell() {
  const { signOut, user } = useAuth();

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-[28px] font-normal leading-9">Employee dashboard</h1>
      <p className="mt-2 text-lead">
        Welcome, {user?.nameEn}. Full dashboard UI ships in Phase 2.
      </p>
      <Button className="mt-6" variant="outline" onClick={signOut}>
        Sign out
      </Button>
    </main>
  );
}
