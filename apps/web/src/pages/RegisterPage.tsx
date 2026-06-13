import { useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { UserRole } from "@office/shared";
import { Icon } from "@/components/Icon";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { homeForUser } from "@/lib/auth-routes";
import { cn } from "@/lib/utils";

interface RegisterState {
  profile: { email: string; nameEn: string; photoUrl?: string };
  credential: string;
}

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-info-soft via-background to-selected-soft p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-electric/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-20 size-80 rounded-full bg-amber/20 blur-3xl"
      />
      {children}
    </main>
  );
}

function AuthCard({ children }: { children: ReactNode }) {
  return (
    <Card className="relative w-full max-w-xl overflow-hidden border-border/60 shadow-modal">
      <div aria-hidden className="h-1.5 bg-linear-to-r from-dark-blue via-electric to-amber" />
      {children}
    </Card>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const state = location.state as RegisterState | null;
  const [busy, setBusy] = useState(false);

  if (!state?.credential) {
    return (
      <AuthShell>
        <AuthCard>
          <CardHeader className="gap-4 px-8 pt-8 pb-6">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-electric text-white shadow-pop">
                <Icon name="person" className="size-6" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-[32px] font-normal leading-10 text-dark-blue">
                  Choose your role
                </CardTitle>
                <CardDescription className="mt-2 text-base leading-6 text-lead">
                  Start by signing in with Google.
                </CardDescription>
              </div>
            </div>
            <div className="border-b-2 border-electric/30" />
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 px-8 pb-10 pt-2">
            <Button className="h-11 rounded-full px-8" onClick={() => navigate("/login")}>
              Go to sign in
            </Button>
          </CardContent>
        </AuthCard>
      </AuthShell>
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
    <AuthShell>
      <AuthCard>
        <CardHeader className="gap-4 px-8 pt-8 pb-6">
          <div className="flex items-start gap-4">
            <UserAvatar
              photoUrl={state.profile.photoUrl}
              name={state.profile.nameEn}
              className="size-12 rounded-xl shadow-pop ring-2 ring-electric/20"
              fallbackClassName="bg-electric text-white shadow-pop"
              fallback={<Icon name="groups" className="size-6" aria-hidden />}
              priority
            />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-[32px] font-normal leading-10 text-dark-blue">
                Choose your role
              </CardTitle>
              <CardDescription className="mt-2 text-base leading-6 text-lead">
                Signed in as{" "}
                <span className="font-medium text-dark-blue">{state.profile.nameEn}</span>
              </CardDescription>
            </div>
          </div>
          <div className="border-b-2 border-electric/30" />
        </CardHeader>
        <CardContent className="grid gap-4 px-8 pb-10 pt-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void chooseRole("employee")}
            className={cn(
              "flex w-full items-start gap-4 rounded-xl border border-border bg-card p-4 text-left",
              "transition-[border-color,box-shadow,background-color] hover:border-electric hover:bg-selected-soft hover:shadow-pop",
              "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-electric/45",
              "disabled:pointer-events-none disabled:opacity-60",
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-electric text-white">
              <Icon name="person" className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <span className="block text-base font-medium text-dark-blue">Employee</span>
              <span className="mt-1 block text-sm leading-5 text-lead">
                Request tea, supplies, IT help, and more
              </span>
            </div>
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => void chooseRole("staff")}
            className={cn(
              "flex w-full items-start gap-4 rounded-xl border border-border bg-card p-4 text-left",
              "transition-[border-color,box-shadow,background-color] hover:border-info hover:bg-info-soft hover:shadow-pop",
              "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-info/45",
              "disabled:pointer-events-none disabled:opacity-60",
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-info text-white">
              <Icon name="groups" className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <span className="block text-base font-medium text-dark-blue">Office staff</span>
              <span className="mt-1 block text-sm leading-5 text-lead">
                Accept and complete employee requests
              </span>
            </div>
          </button>

          <p className="text-center text-sm leading-6 text-muted-foreground">
            Your admin will review and approve your{" "}
            <span className="font-medium text-electric">Employee</span> or{" "}
            <span className="font-medium text-info">Staff</span> access.
          </p>
        </CardContent>
      </AuthCard>
    </AuthShell>
  );
}
