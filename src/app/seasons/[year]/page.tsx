import SeasonClientContent from "./SeasonClientContent";

export async function generateStaticParams() {
  return Array.from({ length: 13 }, (_, i) => ({
    year: (2014 + i).toString(),
  }));
}

export default async function SeasonDetailPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const resolved = await params;
  return <SeasonClientContent year={parseInt(resolved.year)} />;
}
