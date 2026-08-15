import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APPS, buildGameJsonLd, getApp } from "@/lib/apps";
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
  const title = app.seo.title;
  const description = app.seo.description;
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
  const jsonLd = buildGameJsonLd(app);

  return (
    <>
      <PlayClient
        game={{ id: app.id, name: app.name, description: app.description, seo: app.seo }}
        games={APPS.map((a) => ({ id: a.id, name: a.name }))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
