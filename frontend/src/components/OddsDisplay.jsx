const Tooltip = ({ text, children }) => (
  <div className="relative group inline-flex">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] text-white bg-slate-700 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700" />
    </div>
  </div>
);

const OddsDisplay = ({ odds, allOdds }) => {
  if (!odds || !allOdds || allOdds.length === 0) {
    return <span className="text-sm text-slate-300">{odds?.toFixed(2) || "-"}</span>;
  }

  const avg = allOdds.reduce((s, v) => s + v, 0) / allOdds.length;
  const deviation = ((odds - avg) / avg) * 100;
  const isValue = deviation > 5;
  const isBad = deviation < -5;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-slate-200">
        {odds.toFixed(2)}
      </span>
      {isValue && (
        <Tooltip text={`${deviation.toFixed(1)}% above market average — potential value bet`}>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 cursor-default">
            +{deviation.toFixed(1)}%
          </span>
        </Tooltip>
      )}
      {isBad && (
        <Tooltip text={`${Math.abs(deviation).toFixed(1)}% below market average`}>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 cursor-default">
            {deviation.toFixed(1)}%
          </span>
        </Tooltip>
      )}
    </div>
  );
};

export default OddsDisplay;
