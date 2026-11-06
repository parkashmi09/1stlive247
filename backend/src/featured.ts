// Picks the Home banner slides: the most notable upcoming fixtures, one per sport, soonest first.
import type { Featured, Match, SportId } from "./types.ts";

// Tournaments worth a banner, strongest first. Matched against the competition text, case-insensitive.
const BIG = [
  /world cup|champions league|europa league|copa (libertadores|america)|euro 20\d\d/i,
  /^(premier league · england|laliga · spain|serie a · italy|bundesliga · germany|ligue 1 · france)/i, // not "2. Bundesliga"
  /\b(test|odi|t20i)\b|one day international|twenty20 international|\bipl\b|big bash/i,
  /\bnba\b|euroleague/i,
  /atp|wta|grand slam|wimbledon|us open|australian open|roland garros/i,
  // still worth a banner: top flights of big football countries
  /· (england|spain|italy|germany|france|brazil|argentina|usa|netherlands|portugal|mexico|saudi arabia|india)\b/i,
];
const SPORT_ORDER: SportId[] = ["football", "cricket", "tennis", "basketball", "kabaddi", "racing", "f1"];

/** "Serie A · Brazil" -> "Serie A"; tennis "Hong Kong, hard · Wta - Singles" -> "WTA · Hong Kong". */
function leagueLabel(m: Match) {
  const [first = "", second = ""] = m.competition.split(" · ");
  if (m.sport === "tennis" && second) return `${second.split(" - ")[0]!.toUpperCase()} · ${first.split(/[(,]/)[0]!.trim()}`;
  return first;
}

/** True for fixtures from tournaments in the top banner tiers (not just "big country"). */
export const isNotable = (competition: string) => BIG.slice(0, -1).some((re) => re.test(competition));

// women's / youth fixtures rank below every senior men's tier (banner = the headline games)
const SECONDARY = /\bwomen\b|\bu-?(1\d|2\d)\b|\breserves?\b|premier league 2/i;

const rank = (m: Match) => {
  const i = BIG.findIndex((re) => re.test(m.competition));
  return (i === -1 ? BIG.length : i) + (SECONDARY.test(`${m.competition} ${m.home.team.name}`) ? BIG.length + 1 : 0);
};

export function pickFeatured(matches: Match[], now = Date.now(), max = 3): Featured[] {
  const soon = matches.filter((m) => m.status === "upcoming" && Date.parse(m.start) > now && Date.parse(m.start) - now < 3 * 86_400_000);
  const best = new Map<SportId, Match>();
  for (const m of soon) {
    const cur = best.get(m.sport);
    if (!cur || rank(m) < rank(cur) || (rank(m) === rank(cur) && m.start < cur.start)) best.set(m.sport, m);
  }
  return SPORT_ORDER.flatMap((s) => best.get(s) ?? [])
    .sort((a, b) => rank(a) - rank(b) || SPORT_ORDER.indexOf(a.sport) - SPORT_ORDER.indexOf(b.sport))
    .slice(0, max)
    .map((m) => ({
      matchId: m.id,
      sport: m.sport,
      league: leagueLabel(m),
      home: m.home.team.name,
      away: m.away.team.name,
      homeCode: m.home.team.code,
      awayCode: m.away.team.code,
      start: m.start,
    }));
}
