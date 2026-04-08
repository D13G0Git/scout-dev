import * as React from "react";
import { cn } from "@/lib/utils";

export function ScoutMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-auto w-auto", className)}
      role="img"
      aria-label="Scout"
    >
      <defs>
        <linearGradient id="scoutSparkle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="45%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="scoutRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <circle
        cx="32"
        cy="32"
        r="27"
        stroke="url(#scoutRing)"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M32 12 L35.5 26.5 L50 30 L35.5 33.5 L32 48 L28.5 33.5 L14 30 L28.5 26.5 Z"
        fill="url(#scoutSparkle)"
      />
      <circle cx="50" cy="16" r="2" fill="#FBBF24" />
      <circle cx="14" cy="50" r="1.5" fill="#EC4899" />
    </svg>
  );
}
