import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CampaignDetail } from "@/components/campaigns/campaign-detail";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: { posts: true },
  });
  if (!campaign) notFound();
  return <CampaignDetail campaign={campaign} />;
}
