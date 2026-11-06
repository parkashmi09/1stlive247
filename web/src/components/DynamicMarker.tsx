import { connection } from "next/server";
import { Suspense } from "react";

async function Connection() {
  await connection();
  return null;
}

/** Marks a page as request-time so params-based generateMetadata can stream (Cache Components). */
export function DynamicMarker() {
  return <Suspense><Connection /></Suspense>;
}
