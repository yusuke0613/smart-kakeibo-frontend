import { API_BASE_URL } from "@/lib/constants";

export async function analyzeReceipt(file: File, userId: string) {
  const formData = new FormData();
  formData.append("receipt", file);
  formData.append("userId", userId);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/receipts/analyze`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Receipt analysis failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Error analyzing receipt:", error);
    throw error;
  }
}
