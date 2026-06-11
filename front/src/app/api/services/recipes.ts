import { api } from '../client';
import type { BackendRecipe } from '../types';

export async function listRecipes(params?: { status?: string; search?: string }): Promise<BackendRecipe[]> {
  return api.get<BackendRecipe[]>('/recipes', params);
}

export async function listMenuRecipes(): Promise<BackendRecipe[]> {
  return api.get<BackendRecipe[]>('/recipes/menu');
}

export async function getRecipe(recipeId: string): Promise<BackendRecipe> {
  return api.get<BackendRecipe>(`/recipes/${recipeId}`);
}

export async function getRecipeCost(recipeId: string): Promise<{ estimated_cost?: string }> {
  return api.get(`/recipes/${recipeId}/cost`);
}

export async function createRecipe(data: {
  name: string;
  description?: string;
  category_id?: string;
  preparation_time_minutes?: number;
  sale_price: number;
  created_by?: string;
  status?: string;
}): Promise<BackendRecipe> {
  return api.post<BackendRecipe>('/recipes', data);
}

export async function updateRecipe(
  recipeId: string,
  data: Partial<{
    name: string;
    description: string;
    preparation_time_minutes: number;
    sale_price: number;
    status: string;
    category_id: string;
  }>,
): Promise<BackendRecipe> {
  return api.patch<BackendRecipe>(`/recipes/${recipeId}`, data);
}

export async function replaceRecipeIngredients(
  recipeId: string,
  lines: Array<{ product_id: string; quantity: number }>,
): Promise<BackendRecipe['ingredients']> {
  return api.put(`/recipes/${recipeId}/ingredients`, { lines });
}
