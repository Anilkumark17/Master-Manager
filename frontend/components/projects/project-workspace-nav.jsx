"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Code2,
  FileText,
  LayoutGrid,
  Palette,
} from "lucide-react";

import { cn } from "@/lib/utils";

const tabs = (projectId) => [
  {
    href: `/dashboard/projects/${projectId}`,
    label: "Project Details",
    icon: LayoutGrid,
    match: (path, base) => path === base || path === `${base}/`,
  },
  {
    href: `/dashboard/projects/${projectId}/prd`,
    label: "PRD",
    icon: FileText,
    match: (path, base) => path.startsWith(`${base}/prd`),
  },
  {
    href: `/dashboard/projects/${projectId}/work-track`,
    label: "Work Track",
    icon: ClipboardList,
    match: (path, base) => path.startsWith(`${base}/work-track`),
  },
  {
    href: `/dashboard/projects/${projectId}/dev`,
    label: "Dev",
    icon: Code2,
    match: (path, base) => path.startsWith(`${base}/dev`),
  },
  {
    href: `/dashboard/projects/${projectId}/designer`,
    label: "Designer",
    icon: Palette,
    match: (path, base) => path.startsWith(`${base}/designer`),
  },
];

export function ProjectWorkspaceNav({ projectId }) {
  const pathname = usePathname();
  const base = `/dashboard/projects/${projectId}`;
  const items = tabs(projectId);

  return (
    <nav
      className="mt-8 flex gap-1 overflow-x-auto border-b border-border pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Workspace"
    >
      {items.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname, base);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors sm:px-4",
              active
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            <Icon className="size-4 opacity-80" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
