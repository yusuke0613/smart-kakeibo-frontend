import { Category } from "@/lib/contexts/category-context";

export async function fetchCategories(userId: string): Promise<Category[]> {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/v1/categories/user/${userId}/categories`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
