import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Icon } from "@/components/Icon";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { homeForUser } from "@/lib/auth-routes";

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

function roleLabel(role: "employee" | "staff" | "admin") {
  if (role === "staff") return "Staff";
  if (role === "employee") return "Employee";
  return "Admin";
}

export function PendingPage() {
  const { signOut, user } = useAuth();

  if (user && user.status !== "pending") {
    return <Navigate to={homeForUser(user)} replace />;
  }

  const role = user?.role ?? "employee";
  const roleClassName =
    role === "staff" ? "font-medium text-info" : "font-medium text-electric";

  return (
    <AuthShell>
      <AuthCard>
        <CardHeader className="gap-4 px-8 pt-8 pb-6">
          <div className="flex items-start gap-4">
            <UserAvatar
              photoUrl={user?.photoUrl}
              name={user?.nameEn}
              className="size-12 rounded-xl shadow-pop ring-2 ring-amber/30"
              fallbackClassName="bg-amber text-white shadow-pop"
              fallback={<Icon name="schedule" className="size-6" aria-hidden />}
              priority
            />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-[32px] font-normal leading-10 text-dark-blue">
                Pending approval
              </CardTitle>
              <CardDescription className="mt-2 text-base leading-6 text-lead">
                {user ? (
                  <>
                    Hi{" "}
                    <span className="font-medium text-dark-blue">{user.nameEn}</span>, your{" "}
                    <span className={roleClassName}>{roleLabel(role)}</span> sign-up request was
                    sent to admin.
                  </>
                ) : (
                  "Sign up request sent to admin."
                )}
              </CardDescription>
            </div>
          </div>
          <div className="border-b-2 border-electric/30" />
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 px-8 pb-10 pt-2">
          <div className="flex w-full items-start gap-3 rounded-xl border border-warning/20 bg-warning-soft px-4 py-3 text-left">
            <Icon name="notifications" className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
            <p className="text-sm leading-6 text-lead">
              You&apos;ll be notified once an admin approves your account. You can sign out and
              check back later.
            </p>
          </div>
          <Button
            variant="outline"
            className="h-11 rounded-full px-8 hover:border-electric hover:text-electric"
            onClick={signOut}
          >
            Sign out
          </Button>
        </CardContent>
      </AuthCard>
    </AuthShell>
  );
}
