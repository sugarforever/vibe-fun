import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APPS, getApp } from "@/lib/apps";
import PlayClient from "@/components/PlayClient";

export function generateStaticParams() {
  return APPS.map((a) => ({ id: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const app = getApp(id);
  if (!app) return { title: "Play" };
  const title = `Play ${app.name}`;
  const description = `Play ${app.name} free in your browser — ${app.description} Delivered as an MCP App you can add to your AI assistant.`;
  return {
    title,
    description,
    alternates: { canonical: `/play/${id}` },
    openGraph: {
      title: `${title} · vibe-fun`,
      description,
      url: `/play/${id}`,
      type: "website",
    },
    twitter: { card: "summary_large_image", title: `${title} · vibe-fun`, description },
  };
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const app = getApp(id);
  if (!app) notFound();

  return (
    <PlayClient
      game={{ id: app.id, name: app.name, description: app.description }}
      games={APPS.map((a) => ({ id: a.id, name: a.name }))}
    />
  );
}
