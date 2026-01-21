import { useMemo, useState, useEffect } from "react";

type Props = {
  categories: string[];
  selectedCategory: string;
  search: string;
  onChange: (next: { category: string; search: string }) => void;
  onIngest: () => void;
  ingestDisabled?: boolean;
};

export function FiltersBar({
  categories,
  selectedCategory,
  search,
  onChange,
  onIngest,
  ingestDisabled,
}: Props) {
  const [localSearch, setLocalSearch] = useState(search);

  const allCategories = useMemo(() => ["All", ...categories], [categories]);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white p-4">
      <select
        value={selectedCategory || "All"}
        onChange={(e) =>
          onChange({ category: e.target.value, search: localSearch })
        }
        className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-gray-200"
      >
        {allCategories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <input
        value={localSearch}
        onChange={(e) => {
          const next = e.target.value;
          setLocalSearch(next);
          onChange({ category: selectedCategory || "All", search: next });
        }}
        placeholder="Search by subject…"
        className="h-10 w-full min-w-[260px] flex-1 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 focus:ring-gray-200 sm:w-auto"
      />

      <div className="hidden flex-1 sm:block" />

      <button
        disabled={ingestDisabled}
        onClick={onIngest}
        className="h-10 min-w-[170px] rounded-xl border border-gray-900 bg-gray-900 px-4 text-sm font-medium text-white transition hover:bg-gray-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-500"
      >
        {ingestDisabled ? "Ingesting..." : "Ingest Mock Emails"}
      </button>
    </div>
  );
}
