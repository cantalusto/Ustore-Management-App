"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

interface MeteorsProps {
  number?: number;
  minDelay?: number;
  maxDelay?: number;
  minDuration?: number;
  maxDuration?: number;
  angle?: number;
  className?: string;
}

export const Meteors = ({
  number = 20,
  minDelay = 0.2,
  maxDelay = 1.2,
  minDuration = 2,
  maxDuration = 10,
  angle = 215,
  className,
}: MeteorsProps) => {
  const [meteorStyles, setMeteorStyles] = useState<Array<React.CSSProperties>>(
    [],
  );

  useEffect(() => {
    const styles = [...new Array(number)].map(() => {
      const delay = Math.random() * (maxDelay - minDelay) + minDelay;
      const duration = Math.floor(Math.random() * (maxDuration - minDuration) + minDuration);
      
      return {
        top: "-5%",
        left: `${Math.floor(Math.random() * 100)}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        animationName: "meteor",
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
        transform: `rotate(${angle}deg)`,
      } as React.CSSProperties;
    });
    setMeteorStyles(styles);
  }, [number, minDelay, maxDelay, minDuration, maxDuration, angle]);

  return (
    <>
      {[...meteorStyles].map((style, idx) => (
        // Meteor Head
        <span
          key={idx}
          style={style}
          className={cn(
            "pointer-events-none absolute size-0.5 rounded-full bg-orange-400 shadow-[0_0_0_1px_#3b82f610]",
            className,
          )}
        >
          {/* Meteor Tail */}
          <div className="pointer-events-none absolute top-1/2 -z-10 h-px w-[50px] -translate-y-1/2 bg-gradient-to-r from-orange-500 via-blue-500 to-transparent" />
        </span>
      ))}
    </>
  );
};
