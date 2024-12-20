import React, { useState } from 'react';
import OddsDisplay from './OddsDisplay';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const MatchCard = ({ match }) => {
  const [showMore, setShowMore] = useState(false);

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

  const initialHomeBookmakers = sortedHomeBookmakers.slice(0, 3);
  const remainingHomeBookmakers = sortedHomeBookmakers.slice(3);
  const initialAwayBookmakers = sortedAwayBookmakers.slice(0, 3);
  const remainingAwayBookmakers = sortedAwayBookmakers.slice(3);

  return (
    <Card className="bg-white">
      <CardHeader className="p-4 border-b">
        <div className="flex flex-col space-y-1">
          <CardTitle className="text-base font-medium">
            {match.home_team} vs {match.away_team}
          </CardTitle>
          <span className="text-sm text-gray-500">{startTime}</span>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Home Team Column */}
          <div>
            <div className="mb-2 font-medium text-sm text-gray-600">{match.home_team}</div>
            <div className="space-y-2">
              {initialHomeBookmakers.map((bookmaker) => {
                const odds = bookmaker.markets[0]?.outcomes.find(
                  o => o.name === match.home_team
                )?.price;

                // Kontrollera om länkar finns
                const link = bookmaker.links ? bookmaker.links[0]?.url : null;

                return odds ? (
                  <div key={bookmaker.key} className="flex justify-between items-center text-sm">
                    {link ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-24 truncate text-gray-700 hover:text-blue-500 font-medium"
                        title={`Go to ${bookmaker.title}`}
                      >
                        {bookmaker.title || 'Unknown Bookmaker'}
                      </a>
                    ) : (
                      <span className="w-24 truncate text-gray-500" title="URL not available">
                        {bookmaker.title || 'Unknown Bookmaker'}
                      </span>
                    )}
                    <OddsDisplay odds={odds} allOdds={homeOdds} />
                  </div>
                ) : null;
              })}

              {showMore && remainingHomeBookmakers.map((bookmaker) => {
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
                        className="w-24 truncate text-gray-700 hover:text-blue-500 font-medium"
                        title={`Go to ${bookmaker.title}`}
                      >
                        {bookmaker.title || 'Unknown Bookmaker'}
                      </a>
                    ) : (
                      <span className="w-24 truncate text-gray-500" title="URL not available">
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
            <div className="mb-2 font-medium text-sm text-gray-600">{match.away_team}</div>
            <div className="space-y-2">
              {initialAwayBookmakers.map((bookmaker) => {
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
                        className="w-24 truncate text-gray-700 hover:text-blue-500 font-medium"
                        title={`Go to ${bookmaker.title}`}
                      >
                        {bookmaker.title || 'Unknown Bookmaker'}
                      </a>
                    ) : (
                      <span className="w-24 truncate text-gray-500" title="URL not available">
                        {bookmaker.title || 'Unknown Bookmaker'}
                      </span>
                    )}
                    <OddsDisplay odds={odds} allOdds={awayOdds} />
                  </div>
                ) : null;
              })}

              {showMore && remainingAwayBookmakers.map((bookmaker) => {
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
                        className="w-24 truncate text-gray-700 hover:text-blue-500 font-medium"
                        title={`Go to ${bookmaker.title}`}
                      >
                        {bookmaker.title || 'Unknown Bookmaker'}
                      </a>
                    ) : (
                      <span className="w-24 truncate text-gray-500" title="URL not available">
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

        {(remainingHomeBookmakers.length > 0 || remainingAwayBookmakers.length > 0) && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            {showMore ? <span>Show Less ▲</span> : <span>Show More ▼</span>}
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchCard;
