import { prisma } from "./prisma";
import type { BrandConfig } from "@prisma/client";

export async function getBrandConfig(): Promise<BrandConfig> {
  return prisma.brandConfig.upsert({
    where: { id: "brand" },
    update: {},
    create: { id: "brand" },
  });
}

export async function updateBrandConfig(data: Partial<Omit<BrandConfig, "id" | "updatedAt">>) {
  await getBrandConfig();
  return prisma.brandConfig.update({ where: { id: "brand" }, data });
}
