import { useState, useEffect, useRef, useCallback } from "react";
import Masonry from "react-masonry-css";
import MatchCard from "./components/MatchCard";
import SportSelector from "./components/SportSelector";
import FilterBar from "./components/FilterBar";
import { Alert, AlertDescription } from "./components/ui/alert";
import logo from "./assets/odds.png";

const getMatchMaxDeviation = (match) => {
  let max = 0;
  for (const bookmaker of match.bookmakers) {
    for (const outcome of bookmaker.markets[0]?.outcomes || []) {
      const allPrices = match.bookmakers
        .map((b) => b.markets[0]?.outcomes.find((o) => o.name === outcome.name)?.price)
        .filter(Boolean);
      if (allPrices.length === 0) continue;
      const avg = allPrices.reduce((s, v) => s + v, 0) / allPrices.length;
      const dev = ((outcome.price - avg) / avg) * 100;
      if (dev > max) max = dev;
    }
  }
  return max;
};

const App = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [sport, setSport] = useState("soccer_epl");
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [sortBy, setSortBy] = useState("time");
  const [filterBy, setFilterBy] = useState("all");

  const notifiedIds = useRef(new Set());

  const checkAndNotify = useCallback((newMatches) => {
    if (Notification.permission !== "granted") return;

    for (const match of newMatches) {
      const maxDev = getMatchMaxDeviation(match);
      if (maxDev > 5 && !notifiedIds.current.has(match.id)) {
        notifiedIds.current.add(match.id);
        new Notification(`Value bet: ${match.home_team} vs ${match.away_team}`, {
          body: `${maxDev.toFixed(1)}% över marknadspris`,
        });
      }
    }
  }, []);

  const fetchOdds = useCallback(
    async (selectedSport, isBackground = false) => {
      if (isBackground) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/odds?sport=${selectedSport}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Något gick fel");
        }

        const sorted = data.sort(
          (a, b) => new Date(a.commence_time) - new Date(b.commence_time)
        );

        setMatches(sorted);
        setLastUpdated(Date.now());
        setError(null);
        checkAndNotify(sorted);
      } catch (err) {
        if (!isBackground) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [checkAndNotify]
  );

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    setMatches([]);
    setExpandedMatchId(null);
    fetchOdds(sport, false);

    const interval = setInterval(() => fetchOdds(sport, true), 30000);
    return () => clearInterval(interval);
  }, [sport, fetchOdds]);

  useEffect(() => {
    if (!lastUpdated) return;
    const id = setInterval(
      () => setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000)),
      1000
    );
    return () => clearInterval(id);
  }, [lastUpdated]);

  const getFilteredAndSorted = () => {
    let result = [...matches];

    if (filterBy === "today") {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      result = result.filter((m) => new Date(m.commence_time) <= end);
    } else if (filterBy === "week") {
      const end = new Date();
      end.setDate(end.getDate() + 7);
      result = result.filter((m) => new Date(m.commence_time) <= end);
    }

    if (sortBy === "value") {
      result.sort((a, b) => getMatchMaxDeviation(b) - getMatchMaxDeviation(a));
    }

    return result;
  };

  const visibleMatches = getFilteredAndSorted();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0a0f1e]">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Alert variant="destructive" className="m-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <button
            onClick={() => fetchOdds(sport, false)}
            className="px-4 py-2 bg-emerald-500 text-slate-900 rounded-lg font-medium hover:bg-emerald-400 transition-colors"
          >
            Försök igen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <header className="border-b border-white/5 bg-[#0d1426]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <div className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="Logo" className="h-6 object-contain opacity-80" />
            <span className="text-sm font-semibold tracking-wide text-slate-200">OddsCompare</span>
          </div>

          <SportSelector selected={sport} onChange={setSport} />

          <FilterBar
            sortBy={sortBy}
            onSortChange={setSortBy}
            filterBy={filterBy}
            onFilterChange={setFilterBy}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {visibleMatches.length === 0 ? (
          <p className="text-center text-slate-500 mt-16">No matches found.</p>
        ) : (
          <Masonry
            breakpointCols={{ default: 3, 1024: 2, 640: 1 }}
            className="flex gap-8"
            columnClassName="space-y-8"
          >
            {visibleMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                isExpanded={expandedMatchId === match.id}
                onToggle={() =>
                  setExpandedMatchId((prev) => (prev === match.id ? null : match.id))
                }
              />
            ))}
          </Masonry>
        )}
      </main>
    </div>
  );
};

export default App;
