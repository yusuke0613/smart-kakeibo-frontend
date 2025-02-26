import { useState, useRef } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { analyzeReceipt, ReceiptItem } from "../services/receipt-service";
import { motion } from "framer-motion";

interface ReceiptUploadProps {
  onAnalysisComplete: (items: ReceiptItem[]) => void;
  onError: (error: string) => void;
}

export function ReceiptUpload({
  onAnalysisComplete,
  onError,
}: ReceiptUploadProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState("準備中...");
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileUpload = async (file: File) => {
    try {
      console.log("ファイルアップロード開始:", file.name);
      setIsAnalyzing(true);
      setProgress(0);
      setProgressStatus("画像を処理中...");

      // プログレスバーのアニメーション
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev < 30) {
            setProgressStatus("画像を処理中...");
            return prev + 2;
          } else if (prev < 60) {
            setProgressStatus("テキストを抽出中...");
            return prev + 1.5;
          } else if (prev < 85) {
            setProgressStatus("データを分析中...");
            return prev + 0.8;
          } else if (prev < 95) {
            setProgressStatus("結果を準備中...");
            return prev + 0.3;
          }
          return prev;
        });
      }, 100);

      // APIリクエスト
      console.log("APIリクエスト実行前");
      const result = await analyzeReceipt(file);
      console.log("APIリクエスト完了:", result);

      // プログレスバーを完了状態に
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setProgress(100);
      setProgressStatus("完了！");

      // 少し待ってから結果を表示
      setTimeout(() => {
        console.log("解析結果をコールバックで返します:", result);
        onAnalysisComplete(result);
        setIsAnalyzing(false);
        setProgress(0);
      }, 800);
    } catch (error) {
      console.error("ファイルアップロードエラー:", error);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      onError(
        error instanceof Error ? error.message : "レシートの解析に失敗しました"
      );
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      {isAnalyzing ? (
        <div className="space-y-4 py-6">
          <div className="relative pt-4">
            <Progress value={progress} className="h-2" />
            <motion.div
              className="absolute top-0 left-0 w-full"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </motion.div>
          </div>

          <div className="text-center space-y-2">
            <motion.div
              className="flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </motion.div>

            <motion.p
              className="text-sm font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {progressStatus}
            </motion.p>

            <motion.p
              className="text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              レシートから情報を抽出しています...
            </motion.p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-32 relative overflow-hidden group"
            onClick={() => {
              // カメラ起動処理
              // 注: 実際のカメラ機能は実装が必要
              alert("カメラ機能は現在実装中です");
            }}
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex flex-col items-center justify-center space-y-2">
              <Camera className="h-6 w-6 mb-1 text-primary" />
              <span>カメラで撮影</span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-32 relative overflow-hidden group"
            onClick={() => {
              console.log("画像アップロードボタンがクリックされました");
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  console.log("ファイルが選択されました:", file.name);
                  handleFileUpload(file);
                }
              };
              input.click();
            }}
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-6 w-6 mb-1 text-primary" />
              <span>画像をアップロード</span>
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}
