import { notFound } from "next/navigation";

import { PrdVersionReadOnly } from "@/components/prd/prd-version-readonly";
import { getPrdVersion } from "@/lib/get-prd";
import { getProject } from "@/lib/get-project";

export async function generateMetadata({ params }) {
  const { id, prdId } = await params;
  const prd = await getPrdVersion(id, prdId);
  if (!prd) {
    return { title: "PRD — Master Manager" };
  }
  const title = prd.title || "PRD snapshot";
  return { title: `${title} — Master Manager` };
}

export default async function PrdVersionPage({ params }) {
  const { id, prdId } = await params;
  const [project, prd] = await Promise.all([
    getProject(id),
    getPrdVersion(id, prdId),
  ]);

  if (project === null) {
    notFound();
  }
  if (project === undefined) {
    return (
      <p className="text-sm text-muted-foreground">
        Could not load this project from the API. Check that the backend is
        running and BACKEND_URL is correct.
      </p>
    );
  }
  if (prd === null) {
    notFound();
  }
  if (prd === undefined) {
    return (
      <p className="text-sm text-muted-foreground">
        Could not load this PRD version. Check your connection and try again.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <PrdVersionReadOnly projectId={id} prd={prd} />
    </div>
  );
}
