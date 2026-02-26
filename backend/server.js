const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());

const cache = {};
const CACHE_TTL = 300000;

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

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

async function fetchRegion(sport, region) {
  const res = await axios.get(
    `https://api.the-odds-api.com/v4/sports/${sport}/odds`,
    {
      params: {
        apiKey: process.env.ODDS_API_KEY,
        regions: region,
        markets: "h2h",
        oddsFormat: "decimal",
        includeLinks: true,
      },
    }
  );
  return res.data;
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

app.get("/api/odds", async (req, res) => {
  const sportParam = req.query.sport || "icehockey_nhl";
  const sports = sportParam.split(",").map((s) => s.trim());

  try {
    const results = [];
    for (const s of sports) {
      results.push(await fetchSport(s));
    }
    const combined = results.flat().sort(
      (a, b) => new Date(a.commence_time) - new Date(b.commence_time)
    );
    res.json(combined);
  } catch (error) {
    console.error("API Error:", error.message);

    if (error.response?.status === 401) {
      return res.status(401).json({ error: "Invalid API key" });
    }
    if (error.response?.status === 422) {
      return res.status(422).json({ error: `Unknown sport: ${sportParam}` });
    }

    res.status(500).json({
      error: "Failed to fetch odds data",
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
