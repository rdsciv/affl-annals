import { CANONICAL_FRANCHISES } from "@/lib/constants";
import FranchiseClientContent from "./FranchiseClientContent";

export async function generateStaticParams() {
  return CANONICAL_FRANCHISES.map((f) => ({
    franchise_id: f.franchise_id,
  }));
}

export default async function FranchiseDetailPage({
  params,
}: {
  params: Promise<{ franchise_id: string }>;
}) {
  const resolved = await params;
  return <FranchiseClientContent franchiseId={resolved.franchise_id} />;
}
