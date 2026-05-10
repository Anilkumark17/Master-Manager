import { PrdSubNav } from "@/components/prd/prd-subnav";

export default async function PrdSectionLayout({ children, params }) {
  const { id } = await params;
  return (
    <div>
      <PrdSubNav projectId={id} />
      {children}
    </div>
  );
}
