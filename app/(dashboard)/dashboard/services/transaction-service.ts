import { DailyTransactions, Transaction } from "../types";
import { format, parse } from "date-fns";

export async function getTransactions(userId: string, yearMonth: Date) {
  try {
    const yearMonthStr = format(yearMonth, "yyyyMM");
    const response = await fetch(
      `http://127.0.0.1:8000/api/v1/transactions/?user_id=${userId}&yearmonth=${yearMonthStr}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }

    const data = await response.json();
    return data.map((transaction: any) => ({
      ...transaction,
      date: transaction.date
        ? format(
            parse(transaction.date, "yyyy-MM-dd", new Date()),
            "yyyy-MM-dd"
          )
        : format(new Date(), "yyyy-MM-dd"),
    }));
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }
}

// トランザクションを日付ごとにグループ化するヘルパー関数
export function groupTransactionsByDate(
  transactions: Transaction[]
): DailyTransactions {
  return transactions.reduce((acc, transaction) => {
    const date = transaction.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as DailyTransactions);
}

export async function createTransaction(formData: any) {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/v1/transactions/", {
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

export async function updateTransaction(id: string, formData: any) {
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

export async function deleteTransaction(id: string) {
  const response = await fetch(`/api/transactions/${id}`, {
    method: "DELETE",
  });
  return response.json();
}
