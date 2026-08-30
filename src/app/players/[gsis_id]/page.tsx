import PlayerClientContent from "./PlayerClientContent";

export async function generateStaticParams() {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "public/data/marts/mart_affl_player_season_custody.json");
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const ids = Array.from(new Set(data.map((r: any) => r.gsis_id || r.player_name).filter(Boolean)));
      return ids.slice(0, 500).map((id) => ({
        gsis_id: encodeURIComponent(String(id)),
      }));
    }
  } catch (e) {
    // fallback
  }
  return [{ gsis_id: "00-0034796" }];
}

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ gsis_id: string }>;
}) {
  const resolved = await params;
  return <PlayerClientContent gsisId={resolved.gsis_id} />;
}
