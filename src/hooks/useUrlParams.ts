'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export interface DashboardUrlParams {
  page: number;
  limit: number;
  search: string;
  category: string;
  sortBy: string;
  order: 'asc' | 'desc';
}

export function useUrlParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Safely parse and sanitize URL parameters
  const params: DashboardUrlParams = useMemo(() => {
    // 1. Sanitize page: must be a positive integer, fallback to 1
    const rawPage = searchParams.get('page');
    let page = 1;
    if (rawPage) {
      const parsed = parseInt(rawPage, 10);
      if (!isNaN(parsed) && parsed > 0) {
        page = parsed;
      }
    }

    // 2. Sanitize limit: allowed values are 10, 20, 50 (fallback to 10)
    const rawLimit = searchParams.get('limit');
    let limit = 10;
    if (rawLimit) {
      const parsed = parseInt(rawLimit, 10);
      if ([10, 20, 50].includes(parsed)) {
        limit = parsed;
      }
    }

    // 3. Search query
    const search = searchParams.get('search') || '';

    // 4. Category
    const category = searchParams.get('category') || '';

    // 5. SortBy
    const rawSort = searchParams.get('sortBy') || '';
    const validSorts = ['price', 'rating', 'title'];
    const sortBy = validSorts.includes(rawSort) ? rawSort : '';

    // 6. Order
    const rawOrder = searchParams.get('order');
    const order: 'asc' | 'desc' = rawOrder === 'desc' ? 'desc' : 'asc';

    return {
      page,
      limit,
      search,
      category,
      sortBy,
      order,
    };
  }, [searchParams]);

  // Update query params in the URL without a full page reload
  const updateUrlParams = useCallback(
    (newParams: Partial<DashboardUrlParams>, resetPage: boolean = false) => {
      const current = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || (key === 'page' && value === 1)) {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      if (resetPage) {
        current.delete('page');
      }

      const queryString = current.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(targetUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return {
    params,
    updateUrlParams,
  };
}
