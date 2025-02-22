import { create } from 'zustand';
import { Recipe } from '../types';

interface RecipeStore {
  recipe: Recipe | null;
  setRecipe: (recipe: Recipe) => void;
}

export const useRecipeStore = create<RecipeStore>((set) => ({
  recipe: null,
  setRecipe: (recipe) => set({ recipe }),
}));