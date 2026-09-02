"use client";

import { useState } from "react";
import { getAssetUrl } from "@/lib/api";
import { CANONICAL_FRANCHISES } from "@/lib/constants";

interface FranchiseLogoProps {
  franchiseId?: string;
  logoPath?: string;
  name?: string;
  color?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const SIZE_MAP = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
  xl: "h-16 w-16 text-lg",
  "2xl": "h-24 w-24 text-2xl",
};

export default function FranchiseLogo({
  franchiseId,
  logoPath,
  name,
  color,
  size = "md",
  className = "",
}: FranchiseLogoProps) {
  const [error, setError] = useState(false);

  // Look up canonical franchise metadata if available
  const meta = franchiseId
    ? CANONICAL_FRANCHISES.find((f) => f.franchise_id === franchiseId)
    : null;

  const displayName = name || meta?.display_name || franchiseId || "AFFL";
  const primaryColor = color || meta?.primary_color || "#5b87ac";
  const rawLogo = logoPath || meta?.current_logo_path;

  // Derive resolved asset URL
  const resolvedUrl = rawLogo ? getAssetUrl(rawLogo) : null;
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (resolvedUrl && !error) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl overflow-hidden bg-card-elevated border border-rule shrink-0 shadow-sm transition-transform ${sizeClasses} ${className}`}
        style={{
          boxShadow: `0 0 12px ${primaryColor}25`,
          borderColor: `${primaryColor}40`,
        }}
      >
        <img
          src={resolvedUrl}
          alt={displayName}
          className="h-full w-full object-contain p-0.5"
          loading="lazy"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  // Graceful fallback to colored brand monogram badge
  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl font-mono font-black shrink-0 shadow-sm select-none ${sizeClasses} ${className}`}
      style={{
        backgroundColor: `${primaryColor}22`,
        color: primaryColor,
        border: `2px solid ${primaryColor}55`,
      }}
      title={displayName}
    >
      {initials}
    </div>
  );
}
