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
      `http://127.0.0.1:8000/api/v1/transactions/user/${userId}/${yearMonthStr}`,
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
    const response = await fetch(`http://127.0.0.1:8000/api/v1/transactions/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    return await response.json();
  } catch (error) {
    console.error("Failed to create transaction:", error);
    throw error;
  }
}

export async function updateTransaction(
  id: number,
  formData: Partial<Transaction>
) {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/v1/transactions/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Failed to update transaction:", error);
    throw error;
  }
}

export async function deleteTransaction(id: number) {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/v1/transactions/${id}`,
      {
        method: "DELETE",
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    throw error;
  }
}
