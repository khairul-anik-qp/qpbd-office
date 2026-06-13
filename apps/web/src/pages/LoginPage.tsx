import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { Icon } from "@/components/Icon";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, isNeedsRegistration } from "@/lib/api";
import { homeForUser } from "@/lib/auth-routes";

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [busy, setBusy] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  async function handleCredential(credential: string) {
    setBusy(true);
    try {
      const result = await api.googleAuth(credential);
      if (isNeedsRegistration(result)) {
        navigate("/register", { state: { profile: result.profile, credential } });
        return;
      }
      signIn(result.token, result.user);
      navigate(homeForUser(result.user), { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error(
          "Google sign-in could not be verified. Restart dev servers (pnpm dev) and confirm GOOGLE_CLIENT_ID matches VITE_GOOGLE_CLIENT_ID in .env.",
        );
        return;
      }
      if (err instanceof ApiError) {
        toast.error(err.message || "Sign-in failed.");
        return;
      }
      if (err instanceof DOMException && err.name === "SecurityError") {
        toast.error("Browser blocked sign-in storage. Allow cookies/site data for this site and try again.");
        return;
      }
      toast.error("Sign-in failed. Check your Google account and try again.");
    } finally {
      setBusy(false);
    }
  }

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

      <Card className="relative w-full max-w-xl overflow-hidden border-border/60 shadow-modal">
        <div aria-hidden className="h-1.5 bg-linear-to-r from-dark-blue via-electric to-amber" />
        <CardHeader className="gap-4 px-8 pt-8 pb-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-electric text-white shadow-pop">
              <Icon name="inbox" className="size-6" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-[32px] font-normal leading-10 text-dark-blue">
                QuestionPro · Office Requests
              </CardTitle>
              <CardDescription className="mt-2 text-base leading-6 text-lead">
                Sign in with your Google account to continue.
              </CardDescription>
            </div>
          </div>
          <div className="border-b-2 border-electric/30" />
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 px-8 pb-10 pt-2">
          {!clientId ? (
            <p className="w-full rounded-md border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
              Set <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> in your{" "}
              <code className="font-mono">.env</code> file.
            </p>
          ) : (
            <GoogleSignInButton
              disabled={busy}
              onSuccess={(credential) => void handleCredential(credential)}
              onError={() => toast.error("Google sign-in failed")}
            />
          )}
          <p className="max-w-md text-center text-sm leading-6 text-muted-foreground">
            New here? Sign in with Google, then choose{" "}
            <span className="inline-flex rounded-sm font-medium text-electric">
              Employee
            </span>{" "}
            or{" "}
            <span className="inline-flex rounded-sm font-medium text-info">
              Staff
            </span>{" "}
            from the options.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
