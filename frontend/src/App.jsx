import { useState, useEffect, useRef, useCallback } from "react";

const ALL_SPORTS = [
  "soccer_sweden_allsvenskan", "soccer_epl", "soccer_spain_la_liga", "soccer_uefa_champs_league",
  "icehockey_nhl", "icehockey_sweden_hockey_league",
  "basketball_nba", "tennis",
].join(",");
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
  const [sport, setSport] = useState("soccer_sweden_allsvenskan,soccer_epl,soccer_spain_la_liga,soccer_uefa_champs_league");
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [sortBy, setSortBy] = useState("time");
  const [filterBy, setFilterBy] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const notifiedIds = useRef(new Set());
  const allMatchesRef = useRef([]);

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
          throw new Error(data.error || "Something went wrong");
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
    fetch(`${import.meta.env.VITE_API_URL}/api/odds?sport=${ALL_SPORTS}`)
      .then((r) => r.json())
      .then((data) => { allMatchesRef.current = data; })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMatches([]);
    setExpandedMatchId(null);
    setCurrentPage(1);
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

  const ITEMS_PER_PAGE = 9;

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

    if (search.trim()) {
      const q = search.toLowerCase();
      const pool = allMatchesRef.current.length > 0 ? allMatchesRef.current : result;
      result = pool.filter(
        (m) =>
          m.home_team.toLowerCase().includes(q) ||
          m.away_team.toLowerCase().includes(q)
      );
    }

    if (sortBy === "value") {
      result.sort((a, b) => getMatchMaxDeviation(b) - getMatchMaxDeviation(a));
    }

    return result;
  };

  const allFiltered = getFilteredAndSorted();
  const totalPages = Math.ceil(allFiltered.length / ITEMS_PER_PAGE);
  const visibleMatches = allFiltered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <header className="relative z-20 border-b border-slate-800/80 bg-[#070b13]/90 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-10 h-20 flex items-center justify-between gap-8">
          <div className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="Logo" className="h-12 object-contain" />
            <span className="text-sm font-semibold tracking-wide text-slate-200">OddsCompare</span>
          </div>

          <SportSelector selected={sport} onChange={setSport} />

          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search team..."
            className="bg-transparent border border-slate-700/50 rounded px-3 py-1.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-500 w-40"
          />

          <FilterBar
            sortBy={sortBy}
            onSortChange={setSortBy}
            filterBy={filterBy}
            onFilterChange={setFilterBy}
          />
        </div>
      </header>

      <main className="relative z-10 max-w-screen-2xl mx-auto px-10 py-10">
        {visibleMatches.length === 0 ? (
          <p className="text-center text-slate-500 mt-16">No matches found.</p>
        ) : (
          <Masonry
            breakpointCols={{ default: 3, 1024: 2, 640: 1 }}
            className="flex gap-14"
            columnClassName="space-y-10"
          >
            {visibleMatches.map((match, i) => (
              <MatchCard
                key={match.id}
                match={match}
                index={i}
                total={visibleMatches.length}
                isExpanded={expandedMatchId === match.id}
                onToggle={() =>
                  setExpandedMatchId((prev) => (prev === match.id ? null : match.id))
                }
              />
            ))}
          </Masonry>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs text-slate-400 border border-slate-700/50 rounded hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <span className="text-xs text-slate-600 tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs text-slate-400 border border-slate-700/50 rounded hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </main>

      <div className="fixed top-[120px] left-6 z-30 bg-[#0c1220] border border-slate-700/40 rounded-lg px-4 py-4 flex flex-col gap-4 w-44">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Legend</p>

        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] text-slate-600 uppercase tracking-wide">Odds</p>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-mono font-bold text-sm w-10">2.45</span>
            <span className="text-slate-500 text-[11px] leading-tight">&gt;5% above market avg</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-100 font-mono font-bold text-sm w-10">1.85</span>
            <span className="text-slate-500 text-[11px] leading-tight">Normal market price</span>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-3 flex flex-col gap-1.5">
          <p className="text-[10px] text-slate-600 uppercase tracking-wide">Status</p>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 text-[11px]">●</span>
            <span className="text-slate-500 text-[11px]">Live now</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-[11px]">●</span>
            <span className="text-slate-500 text-[11px]">Starting soon</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 text-[11px]">●</span>
            <span className="text-slate-500 text-[11px]">Upcoming</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
