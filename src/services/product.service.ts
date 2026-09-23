import apiClient from '@/lib/axios';
import {
  CategoryItem,
  CreateProductInput,
  Product,
  ProductQueryParams,
  ProductsResponse,
  UpdateProductInput,
} from '@/types/product';
import { AxiosRequestConfig } from 'axios';

export const productService = {
  /**
   * Fetch products with support for pagination, search, category, and sorting.
   * Note on DummyJSON limitation:
   * DummyJSON does not support simultaneous search (`/products/search?q=`) and category filtering (`/products/category/{cat}`).
   * When both are active, we fetch from `/products/category/{cat}` (or search) and apply in-memory matching.
   */
  async getProducts(
    params: ProductQueryParams,
    options?: AxiosRequestConfig
  ): Promise<ProductsResponse> {
    const { limit = 10, skip = 0, search, category, sortBy, order } = params;

    let endpoint = '/products';
    const queryParams: Record<string, string | number> = {
      limit,
      skip,
    };

    if (sortBy) {
      queryParams.sortBy = sortBy;
      queryParams.order = order || 'asc';
    }

    if (category && !search) {
      // Category filtering without search query
      endpoint = `/products/category/${encodeURIComponent(category)}`;
    } else if (search && !category) {
      // Search query without category filter
      endpoint = '/products/search';
      queryParams.q = search;
    } else if (search && category) {
      // Both category and search are selected:
      // We retrieve from the category endpoint and perform matching client-side or vice-versa
      // We fetch a larger limit to perform accurate client filtering across that category
      endpoint = `/products/category/${encodeURIComponent(category)}`;
      queryParams.limit = 100;
      queryParams.skip = 0;
    }

    const response = await apiClient.get<ProductsResponse>(endpoint, {
      ...options,
      params: queryParams,
    });

    // If both search and category were active, filter and paginate client-side
    if (search && category) {
      const qLower = search.toLowerCase();
      const allFiltered = response.data.products.filter(
        (p) =>
          p.title.toLowerCase().includes(qLower) ||
          p.description?.toLowerCase().includes(qLower) ||
          p.brand?.toLowerCase().includes(qLower)
      );

      // Apply sorting if specified
      if (sortBy) {
        allFiltered.sort((a, b) => {
          const rawA = (a as unknown as Record<string, unknown>)[sortBy];
          const rawB = (b as unknown as Record<string, unknown>)[sortBy];
          let valA: string | number = '';
          let valB: string | number = '';
          if (typeof rawA === 'string') valA = rawA.toLowerCase();
          else if (typeof rawA === 'number') valA = rawA;
          if (typeof rawB === 'string') valB = rawB.toLowerCase();
          else if (typeof rawB === 'number') valB = rawB;

          if (valA < valB) return order === 'desc' ? 1 : -1;
          if (valA > valB) return order === 'desc' ? -1 : 1;
          return 0;
        });
      }

      const total = allFiltered.length;
      const paginated = allFiltered.slice(skip, skip + limit);

      return {
        products: paginated,
        total,
        skip,
        limit,
      };
    }

    return response.data;
  },

  /**
   * Fetch single product by ID
   */
  async getProductById(id: string | number, options?: AxiosRequestConfig): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`, options);
    return response.data;
  },

  /**
   * Fetch categories list
   */
  async getCategories(options?: AxiosRequestConfig): Promise<CategoryItem[]> {
    const response = await apiClient.get<CategoryItem[] | string[]>('/products/categories', options);
    // DummyJSON can return either array of strings or array of { slug, name, url }
    if (Array.isArray(response.data) && response.data.length > 0) {
      if (typeof response.data[0] === 'string') {
        return (response.data as string[]).map((cat) => ({
          slug: cat,
          name: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' '),
          url: `/products/category/${cat}`,
        }));
      }
      return response.data as CategoryItem[];
    }
    return [];
  },

  /**
   * Add a new product (mocked on server)
   */
  async addProduct(input: CreateProductInput): Promise<Product> {
    const response = await apiClient.post<Product>('/products/add', input);
    return response.data;
  },

  /**
   * Update an existing product (mocked on server)
   */
  async updateProduct(id: number, input: Partial<CreateProductInput>): Promise<Product> {
    const response = await apiClient.put<Product>(`/products/${id}`, input);
    return response.data;
  },

  /**
   * Delete a product (mocked on server)
   */
  async deleteProduct(id: number): Promise<{ id: number; isDeleted: boolean; deletedOn: string }> {
    const response = await apiClient.delete<{ id: number; isDeleted: boolean; deletedOn: string }>(
      `/products/${id}`
    );
    return response.data;
  },
};
