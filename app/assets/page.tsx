import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { AssetGallery } from "@/components/assets/asset-gallery";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const assets = await prisma.asset.findMany({
    orderBy: { createdAt: "desc" },
    include: { usages: { include: { post: true }, orderBy: { usedAt: "desc" } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset-Bibliothek"
        description="Bilder und Videos aus Google Drive sowie eigene Uploads — durchsuchbar, getaggt, mit Verwendungshistorie."
      />
      <AssetGallery initialAssets={JSON.parse(JSON.stringify(assets))} />
    </div>
  );
}
