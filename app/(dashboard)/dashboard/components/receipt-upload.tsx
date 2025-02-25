import { useState } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { analyzeReceipt } from "../services/receipt-service";

interface ReceiptUploadProps {
  onAnalysisComplete: (items: any[]) => void;
  onError: (error: string) => void;
}

export function ReceiptUpload({
  onAnalysisComplete,
  onError,
}: ReceiptUploadProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (file: File) => {
    try {
      setIsAnalyzing(true);
      // プログレスバーのシミュレーション
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 500);

      //const result = await analyzeReceipt(file, "1"); // ユーザーIDは後で動的に

      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        //onAnalysisComplete(result.items);
        setIsAnalyzing(false);
        setProgress(0);
      }, 500);
    } catch (error) {
      onError("レシートの解析に失敗しました");
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      {isAnalyzing ? (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-center text-muted-foreground">
            レシートを解析中...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-32"
            onClick={() => {
              // カメラ起動処理
            }}
          >
            <Camera className="h-6 w-6 mb-2" />
            <span>カメラで撮影</span>
          </Button>
          <Button
            variant="outline"
            className="h-32"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleFileUpload(file);
              };
              input.click();
            }}
          >
            <Upload className="h-6 w-6 mb-2" />
            <span>画像をアップロード</span>
          </Button>
        </div>
      )}
    </div>
  );
}
