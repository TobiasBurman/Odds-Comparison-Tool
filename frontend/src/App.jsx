import React, { useState, useEffect } from "react";
import MatchCard from "./components/MatchCard";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Info } from "lucide-react";

const App = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOdds = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/odds');
        if (!response.ok) throw new Error('Failed to fetch NHL odds');
        
        const data = await response.json();
        // Sortera matcher efter starttid
        const sortedMatches = data.sort((a, b) => 
          new Date(a.commence_time) - new Date(b.commence_time)
        );
        setMatches(sortedMatches);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching NHL odds:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOdds();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>Error loading odds: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center px-4">
      <div className="max-w-7xl w-full mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">NHL Odds</h1>
          <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
            <Info size={14} />
            Highlighted odds indicate significant deviation
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
