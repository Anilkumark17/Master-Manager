import Link from "next/link";
import { cookies } from "next/headers";

import { LogoutButton } from "@/components/auth/logout-button";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { verifySessionToken } from "@/lib/server-jwt";

export const metadata = {
  title: "Dashboard — Master Manager",
};

export default async function DashboardPage() {
  const token = (await cookies()).get("mm_token")?.value;
  const payload = token ? verifySessionToken(token) : null;

  return (
    <div className="flex min-h-full flex-col bg-background">
      <SiteHeader>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Home</Link>
          </Button>
          <LogoutButton />
        </div>
      </SiteHeader>

      <main className="flex-1 border-b border-border px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl space-y-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Protected workspace home — same black-and-white system as the
              landing experience.
            </p>
          </div>

          <Card className="border-border/80 shadow-none">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Projects</CardTitle>
                <CardDescription>
                  Create and open workspace projects — vision, problem, users,
                  and domain in one record.
                </CardDescription>
              </div>
              <Button asChild>
                <Link href="/dashboard/projects">Open projects</Link>
              </Button>
            </CardHeader>
          </Card>

          <Card className="border-border/80 shadow-none">
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>
                You&apos;re signed in. Add PRD boards, tasks, and team views
                here next.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {payload ? (
                <>
                  <p>
                    <span className="font-medium text-foreground">Name:</span>{" "}
                    {payload.name || "—"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Email:</span>{" "}
                    {payload.email || "—"}
                  </p>
                </>
              ) : (
                <p className="text-foreground">Loading session…</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
