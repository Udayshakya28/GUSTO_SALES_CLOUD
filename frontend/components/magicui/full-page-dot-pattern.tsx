// components/ui/full-page-dot-pattern.tsx
"use client";
import { DotPattern } from "./dot-pattern";

export function FullPageDotPattern() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Primary Dot Pattern */}
      <DotPattern
        width={24}
        height={24}
        cx={1}
        cy={1}
        cr={0.8}
        className="fill-white/5 opacity-40"
      />
      
      {/* Secondary Subtle Pattern */}
      <DotPattern
        width={48}
        height={48}
        cx={2}
        cy={2}
        cr={1.2}
        className="fill-white/3 opacity-20 [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
      />
    </div>
  );
}
