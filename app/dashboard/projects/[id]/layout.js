import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { ProjectWorkspaceNav } from "@/components/projects/project-workspace-nav";
import { SiteHeader } from "@/components/layout/site-header";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getProject } from "@/lib/get-project";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) {
    return { title: "Project — Master Manager" };
  }
  return {
    title: `${project.name} — Workspace`,
    description: project.shortDescription,
  };
}

export default async function ProjectWorkspaceLayout({ children, params }) {
  const { id } = await params;
  const project = await getProject(id);

  if (project === null) {
    notFound();
  }
  if (project === undefined) {
    return (
      <div className="flex min-h-full flex-col bg-background">
        <SiteHeader>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/projects">Projects</Link>
          </Button>
        </SiteHeader>
        <main className="space-y-2 p-6 text-sm text-muted-foreground">
          <p>Unable to load this workspace.</p>
          <p className="text-xs">
            Sign in again if your session expired, or check that{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">
              DATABASE_URL
            </code>{" "}
            is set in{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">
              .env.local
            </code>
            .
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-background">
      <SiteHeader>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/projects">All projects</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <LogoutButton />
        </div>
      </SiteHeader>

      <div className="relative flex-1 border-b border-border">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-muted/40 dark:to-muted/20"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-10">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard/projects">Projects</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-[200px] truncate sm:max-w-md">
                  {project.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {project.type}
              </p>
              <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
                {project.name}
              </h1>
              <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
                {project.shortDescription}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2 lg:pt-1">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/projects/new">New project</Link>
              </Button>
              <DeleteProjectButton projectId={project.id} />
            </div>
          </div>

          <ProjectWorkspaceNav projectId={id} />

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
