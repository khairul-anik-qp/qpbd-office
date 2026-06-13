import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { api, isNeedsRegistration } from "@/lib/api";
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
    } catch {
      toast.error("Sign-in failed. Check your Google account and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md shadow-modal">
        <CardHeader>
          <CardTitle className="text-[28px] font-normal leading-9">
            QuestionPro · Office Requests
          </CardTitle>
          <CardDescription>Sign in with your Google account to continue.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {!clientId ? (
            <p className="w-full rounded-md border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
              Set <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> in your{" "}
              <code className="font-mono">.env</code> file.
            </p>
          ) : (
            <div className={busy ? "pointer-events-none opacity-60" : undefined}>
              <GoogleLogin
                onSuccess={(res) => {
                  if (res.credential) void handleCredential(res.credential);
                }}
                onError={() => toast.error("Google sign-in failed")}
                text="signin_with"
                shape="rectangular"
                size="large"
                width="320"
              />
            </div>
          )}
          <p className="text-center text-sm text-muted-foreground">
            New here? Sign in with Google, then choose Employee or Staff.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
