/**
 * TypeScript interfaces for Bar Assistant API integration
 */

// Core cocktail data structures
export interface Cocktail {
  id: number;
  name: string;
  slug: string;
  description?: string;
  source?: string;
  garnish?: string;
  color?: string;
  abv?: number;
  created_at: string;
  updated_at: string;
  short_ingredients: CocktailIngredient[];
  tags: Tag[];
  glass?: Glass;
  method?: CocktailMethod;
  images: CocktailImage[];
  user_rating?: UserRating;
  average_rating?: number;
  total_ratings?: number;
  public_id?: string;
  main_image_id?: number;
  created_user?: User;
}

export interface CocktailIngredient {
  id: number;
  name: string;
  slug: string;
  strength?: number;
  color?: string;
  description?: string;
  origin?: string;
  category?: IngredientCategory;
  parent_ingredient_id?: number;
  ingredient_category_id?: number;
  complex_ingredient_part_of?: ComplexIngredient[];
  main_image_id?: number;
  images: IngredientImage[];
  cocktail_ingredient_substitutes: IngredientSubstitute[];
  pivot: {
    id: number;
    cocktail_id: number;
    ingredient_id: number;
    amount: number;
    amount_max?: number;
    units: string;
    optional: boolean;
    sort: number;
    note?: string;
  };
}

export interface IngredientCategory {
  id: number;
  name: string;
  description?: string;
}

export interface ComplexIngredient {
  id: number;
  ingredient_id: number;
  parent_ingredient_id: number;
  amount: number;
  amount_max?: number;
  units: string;
  sort: number;
  optional: boolean;
}

export interface IngredientImage {
  id: number;
  file_path: string;
  file_extension: string;
  sort: number;
  placeholder_hash?: string;
  created_at: string;
}

export interface IngredientSubstitute {
  id: number;
  ingredient_id: number;
  ingredient_substitute_id: number;
  amount_multiplier?: number;
  description?: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Glass {
  id: number;
  name: string;
  description?: string;
  volume?: number;
}

export interface CocktailMethod {
  id: number;
  name: string;
  dilution_percentage?: number;
}

export interface CocktailImage {
  id: number;
  file_path: string;
  file_extension: string;
  sort: number;
  placeholder_hash?: string;
  created_at: string;
}

export interface UserRating {
  id: number;
  rating: number;
  note?: string;
  user_id: number;
}

export interface User {
  id: number;
  name: string;
  email?: string;
}

// API Response structures
export interface CocktailSearchResult {
  data: Cocktail[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface PaginationLinks {
  first: string;
  last: string;
  prev?: string;
  next?: string;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  links: PaginationLink[];
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginationLink {
  url?: string;
  label: string;
  active: boolean;
}

export interface DetailedRecipe extends Cocktail {
  instructions: Instruction[];
  ingredients: CocktailIngredient[];
}

export interface Instruction {
  id: number;
  cocktail_id: number;
  sort: number;
  content: string;
}

// Inventory and shopping list structures
export interface BarIngredient {
  id: number;
  ingredient_id: number;
  bar_id: number;
  amount?: number;
  amount_max?: number;
  units?: string;
  price?: number;
  price_per_amount?: number;
  note?: string;
  ingredient: CocktailIngredient;
}

export interface InventoryStatus {
  available_ingredients: BarIngredient[];
  missing_ingredients: any[]; // Simplified structure for missing ingredients
  can_make_cocktails: number[];
}

export interface ShoppingListItem {
  ingredient: CocktailIngredient;
  needed_amount: number;
  units: string;
  estimated_price?: number;
  cocktails_requiring: number[];
}

export interface ShoppingList {
  items: ShoppingListItem[];
  total_estimated_cost?: number;
  cocktails_count: number;
}

// MCP Tool parameter interfaces
export interface SearchCocktailsParams {
  query?: string;
  ingredient?: string;
  base_spirit?: string;
  abv_min?: number;
  abv_max?: number;
  can_make?: boolean;
  limit?: number;
  page?: number;
}

export interface SmartSearchCocktailsParams {
  query?: string;
  similar_to?: string;
  similar_to_id?: number;
  ingredient?: string;
  must_include?: string[];
  must_exclude?: string[];
  preferred_flavors?: string[];
  preferred_strength?: 'light' | 'medium' | 'strong';
  abv_min?: number;
  abv_max?: number;
  glass_type?: string;
  preparation_method?: string;
  limit?: number;
}

export interface GetRecipeParams {
  cocktail_name?: string;
  cocktail_id?: number;
  cocktail_ids?: number[];
  cocktail_names?: string[];
  include_variations?: boolean;
  limit?: number;
}

export interface SimilarCocktailsParams {
  cocktail_id: number;
  limit?: number;
}

export interface InventoryCheckParams {
  ingredient_names?: string[];
}

export interface ShoppingListParams {
  cocktail_ids: number[];
}

export interface TasteRecommendationsParams {
  preferences?: string[];
  preferred_flavors?: string[];
  preferred_strength?: 'light' | 'medium' | 'strong';
  preferred_style?: string;
  exclude_spirits?: string[];
  disliked_ingredients?: string[];
  limit?: number;
}

export interface FilterCocktailsParams {
  tags?: string[];
  method?: string;
  glass?: string;
  glass_type?: string;
  preparation_method?: string;
  must_include?: string[];
  must_exclude?: string[];
  abv_range?: [number, number];
  rating_min?: number;
  difficulty?: string;
  limit?: number;
}

// API Error responses
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Bar Assistant API client configuration
export interface BarAssistantConfig {
  baseUrl: string;
  token: string;
  barId?: string;
  timeout?: number;
}

// Recommendation and similarity structures
export interface SimilarCocktail {
  cocktail: Cocktail;
  similarity_score?: number;
  similarity_reasons?: string[];
}

// Collection and user preference structures
export interface CocktailCollection {
  id: number;
  name: string;
  description?: string;
  cocktails: Cocktail[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}