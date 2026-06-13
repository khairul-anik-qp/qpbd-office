import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function StaffShell() {
  const { signOut, user } = useAuth();

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-[24px] font-normal leading-8">
        {user?.nameBn ?? user?.nameEn}
      </h1>
      <p className="mt-2 text-lead">Staff UI ships in Phase 3.</p>
      <Button className="mt-6" variant="outline" onClick={signOut}>
        সাইন আউট · Sign out
      </Button>
    </main>
  );
}
