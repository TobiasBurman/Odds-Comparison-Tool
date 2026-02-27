const CACHE_TTL = 300000;
const cache = {};

const ALLOWED_BOOKMAKERS = new Set([
  "unibet_se",
  "betsson",
  "leovegas_se",
  "mrgreen_se",
  "nordicbet",
  "sport888_se",
  "svenskaspel_se",
  "atg_se",
  "betfair",
]);

async function fetchRegion(sport, region) {
  const params = new URLSearchParams({
    apiKey: process.env.ODDS_API_KEY,
    regions: region,
    markets: "h2h",
    oddsFormat: "decimal",
    includeLinks: true,
  });
  const res = await fetch(
    `https://api.the-odds-api.com/v4/sports/${sport}/odds?${params}`
  );
  if (!res.ok) {
    const err = new Error(`API error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function fetchSport(sport) {
  const cached = cache[sport];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const [euData, seData] = await Promise.all([
    fetchRegion(sport, "eu"),
    fetchRegion(sport, "se"),
  ]);

  const seById = new Map(seData.map((m) => [m.id, m]));

  const merged = euData.map((match) => {
    const seMatch = seById.get(match.id);
    const allBookmakers = [
      ...match.bookmakers,
      ...(seMatch ? seMatch.bookmakers : []),
    ];
    const seen = new Set();
    const unique = allBookmakers.filter((b) => {
      if (seen.has(b.key)) return false;
      seen.add(b.key);
      return true;
    });
    return {
      ...match,
      bookmakers: unique
        .filter((b) => ALLOWED_BOOKMAKERS.has(b.key))
        .slice(0, 10),
    };
  });

  const result = merged.filter((m) => m.bookmakers.length > 0);
  cache[sport] = { data: result, timestamp: Date.now() };
  return result;
}

module.exports = async function handler(req, res) {
  const sportParam = req.query.sport || "icehockey_nhl";
  const sports = sportParam.split(",").map((s) => s.trim());

  try {
    const results = [];
    for (const s of sports) {
      results.push(await fetchSport(s));
    }
    const combined = results
      .flat()
      .sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time));
    res.json(combined);
  } catch (error) {
    if (error.status === 401) {
      return res.status(401).json({ error: "Invalid API key" });
    }
    if (error.status === 422) {
      return res.status(422).json({ error: `Unknown sport: ${sportParam}` });
    }
    res.status(500).json({ error: "Failed to fetch odds data", message: error.message });
  }
}
