'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { Edit2, Eye, Star, Trash2 } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

interface ProductCardGridProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductCardGrid: React.FC<ProductCardGridProps> = ({
  products,
  isLoading,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
          >
            <Skeleton className="w-full h-40 rounded-lg" />
            <Skeleton className="h-5 w-3/4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {products.map((product) => {
        const isLowStock = product.stock <= 5;
        const isOutOfStock = product.stock === 0;

        return (
          <div
            key={product.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col justify-between"
          >
            <div>
              {/* Product Thumbnail */}
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 border border-slate-100 dark:border-slate-800">
                <img
                  src={product.thumbnail || (product.images && product.images[0]) || ''}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://dummyjson.com/image/200x200?text=No+Img';
                  }}
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 shadow-sm capitalize backdrop-blur-sm">
                  {product.category}
                </span>

                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 dark:bg-slate-900/90 text-amber-600 shadow-sm backdrop-blur-sm">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{product.rating?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>

              {/* Title & Brand */}
              <Link href={`/products/${product.id}`}>
                <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-indigo-600 transition-colors">
                  {product.title}
                </h3>
              </Link>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {product.brand || 'Generic Brand'}
              </p>

              {/* Stock and Price details */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  ${product.price?.toFixed(2)}
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                    isOutOfStock
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                      : isLowStock
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                  }`}
                >
                  {isOutOfStock ? 'Out of stock' : `${product.stock} left`}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Link href={`/products/${product.id}`} className="flex-1">
                <button className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
              </Link>

              <button
                onClick={() => onEdit(product)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                title="Edit product"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDelete(product)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                title="Delete product"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
