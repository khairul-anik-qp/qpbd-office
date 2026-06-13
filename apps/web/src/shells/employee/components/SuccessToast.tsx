import { Icon } from "@/components/Icon";

interface SuccessToastProps {
  message: string;
}

export function SuccessToast({ message }: SuccessToastProps) {
  return (
    <div
      role="status"
      className="flex items-center gap-2.5 rounded-lg border border-[#BFE08F] bg-success-soft px-3.5 py-2.5 text-sm leading-[18px] text-success"
    >
      <Icon name="check_circle" className="size-5 shrink-0" aria-hidden />
      {message}
    </div>
  );
}
