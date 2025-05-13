import React, { useState, useEffect } from "react";
import MatchCard from "./components/MatchCard";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Info } from "lucide-react";
import logo from "./assets/odds.png";
import Masonry from "react-masonry-css";

const App = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedMatchId, setExpandedMatchId] = useState(null);

  const toggleExpandedMatch = (matchId) => {
    setExpandedMatchId((prevId) => (prevId === matchId ? null : matchId));
  };

  useEffect(() => {
    const fetchOdds = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/odds");
        if (!response.ok) throw new Error("Failed to fetch NHL odds");

        const data = await response.json();
        const sorted = data.sort(
          (a, b) => new Date(a.commence_time) - new Date(b.commence_time)
        );
        setMatches(sorted);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching NHL odds:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOdds();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900 text-white">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <Alert variant="destructive" className="m-4">
          <AlertDescription>Error loading odds: {error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-slate-900 flex flex-col items-center justify-center pt-4 pb-4 space-y-1">
        <img src={logo} alt="Logo" className="h-14 md:h-16 object-contain" />
        <h1 className="text-2xl md:text-3xl font-extrabold text-cyan-300">
          NHL Odds
        </h1>
        <div className="text-sm text-slate-400 italic flex items-center gap-1">
          <Info size={14} />
          Highlighted odds indicate significant deviation
        </div>
      </div>

      {/* Match Cards */}
      <div className="min-h-screen bg-slate-900 text-white flex justify-center items-start px-4">
        <div className="max-w-7xl w-full mx-auto px-6 pt-2 pb-8">
          <Masonry
            breakpointCols={{ default: 3, 1024: 2, 640: 1 }}
            className="flex gap-6"
            columnClassName="space-y-6"
          >
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                isExpanded={expandedMatchId === match.id}
                onToggle={() => toggleExpandedMatch(match.id)}
              />
            ))}
          </Masonry>
        </div>
      </div>
    </>
  );
};

export default App;
