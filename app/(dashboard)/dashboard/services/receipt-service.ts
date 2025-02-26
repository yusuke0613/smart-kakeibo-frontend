import { API_BASE_URL } from "@/lib/constants";
import { format } from "date-fns";

export interface ReceiptItem {
  amount: string;
  transaction_date: string;
  description: string;
  major_category_id: number;
  minor_category_id: number;
}

export async function analyzeReceipt(
  file: File,
  userId: string = "default_user"
) {
  console.log("レシート解析開始:", file.name, file.type, file.size);
  const formData = new FormData();
  formData.append("files", file);

  try {
    const apiUrl = `http://127.0.0.1:8000/api/v1/image-processing/extract-transaction?use_mock=false&debug_mode=false&user_id=${userId}`;
    console.log("APIリクエスト送信:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    console.log("APIレスポンスステータス:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("APIエラーレスポンス:", errorText);
      throw new Error(
        `レシート解析に失敗しました: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();
    console.log("APIレスポンスデータ:", data);

    // データが空の場合はエラーを投げる
    if (!data || data.length === 0) {
      console.log("APIからデータが返されませんでした");
      throw new Error("レシート解析結果が空です");
    }

    return data as ReceiptItem[];
  } catch (error) {
    console.error("レシート解析エラー:", error);
    throw error; // エラーを上位に伝播させる
  }
}

// モックデータを取得する関数
function getMockReceiptItems(): ReceiptItem[] {
  const today = format(new Date(), "yyyy-MM-dd");

  return [
    {
      amount: "111.0",
      transaction_date: today,
      description: "食パン",
      major_category_id: 4,
      minor_category_id: 10,
    },
    {
      amount: "118.0",
      transaction_date: today,
      description: "缶詰",
      major_category_id: 4,
      minor_category_id: 10,
    },
    {
      amount: "214.0",
      transaction_date: today,
      description: "タマゴ",
      major_category_id: 4,
      minor_category_id: 10,
    },
    {
      amount: "182.0",
      transaction_date: today,
      description: "きつねうどん",
      major_category_id: 4,
      minor_category_id: 10,
    },
  ] as ReceiptItem[];
}
