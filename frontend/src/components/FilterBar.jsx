const FilterBar = ({ sortBy, onSortChange, filterBy, onFilterChange }) => {
  const sortOptions = [
    { key: "time", label: "Time" },
    { key: "value", label: "Value" },
  ];

  const filterOptions = [
    { key: "today", label: "Today" },
    { key: "week", label: "7 days" },
    { key: "all", label: "All" },
  ];

  const btnClass = (active) =>
    `px-3 py-1.5 text-xs font-medium rounded transition-colors ${
      active
        ? "bg-slate-700 text-white"
        : "text-slate-500 hover:text-slate-300"
    }`;

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-slate-600 mr-1">Sort</span>
      {sortOptions.map((opt) => (
        <button key={opt.key} onClick={() => onSortChange(opt.key)} className={btnClass(sortBy === opt.key)}>
          {opt.label}
        </button>
      ))}

      <div className="w-px h-4 bg-slate-700 mx-2" />

      <span className="text-xs text-slate-600 mr-1">Show</span>
      {filterOptions.map((opt) => (
        <button key={opt.key} onClick={() => onFilterChange(opt.key)} className={btnClass(filterBy === opt.key)}>
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
