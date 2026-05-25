import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listProjects } from "@/lib/get-project";

export const metadata = {
  title: "Projects — Master Manager",
};

export default async function ProjectsPage() {
  const { ok, projects } = await listProjects();

  return (
    <div className="flex min-h-full flex-col bg-background">
      <SiteHeader>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Home</Link>
          </Button>
          <LogoutButton />
        </div>
      </SiteHeader>

      <main className="flex-1 border-b border-border px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Projects
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Capture name, type, positioning, and audience in one place.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/projects/new">New project</Link>
            </Button>
          </div>

          {!ok ? (
            <p className="text-sm text-muted-foreground">
              Could not load projects. Sign in again if your session expired.
            </p>
          ) : projects?.length === 0 ? (
            <Card className="border-border/80 shadow-none">
              <CardHeader>
                <CardTitle>No projects yet</CardTitle>
                <CardDescription>
                  Create your first project to track PRDs and execution from
                  here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/dashboard/projects/new">Create project</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link href={`/dashboard/projects/${p.id}`}>
                    <Card className="h-full border-border/80 shadow-none transition-colors hover:bg-muted/30">
                      <CardHeader className="pb-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {p.type}
                        </p>
                        <CardTitle className="text-lg">{p.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {p.shortDescription}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
