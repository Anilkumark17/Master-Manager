import Link from "next/link";

import { SignUpForm } from "@/components/auth/sign-up-form";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Create account — Master Manager",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <SiteHeader>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">Home</Link>
        </Button>
      </SiteHeader>

      <main className="flex flex-1 flex-col border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto w-full max-w-md">
            <Card className="border-border/80 shadow-none">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                  Create account
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Name, email, and password — then you&apos;re in the dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignUpForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
