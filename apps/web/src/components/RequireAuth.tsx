import { Navigate, useLocation } from "react-router-dom";
import type { UserRole } from "@office/shared";
import { useAuth } from "@/context/AuthContext";
import { homeForUser, userCanAccess } from "@/lib/auth-routes";

interface RequireAuthProps {
  children: React.ReactNode;
  roles?: UserRole[];
  requireActive?: boolean;
}

export function RequireAuth({
  children,
  roles,
  requireActive = true,
}: RequireAuthProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lead">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!userCanAccess(user, roles, requireActive)) {
    return <Navigate to={homeForUser(user)} replace />;
  }

  return children;
}
