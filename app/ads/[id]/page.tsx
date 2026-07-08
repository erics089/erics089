import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdSpecDetail } from "@/components/ads/ad-spec-detail";

export const dynamic = "force-dynamic";

export default async function AdSpecPage({ params }: { params: { id: string } }) {
  const spec = await prisma.adSpec.findUnique({ where: { id: params.id } });
  if (!spec) notFound();
  return <AdSpecDetail spec={spec} />;
}
