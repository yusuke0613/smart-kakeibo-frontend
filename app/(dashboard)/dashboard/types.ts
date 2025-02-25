export interface Transaction {
  transaction_id: number;
  amount: string;
  transaction_date: string;
  description: string;
  major_category_id: number;
  minor_category_id: number;
  user_id: number;
  type: TransactionType;
  created_at: string;
  updated_at: string;
  major_category_name: string;
  minor_category_name: string;
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
  type: TransactionType;
  is_fixed: boolean;
  minor_categories: MinorCategory[];
}
