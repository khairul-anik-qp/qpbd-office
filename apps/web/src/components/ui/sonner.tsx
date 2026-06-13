import { Toaster as Sonner, type ToasterProps } from "sonner";

// Toast host. Variant classNames map to toast.success / .error / .warning / .info.
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "rounded-lg border px-3.5 py-2.5 text-sm leading-[18px] shadow-pop [&_[data-icon]]:size-5 [&_[data-icon]]:shrink-0",
          title: "font-medium",
          default: "border-border bg-card text-foreground",
          success: "border-[#BFE08F] bg-success-soft text-success",
          error: "border-danger-soft-2 bg-danger-soft text-danger",
          warning: "border-warning/35 bg-warning-soft text-warning",
          info: "border-info/30 bg-info-soft text-info",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
