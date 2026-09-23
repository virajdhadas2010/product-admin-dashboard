'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Product } from '@/types/product';
import { productService } from '@/services/product.service';
import { useProductMutations } from '@/context/ProductMutationContext';
import { DashboardUrlParams } from './useUrlParams';

interface UseProductsResult {
  products: Product[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => void;
}

export function useProducts(params: DashboardUrlParams): UseProductsResult {
  const [serverProducts, setServerProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keep a reference to the latest request ID to prevent race conditions
  // When user types fast, or if an old request resolves with delay, it is ignored
  const latestRequestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { applyMutations, createdProducts } = useProductMutations();

  const fetchProducts = useCallback(async () => {
    // Increment request sequence ID
    const currentRequestId = ++latestRequestIdRef.current;

    // Abort previous in-flight request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const skip = (params.page - 1) * params.limit;

      const data = await productService.getProducts(
        {
          limit: params.limit,
          skip,
          search: params.search,
          category: params.category,
          sortBy: params.sortBy,
          order: params.order,
        },
        {
          signal: abortControllerRef.current.signal,
        }
      );

      // Check if this response belongs to the latest request
      if (currentRequestId === latestRequestIdRef.current) {
        setServerProducts(data.products);
        setTotal(data.total);
        setIsLoading(false);
      }
    } catch (err: unknown) {
      // Don't treat aborted requests as UI errors
      if (axios.isCancel(err)) {
        return;
      }

      if (currentRequestId === latestRequestIdRef.current) {
        console.error('Failed to fetch products:', err);
        setIsError(true);
        setErrorMessage('Failed to load products. Please check your connection and try again.');
        setIsLoading(false);
      }
    }
  }, [params.page, params.limit, params.search, params.category, params.sortBy, params.order]);

  useEffect(() => {
    fetchProducts();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  // Apply optimistic mutation overlay to products
  // Also on page 1 with no search/category or matching criteria, prepend created products
  const transformedProducts = applyMutations(serverProducts);

  // If on page 1 and no search query filter is excluding them, include matching newly created items
  let finalProducts = transformedProducts;
  if (params.page === 1 && createdProducts.length > 0) {
    const matchingCreated = createdProducts.filter((p) => {
      const matchesSearch =
        !params.search ||
        p.title.toLowerCase().includes(params.search.toLowerCase()) ||
        p.description?.toLowerCase().includes(params.search.toLowerCase());
      const matchesCat = !params.category || p.category === params.category;
      return matchesSearch && matchesCat;
    });

    // Deduplicate against server results
    const existingIds = new Set(transformedProducts.map((p) => p.id));
    const newItems = matchingCreated.filter((p) => !existingIds.has(p.id));
    finalProducts = [...newItems, ...transformedProducts];
  }

  return {
    products: finalProducts,
    total: total + (params.page === 1 ? createdProducts.length : 0),
    isLoading,
    isError,
    errorMessage,
    refetch: fetchProducts,
  };
}
