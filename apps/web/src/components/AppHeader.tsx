import { Link } from "react-router-dom";
import { isEmployeeRole } from "@office/shared";
import { Icon } from "@/components/Icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { userInitials } from "@/shells/employee/lib/employee-request";

export function AppHeader() {
  const { user, signOut } = useAuth();
  const { canInstall, promptInstall } = useInstallPrompt();
  const initials = user ? userInitials(user.nameEn) : "?";
  const displayName = user?.nameEn ?? "Account";
  const showDashboard = user ? isEmployeeRole(user.role) : false;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-dark-blue px-5 text-white md:px-6">
      <div className="flex items-center gap-2.5">
        <span className="flex size-[22px] items-center justify-center text-[22px] leading-none">
          <Icon name="inbox" className="size-[22px]" aria-hidden />
        </span>
        <span className="text-base font-medium leading-6">QuestionPro</span>
        <span className="text-base font-normal leading-6 text-white/55">· Office Requests</span>
      </div>
      <div className="flex items-center gap-3.5">
        {canInstall ? (
          <button
            type="button"
            onClick={() => void promptInstall()}
            className="inline-flex items-center gap-1.5 rounded-[7px] border border-white/32 px-2.5 py-1.5 text-[13px] leading-4 text-white transition-colors hover:bg-white/10"
          >
            <Icon name="install_desktop" className="size-4" aria-hidden />
            Install app
          </button>
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-full outline-none ring-offset-dark-blue transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2"
              aria-label="Open account menu"
            >
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt=""
                  className="size-8 rounded-full object-cover"
                />
              ) : (
                <span
                  className="flex size-8 items-center justify-center rounded-full bg-electric text-[13px] font-medium leading-none"
                  aria-hidden
                >
                  {initials}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {showDashboard ? (
              <DropdownMenuItem asChild>
                <Link to="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
            ) : null}
            {showDashboard ? (
              <DropdownMenuItem asChild>
                <Link to="/requests">All requests</Link>
              </DropdownMenuItem>
            ) : null}
            {user?.role === "admin" ? (
              <DropdownMenuItem asChild>
                <Link to="/admin">Signup approvals</Link>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-danger focus:bg-danger-soft focus:text-danger"
              onSelect={signOut}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
