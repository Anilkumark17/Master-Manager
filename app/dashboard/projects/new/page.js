import Link from "next/link";

import { NewProjectForm } from "@/components/projects/new-project-form";
import { SiteHeader } from "@/components/layout/site-header";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "New project — Master Manager",
};

export default function NewProjectPage() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <SiteHeader>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/projects">All projects</Link>
          </Button>
          <LogoutButton />
        </div>
      </SiteHeader>

      <main className="flex-1 border-b border-border px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl space-y-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              New project
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Define the basics once — vision, problem, users, and domain stay
              tied to everything downstream.
            </p>
          </div>
          <NewProjectForm />
        </div>
      </main>
    </div>
  );
}
