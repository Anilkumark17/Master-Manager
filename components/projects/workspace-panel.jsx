import { cn } from "@/lib/utils";

export function WorkspacePanel({ className, children }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-card/50 p-6 shadow-sm ring-1 ring-foreground/[0.04] backdrop-blur-sm sm:p-8",
        className
      )}
    >
      {children}
    </div>
  );
}
