import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function AiCallout({ title, children }) {
  return (
    <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-4 sm:px-5">
      <div className="flex items-start gap-3">
        <Badge variant="outline" className="mt-0.5 shrink-0 gap-1 font-normal">
          <Sparkles className="size-3" aria-hidden />
          AI
        </Badge>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {children}
          </p>
        </div>
      </div>
    </div>
  );
}
