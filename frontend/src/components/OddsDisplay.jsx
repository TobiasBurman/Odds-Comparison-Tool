import React from 'react';

const OddsDisplay = ({ odds, allOdds }) => {
  if (!odds || !allOdds || allOdds.length === 0) {
    return <span>{odds?.toFixed(2) || '-'}</span>;
  }

  const average = allOdds.reduce((sum, current) => sum + current, 0) / allOdds.length;
  const deviation = ((odds - average) / average) * 100;
  const isSignificant = Math.abs(deviation) > 5;

  return (
    <div className="flex items-center justify-between text-sm">
      <span>{odds.toFixed(2)}</span>
      {isSignificant && (
        <span className={`ml-2 ${deviation > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {deviation.toFixed(1)}%
        </span>
      )}
    </div>
  );
};

export default OddsDisplay;
