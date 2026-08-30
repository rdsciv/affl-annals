"use client";

import { getAssetUrl } from "@/lib/api";

type SealProps = {
  size?: number;
  className?: string;
  variant?: "badge" | "banner";
};

export default function Seal({ size = 48, className = "", variant = "badge" }: SealProps) {
  const src = getAssetUrl(variant === "banner" ? "/images/affl-banner.jpg" : "/images/affl-logo.jpg");

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="AFFL Official Chrome Logo"
        width={variant === "banner" ? size * 2.5 : size}
        height={size}
        className={`object-contain rounded-lg shadow-md hover:scale-105 transition-transform duration-200`}
        style={{
          height: `${size}px`,
          width: variant === "banner" ? "auto" : `${size}px`,
          filter: "drop-shadow(0 0 12px rgba(0, 162, 255, 0.35))"
        }}
      />
    </div>
  );
}
