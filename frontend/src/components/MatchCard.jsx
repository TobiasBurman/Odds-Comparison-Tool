import { motion, AnimatePresence } from "framer-motion";
import OddsDisplay from "./OddsDisplay";

const cleanName = (title) => (title || "Unknown").replace(/\s*\(SE\)\s*/i, "").trim();

const MatchCard = ({ match, isExpanded, onToggle, index = 0 }) => {
  const t = (index % 3) / 2;
  const r = Math.round(165 - 36 * t);
  const g = Math.round(180 - 40 * t);
  const b = Math.round(252 - 4 * t);
  const titleColor = `rgb(${r}, ${g}, ${b})`;
  const getAllTeamOdds = (teamName) => {
    return match.bookmakers
      .map((b) => b.markets[0]?.outcomes.find((o) => o.name === teamName)?.price)
      .filter(Boolean);
  };

  const sortBookmakers = (teamName) => {
    return [...match.bookmakers]
      .filter((b) => b.markets[0]?.outcomes.find((o) => o.name === teamName)?.price)
      .sort((a, b) => {
        const oddsA = a.markets[0]?.outcomes.find((o) => o.name === teamName)?.price || 0;
        const oddsB = b.markets[0]?.outcomes.find((o) => o.name === teamName)?.price || 0;
        return oddsB - oddsA;
      });
  };

  const homeOdds = getAllTeamOdds(match.home_team);
  const awayOdds = getAllTeamOdds(match.away_team);
  const sortedHomeBookmakers = sortBookmakers(match.home_team);
  const sortedAwayBookmakers = sortBookmakers(match.away_team);

  const bestHomeBookie = sortedHomeBookmakers[0];
  const bestAwayBookie = sortedAwayBookmakers[0];
  const bestHomeOdds = bestHomeBookie?.markets[0]?.outcomes.find((o) => o.name === match.home_team)?.price;
  const bestAwayOdds = bestAwayBookie?.markets[0]?.outcomes.find((o) => o.name === match.away_team)?.price;

  const homeAvg = homeOdds.length > 0 ? homeOdds.reduce((s, v) => s + v, 0) / homeOdds.length : 0;
  const awayAvg = awayOdds.length > 0 ? awayOdds.reduce((s, v) => s + v, 0) / awayOdds.length : 0;
  const homeIsValue = bestHomeOdds && homeAvg > 0 && ((bestHomeOdds - homeAvg) / homeAvg) * 100 > 5;
  const awayIsValue = bestAwayOdds && awayAvg > 0 && ((bestAwayOdds - awayAvg) / awayAvg) * 100 > 5;

  const getTimeLabel = () => {
    const diff = new Date(match.commence_time) - Date.now();
    if (diff < 0) return "Live now";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h < 24) return h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
    return new Date(match.commence_time).toLocaleString("sv-SE", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const timeLabel = getTimeLabel();
  const isLive = new Date(match.commence_time) < Date.now();
  const isSoon = !isLive && new Date(match.commence_time) - Date.now() < 3600000;

  const hasMore = sortedHomeBookmakers.length > 1 || sortedAwayBookmakers.length > 1;

  const renderRow = (bookmaker, teamName, allOdds) => {
    const odds = bookmaker.markets[0]?.outcomes.find((o) => o.name === teamName)?.price;
    const link = bookmaker.links?.[0]?.url;
    if (!odds) return null;
    return (
      <div key={bookmaker.key} className="flex justify-between items-center py-1.5 border-b border-slate-800/50 last:border-0">
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-[11px] text-slate-500 hover:text-emerald-400 transition-colors truncate w-28">
            {cleanName(bookmaker.title)}
          </a>
        ) : (
          <span className="text-[11px] text-slate-500 truncate w-28">{cleanName(bookmaker.title)}</span>
        )}
        <OddsDisplay odds={odds} allOdds={allOdds} />
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="bg-[#0c1220] border border-slate-600/40 rounded-lg hover:border-slate-500 transition-colors duration-100"
    >
      <div className="px-4 pt-4 pb-3">
        <p className="text-sm font-semibold leading-snug" style={{ color: titleColor }}>
          {match.home_team} <span className="text-slate-600 font-normal">–</span> {match.away_team}
        </p>
        <span className={`text-[11px] tabular-nums mt-1 block ${isLive ? "text-emerald-500" : isSoon ? "text-amber-500" : "text-slate-600"}`}>
          {timeLabel}
        </span>
      </div>

      <div className="border-t border-slate-800/80 px-4">
        <div className="flex items-center justify-between py-3">
          <span className="text-xs text-slate-500 flex-1 truncate">{match.home_team}</span>
          <div className="text-right ml-4 shrink-0">
            {bestHomeOdds ? (
              <>
                <span className={`text-base font-bold font-mono tabular-nums ${homeIsValue ? "text-emerald-400" : "text-slate-400"}`}>
                  {bestHomeOdds.toFixed(2)}
                </span>
                <p className="text-[10px] text-slate-600 leading-none mt-0.5">{cleanName(bestHomeBookie?.title)}</p>
              </>
            ) : (
              <span className="text-sm font-mono text-slate-700">–</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-slate-800/50">
          <span className="text-xs text-slate-500 flex-1 truncate">{match.away_team}</span>
          <div className="text-right ml-4 shrink-0">
            {bestAwayOdds ? (
              <>
                <span className={`text-base font-bold font-mono tabular-nums ${awayIsValue ? "text-emerald-400" : "text-slate-400"}`}>
                  {bestAwayOdds.toFixed(2)}
                </span>
                <p className="text-[10px] text-slate-600 leading-none mt-0.5">{cleanName(bestAwayBookie?.title)}</p>
              </>
            ) : (
              <span className="text-sm font-mono text-slate-700">–</span>
            )}
          </div>
        </div>
      </div>

      {hasMore && (
        <button
          onClick={onToggle}
          className="w-full py-1.5 text-[11px] text-slate-700 hover:text-slate-400 transition-colors border-t border-slate-800/80"
        >
          {isExpanded ? "Show less ▲" : "All bookmakers ▼"}
        </button>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 border-t border-slate-800 pt-3 space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">{match.home_team}</p>
                {sortedHomeBookmakers.map((b) => renderRow(b, match.home_team, homeOdds))}
              </div>
              <div className="border-t border-slate-800 pt-3">
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">{match.away_team}</p>
                {sortedAwayBookmakers.map((b) => renderRow(b, match.away_team, awayOdds))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MatchCard;
