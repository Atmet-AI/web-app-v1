import { LoaderCircle } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react";
import type React from "react";
import { cn } from "@/lib/utils";

export function Spinner({
  className,
  ...props
}: Omit<HugeiconsIconProps, "icon">): React.ReactElement {
  return (
    <HugeiconsIcon
      aria-label="Loading"
      className={cn("animate-spin", className)}
      icon={LoaderCircle}
      role="status"
      strokeWidth={1.7}
      {...props}
    />
  );
}
