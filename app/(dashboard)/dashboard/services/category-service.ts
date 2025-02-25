import { MajorCategory } from "../types";
import { API_BASE_URL } from "@/lib/constants";

export async function fetchCategories(
  userId: string
): Promise<MajorCategory[]> {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/v1/categories/user/${userId}/all`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}
