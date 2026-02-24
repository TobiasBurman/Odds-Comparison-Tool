import { motion, AnimatePresence } from "framer-motion";
import OddsDisplay from "./OddsDisplay";

const MatchCard = ({ match, isExpanded, onToggle }) => {
  const getAllTeamOdds = (teamName) => {
    return match.bookmakers
      .map((b) => b.markets[0]?.outcomes.find((o) => o.name === teamName)?.price)
      .filter(Boolean);
  };

  const sortBookmakers = (teamName) => {
    return [...match.bookmakers].sort((a, b) => {
      const oddsA = a.markets[0]?.outcomes.find((o) => o.name === teamName)?.price || 0;
      const oddsB = b.markets[0]?.outcomes.find((o) => o.name === teamName)?.price || 0;
      return oddsB - oddsA;
    });
  };

  const homeOdds = getAllTeamOdds(match.home_team);
  const awayOdds = getAllTeamOdds(match.away_team);
  const sortedHomeBookmakers = sortBookmakers(match.home_team);
  const sortedAwayBookmakers = sortBookmakers(match.away_team);

  const startTime = new Date(match.commence_time).toLocaleString("sv-SE", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const visibleHome = isExpanded ? sortedHomeBookmakers : sortedHomeBookmakers.slice(0, 3);
  const visibleAway = isExpanded ? sortedAwayBookmakers : sortedAwayBookmakers.slice(0, 3);
  const hasMore = sortedHomeBookmakers.length > 3 || sortedAwayBookmakers.length > 3;

  const renderRow = (bookmaker, teamName, allOdds) => {
    const odds = bookmaker.markets[0]?.outcomes.find((o) => o.name === teamName)?.price;
    const link = bookmaker.links?.[0]?.url;

    if (!odds) return null;

    return (
      <div key={bookmaker.key} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors truncate w-24"
            title={bookmaker.title}
          >
            {bookmaker.title || "Unknown"}
          </a>
        ) : (
          <span className="text-xs text-slate-500 truncate w-24">{bookmaker.title || "Unknown"}</span>
        )}
        <OddsDisplay odds={odds} allOdds={allOdds} />
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors"
    >
      <div className="px-5 py-4 border-b border-slate-800 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold leading-snug">
            <span className="text-sky-400">{match.home_team}</span>
            <span className="text-slate-500 font-normal mx-1.5">vs</span>
            <span className="text-violet-400">{match.away_team}</span>
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{startTime}</p>
        </div>
      </div>

      <div className="px-5 pt-4 pb-3 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400 mb-1.5 truncate">{match.home_team}</p>
          <div>{visibleHome.map((b) => renderRow(b, match.home_team, homeOdds))}</div>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-400 mb-1.5 truncate">{match.away_team}</p>
          <div>{visibleAway.map((b) => renderRow(b, match.away_team, awayOdds))}</div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="extra"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {hasMore && (
        <button
          onClick={onToggle}
          className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors border-t border-slate-800"
        >
          {isExpanded ? "Show less ▲" : "Show more ▼"}
        </button>
      )}
    </motion.div>
  );
};

export default MatchCard;
