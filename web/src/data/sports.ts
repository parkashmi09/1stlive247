// Static UI metadata per sport (labels + icons). Live data comes from the backend.
import type { Sport } from "./types";

export const SPORTS: Sport[] = [
  { id: "cricket", label: "Cricket", icon: "cricket" },
  { id: "football", label: "Football", icon: "football" },
  { id: "tennis", label: "Tennis", icon: "tennis" },
  { id: "racing", label: "Horse Racing", icon: "racing" },
  { id: "basketball", label: "Basketball", icon: "basketball" },
  { id: "kabaddi", label: "Kabaddi", icon: "kabaddi" },
  { id: "f1", label: "F1", icon: "f1" },
  // the Sofascore-style "More" sports (feed: Sports API); Home shows them behind the More chip
  { id: "hockey", label: "Ice Hockey" },
  { id: "volleyball", label: "Volleyball" },
  { id: "handball", label: "Handball" },
  { id: "baseball", label: "Baseball" },
  { id: "american-football", label: "American Football" },
  { id: "rugby", label: "Rugby" },
  { id: "rugby-league", label: "Rugby League" },
  { id: "aussie-rules", label: "Aussie Rules" },
  { id: "darts", label: "Darts" },
  { id: "snooker", label: "Snooker" },
  { id: "table-tennis", label: "Table Tennis" },
  { id: "badminton", label: "Badminton" },
  { id: "futsal", label: "Futsal" },
  { id: "beach-volleyball", label: "Beach Volleyball" },
  { id: "beach-soccer", label: "Beach Soccer" },
  { id: "floorball", label: "Floorball" },
  { id: "bandy", label: "Bandy" },
  { id: "water-polo", label: "Water Polo" },
  { id: "field-hockey", label: "Field Hockey" },
  { id: "netball", label: "Netball" },
  { id: "esports", label: "Esports" },
  { id: "mma", label: "MMA" },
  { id: "boxing", label: "Boxing" },
];

export const sportOf = (id: Sport["id"]) => SPORTS.find((s) => s.id === id)!;
