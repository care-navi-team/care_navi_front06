import { supabase } from './supabase';
import { Product, ProductCategory } from '../types';

interface GetProductsOptions {
  category?: ProductCategory;
  searchQuery?: string;
  keywords?: string[];
  limit?: number;
}

/**
 * Get all active products with optional filters
 */
export async function getProducts(options?: GetProductsOptions): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true);

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  if (options?.keywords && options.keywords.length > 0) {
    // Filter by condition keywords (array contains)
    query = query.contains('condition_keywords', options.keywords);
  }

  // Order by created_at desc
  query = query.order('created_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Client-side search if searchQuery provided
  let products = (data || []) as Product[];
  if (options?.searchQuery) {
    const searchLower = options.searchQuery.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
    );
  }

  return products;
}

/**
 * Get product by ID
 */
export async function getProductById(productId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error || !data) return null;
  return data as Product;
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  return getProducts({ category });
}

/**
 * Search products by keyword
 */
export async function searchProducts(query: string): Promise<Product[]> {
  return getProducts({ searchQuery: query });
}

/**
 * Get recommended products based on condition keywords
 */
export async function getRecommendedProducts(keywords: string[], limit = 5): Promise<Product[]> {
  return getProducts({ keywords, limit });
}

/**
 * Get all product categories with counts
 */
export async function getCategoryCounts(): Promise<Record<ProductCategory, number>> {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('is_active', true);

  if (error || !data) {
    return {
      supplements: 0,
      wellness: 0,
      food: 0,
      accessories: 0,
    };
  }

  const counts: Record<ProductCategory, number> = {
    supplements: 0,
    wellness: 0,
    food: 0,
    accessories: 0,
  };

  data.forEach((item) => {
    const cat = item.category as ProductCategory;
    if (counts[cat] !== undefined) {
      counts[cat]++;
    }
  });

  return counts;
}
