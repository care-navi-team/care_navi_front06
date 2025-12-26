
import { supabase } from './supabase';
import { ProductRecommendation, ConditionAnalysis, Product } from '../types';
import { getRecommendedProducts } from './productService';

interface CreateRecommendationRequest {
  userId: string;
  conditionRecordId: string;
  analysis: ConditionAnalysis;
}

/**
 * Generate AI recommendations based on condition analysis
 */
export async function getRecommendationsForCondition(
  request: CreateRecommendationRequest
): Promise<ProductRecommendation[]> {
  const { userId, conditionRecordId, analysis } = request;

  // Get keywords from analysis
  const keywords = analysis.productKeywords || [];

  // Add keywords based on mood and physical state
  if (analysis.mood) {
    keywords.push(analysis.mood.toLowerCase());
  }
  if (analysis.physical) {
    keywords.push(analysis.physical.toLowerCase());
  }

  // Fetch matching products
  const products = await getRecommendedProducts(keywords, 5);

  if (products.length === 0) {
    return [];
  }

  // Create recommendation records
  const recommendations: Omit<ProductRecommendation, 'id' | 'created_at' | 'product'>[] = products.map(
    (product) => ({
      user_id: userId,
      condition_record_id: conditionRecordId,
      product_id: product.id,
      match_reason: generateMatchReason(product, analysis),
      is_clicked: false,
      clicked_at: null,
    })
  );

  // Insert recommendations to database
  const { data, error } = await supabase
    .from('product_recommendations')
    .insert(recommendations)
    .select(`
      *,
      product:products(*)
    `);

  if (error) {
    console.error('Failed to create recommendations:', error);
    return [];
  }

  return (data || []) as ProductRecommendation[];
}

/**
 * Generate a match reason based on product and condition
 */
function generateMatchReason(product: Product, analysis: ConditionAnalysis): string {
  const reasons: string[] = [];

  // Check for keyword matches
  const productKeywords = product.condition_keywords || [];
  const analysisKeywords = analysis.productKeywords || [];

  const matchingKeywords = productKeywords.filter((k) =>
    analysisKeywords.some((ak) => ak.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(ak.toLowerCase()))
  );

  if (analysis.mainIssue) {
    reasons.push(`${analysis.mainIssue}에 도움이 될 수 있어요`);
  } else if (matchingKeywords.length > 0) {
    reasons.push(`${matchingKeywords[0]} 관련 추천 상품이에요`);
  } else if (analysis.mood) {
    reasons.push(`${analysis.mood} 기분에 맞는 추천이에요`);
  } else {
    reasons.push('오늘 컨디션에 맞는 추천이에요');
  }

  return reasons[0];
}

/**
 * Track when user clicks a recommendation
 */
export async function trackRecommendationClick(
  recommendationId: string
): Promise<ProductRecommendation | null> {
  const { data, error } = await supabase
    .from('product_recommendations')
    .update({
      is_clicked: true,
      clicked_at: new Date().toISOString(),
    })
    .eq('id', recommendationId)
    .select(`
      *,
      product:products(*)
    `)
    .single();

  if (error) {
    console.error('Failed to track recommendation click:', error);
    return null;
  }

  return data as ProductRecommendation;
}

/**
 * Get today's recommendations for user
 */
export async function getTodayRecommendations(
  userId: string
): Promise<ProductRecommendation[]> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('product_recommendations')
    .select(`
      *,
      product:products(*)
    `)
    .eq('user_id', userId)
    .gte('created_at', `${today}T00:00:00`)
    .lt('created_at', `${today}T23:59:59`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch recommendations:', error);
    return [];
  }

  return (data || []) as ProductRecommendation[];
}
