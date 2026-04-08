import * as React from "react";
import { cn } from "@/lib/utils";

export function OrishaLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 120"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-auto w-auto", className)}
      role="img"
      aria-label="Orisha Agrifood"
    >
      <defs>
        <linearGradient id="orishaS" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="35%" stopColor="#F97316" />
          <stop offset="70%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#BE185D" />
        </linearGradient>
      </defs>
      <g fontFamily="var(--font-geist-sans), Inter, system-ui, sans-serif">
        <text
          x="0"
          y="70"
          fontSize="72"
          fontWeight={800}
          letterSpacing="2"
          fill="currentColor"
        >
          ORI
        </text>
        <text
          x="143"
          y="70"
          fontSize="72"
          fontWeight={800}
          letterSpacing="2"
          fill="url(#orishaS)"
        >
          S
        </text>
        <text
          x="192"
          y="70"
          fontSize="72"
          fontWeight={800}
          letterSpacing="2"
          fill="currentColor"
        >
          HA
        </text>
        <text
          x="192"
          y="102"
          fontSize="24"
          fontWeight={500}
          letterSpacing="1.5"
          fill="currentColor"
          opacity={0.85}
        >
          Agrifood
        </text>
      </g>
    </svg>
  );
}
