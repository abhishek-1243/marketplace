"use client";

import { useState, useEffect } from "react";

const SLIDES = [
  { top: "Fuel your", bottom: "next sound." },
  { top: "Indian roots.", bottom: "Original sounds." },
  { top: "Discover the craft.", bottom: "Hear the detail." },
];

export default function HeroHeadline() {
  const [index, setIndex] = useState(0);
  const [sliding, setSliding] = useState<"in" | "out" | "idle">("idle");

  useEffect(() => {
    const interval = setInterval(() => {
      setSliding("out");
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % SLIDES.length);
        setSliding("in");
        setTimeout(() => setSliding("idle"), 50);
      }, 500);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const slide = SLIDES[index];

  return (
    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] min-h-[2.4em] overflow-hidden">
      <span
        className={`block transition-all duration-500 ease-in-out ${
          sliding === "out"
            ? "opacity-0 -translate-y-8"
            : sliding === "in"
              ? "opacity-0 translate-y-8"
              : "opacity-100 translate-y-0"
        }`}
      >
        {slide.top}
        <br />
        {slide.bottom}
      </span>
    </h1>
  );
}
