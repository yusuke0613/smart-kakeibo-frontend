import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 支出カテゴリーの定義
export const EXPENSE_CATEGORIES = {
  food: "食費",
  daily: "日用品",
  entertainment: "娯楽",
  transport: "交通費",
  utilities: "光熱費",
  others: "その他",
} as const;

// 支出分析の閾値
export const ANALYSIS_THRESHOLDS = {
  monthlyIncrease: 10, // 月次増加警告の閾値（%）
  categoryImbalance: 40, // カテゴリー偏り警告の閾値（%）
  savingsTarget: 20, // 推奨貯蓄率（%）
};

// AIアドバイスの生成
export function generateExpenseAdvice(
  currentMonth: number,
  previousMonth: number,
  categories: Record<string, number>
) {
  const monthlyChange = ((currentMonth - previousMonth) / previousMonth) * 100;
  const insights = [];

  // 月次変化の分析
  if (monthlyChange > ANALYSIS_THRESHOLDS.monthlyIncrease) {
    insights.push({
      type: "warning",
      message: `先月比で支出が${monthlyChange.toFixed(1)}%増加しています。`,
    });
  }

  // カテゴリーバランスの分析
  const total = Object.values(categories).reduce(
    (sum, value) => sum + value,
    0
  );
  Object.entries(categories).forEach(([category, amount]) => {
    const percentage = (amount / total) * 100;
    if (percentage > ANALYSIS_THRESHOLDS.categoryImbalance) {
      insights.push({
        type: "warning",
        message: `${
          EXPENSE_CATEGORIES[category as keyof typeof EXPENSE_CATEGORIES]
        }の割合が${percentage.toFixed(1)}%と高くなっています。`,
      });
    }
  });

  return insights;
}
