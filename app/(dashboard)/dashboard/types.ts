export interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  memo: string;
  date: string; // "YYYY-MM-DD" 形式
  category_id?: string;
  sub_category_id?: string;
}

export interface DailyTransactions {
  [date: string]: Transaction[];
}

// カテゴリー名の変換用
export const categoryMap: { [key: string]: string } = {
  food: "食費",
  daily: "日用品",
  entertainment: "娯楽",
  transport: "交通費",
  utilities: "光熱費",
  salary: "給与",
  bonus: "賞与",
  other: "その他",
};

export function getCategoryName(category: string): string {
  return categoryMap[category] || category;
}

// 既存の型定義に追加
export interface SubCategory {
  id: string;
  name: string;
}

export interface MinorCategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color?: string;
  subcategories: SubCategory[];
  minor_categories: MinorCategory[];
}
