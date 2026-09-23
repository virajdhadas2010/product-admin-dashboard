export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage?: number;
  rating: number;
  stock: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  reviews?: ProductReview[];
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  thumbnail: string;
  images: string[];
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface CategoryItem {
  slug: string;
  name: string;
  url: string;
}

export interface ProductQueryParams {
  limit?: number;
  skip?: number;
  page?: number;
  search?: string;
  category?: string;
  sortBy?: 'price' | 'rating' | 'title' | string;
  order?: 'asc' | 'desc';
}

export interface CreateProductInput {
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  rating?: number;
  brand?: string;
  thumbnail?: string;
  images?: string[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: number;
}
