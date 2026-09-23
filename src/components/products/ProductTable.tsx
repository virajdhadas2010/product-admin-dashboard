'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { Edit2, Eye, Star, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="p-4 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <th className="py-3 px-4">Product</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Price</th>
            <th className="py-3 px-4">Rating</th>
            <th className="py-3 px-4">Stock</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-sm">
          {products.map((product) => {
            const isLowStock = product.stock <= 5;
            const isOutOfStock = product.stock === 0;

            return (
              <tr
                key={product.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
              >
                {/* Product Image & Title */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.thumbnail || (product.images && product.images[0]) || ''}
                      alt={product.title}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/60 dark:border-slate-700/60"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://dummyjson.com/image/100x100?text=No+Img';
                      }}
                    />
                    <div className="min-w-0 max-w-[240px]">
                      <Link
                        href={`/products/${product.id}`}
                        className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block transition-colors"
                        title={product.title}
                      >
                        {product.title}
                      </Link>
                      {product.brand && (
                        <span className="text-xs text-slate-500 truncate block">
                          {product.brand}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3 px-4">
                  <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                    {product.category}
                  </span>
                </td>

                {/* Price */}
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                  ${product.price?.toFixed(2)}
                </td>

                {/* Rating */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                </td>

                {/* Stock */}
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold ${
                      isOutOfStock
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                        : isLowStock
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isOutOfStock
                          ? 'bg-rose-500'
                          : isLowStock
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    {isOutOfStock ? 'Out of stock' : `${product.stock} in stock`}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/products/${product.id}`}>
                      <button
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </Link>

                    <button
                      onClick={() => onEdit(product)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDelete(product)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
