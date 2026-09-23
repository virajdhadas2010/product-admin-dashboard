'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useUrlParams } from '@/hooks/useUrlParams';
import { useProducts } from '@/hooks/useProducts';
import { useProductMutations } from '@/context/ProductMutationContext';
import { productService } from '@/services/product.service';
import { CategoryItem, CreateProductInput, Product } from '@/types/product';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ProductSearch } from '@/components/products/ProductSearch';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductCardGrid } from '@/components/products/ProductCardGrid';
import { ProductPagination } from '@/components/products/ProductPagination';
import { ProductModal } from '@/components/products/ProductModal';
import { DeleteConfirmModal } from '@/components/products/DeleteConfirmModal';
import { Toast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import {
  AlertCircle,
  FolderOpen,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
} from 'lucide-react';

function ProductsDashboardContent() {
  const { params, updateUrlParams } = useUrlParams();
  const { products, total, isLoading, isError, errorMessage, refetch } = useProducts(params);
  const { recordCreatedProduct, recordUpdatedProduct, recordDeletedProduct } = useProductMutations();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load categories for modals & filter reference
  useEffect(() => {
    productService.getCategories().then(setCategories).catch(console.error);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Search Handler: resets to page 1
  const handleSearchChange = (newSearch: string) => {
    updateUrlParams({ search: newSearch }, true);
  };

  // Category Handler: resets to page 1
  const handleCategoryChange = (newCategory: string) => {
    updateUrlParams({ category: newCategory }, true);
  };

  // Sort Handler
  const handleSortChange = (sortBy: string, order: 'asc' | 'desc') => {
    updateUrlParams({ sortBy, order });
  };

  // Reset all filters
  const handleResetFilters = () => {
    updateUrlParams({ search: '', category: '', sortBy: '', order: 'asc' }, true);
  };

  // Pagination Handlers
  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    updateUrlParams({ limit: newSize }, true);
  };

  // Add / Edit Handlers
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (formData: CreateProductInput) => {
    if (editingProduct) {
      // Edit existing product
      try {
        await productService.updateProduct(editingProduct.id, formData);
        recordUpdatedProduct(editingProduct.id, formData);
        showToast(`Product "${formData.title}" updated successfully!`);
      } catch (err) {
        // Even if server responds with error due to mock id, record locally
        recordUpdatedProduct(editingProduct.id, formData);
        showToast(`Product updated locally (mock API limitation)!`);
      }
    } else {
      // Create new product
      try {
        const res = await productService.addProduct(formData);
        recordCreatedProduct(formData, res.id);
        showToast(`Product "${formData.title}" created successfully!`);
      } catch (err) {
        recordCreatedProduct(formData);
        showToast(`Product created locally (mock API limitation)!`);
      }
    }
  };

  // Delete Handlers
  const handleOpenDeleteModal = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      setIsDeleting(true);
      await productService.deleteProduct(deletingProduct.id);
      recordDeletedProduct(deletingProduct.id);
      showToast(`Product "${deletingProduct.title}" deleted.`);
      setIsDeleteModalOpen(false);
      setDeletingProduct(null);
    } catch (err) {
      recordDeletedProduct(deletingProduct.id);
      showToast(`Product removed locally (mock API limitation).`);
      setIsDeleteModalOpen(false);
      setDeletingProduct(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const isFilteredSearchCombined = !!params.search && !!params.category;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
      )}

      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Products Catalog
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your store inventory, pricing, stock levels and categories
          </p>
        </div>

        <Button onClick={handleOpenAddModal} variant="primary" size="md">
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {/* API Explanation Banner if both Search and Category are active */}
      {isFilteredSearchCombined && (
        <div className="mt-4 p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 dark:bg-indigo-950/30 dark:border-indigo-800/80 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Combined Filter Active:</span> The DummyJSON API doesn&apos;t support simultaneous search and category filtering on the server. AdminPulse handles this seamlessly with intelligent client-side matching.
          </div>
        </div>
      )}

      {/* Search, Filters, and Controls Toolbar */}
      <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <ProductSearch
          initialValue={params.search}
          onSearchChange={handleSearchChange}
          isLoading={isLoading}
        />

        <ProductFilters
          category={params.category}
          sortBy={params.sortBy}
          order={params.order}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {/* Error State with Retry Button */}
        {isError && (
          <div className="p-8 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Failed to Load Products
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {errorMessage || 'There was a problem reaching the DummyJSON server.'}
            </p>
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && products.length === 0 && (
          <div className="p-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              No products found
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {params.search || params.category
                ? 'Try adjusting your search query or removing filters.'
                : 'There are no products to display right now.'}
            </p>
            {(params.search || params.category || params.sortBy) && (
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        )}

        {/* Data View: Desktop Table + Mobile Card Grid */}
        {(!isError && (isLoading || products.length > 0)) && (
          <div className="space-y-6">
            {/* Desktop Table: Hidden on small screens */}
            <div className="hidden md:block">
              <ProductTable
                products={products}
                isLoading={isLoading}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
              />
            </div>

            {/* Mobile Card Grid: Visible only on small screens */}
            <div className="block md:hidden">
              <ProductCardGrid
                products={products}
                isLoading={isLoading}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
              />
            </div>

            {/* Pagination Controls */}
            {!isLoading && products.length > 0 && (
              <ProductPagination
                currentPage={params.page}
                totalItems={total}
                pageSize={params.limit}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleSaveProduct}
        initialData={editingProduct}
        categories={categories}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        product={deletingProduct}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <ProductsDashboardContent />
      </Suspense>
    </AuthGuard>
  );
}
