'use client';

import { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  value?: string;
}

/**
 * SearchBar Component
 * 
 * Search input for filtering data
 */
export function SearchBar({
  placeholder = 'Search...',
  onSearch,
  value = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="flex items-center gap-4 bg-white border-2 border-[#E5E7EB] rounded-[1.25rem] p-3 transition-all focus-within:border-[#1F2937] group">
      <div className="w-8 h-8 bg-[#FAFAF8] rounded-lg flex items-center justify-center text-[#9CA3AF] transition-colors group-focus-within:bg-[#1F2937] group-focus-within:text-white">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        className="flex-1 bg-transparent border-none p-0 text-[11px] font-black uppercase tracking-widest focus:ring-0 focus:outline-none placeholder:text-[#9CA3AF] placeholder:font-bold"
      />
      {query && (
        <button
          onClick={handleClear}
          className="w-8 h-8 rounded-lg hover:bg-black/5 flex items-center justify-center text-[#9CA3AF] hover:text-[#1F2937] transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface FilterOption {
  value: string;
  label: string;
}

interface FilterPanelProps {
  filters: {
    [key: string]: {
      label: string;
      options: FilterOption[];
      selected: string[];
    };
  };
  onFilterChange: (filterKey: string, selected: string[]) => void;
  onClearAll: () => void;
}

/**
 * FilterPanel Component
 * 
 * Filter controls for data table
 */
export function FilterPanel({
  filters,
  onFilterChange,
  onClearAll,
}: FilterPanelProps) {
  const handleToggle = (filterKey: string, value: string) => {
    const current = filters[filterKey].selected;
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange(filterKey, updated);
  };

  const totalSelected = Object.values(filters).reduce(
    (sum, f) => sum + f.selected.length,
    0
  );

  return (
    <div className="space-y-8 bg-[#FAFAF8] p-8 rounded-[2rem] border-2 border-[#E5E7EB] shadow-[12px_12px_0px_0px_rgba(31,41,55,0.02)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-[#1F2937]" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#1F2937]">Filters</h2>
        </div>
        {totalSelected > 0 && (
          <button
            onClick={onClearAll}
            className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors px-3 py-1 bg-red-50 rounded-full border border-red-100"
          >
            Reset All
          </button>
        )}
      </div>

      <div className="space-y-8">
        {Object.entries(filters).map(([key, filter]) => (
          <div key={key} className="space-y-4">
            <h3 className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-[0.2em] border-l-2 border-[#1F2937] pl-3">
              {filter.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {filter.options.map((option) => {
                const isSelected = filter.selected.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => handleToggle(key, option.value)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                      isSelected 
                        ? 'bg-[#1F2937] border-[#1F2937] text-white shadow-lg transform -translate-y-0.5' 
                        : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#1F2937] hover:text-[#1F2937]'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
