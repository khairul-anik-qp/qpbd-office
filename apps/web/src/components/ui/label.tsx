import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import * as React from "react";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-sm font-medium leading-6 text-foreground", className)}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
