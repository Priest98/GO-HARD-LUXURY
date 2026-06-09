export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Polos' | 'Denim' | 'Tees' | 'Accessories' | 'Footwear' | 'Eyewear' | 'Tracksuits';
  description: string;
  details: string[];
  sizes: string[];
  images: string[]; // SVGs or custom renders will be mapped based on IDs
  soldOut?: boolean;
  badge?: 'NEW ARRIVAL' | 'ARCHIVE PIECE' | '1of1' | 'BEST SELLER';
  quotes?: string;
  releaseDate: string;
  formerPrice?: number;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
}

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

export interface CouponCode {
  code: string;
  discountPercentage: number;
  description: string;
}
