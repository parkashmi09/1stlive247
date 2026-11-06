// Static UI metadata per sport (labels + icons). Live data comes from the backend.
import type { Sport } from "./types";

export const SPORTS: Sport[] = [
  { id: "cricket", label: "Cricket", icon: "cricket" },
  { id: "football", label: "Football", icon: "football" },
  { id: "tennis", label: "Tennis", icon: "tennis" },
  { id: "kabaddi", label: "Kabaddi", icon: "kabaddi" },
  { id: "basketball", label: "Basketball", icon: "basketball" },
  { id: "racing", label: "Racing", icon: "racing" },
  { id: "f1", label: "F1", icon: "f1" },
];

export const sportOf = (id: Sport["id"]) => SPORTS.find((s) => s.id === id)!;
