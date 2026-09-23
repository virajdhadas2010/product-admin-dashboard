'use client';

import React, { useEffect, useState } from 'react';
import { CreateProductInput, Product } from '@/types/product';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateProductInput) => Promise<void>;
  initialData?: Product | null;
  categories: { slug: string; name: string }[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [stock, setStock] = useState<number | string>('');
  const [brand, setBrand] = useState('');
  const [thumbnail, setThumbnail] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || '');
      setPrice(initialData.price ?? '');
      setStock(initialData.stock ?? '');
      setBrand(initialData.brand || '');
      setThumbnail(initialData.thumbnail || '');
    } else {
      setTitle('');
      setDescription('');
      setCategory(categories[0]?.slug || 'beauty');
      setPrice('');
      setStock('');
      setBrand('');
      setThumbnail('');
    }
    setErrors({});
  }, [initialData, isOpen, categories]);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!title.trim()) {
      errs.title = 'Product title is required';
    } else if (title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters';
    }

    if (!description.trim()) {
      errs.description = 'Description is required';
    }

    if (!category) {
      errs.category = 'Please choose a category';
    }

    const numPrice = Number(price);
    if (price === '' || isNaN(numPrice) || numPrice <= 0) {
      errs.price = 'Price must be greater than $0';
    }

    const numStock = Number(stock);
    if (stock === '' || isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      errs.stock = 'Stock must be a non-negative whole number';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return; // Guard against multiple simultaneous submits

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        price: Number(price),
        stock: Number(stock),
        brand: brand.trim() || undefined,
        thumbnail:
          thumbnail.trim() ||
          'https://dummyjson.com/image/300x300?text=' + encodeURIComponent(title.trim()),
      });
      onClose();
    } catch (err) {
      console.error('Error submitting form:', err);
      setErrors({ form: 'An unexpected error occurred while saving. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Product' : 'Add New Product'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 text-xs bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
            {errors.form}
          </div>
        )}

        {/* Title */}
        <Input
          label="Product Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Wireless Noise-Cancelling Headphones"
          error={errors.title}
          disabled={isSubmitting}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs text-rose-500">{errors.category}</p>}
          </div>

          {/* Brand */}
          <Input
            label="Brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. Sony"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Price */}
          <Input
            label="Price ($) *"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="29.99"
            error={errors.price}
            disabled={isSubmitting}
          />

          {/* Stock */}
          <Input
            label="Inventory / Stock *"
            type="number"
            step="1"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="50"
            error={errors.stock}
            disabled={isSubmitting}
          />
        </div>

        {/* Thumbnail URL */}
        <Input
          label="Thumbnail Image URL"
          type="url"
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
          placeholder="https://example.com/image.jpg (optional)"
          disabled={isSubmitting}
        />

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Description *
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of the product features..."
            disabled={isSubmitting}
            className={`w-full rounded-lg border bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.description
                ? 'border-rose-500 focus:ring-rose-500'
                : 'border-slate-300 dark:border-slate-700'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-rose-500">{errors.description}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {initialData ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
