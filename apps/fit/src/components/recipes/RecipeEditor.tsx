'use client';

import { useState } from 'react';
import { Plus, Trash2, Save, X, GripVertical } from 'lucide-react';
import type { CreateRecipeInput, RecipeIngredient, NutritionInfo } from '@ainexsuite/types';

interface RecipeEditorProps {
  onSave: (recipe: Omit<CreateRecipeInput, 'ownerId'>) => Promise<void>;
  onCancel: () => void;
}

interface IngredientInput {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

export function RecipeEditor({ onSave, onCancel }: RecipeEditorProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState('4');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { id: crypto.randomUUID(), name: '', amount: '', unit: '' },
  ]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [tags, setTags] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [mealType, setMealType] = useState('');

  // Nutrition (optional)
  const [showNutrition, setShowNutrition] = useState(false);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: '', amount: '', unit: '' },
    ]);
  };

  const updateIngredient = (id: string, field: keyof IngredientInput, value: string) => {
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing))
    );
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  const addInstruction = () => {
    setInstructions((prev) => [...prev, '']);
  };

  const updateInstruction = (index: number, value: string) => {
    setInstructions((prev) => prev.map((inst, i) => (i === index ? value : inst)));
  };

  const removeInstruction = (index: number) => {
    setInstructions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a recipe name');
      return;
    }

    const validIngredients = ingredients.filter((ing) => ing.name.trim());
    if (validIngredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }

    const validInstructions = instructions.filter((inst) => inst.trim());
    if (validInstructions.length === 0) {
      setError('Please add at least one instruction');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const recipeIngredients: RecipeIngredient[] = validIngredients.map((ing) => ({
        id: ing.id,
        name: ing.name.trim(),
        amount: parseFloat(ing.amount) || 1,
        unit: ing.unit.trim() || 'unit',
      }));

      let nutrition: NutritionInfo | undefined;
      if (showNutrition && (calories || protein || carbs || fat)) {
        nutrition = {
          calories: parseFloat(calories) || 0,
          protein: parseFloat(protein) || 0,
          carbs: parseFloat(carbs) || 0,
          fat: parseFloat(fat) || 0,
        };
      }

      const recipe: Omit<CreateRecipeInput, 'ownerId'> = {
        name: name.trim(),
        description: description.trim() || undefined,
        source: 'custom',
        servings: parseInt(servings) || 4,
        prepTime: prepTime ? parseInt(prepTime) : undefined,
        cookTime: cookTime ? parseInt(cookTime) : undefined,
        totalTime:
          prepTime || cookTime
            ? (parseInt(prepTime) || 0) + (parseInt(cookTime) || 0)
            : undefined,
        ingredients: recipeIngredients,
        instructions: validInstructions.map((inst) => inst.trim()),
        nutrition,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        cuisine: cuisine || undefined,
        mealType: mealType || undefined,
        isFavorite: false,
      };

      await onSave(recipe);
    } catch (err) {
      setError('Failed to save recipe');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const unitOptions = ['g', 'kg', 'ml', 'L', 'oz', 'lb', 'cup', 'tbsp', 'tsp', 'piece', 'clove', 'slice'];

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">
          Recipe Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Grilled Chicken Salad"
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of your recipe..."
          rows={2}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))] resize-none"
        />
      </div>

      {/* Time & Servings */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Servings
          </label>
          <input
            type="number"
            min="1"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Prep Time (min)
          </label>
          <input
            type="number"
            min="0"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
            placeholder="15"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Cook Time (min)
          </label>
          <input
            type="number"
            min="0"
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value)}
            placeholder="30"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Cuisine
          </label>
          <input
            type="text"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            placeholder="e.g., Italian, Mexican"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Meal Type
          </label>
          <input
            type="text"
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            placeholder="e.g., Breakfast, Dinner"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., healthy, quick, meal-prep"
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
        />
      </div>

      {/* Ingredients */}
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">
          Ingredients <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {ingredients.map((ing) => (
            <div key={ing.id} className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
              <input
                type="number"
                min="0"
                step="0.25"
                value={ing.amount}
                onChange={(e) => updateIngredient(ing.id, 'amount', e.target.value)}
                placeholder="1"
                className="w-20 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
              />
              <select
                value={ing.unit}
                onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)}
                className="w-24 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
              >
                <option value="">unit</option>
                {unitOptions.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={ing.name}
                onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                placeholder="Ingredient name"
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))]"
              />
              {ingredients.length > 1 && (
                <button
                  onClick={() => removeIngredient(ing.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addIngredient}
          className="mt-2 flex items-center gap-1 text-sm text-[hsl(var(--app-primary))] hover:underline"
        >
          <Plus className="w-4 h-4" />
          Add ingredient
        </button>
      </div>

      {/* Instructions */}
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">
          Instructions <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {instructions.map((inst, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-medium text-muted-foreground mt-2">
                {index + 1}
              </span>
              <textarea
                value={inst}
                onChange={(e) => updateInstruction(index, e.target.value)}
                placeholder="Describe this step..."
                rows={2}
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))] resize-none"
              />
              {instructions.length > 1 && (
                <button
                  onClick={() => removeInstruction(index)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded mt-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addInstruction}
          className="mt-2 flex items-center gap-1 text-sm text-[hsl(var(--app-primary))] hover:underline"
        >
          <Plus className="w-4 h-4" />
          Add step
        </button>
      </div>

      {/* Nutrition (optional) */}
      <div>
        <button
          onClick={() => setShowNutrition(!showNutrition)}
          className="text-sm text-[hsl(var(--app-primary))] hover:underline"
        >
          {showNutrition ? 'Hide' : 'Add'} nutrition info (optional)
        </button>

        {showNutrition && (
          <div className="mt-3 p-4 bg-foreground/5 rounded-xl">
            <p className="text-xs text-muted-foreground mb-3">Per serving</p>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Calories
                </label>
                <input
                  type="number"
                  min="0"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  min="0"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  min="0"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Fat (g)
                </label>
                <input
                  type="number"
                  min="0"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-foreground/5 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[hsl(var(--app-primary))] text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Recipe'}
        </button>
      </div>
    </div>
  );
}
