"use client";
import { useState } from "react";

/** Renders a score; plays the gold "score-pop" only when the value changes after first paint. */
export function ScorePop({ value, className }: { value: string; className?: string }) {
  const [initial] = useState(value);
  return <span key={value} className={`${initial !== value ? "score-pop " : ""}${className ?? ""}`}>{value}</span>;
}
