'use client';

import React, { useEffect, useState } from 'react';
import { CategoryItem } from '@/types/product';
import { productService } from '@/services/product.service';
import { ArrowDownUp, Filter, Sparkles, X } from 'lucide-react';

interface ProductFiltersProps {
  category: string;
  sortBy: string;
  order: 'asc' | 'desc';
  onCategoryChange: (cat: string) => void;
  onSortChange: (sortBy: string, order: 'asc' | 'desc') => void;
  onReset: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  category,
  sortBy,
  order,
  onCategoryChange,
  onSortChange,
  onReset,
}) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    productService
      .getCategories()
      .then((data) => {
        if (isMounted) {
          setCategories(data);
          setIsLoadingCategories(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching categories:', err);
        if (isMounted) setIsLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const hasActiveFilters = !!category || !!sortBy;

  return (
    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
      {/* Category Dropdown */}
      <div className="relative min-w-[170px] flex-1 sm:flex-initial">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Filter className="w-3.5 h-3.5" />
        </div>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={isLoadingCategories}
          className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Sort Field Dropdown */}
      <div className="relative min-w-[150px] flex-1 sm:flex-initial">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <ArrowDownUp className="w-3.5 h-3.5" />
        </div>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value, order)}
          className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
        >
          <option value="">Default Sorting</option>
          <option value="price">Price</option>
          <option value="rating">Rating</option>
          <option value="title">Title</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Sort Direction Toggle Button (Only when sort is active) */}
      {sortBy && (
        <button
          type="button"
          onClick={() => onSortChange(sortBy, order === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          title={`Currently ${order.toUpperCase()}. Click to change`}
        >
          <span>{order === 'asc' ? 'Low → High' : 'High → Low'}</span>
        </button>
      )}

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 px-3 py-2.5 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold cursor-pointer transition-colors"
          title="Reset filters"
        >
          <X className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
};
