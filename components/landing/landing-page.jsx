import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GitBranch,
  LayoutDashboard,
  Palette,
  Radar,
  Sparkles,
  Users,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const founderOutputs = [
  "High-level architecture diagrams",
  "Team dependency maps",
  "Sprint execution plans",
  "Progress bottlenecks",
  "Team alignment summaries",
];

const designerOutputs = [
  "Information architecture",
  "User journey maps",
  "Human action cycles",
  "User flows",
  "Feature interaction logic",
];

export function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/sign-up">Get started</Link>
          </Button>
        </nav>
      </SiteHeader>

      <main className="flex-1">
        <section className="border-b border-border px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <Badge variant="outline" className="mb-6 font-normal">
              <Sparkles className="size-3" aria-hidden />
              Execution OS for 10+ person teams
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl sm:leading-[1.1]">
              Stop managing the startup in spreadsheets, slides, and side
              channels.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              A Trello-style operating system that connects PRDs, scope
              control, your knowledge base, designer workflows, and delivery
              tracking—so founders are not the glue between every function.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" className="h-11 px-6" asChild>
                <Link href="/sign-up">
                  Start free
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-6" asChild>
                <Link href="/sign-in">Sign in to workspace</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-foreground px-4 py-20 text-background sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-background/70">
                From chaos to structure
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Every project starts on a PRD board.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-background/80">
                Dump rough ideas, client calls, voice notes, and feature
                requests in one place. AI shapes them into requirements,
                milestones, risks, dependencies, and tasks your team can
                actually ship against.
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: LayoutDashboard,
                  title: "PRD board",
                  body: "The single intake for product intent before it becomes noise.",
                },
                {
                  icon: Radar,
                  title: "Scope creep radar",
                  body: "New asks are compared to the original PRD so timelines do not drift in silence.",
                },
                {
                  icon: BookOpen,
                  title: "Linked knowledge",
                  body: "Tasks pull in docs, decisions, APIs, branding, and reusable components automatically.",
                },
                {
                  icon: GitBranch,
                  title: "Execution spine",
                  body: "Ideas, design, engineering, and org memory stay connected end to end.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <li
                  key={title}
                  className="rounded-xl border border-background/15 bg-background/5 p-5"
                >
                  <Icon className="size-5 text-background/90" aria-hidden />
                  <h3 className="mt-3 font-medium">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-background/75">
                    {body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-b border-border px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Built for how real teams work.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Designers, engineers, PMs, and founders each get outputs tuned
                to their job—without losing the thread back to the PRD.
              </p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <Card className="border-border/80 shadow-none">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Palette className="size-4 text-foreground" aria-hidden />
                    <CardTitle>Designers</CardTitle>
                  </div>
                  <CardDescription>
                    From feature logic to journey clarity—generated artifacts
                    you can critique and refine.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {designerOutputs.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-foreground" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-border/80 shadow-none">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-foreground" aria-hidden />
                    <CardTitle>Founders &amp; managers</CardTitle>
                  </div>
                  <CardDescription>
                    Visibility across dependencies, plans, and bottlenecks—
                    without another status meeting deck.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {founderOutputs.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-foreground" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 rounded-2xl border border-border bg-muted/30 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Your company&apos;s execution brain.
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                One workspace for product thinking, design systems, engineering
                workflow, and organizational memory.
              </p>
            </div>
            <Separator className="bg-border sm:hidden" />
            <Button size="lg" className="h-11 w-full shrink-0 sm:w-auto" asChild>
              <Link href="/sign-up">
                Create account
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Master Manager</p>
          <div className="flex gap-6">
            <Link
              href="/sign-in"
              className="hover:text-foreground hover:underline"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="hover:text-foreground hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
