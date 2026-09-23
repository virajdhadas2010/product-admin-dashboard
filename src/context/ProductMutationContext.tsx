'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CreateProductInput, Product } from '@/types/product';

interface ProductMutationContextType {
  createdProducts: Product[];
  updatedProducts: Record<number, Partial<Product>>;
  deletedProductIds: Set<number>;
  recordCreatedProduct: (input: CreateProductInput, id?: number) => Product;
  recordUpdatedProduct: (id: number, input: Partial<Product>) => void;
  recordDeletedProduct: (id: number) => void;
  applyMutations: (serverProducts: Product[]) => Product[];
}

const ProductMutationContext = createContext<ProductMutationContextType | undefined>(undefined);

const STORAGE_KEY = 'product_mutations_state';

export const ProductMutationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [createdProducts, setCreatedProducts] = useState<Product[]>([]);
  const [updatedProducts, setUpdatedProducts] = useState<Record<number, Partial<Product>>>({});
  const [deletedProductIds, setDeletedProductIds] = useState<Set<number>>(new Set());

  // Restore session mutations
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.createdProducts) setCreatedProducts(parsed.createdProducts);
        if (parsed.updatedProducts) setUpdatedProducts(parsed.updatedProducts);
        if (parsed.deletedProductIds) {
          setDeletedProductIds(new Set(parsed.deletedProductIds));
        }
      }
    } catch (e) {
      console.error('Error loading mutation overlay:', e);
    }
  }, []);

  // Save session mutations
  const saveState = (
    created: Product[],
    updated: Record<number, Partial<Product>>,
    deleted: Set<number>
  ) => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          createdProducts: created,
          updatedProducts: updated,
          deletedProductIds: Array.from(deleted),
        })
      );
    } catch (e) {
      console.error('Error persisting mutations:', e);
    }
  };

  const recordCreatedProduct = (input: CreateProductInput, serverAssignedId?: number): Product => {
    // Generate a temporary unique id if not provided by server
    const id = serverAssignedId || Date.now();
    const newProduct: Product = {
      id,
      title: input.title,
      description: input.description,
      category: input.category,
      price: input.price,
      stock: input.stock,
      rating: input.rating || 4.5,
      brand: input.brand || 'Generic',
      thumbnail: input.thumbnail || 'https://dummyjson.com/image/200x200?text=Product',
      images: input.images || [input.thumbnail || 'https://dummyjson.com/image/400x400?text=Product'],
    };

    const nextCreated = [newProduct, ...createdProducts];
    setCreatedProducts(nextCreated);
    saveState(nextCreated, updatedProducts, deletedProductIds);
    return newProduct;
  };

  const recordUpdatedProduct = (id: number, input: Partial<Product>) => {
    // If it's a locally created product, update it in createdProducts
    if (createdProducts.some((p) => p.id === id)) {
      const nextCreated = createdProducts.map((p) => (p.id === id ? { ...p, ...input } : p));
      setCreatedProducts(nextCreated);
      saveState(nextCreated, updatedProducts, deletedProductIds);
    } else {
      const nextUpdated = {
        ...updatedProducts,
        [id]: { ...(updatedProducts[id] || {}), ...input },
      };
      setUpdatedProducts(nextUpdated);
      saveState(createdProducts, nextUpdated, deletedProductIds);
    }
  };

  const recordDeletedProduct = (id: number) => {
    const nextCreated = createdProducts.filter((p) => p.id !== id);
    const nextDeleted = new Set(deletedProductIds);
    nextDeleted.add(id);

    setCreatedProducts(nextCreated);
    setDeletedProductIds(nextDeleted);
    saveState(nextCreated, updatedProducts, nextDeleted);
  };

  const applyMutations = (serverProducts: Product[]): Product[] => {
    // 1. Remove deleted items
    const filtered = serverProducts.filter((p) => !deletedProductIds.has(p.id));

    // 2. Apply updates
    const updated = filtered.map((p) => {
      if (updatedProducts[p.id]) {
        return { ...p, ...updatedProducts[p.id] };
      }
      return p;
    });

    // 3. For any locally created products that aren't in server results yet, prepend them if relevant
    return updated;
  };

  return (
    <ProductMutationContext.Provider
      value={{
        createdProducts,
        updatedProducts,
        deletedProductIds,
        recordCreatedProduct,
        recordUpdatedProduct,
        recordDeletedProduct,
        applyMutations,
      }}
    >
      {children}
    </ProductMutationContext.Provider>
  );
};

export const useProductMutations = () => {
  const context = useContext(ProductMutationContext);
  if (!context) {
    throw new Error('useProductMutations must be used within a ProductMutationProvider');
  }
  return context;
};
