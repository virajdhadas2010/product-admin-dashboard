'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { productService } from '@/services/product.service';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  ArrowLeft,
  CheckCircle2,
  Package,
  ShieldCheck,
  Star,
  Truck,
  RotateCcw,
  Tag,
  Share2,
} from 'lucide-react';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const unwrappedParams = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const data = await productService.getProductById(unwrappedParams.id);
        if (isMounted) {
          setProduct(data);
          setActiveImage(data.thumbnail || data.images?.[0] || '');
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setIsNotFound(true);
          setIsLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [unwrappedParams.id]);

  if (isNotFound) {
    return notFound();
  }

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/products">
            <button className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Products</span>
            </button>
          </Link>
          <span className="text-xs text-slate-400">Product #{unwrappedParams.id}</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Skeleton className="w-full aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-1/2" />
            </div>
          </div>
        ) : product ? (
          <div className="space-y-8">
            {/* Top Grid: Gallery & Main Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              {/* Image Gallery Column (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                  <img
                    src={activeImage}
                    alt={product.title}
                    className="w-full h-full object-contain p-4 transition-all duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://dummyjson.com/image/400x400?text=No+Preview';
                    }}
                  />
                  {product.discountPercentage && (
                    <span className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white shadow-md">
                      -{Math.round(product.discountPercentage)}% OFF
                    </span>
                  )}
                </div>

                {/* Thumbnails list */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto pb-2">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 bg-slate-50 dark:bg-slate-800 shrink-0 cursor-pointer transition-all ${
                          activeImage === img
                            ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info Column (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 capitalize">
                      {product.category}
                    </span>
                    {product.brand && (
                      <span className="text-xs text-slate-500 font-medium">
                        by <strong className="text-slate-700 dark:text-slate-300">{product.brand}</strong>
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {product.title}
                  </h1>

                  {/* Rating & SKU */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{product.rating?.toFixed(1) || '0.0'}</span>
                      <span className="text-slate-400 font-normal">
                        ({product.reviews?.length || 0} reviews)
                      </span>
                    </div>

                    {product.sku && (
                      <span className="text-xs text-slate-400 font-mono">
                        SKU: {product.sku}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mt-5 flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                      ${product.price?.toFixed(2)}
                    </span>
                    {product.discountPercentage && (
                      <span className="text-base text-slate-400 line-through">
                        $
                        {(
                          product.price /
                          (1 - product.discountPercentage / 100)
                        ).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Stock info */}
                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md ${
                        product.stock > 0
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          product.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      {product.stock > 0 ? `In Stock (${product.stock} units available)` : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Description
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Badges / Guarantees */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{product.warrantyInformation || '1-Year Standard Warranty'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{product.shippingInformation || 'Standard Free Shipping'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <RotateCcw className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{product.returnPolicy || '30 Days Money Back'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                Customer Reviews ({product.reviews?.length || 0})
              </h2>

              {product.reviews && product.reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.reviews.map((rev, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          {rev.reviewerName}
                        </span>
                        <div className="flex items-center text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rev.rating ? 'fill-amber-400' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                        &quot;{rev.comment}&quot;
                      </p>
                      <span className="block mt-2 text-[10px] text-slate-400">
                        {new Date(rev.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No customer reviews yet for this product.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </AuthGuard>
  );
}
