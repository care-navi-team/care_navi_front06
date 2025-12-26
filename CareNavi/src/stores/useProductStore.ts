import { create } from 'zustand';
import { Product, ProductCategory } from '../types';
import {
  getProducts,
  getProductById,
  getRecommendedProducts,
} from '../services/productService';

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  selectedCategory: ProductCategory | null;
  searchQuery: string;
  recommendedProducts: Product[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  setSelectedCategory: (category: ProductCategory | null) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;

  // Async actions
  fetchProducts: (options?: {
    category?: ProductCategory;
    searchQuery?: string;
  }) => Promise<void>;
  fetchProductById: (productId: string) => Promise<Product | null>;
  fetchRecommendedProducts: (keywords: string[]) => Promise<void>;

  // Selectors
  getFilteredProducts: () => Product[];
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  selectedProduct: null,
  selectedCategory: null,
  searchQuery: '',
  recommendedProducts: [],
  isLoading: false,
  error: null,

  setProducts: (products) => set({ products }),
  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  clearFilters: () =>
    set({
      selectedCategory: null,
      searchQuery: '',
    }),

  fetchProducts: async (options) => {
    set({ isLoading: true, error: null });
    try {
      const products = await getProducts(options);
      set({ products, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch products',
        isLoading: false,
      });
    }
  },

  fetchProductById: async (productId) => {
    try {
      const product = await getProductById(productId);
      if (product) {
        set({ selectedProduct: product });
      }
      return product;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch product',
      });
      return null;
    }
  },

  fetchRecommendedProducts: async (keywords) => {
    try {
      const products = await getRecommendedProducts(keywords);
      set({ recommendedProducts: products });
    } catch (error) {
      console.warn('Failed to fetch recommended products:', error);
    }
  },

  getFilteredProducts: () => {
    const { products, selectedCategory, searchQuery } = get();
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  },
}));
