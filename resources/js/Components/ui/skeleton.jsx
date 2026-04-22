import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/50 dark:bg-muted/10",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-shimmer",
        "before:bg-gradient-to-r before:from-transparent before:via-white/60 dark:before:via-white/10 before:to-transparent",
        className
      )}
      {...props} />
  );
}

export { Skeleton }
