export interface Transaction {
  transaction_id: number;
  user_id: number;
  type: "INCOME" | "EXPENSE";
  major_category_id: number;
  major_category_name: string;
  minor_category_id?: number;
  minor_category_name?: string;
  amount: number;
  description?: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface DailyTransactions {
  [date: string]: Transaction[];
}

// カテゴリータイプの定義（収入または支出）
export type TransactionType = "INCOME" | "EXPENSE";

// 小カテゴリーのインターフェース
export interface MinorCategory {
  minor_category_id: number;
  name: string;
}

// 大カテゴリーのインターフェース
export interface MajorCategory {
  major_category_id: number;
  name: string;
  type: "INCOME" | "EXPENSE" | "income" | "expense"; // APIからの応答に合わせて大文字小文字両方に対応
  is_fixed: boolean;
  minor_categories: MinorCategory[];
}
