import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const CATEGORIES = [
  {
    key: "soccer",
    label: "Football",
    subs: [
      { key: "soccer_sweden_allsvenskan", label: "Allsvenskan" },
      { key: "soccer_epl", label: "Premier League" },
      { key: "soccer_spain_la_liga", label: "La Liga" },
      { key: "soccer_uefa_champs_league", label: "Champions League" },
    ],
  },
  {
    key: "hockey",
    label: "Ice Hockey",
    subs: [
      { key: "icehockey_nhl", label: "NHL" },
      { key: "icehockey_sweden_hockey_league", label: "SHL" },
    ],
  },
  {
    key: "tennis",
    label: "Tennis",
  },
  {
    key: "basketball_nba",
    label: "NBA",
  },
];

const SportSelector = ({ selected, onChange }) => {
  const [openSub, setOpenSub] = useState(null);

  const handleClick = (cat) => {
    if (cat.subs) {
      setOpenSub(openSub === cat.key ? null : cat.key);
    } else {
      onChange(cat.key);
      setOpenSub(null);
    }
  };

  const isActive = (cat) => {
    if (cat.subs) return cat.subs.some((s) => s.key === selected);
    return cat.key === selected;
  };

  return (
    <nav className="flex items-center gap-1">
      {CATEGORIES.map((cat) => (
        <div key={cat.key} className="relative">
          <button
            onClick={() => handleClick(cat)}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors ${
              isActive(cat)
                ? "text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {cat.label}
            {cat.subs && (
              <ChevronDown
                size={12}
                className={`transition-transform text-slate-500 ${openSub === cat.key ? "rotate-180" : ""}`}
              />
            )}
            {isActive(cat) && (
              <motion.div
                layoutId="nav-underline"
                className="absolute bottom-0 left-3 right-3 h-px bg-white"
              />
            )}
          </button>

          <AnimatePresence>
            {cat.subs && openSub === cat.key && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute top-full mt-2 left-0 z-20 bg-[#161f35] border border-slate-700/50 rounded-lg shadow-2xl overflow-hidden min-w-[160px]"
              >
                {cat.subs.map((sub) => (
                  <button
                    key={sub.key}
                    onClick={() => {
                      onChange(sub.key);
                      setOpenSub(null);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      selected === sub.key
                        ? "text-white bg-slate-700/50"
                        : "text-slate-400 hover:text-white hover:bg-slate-700/30"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </nav>
  );
};

export default SportSelector;
