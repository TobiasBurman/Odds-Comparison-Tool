import React from 'react';
import OddsDisplay from './OddsDisplay';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const MatchCard = ({ match, isExpanded, onToggle }) => {
  const getAllTeamOdds = (teamName) => {
    return match.bookmakers
      .map(b => b.markets[0]?.outcomes.find(o => o.name === teamName)?.price)
      .filter(Boolean);
  };

  const sortBookmakers = (teamName) => {
    return [...match.bookmakers].sort((a, b) => {
      const oddsA = a.markets[0]?.outcomes.find(o => o.name === teamName)?.price || 0;
      const oddsB = b.markets[0]?.outcomes.find(o => o.name === teamName)?.price || 0;
      return oddsB - oddsA;
    });
  };

  const homeOdds = getAllTeamOdds(match.home_team);
  const awayOdds = getAllTeamOdds(match.away_team);
  const sortedHomeBookmakers = sortBookmakers(match.home_team);
  const sortedAwayBookmakers = sortBookmakers(match.away_team);

  const startTime = new Date(match.commence_time).toLocaleString();

  const visibleHomeBookmakers = isExpanded
    ? sortedHomeBookmakers
    : sortedHomeBookmakers.slice(0, 3);

  const visibleAwayBookmakers = isExpanded
    ? sortedAwayBookmakers
    : sortedAwayBookmakers.slice(0, 3);

  return (
<Card className="bg-gradient-to-br from-blue-800 to-slate-800 text-white shadow-md rounded-2xl transition-all duration-300 hover:shadow-lg">
      <CardHeader className="p-4 border-b border-blue-700">
        <div className="flex flex-col space-y-1">
          <CardTitle className="text-base font-medium">
            {match.home_team} vs {match.away_team}
          </CardTitle>
          <span className="text-sm text-blue-200">{startTime}</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Home Team Column */}
          <div>
            <div className="mb-2 font-medium text-sm text-cyan-100">{match.home_team}</div>

            <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-blue-400 hover:scrollbar-thumb-blue-300">
              {visibleHomeBookmakers.map((bookmaker) => {
                const odds = bookmaker.markets[0]?.outcomes.find(
                  o => o.name === match.home_team
                )?.price;
                const link = bookmaker.links ? bookmaker.links[0]?.url : null;

                return odds ? (
                  <div key={bookmaker.key} className="flex justify-between items-center text-sm">
                    {link ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-28 truncate text-blue-200 hover:text-white font-semibold transition-colors"
                        title={`Go to ${bookmaker.title}`}
                      >
                        {bookmaker.title || 'Unknown Bookmaker'}
                      </a>
                    ) : (
                      <span className="w-28 truncate text-blue-300" title="URL not available">
                        {bookmaker.title || 'Unknown Bookmaker'}
                      </span>
                    )}
                    <OddsDisplay odds={odds} allOdds={homeOdds} />
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Away Team Column */}
          <div>
            <div className="mb-2 font-medium text-sm text-blue-100">{match.away_team}</div>
            <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-blue-400 hover:scrollbar-thumb-blue-300">
              {visibleAwayBookmakers.map((bookmaker) => {
                const odds = bookmaker.markets[0]?.outcomes.find(
                  o => o.name === match.away_team
                )?.price;
                const link = bookmaker.links ? bookmaker.links[0]?.url : null;

                return odds ? (
                  <div key={bookmaker.key} className="flex justify-between items-center text-sm">
                    {link ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-28 truncate text-blue-200 hover:text-white font-semibold transition-colors"
                        title={`Go to ${bookmaker.title}`}
                      >
                        {bookmaker.title || 'Unknown Bookmaker'}
                      </a>
                    ) : (
                      <span className="w-28 truncate text-blue-300" title="URL not available">
                        {bookmaker.title || 'Unknown Bookmaker'}
                      </span>
                    )}
                    <OddsDisplay odds={odds} allOdds={awayOdds} />
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>

        {(sortedHomeBookmakers.length > 3 || sortedAwayBookmakers.length > 3) && (
          <button
            onClick={onToggle}
            className="w-full mt-4 text-sm font-medium text-black hover:text-blue-200 transition-colors"
          >
            {isExpanded ? <span>Show Less ▲</span> : <span>Show More ▼</span>}
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchCard;
