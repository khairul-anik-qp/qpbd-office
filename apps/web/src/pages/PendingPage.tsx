import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { homeForUser } from "@/lib/auth-routes";

export function PendingPage() {
  const { signOut, user } = useAuth();

  if (user && user.status !== "pending") {
    return <Navigate to={homeForUser(user)} replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md text-center shadow-modal">
        <CardHeader>
          <CardTitle className="text-[24px] font-normal leading-8">Pending approval</CardTitle>
          <CardDescription className="text-base leading-6">
            Sign up request sent to admin. You&apos;ll be notified once approved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={signOut}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
