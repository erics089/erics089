import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostDetail } from "@/components/social/post-detail";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) notFound();
  return <PostDetail post={post} />;
}
