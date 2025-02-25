import { DailyTransactions, Transaction } from "../types";
import { format } from "date-fns";

export async function getTransactions(
  userId: string,
  yearMonth: Date
): Promise<Transaction[]> {
  try {
    const yearMonthStr = format(yearMonth, "yyyyMM");
    console.log("トランザクション取得開始:", userId, yearMonthStr);

    const response = await fetch(
      `http://127.0.0.1:8000/api/v1/transactions/user/${userId}/${yearMonthStr}?current_user_id=${userId}`,
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
      console.error("トランザクション取得エラー:", response.status, errorText);
      throw new Error(
        `トランザクション取得エラー: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();
    console.log("トランザクション取得成功:", data.length, "件");
    return data;
  } catch (error) {
    console.error("トランザクション取得例外:", error);
    return [];
  }
}

// トランザクションを日付ごとにグループ化するヘルパー関数
export function groupTransactionsByDate(
  transactions: Transaction[]
): DailyTransactions {
  return transactions.reduce((acc, transaction) => {
    const date = transaction.transaction_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as DailyTransactions);
}

export async function createTransaction(formData: Partial<Transaction>) {
  try {
    console.log("トランザクション作成開始:", formData);

    // APIのエンドポイントを修正
    const response = await fetch(
      `http://127.0.0.1:8000/api/v1/transactions/?current_user_id=1`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          amount: Number(formData.amount), // 数値型に変換
          transaction_date: formData.transaction_date,
          description: formData.description || "",
          major_category_id: formData.major_category_id,
          minor_category_id: formData.minor_category_id,
          type: formData.type,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("トランザクション作成エラー:", response.status, errorText);
      throw new Error(
        `トランザクション作成エラー: ${response.status} ${errorText}`
      );
    }

    const result = await response.json();
    console.log("トランザクション作成成功:", result);
    return result;
  } catch (error) {
    console.error("トランザクション作成例外:", error);
    throw error;
  }
}

export async function updateTransaction(
  id: number,
  formData: Partial<Transaction>
) {
  try {
    console.log("トランザクション更新開始:", id, formData);

    const response = await fetch(
      `http://127.0.0.1:8000/api/v1/transactions/${id}?current_user_id=1`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          amount: Number(formData.amount), // 数値型に変換
          transaction_date: formData.transaction_date,
          description: formData.description || "",
          major_category_id: formData.major_category_id,
          minor_category_id: formData.minor_category_id,
          type: formData.type,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("トランザクション更新エラー:", response.status, errorText);
      throw new Error(
        `トランザクション更新エラー: ${response.status} ${errorText}`
      );
    }

    const result = await response.json();
    console.log("トランザクション更新成功:", result);
    return result;
  } catch (error) {
    console.error("トランザクション更新例外:", error);
    throw error;
  }
}

export async function deleteTransaction(id: number) {
  try {
    console.log("トランザクション削除開始:", id);

    const response = await fetch(
      `http://127.0.0.1:8000/api/v1/transactions/${id}?current_user_id=1`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("トランザクション削除エラー:", response.status, errorText);
      throw new Error(
        `トランザクション削除エラー: ${response.status} ${errorText}`
      );
    }

    const result = await response.json();
    console.log("トランザクション削除成功:", result);
    return result;
  } catch (error) {
    console.error("トランザクション削除例外:", error);
    throw error;
  }
}
