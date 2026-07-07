import { NextResponse } from "next/server";
import { getBrandConfig, updateBrandConfig } from "@/lib/settings";

export async function GET() {
  const brand = await getBrandConfig();
  return NextResponse.json(brand);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const allowed = [
    "colorPrimary",
    "colorSecondary",
    "colorAccent",
    "fontHeading",
    "fontBody",
    "logoPath",
    "monthlyAdBudget",
    "imageVideoTools",
    "languages",
    "setmoreUrl",
    "instagramHandle",
    "facebookHandle",
  ] as const;
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }
  const updated = await updateBrandConfig(data);
  return NextResponse.json(updated);
}
