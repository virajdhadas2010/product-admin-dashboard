'use client';

import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface ProductSearchProps {
  initialValue: string;
  onSearchChange: (query: string) => void;
  isLoading?: boolean;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  initialValue,
  onSearchChange,
  isLoading = false,
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const debouncedValue = useDebounce(inputValue, 450);

  // Synchronize local input if URL changes externally (e.g. back/forward navigation)
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  // Trigger search update when user finishes typing
  useEffect(() => {
    if (debouncedValue !== initialValue) {
      onSearchChange(debouncedValue);
    }
  }, [debouncedValue, initialValue, onSearchChange]);

  const handleClear = () => {
    setInputValue('');
    onSearchChange('');
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>

      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search products by title, brand, description..."
        className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm placeholder-slate-400 text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
      />

      <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
        {isLoading && (
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        )}

        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
