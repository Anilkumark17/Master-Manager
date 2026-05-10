"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileStack, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const items = (projectId) => [
  {
    href: `/dashboard/projects/${projectId}/prd/planning`,
    label: "PRD planning",
    icon: FileStack,
  },
  {
    href: `/dashboard/projects/${projectId}/prd/generate`,
    label: "PRD generation",
    icon: Sparkles,
  },
];

export function PrdSubNav({ projectId }) {
  const pathname = usePathname();
  const links = items(projectId);

  return (
    <nav
      className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3"
      aria-label="PRD steps"
    >
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-foreground text-background"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4 opacity-90" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
