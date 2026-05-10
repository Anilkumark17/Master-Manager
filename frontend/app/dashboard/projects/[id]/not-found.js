import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ProjectNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-xl font-semibold tracking-tight">Project not found</h1>
      <Button variant="outline" asChild>
        <Link href="/dashboard/projects">Back to projects</Link>
      </Button>
    </div>
  );
}
