import type { User } from "@office/shared";
import { staffFirstName } from "@office/shared";
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
}

export function StaffHeader({ user }: StaffHeaderProps) {
  const { signOut } = useAuth();
  const color = user.brandColor ?? "#1B87E6";
  const greeting = staffFirstName(user.nameEn);
  const displayName = user.nameBn ?? user.nameEn;

  return (
    <header className="shrink-0 bg-dark-blue px-3.5 pb-[15px] pt-[13px] text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[11px]">
          <span
            className="flex size-[42px] shrink-0 items-center justify-center rounded-full text-lg font-medium leading-none text-white"
            style={{ backgroundColor: color }}
            aria-hidden
          >
            {staffAvatarInitial(user)}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] leading-[15px] text-white/70">
              শুভেচ্ছা, {greeting}
            </span>
            <span className="text-[19px] font-medium leading-6">আজকের অনুরোধ</span>
          </div>
        </div>
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
    </header>
  );
}
