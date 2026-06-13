import { Icon } from "@/components/Icon";
import { useAuth } from "@/context/AuthContext";
import { userInitials } from "../lib/employee-request";

export function EmployeeHeader() {
  const { user } = useAuth();
  const initials = user ? userInitials(user.nameEn) : "?";

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
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-[7px] border border-white/32 px-2.5 py-1.5 text-[13px] leading-4 text-white transition-colors hover:bg-white/10"
        >
          <Icon name="install_desktop" className="size-4" aria-hidden />
          Install app
        </button>
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
      </div>
    </header>
  );
}
