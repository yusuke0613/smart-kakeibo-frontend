import { MajorCategory } from "../types";

export async function fetchCategories(
  userId: string
): Promise<MajorCategory[]> {
  try {
    console.log("カテゴリー取得開始:", userId);
    const response = await fetch(
      `http://127.0.0.1:8000/api/v1/categories/user/${userId}/all`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("カテゴリー取得エラー:", response.status, errorText);
      throw new Error(`カテゴリー取得エラー: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("カテゴリー取得成功:", data.length, "件");
    return data;
  } catch (error) {
    console.error("カテゴリー取得例外:", error);
    return []; // エラー時は空の配列を返す
  }
}
