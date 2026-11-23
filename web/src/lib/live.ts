"use client";
// Socket.IO client + hooks. One shared connection per tab; rooms are re-joined after every reconnect.
import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { CommentaryEntry, Match, MatchCentre } from "@/data/types";
import { API_URL, BACKEND_URL } from "./config";

type ServerToClient = {
  "match:update": (m: Match) => void;
  "centre:update": (c: Omit<MatchCentre, "commentary">) => void;
  "commentary:new": (e: { matchId: string; entries: CommentaryEntry[] }) => void;
};
type ClientToServer = {
  "match:subscribe": (p: { id: string }, ack?: (r: { ok: boolean; error?: string }) => void) => void;
  "match:unsubscribe": (p: { id: string }) => void;
  "live:subscribe": (ack?: (r: { ok: boolean }) => void) => void;
};

let socket: Socket<ServerToClient, ClientToServer> | undefined;
// Same-origin long-polling through the /sio rewrite (Vercel rewrites can't carry a websocket, and the backend is plain http).
// On an http page (local dev) a direct websocket to the backend is fine and avoids a pending long-poll request.
export const getSocket = () => (socket ??= location.protocol === "http:"
  ? io(BACKEND_URL, { transports: ["websocket"] })
  : io(API_URL, { path: "/sio", addTrailingSlash: false, transports: ["polling"] }));

/** Keep a list of matches fresh from the `live` room. */
export function useLiveMatches(initial: Match[]) {
  const [list, setList] = useState(initial);
  useEffect(() => {
    const s = getSocket();
    const join = () => s.emit("live:subscribe");
    const onUpdate = (m: Match) => setList((l) => l.map((x) => (x.id === m.id ? m : x)));
    join();
    s.on("connect", join);
    s.on("match:update", onUpdate);
    return () => { s.off("connect", join); s.off("match:update", onUpdate); };
  }, []);
  return list;
}

/** Live state for one match: score, centre and commentary (newest first). */
export function useMatchFeed(initialMatch: Match, initialCentre?: MatchCentre) {
  const [match, setMatch] = useState(initialMatch);
  const [centre, setCentre] = useState(initialCentre);
  const id = initialMatch.id;
  useEffect(() => {
    const s = getSocket();
    const join = () => s.emit("match:subscribe", { id });
    const onMatch = (m: Match) => { if (m.id === id) setMatch(m); };
    const onCentre = (c: Omit<MatchCentre, "commentary">) => {
      if (c.matchId === id) setCentre((prev) => ({ ...c, commentary: prev?.commentary ?? [] }));
    };
    const onCommentary = (e: { matchId: string; entries: CommentaryEntry[] }) => {
      if (e.matchId === id) setCentre((prev) => prev && { ...prev, commentary: [...e.entries, ...prev.commentary].slice(0, 100) });
    };
    join();
    s.on("connect", join);
    s.on("match:update", onMatch);
    s.on("centre:update", onCentre);
    s.on("commentary:new", onCommentary);
    return () => {
      s.emit("match:unsubscribe", { id });
      s.off("connect", join); s.off("match:update", onMatch); s.off("centre:update", onCentre); s.off("commentary:new", onCommentary);
    };
  }, [id]);
  return { match, centre };
}
