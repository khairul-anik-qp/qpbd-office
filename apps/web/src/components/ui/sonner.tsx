import { Toaster as Sonner, type ToasterProps } from "sonner";

// Toast host. Employee success / all-busy toasts (issue #13) use this.
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "rounded-lg border border-border bg-card text-foreground shadow-pop",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
