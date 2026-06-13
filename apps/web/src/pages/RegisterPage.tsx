import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { UserRole } from "@office/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { homeForUser } from "@/lib/auth-routes";

interface RegisterState {
  profile: { email: string; nameEn: string; photoUrl?: string };
  credential: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const state = location.state as RegisterState | null;
  const [busy, setBusy] = useState(false);

  if (!state?.credential) {
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <p className="text-lead">Start by signing in with Google.</p>
        <Button className="mt-4" onClick={() => navigate("/login")}>
          Go to sign in
        </Button>
      </main>
    );
  }

  async function chooseRole(role: UserRole) {
    if (role === "admin") return;
    setBusy(true);
    try {
      const result = await api.register({ credential: state!.credential, role });
      signIn(result.token, result.user);
      navigate(homeForUser(result.user), { replace: true });
      toast.success("Sign up request sent to admin.");
    } catch {
      toast.error("Registration failed. Try signing in again.");
      navigate("/login", { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md shadow-modal">
        <CardHeader>
          <CardTitle className="text-[24px] font-normal leading-8">Choose your role</CardTitle>
          <CardDescription>
            Signed in as <span className="font-medium text-foreground">{state.profile.nameEn}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Button
            size="lg"
            className="h-auto flex-col items-start gap-1 py-4 text-left"
            disabled={busy}
            onClick={() => void chooseRole("employee")}
          >
            <span className="text-base font-medium">Employee</span>
            <span className="text-sm font-normal text-primary-foreground/90">
              Request tea, supplies, IT help, and more
            </span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-auto flex-col items-start gap-1 py-4 text-left"
            disabled={busy}
            onClick={() => void chooseRole("staff")}
          >
            <span className="text-base font-medium">Office staff</span>
            <span className="text-sm font-normal text-muted-foreground">
              Accept and complete employee requests
            </span>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
