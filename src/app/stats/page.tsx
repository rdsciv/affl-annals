import { Metadata } from "next";
import StatsClientContent from "./StatsClientContent";

export const metadata: Metadata = {
  title: "Franchise Stat Tracker — AFFL Annals",
  description: "Annual and all-time franchise stat tracker featuring passing, rushing, receiving, and advanced nflverse and SumerSports efficiency metrics (EPA, CPOE, Success Rate, Stuff Rate, aDOT, and RACR).",
};

export default function StatsPage() {
  return <StatsClientContent />;
}
