import type { User } from "@office/shared";
import { staffFirstName } from "@office/shared";
import { Icon } from "@/components/Icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { staffAvatarInitial } from "../lib/staff-format";

interface StaffHeaderProps {
  user: User;
  canInstall?: boolean;
  onInstall?: () => void;
}

export function StaffHeader({ user, canInstall, onInstall }: StaffHeaderProps) {
  const { signOut } = useAuth();
  const color = user.brandColor ?? "#1B87E6";
  const greeting = staffFirstName(user.nameEn);
  const displayName = user.nameBn ?? user.nameEn;

  return (
    <header className="shrink-0 bg-dark-blue px-3.5 pb-[15px] pt-[13px] text-white">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] leading-[15px] text-white/70">
            শুভেচ্ছা, {greeting}
          </span>
          <span className="text-[19px] font-medium leading-6">আজকের অনুরোধ</span>
        </div>
        <div className="flex items-center gap-2">
          {canInstall ? (
            <button
              type="button"
              onClick={onInstall}
              className="inline-flex items-center gap-1 rounded-[7px] border border-white/32 px-2 py-1.5 text-xs leading-4 text-white transition-colors hover:bg-white/10"
            >
              <Icon name="install_desktop" className="size-3.5" aria-hidden />
              ইনস্টল · Install
            </button>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded-full outline-none ring-offset-dark-blue transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2"
                aria-label="Open account menu"
              >
                <UserAvatar
                  photoUrl={user.photoUrl}
                  name={user.nameEn}
                  className="size-[42px] rounded-full"
                  fallbackClassName="text-lg font-medium leading-none text-white"
                  fallback={
                    <span
                      className="flex size-full items-center justify-center rounded-full"
                      style={{ backgroundColor: color }}
                    >
                      {staffAvatarInitial(user)}
                    </span>
                  }
                  priority
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-danger focus:bg-danger-soft focus:text-danger"
                onSelect={signOut}
              >
                সাইন আউট · Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
