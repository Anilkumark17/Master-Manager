import { redirect } from "next/navigation";

export default async function PrdIndexPage({ params }) {
  const { id } = await params;
  redirect(`/dashboard/projects/${id}/prd/planning`);
}
