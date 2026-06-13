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
import { UserAvatar } from "@/components/UserAvatar";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { usePendingSignupCount } from "@/hooks/usePendingSignupCount";

export function AppHeader() {
  const { user, signOut } = useAuth();
  const { canInstall, promptInstall } = useInstallPrompt();
  const displayName = user?.nameEn ?? "Account";
  const showDashboard = user ? isEmployeeRole(user.role) : false;
  const pendingSignupCount = usePendingSignupCount();
  const showPendingBadge = user?.role === "admin" && pendingSignupCount > 0;

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between bg-dark-blue px-5 text-white md:px-6">
      <Link
        to="/dashboard"
        className="flex items-center gap-2.5 rounded-sm outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-blue"
        aria-label="QuestionPro Office Requests — go to dashboard"
      >
        <span className="flex size-[22px] items-center justify-center text-[22px] leading-none">
          <Icon name="inbox" className="size-[22px]" aria-hidden />
        </span>
        <span className="text-base font-medium leading-6">QuestionPro</span>
        <span className="text-base font-normal leading-6 text-white/55">· Office Requests</span>
      </Link>
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
              aria-label={
                showPendingBadge
                  ? `Open account menu, ${pendingSignupCount} pending signups`
                  : "Open account menu"
              }
            >
              <span className="relative inline-flex">
                <UserAvatar
                  photoUrl={user?.photoUrl}
                  name={user?.nameEn}
                  className="size-8 rounded-full"
                  fallbackClassName="bg-electric text-[13px] font-medium leading-none text-white"
                  priority
                />
                {showPendingBadge ? (
                  <span
                    className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-dark-blue bg-danger px-1 text-[10px] font-medium leading-none text-white"
                    aria-hidden
                  >
                    {pendingSignupCount > 9 ? "9+" : pendingSignupCount}
                  </span>
                ) : null}
              </span>
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
                <Link to="/admin" className="flex items-center justify-between gap-2">
                  <span>Signup approvals</span>
                  {showPendingBadge ? (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[11px] font-medium leading-none text-white">
                      {pendingSignupCount > 9 ? "9+" : pendingSignupCount}
                    </span>
                  ) : null}
                </Link>
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
