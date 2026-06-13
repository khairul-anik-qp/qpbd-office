import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import { homeForUser } from "@/lib/auth-routes";
import { LoginPage } from "@/pages/LoginPage";
import { PendingPage } from "@/pages/PendingPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { TokensPage } from "@/dev/TokensPage";

const AdminShell = lazy(() => import("@/shells/admin/AdminShell"));
const EmployeeShell = lazy(() => import("@/shells/employee/EmployeeShell"));
const StaffShell = lazy(() => import("@/shells/staff/StaffShell"));

function ShellFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center text-lead">Loading…</div>
  );
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <ShellFallback />;
  return <Navigate to={homeForUser(user)} replace />;
}

const router = createBrowserRouter([
  { path: "/", element: <RootRedirect /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    path: "/pending",
    element: (
      <RequireAuth requireActive={false}>
        <PendingPage />
      </RequireAuth>
    ),
  },
  {
    path: "/admin",
    element: (
      <RequireAuth roles={["admin"]}>
        <Suspense fallback={<ShellFallback />}>
          <AdminShell />
        </Suspense>
      </RequireAuth>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <RequireAuth roles={["employee"]}>
        <Suspense fallback={<ShellFallback />}>
          <EmployeeShell />
        </Suspense>
      </RequireAuth>
    ),
  },
  {
    path: "/staff",
    element: (
      <RequireAuth roles={["staff"]}>
        <Suspense fallback={<ShellFallback />}>
          <StaffShell />
        </Suspense>
      </RequireAuth>
    ),
  },
  { path: "/dev/tokens", element: <TokensPage /> },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
