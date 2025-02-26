"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrendingUpIcon,
  Bot,
  CalendarIcon,
  TableIcon,
  BarChart3Icon,
  ChevronLeft,
  ChevronRight,
  Plus,
  PencilIcon,
  Trash2,
  Camera,
  Upload,
  Loader2,
  Check,
  Search,
  Moon,
  Sun,
  Settings,
} from "lucide-react";
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  getDate,
  isSameDay,
  isSameMonth,
  subMonths,
} from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  getTransactions,
  groupTransactionsByDate,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "./services/transaction-service";
import {
  Transaction,
  DailyTransactions,
  MajorCategory,
  MinorCategory,
} from "./types";
import { fetchCategories } from "./services/category-service";
import { useTheme } from "next-themes";
import { ReceiptUpload } from "./components/receipt-upload";
import { ReceiptItems } from "./components/receipt-items";
import { ReceiptItem } from "./services/receipt-service";

// カスタムカレンダーの日付コンテンツ
function CalendarDay({
  date,
  transactions,
  selectedDate,
  onSelect,
}: {
  date: Date;
  transactions: any;
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}) {
  const dateStr = format(date, "yyyy-MM-dd");
  const dayTransactions = transactions[dateStr] || [];
  const isSelected = selectedDate && isSameDay(date, selectedDate);

  const income = dayTransactions
    .filter((t: Transaction) => t.type === "INCOME")
    .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);

  const expense = dayTransactions
    .filter((t: Transaction) => t.type === "EXPENSE")
    .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);

  return (
    <div
      className={cn(
        "h-24 p-2 cursor-pointer transition-colors",
        isSelected ? "bg-primary/10" : "hover:bg-accent"
      )}
      onClick={() => onSelect(date)}
    >
      <div className="text-sm font-medium mb-1">{getDate(date)}</div>
      <div className="space-y-1">
        {income > 0 && (
          <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
            +¥{income.toLocaleString()}
          </div>
        )}
        {expense > 0 && (
          <div className="text-xs font-medium text-red-600 dark:text-red-400">
            -¥{expense.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}

// カスタムカレンダーグリッド
function CalendarGrid({
  currentMonth,
  selectedDate,
  transactions,
  onSelectDate,
}: {
  currentMonth: Date;
  selectedDate: Date | null;
  transactions: any;
  onSelectDate: (date: Date) => void;
}) {
  // 月の最初の日と最後の日を取得
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // カレンダーの開始日（月の最初の日の週の月曜日）
  const calendarStart = startOfWeek(monthStart, { locale: ja });

  // カレンダーの終了日（月の最後の日を含む週の日曜日）
  const calendarEnd = endOfWeek(monthEnd, { locale: ja });

  // カレンダーに表示する日付の配列を生成
  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  // 週ごとに日付をグループ化
  const weeks = days.reduce<Date[][]>((weeks, day) => {
    const weekIndex = Math.floor(days.indexOf(day) / 7);
    weeks[weekIndex] = weeks[weekIndex] || [];
    weeks[weekIndex].push(day);
    return weeks;
  }, []);

  return (
    <div className="space-y-px">
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 gap-px bg-border">
          {week.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                "bg-background",
                format(day, "M") !== format(currentMonth, "M") && "opacity-50"
              )}
            >
              <CalendarDay
                date={day}
                transactions={transactions}
                selectedDate={selectedDate}
                onSelect={onSelectDate}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// 日別収支データ（サンプル）
const initialTransactions: DailyTransactions = {};

// 月ごとの支出を計算
const calculateMonthlyExpense = (transactions: Transaction[]) => {
  return transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);
};

export default function DashboardPage() {
  const { theme, setTheme } = useTheme();
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [chartColors, setChartColors] = useState([
    "#4f46e5", // インディゴ
    "#0ea5e9", // スカイブルー
    "#10b981", // エメラルド
    "#f59e0b", // アンバー
    "#ef4444", // レッド
  ]);
  const [accentColor, setAccentColor] = useState("hsl(var(--primary))");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    "expense"
  );
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [dailyTransactions, setDailyTransactions] =
    useState<DailyTransactions>(initialTransactions);
  const [categories, setCategories] = useState<MajorCategory[]>([]);
  const [mainCategory, setMainCategory] = useState<string>("");
  const [subCategory, setSubCategory] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [memo, setMemo] = useState<string>("");
  const [inputMode, setInputMode] = useState<"manual" | "receipt">("receipt");
  const [isScanning, setIsScanning] = useState(false);
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<ReceiptItem[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastMonthTransactions, setLastMonthTransactions] = useState<
    Transaction[]
  >([]);
  const [receiptError, setReceiptError] = useState<string | null>(null);

  // カテゴリーデータの取得
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log("カテゴリーデータ取得開始");
        // fetchCategories関数を使用
        const data = await fetchCategories("1");
        console.log("カテゴリーデータ取得成功:", data);
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error("カテゴリーデータが配列ではありません:", data);
        }
      } catch (err) {
        console.error("カテゴリーデータ取得例外:", err);
      }
    };
    loadCategories();
  }, []);

  // 選択された大カテゴリーの小カテゴリーを取得
  const minorCategories = useMemo<MinorCategory[]>(() => {
    const category = categories.find(
      (c) => c.major_category_id.toString() === mainCategory
    );
    return category?.minor_categories || [];
  }, [categories, mainCategory]);

  // 大カテゴリー選択時に小カテゴリーの初期値を設定
  const handleMainCategoryChange = (value: string) => {
    setMainCategory(value);
    const category = categories.find(
      (c) => c.major_category_id.toString() === value
    );
    if (category?.minor_categories && category.minor_categories.length > 0) {
      setSubCategory(category.minor_categories[0].minor_category_id.toString());
    } else {
      setSubCategory("");
    }
  };

  // 初期データの取得
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        console.log("初期データ取得開始");

        // 現在の月と過去6ヶ月分のデータを取得するための配列
        const monthsToFetch = [];
        for (let i = 0; i <= 5; i++) {
          monthsToFetch.push(subMonths(currentMonth, i));
        }

        console.log(
          "取得する月:",
          monthsToFetch.map((m) => format(m, "yyyy-MM"))
        );

        // すべての月のデータを並行して取得
        const allMonthsData = await Promise.all(
          monthsToFetch.map((month) => getTransactions("1", month))
        );

        // 現在の月のデータ
        const currentMonthData = allMonthsData[0];
        // 先月のデータ
        const lastMonthData = allMonthsData[1];
        // すべての月のデータを結合
        const allTransactions = allMonthsData.flat();

        console.log(
          "トランザクションデータ取得成功:",
          "現在月:",
          currentMonthData.length,
          "件",
          "先月:",
          lastMonthData.length,
          "件",
          "全期間:",
          allTransactions.length,
          "件"
        );

        setTransactions(allTransactions);
        setLastMonthTransactions(lastMonthData);
        setDailyTransactions(groupTransactionsByDate(currentMonthData));
      } catch (error) {
        console.error("初期データ取得エラー:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [currentMonth]);

  // 今月の支出を計算
  const currentMonthExpense = useMemo(() => {
    return calculateMonthlyExpense(transactions);
  }, [transactions]);

  // 先月の支出を計算
  const lastMonthExpense = useMemo(() => {
    return calculateMonthlyExpense(lastMonthTransactions);
  }, [lastMonthTransactions]);

  // 支出の増減率を計算
  const expenseChangeRate = useMemo(() => {
    if (lastMonthExpense === 0) return 0;
    return ((currentMonthExpense - lastMonthExpense) / lastMonthExpense) * 100;
  }, [currentMonthExpense, lastMonthExpense]);

  // 1日あたりの支出を計算
  const dailyExpense = useMemo(() => {
    const daysInMonth = endOfMonth(currentMonth).getDate();
    return Math.round(currentMonthExpense / daysInMonth);
  }, [currentMonthExpense, currentMonth]);

  // 先月の1日あたりの支出を計算
  const lastMonthDailyExpense = useMemo(() => {
    const daysInLastMonth = endOfMonth(addMonths(currentMonth, -1)).getDate();
    return Math.round(lastMonthExpense / daysInLastMonth);
  }, [lastMonthExpense, currentMonth]);

  // 最大支出カテゴリーを計算
  const largestExpenseCategory = useMemo(() => {
    const categoryExpenses = transactions.reduce(
      (
        acc: { [key: string]: { amount: number; name: string } },
        transaction
      ) => {
        if (transaction.type === "EXPENSE") {
          const categoryId = transaction.major_category_id.toString();
          if (!acc[categoryId]) {
            acc[categoryId] = {
              amount: 0,
              name: transaction.major_category_name || "未分類",
            };
          }
          acc[categoryId].amount += Number(transaction.amount);
        }
        return acc;
      },
      {}
    );

    return Object.values(categoryExpenses).reduce(
      (max, current) => (current.amount > (max?.amount || 0) ? current : max),
      { amount: 0, name: "" }
    );
  }, [transactions]);

  // 月を変更する関数
  const changeMonth = async (date: Date) => {
    setCurrentMonth(date);
  };

  // 取引を削除
  const handleDeleteTransaction = async (transactionId: number) => {
    try {
      console.log("トランザクション削除開始:", transactionId);
      await deleteTransaction(transactionId);

      // データを再取得
      console.log("削除後のデータ再取得開始");
      const data = await getTransactions("1", currentMonth);
      console.log("削除後のデータ再取得完了:", data.length, "件");
      setTransactions(data);
      const groupedData = groupTransactionsByDate(data);
      setDailyTransactions(groupedData);

      console.log("トランザクション削除完了");
    } catch (error) {
      console.error("トランザクション削除エラー:", error);
    }
  };

  // 取引を編集
  const editTransaction = (date: string, transaction: any) => {
    setEditingTransaction({ ...transaction, date });
    setTransactionType(transaction.type.toLowerCase() as "income" | "expense");
    setMainCategory(transaction.major_category_id.toString());
    if (transaction.minor_category_id) {
      setSubCategory(transaction.minor_category_id.toString());
    }
    setAmount(transaction.amount.toString());
    setMemo(transaction.description || "");
    setSelectedDate(new Date(transaction.transaction_date));
    setInputMode("manual");
    setShowAddDialog(true);
  };

  // フォームをリセット
  const resetForm = () => {
    setTransactionType("expense");
    setMainCategory("");
    setSubCategory("");
    setAmount("");
    setMemo("");
    setEditingTransaction(null);
    setInputMode("receipt");
    setReceiptItems([]);
    setSelectedItems([]);
    setReceiptError(null);
    // 注意: 日付はリセットしない（現在選択されている日付を維持）
  };

  // レシート解析完了時の処理
  const handleReceiptAnalysisComplete = (items: ReceiptItem[]) => {
    console.log("レシート解析完了ハンドラーが呼ばれました:", items);
    console.log("受け取ったアイテムの数:", items.length);
    console.log("アイテムの内容:", JSON.stringify(items, null, 2));
    setReceiptItems(items);
    setReceiptError(null);
    console.log("レシートアイテムの状態を更新しました:", items.length, "件");
  };

  // レシート解析エラー時の処理
  const handleReceiptAnalysisError = (error: string) => {
    console.error("レシート解析エラーハンドラーが呼ばれました:", error);
    setReceiptError(error);
  };

  // レシートアイテムの保存処理
  const handleSaveReceiptItems = async (items: ReceiptItem[]) => {
    setIsRegistering(true);
    try {
      // 各アイテムをトランザクションとして保存
      for (const item of items) {
        const formData = {
          type: "EXPENSE" as "INCOME" | "EXPENSE", // 明示的に型を指定
          major_category_id: item.major_category_id,
          minor_category_id: item.minor_category_id,
          amount: Number(item.amount),
          description: item.description,
          transaction_date: item.transaction_date,
        };

        await createTransaction(formData);
      }

      setShowAddDialog(false);
      resetForm();

      // データ再取得
      const data = await getTransactions("1", currentMonth);
      const groupedData = groupTransactionsByDate(data);
      setDailyTransactions(groupedData);
      setTransactions(data);
    } catch (error) {
      console.error("レシートアイテム保存エラー:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  // レシートモードのキャンセル処理
  const handleCancelReceiptItems = () => {
    setInputMode("manual");
    setReceiptItems([]);
  };

  // 取引を保存
  const saveTransaction = async () => {
    if (!amount || !mainCategory) return;

    setIsRegistering(true);
    try {
      console.log("トランザクション保存開始");
      const formData = {
        type: transactionType.toUpperCase() as "INCOME" | "EXPENSE",
        major_category_id: parseInt(mainCategory),
        minor_category_id: subCategory ? parseInt(subCategory) : undefined,
        amount: Number(amount), // 数値型に変換
        description: memo,
        transaction_date: format(selectedDate, "yyyy-MM-dd"),
      };

      console.log("保存するデータ:", formData);

      if (editingTransaction) {
        await updateTransaction(editingTransaction.transaction_id, formData);
      } else {
        await createTransaction(formData);
      }

      setShowAddDialog(false);
      resetForm();

      // データ再取得
      console.log("データ再取得開始");
      const data = await getTransactions("1", currentMonth);
      console.log("データ再取得完了:", data.length, "件");
      const groupedData = groupTransactionsByDate(data);
      setDailyTransactions(groupedData);
      setTransactions(data);

      console.log("トランザクション保存完了");
    } catch (error) {
      console.error("トランザクション保存エラー:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  // 選択された日付の取引を取得
  const getSelectedDateTransactions = () => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return dailyTransactions[dateStr] || [];
  };

  // 過去6ヶ月分の月別支出データを計算
  const monthlyExpenseData = useMemo(() => {
    console.log("月別支出データ計算開始");

    // 過去6ヶ月分のデータを取得するための配列
    const data = [];

    // 現在の月から過去6ヶ月分のデータを計算
    for (let i = 5; i >= 0; i--) {
      const targetMonth = subMonths(currentMonth, i);
      const monthStr = format(targetMonth, "M月");
      const targetMonthStart = startOfMonth(targetMonth);
      const targetMonthEnd = endOfMonth(targetMonth);

      // 対象月のトランザクションをフィルタリング
      const monthlyTransactions = transactions.filter((t: Transaction) => {
        const transactionDate = new Date(t.transaction_date);
        return (
          transactionDate >= targetMonthStart &&
          transactionDate <= targetMonthEnd
        );
      });

      console.log(
        `${monthStr}のトランザクション:`,
        monthlyTransactions.length,
        "件"
      );

      // 月別支出を計算
      const monthlyExpense = calculateMonthlyExpense(monthlyTransactions);
      data.push({
        name: monthStr,
        支出: monthlyExpense,
      });
    }

    console.log("月別支出データ計算完了:", data);

    // データが空の場合はダミーデータを返す
    if (data.every((item) => item.支出 === 0)) {
      return [
        { name: "1月", 支出: 0 },
        { name: "2月", 支出: 0 },
        { name: "3月", 支出: 0 },
        { name: "4月", 支出: 0 },
        { name: "5月", 支出: 0 },
        { name: "6月", 支出: 0 },
      ];
    }

    return data;
  }, [currentMonth, transactions]);

  // カテゴリー別支出データを計算
  const categoryExpenseData = useMemo(() => {
    console.log("カテゴリー別支出データ計算開始");

    // 現在の月のトランザクションのみをフィルタリング
    const currentMonthStart = startOfMonth(currentMonth);
    const currentMonthEnd = endOfMonth(currentMonth);

    const currentMonthTransactions = transactions.filter((t: Transaction) => {
      const transactionDate = new Date(t.transaction_date);
      return (
        transactionDate >= currentMonthStart &&
        transactionDate <= currentMonthEnd
      );
    });

    console.log(
      "現在月のトランザクション:",
      currentMonthTransactions.length,
      "件"
    );

    const categoryExpenses = currentMonthTransactions.reduce(
      (acc: { [key: string]: number }, transaction) => {
        if (transaction.type === "EXPENSE") {
          const categoryName = transaction.major_category_name || "未分類";
          acc[categoryName] =
            (acc[categoryName] || 0) + Number(transaction.amount);
        }
        return acc;
      },
      {}
    );

    const result = Object.entries(categoryExpenses)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);

    console.log("カテゴリー別支出データ計算完了:", result);

    // データが空の場合は空の配列を返す
    if (result.length === 0) {
      return [];
    }

    return result;
  }, [currentMonth, transactions]);

  // カラーテーマを変更する関数
  const changeColorTheme = (colors: string[]) => {
    setChartColors(colors);
  };

  // アクセントカラーを変更する関数
  const changeAccentColor = (color: string, hslValue: string) => {
    setAccentColor(color);
    document.documentElement.style.setProperty("--primary", hslValue);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* 月選択ヘッダー */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">
            {format(currentMonth, "yyyy年M月", { locale: ja })}
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeMonth(addMonths(currentMonth, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeMonth(addMonths(currentMonth, 1))}
              disabled={isSameMonth(currentMonth, new Date())}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showThemeSettings} onOpenChange={setShowThemeSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>テーマ設定</DialogTitle>
              </DialogHeader>
              <div className="py-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme-select">テーマ</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={theme === "light" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("light")}
                        className="gap-2"
                      >
                        <Sun className="h-4 w-4" />
                        ライト
                      </Button>
                      <Button
                        variant={theme === "dark" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("dark")}
                        className="gap-2"
                      >
                        <Moon className="h-4 w-4" />
                        ダーク
                      </Button>
                      <Button
                        variant={theme === "system" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("system")}
                      >
                        システム
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>カラーテーマ</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        className="flex flex-col items-center justify-center h-24 p-4 border-2 hover:border-primary"
                        onClick={() => {
                          changeColorTheme([
                            "#4f46e5", // インディゴ
                            "#0ea5e9", // スカイブルー
                            "#10b981", // エメラルド
                            "#f59e0b", // アンバー
                            "#ef4444", // レッド
                          ]);
                        }}
                      >
                        <div className="flex gap-1 mb-2">
                          <div className="w-4 h-4 rounded-full bg-[#4f46e5]"></div>
                          <div className="w-4 h-4 rounded-full bg-[#0ea5e9]"></div>
                          <div className="w-4 h-4 rounded-full bg-[#10b981]"></div>
                        </div>
                        <span className="text-xs">デフォルト</span>
                      </Button>

                      <Button
                        variant="outline"
                        className="flex flex-col items-center justify-center h-24 p-4 border-2 hover:border-primary"
                        onClick={() => {
                          changeColorTheme([
                            "#e11d48", // ローズ
                            "#7e22ce", // パープル
                            "#6366f1", // インディゴ
                            "#3b82f6", // ブルー
                            "#06b6d4", // シアン
                          ]);
                        }}
                      >
                        <div className="flex gap-1 mb-2">
                          <div className="w-4 h-4 rounded-full bg-[#e11d48]"></div>
                          <div className="w-4 h-4 rounded-full bg-[#7e22ce]"></div>
                          <div className="w-4 h-4 rounded-full bg-[#6366f1]"></div>
                        </div>
                        <span className="text-xs">パープル</span>
                      </Button>

                      <Button
                        variant="outline"
                        className="flex flex-col items-center justify-center h-24 p-4 border-2 hover:border-primary"
                        onClick={() => {
                          changeColorTheme([
                            "#047857", // エメラルド
                            "#0ea5e9", // スカイブルー
                            "#3b82f6", // ブルー
                            "#6366f1", // インディゴ
                            "#8b5cf6", // バイオレット
                          ]);
                        }}
                      >
                        <div className="flex gap-1 mb-2">
                          <div className="w-4 h-4 rounded-full bg-[#047857]"></div>
                          <div className="w-4 h-4 rounded-full bg-[#0ea5e9]"></div>
                          <div className="w-4 h-4 rounded-full bg-[#3b82f6]"></div>
                        </div>
                        <span className="text-xs">ブルーグリーン</span>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 mt-4">
                    <Label>アクセントカラー</Label>
                    <div className="grid grid-cols-5 gap-2">
                      <Button
                        variant="outline"
                        className="flex items-center justify-center h-12 p-2 border-2 hover:border-primary"
                        onClick={() =>
                          changeAccentColor("#0ea5e9", "199 89% 48%")
                        }
                      >
                        <div className="w-6 h-6 rounded-full bg-[#0ea5e9]"></div>
                      </Button>

                      <Button
                        variant="outline"
                        className="flex items-center justify-center h-12 p-2 border-2 hover:border-primary"
                        onClick={() =>
                          changeAccentColor("#6366f1", "239 84% 67%")
                        }
                      >
                        <div className="w-6 h-6 rounded-full bg-[#6366f1]"></div>
                      </Button>

                      <Button
                        variant="outline"
                        className="flex items-center justify-center h-12 p-2 border-2 hover:border-primary"
                        onClick={() =>
                          changeAccentColor("#8b5cf6", "259 94% 66%")
                        }
                      >
                        <div className="w-6 h-6 rounded-full bg-[#8b5cf6]"></div>
                      </Button>

                      <Button
                        variant="outline"
                        className="flex items-center justify-center h-12 p-2 border-2 hover:border-primary"
                        onClick={() =>
                          changeAccentColor("#ec4899", "330 90% 61%")
                        }
                      >
                        <div className="w-6 h-6 rounded-full bg-[#ec4899]"></div>
                      </Button>

                      <Button
                        variant="outline"
                        className="flex items-center justify-center h-12 p-2 border-2 hover:border-primary"
                        onClick={() =>
                          changeAccentColor("#10b981", "158 64% 39%")
                        }
                      >
                        <div className="w-6 h-6 rounded-full bg-[#10b981]"></div>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog
            open={showAddDialog}
            onOpenChange={(open) => {
              setShowAddDialog(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                収支を追加
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingTransaction ? "取引を編集" : "取引を追加"}
                </DialogTitle>
              </DialogHeader>

              {/* 入力モード切り替えタブ */}
              {!editingTransaction && (
                <Tabs
                  value={inputMode}
                  onValueChange={(v) => setInputMode(v as "manual" | "receipt")}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual">手動入力</TabsTrigger>
                    <TabsTrigger value="receipt">レシート読取</TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual">
                    {/* 既存の手動入力フォーム */}
                    <div className="space-y-4 py-2">
                      {/* 収支タイプ選択 */}
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          type="button"
                          variant={
                            transactionType === "expense"
                              ? "default"
                              : "outline"
                          }
                          className={`flex items-center justify-center ${
                            transactionType === "expense"
                              ? "bg-red-500 hover:bg-red-600"
                              : ""
                          }`}
                          onClick={() => setTransactionType("expense")}
                        >
                          <ArrowDownIcon className="mr-2 h-4 w-4" />
                          支出
                        </Button>
                        <Button
                          type="button"
                          variant={
                            transactionType === "income" ? "default" : "outline"
                          }
                          className={`flex items-center justify-center ${
                            transactionType === "income"
                              ? "bg-green-500 hover:bg-green-600"
                              : ""
                          }`}
                          onClick={() => setTransactionType("income")}
                        >
                          <ArrowUpIcon className="mr-2 h-4 w-4" />
                          収入
                        </Button>
                      </div>

                      {/* カテゴリー選択 */}
                      <div className="space-y-2">
                        <Label htmlFor="category">カテゴリー</Label>
                        <Select
                          value={mainCategory}
                          onValueChange={handleMainCategoryChange}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="カテゴリーを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories
                              .filter(
                                (cat) =>
                                  cat.type.toLowerCase() ===
                                  transactionType.toLowerCase()
                              )
                              .map((category) => (
                                <SelectItem
                                  key={category.major_category_id}
                                  value={category.major_category_id.toString()}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* サブカテゴリー選択 */}
                      {mainCategory && (
                        <div className="space-y-2">
                          <Label htmlFor="subcategory">サブカテゴリー</Label>
                          <Select
                            value={subCategory}
                            onValueChange={setSubCategory}
                          >
                            <SelectTrigger id="subcategory">
                              <SelectValue placeholder="サブカテゴリーを選択" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories
                                .find(
                                  (cat) =>
                                    cat.major_category_id.toString() ===
                                    mainCategory
                                )
                                ?.minor_categories.map((subCat) => (
                                  <SelectItem
                                    key={subCat.minor_category_id}
                                    value={subCat.minor_category_id.toString()}
                                  >
                                    {subCat.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* 金額入力 */}
                      <div className="space-y-2">
                        <Label htmlFor="amount">金額</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="金額を入力"
                        />
                      </div>

                      {/* メモ入力 */}
                      <div className="space-y-2">
                        <Label htmlFor="memo">メモ</Label>
                        <Input
                          id="memo"
                          value={memo}
                          onChange={(e) => setMemo(e.target.value)}
                          placeholder="メモを入力（任意）"
                        />
                      </div>

                      {/* 日付選択 */}
                      <div className="space-y-2">
                        <Label htmlFor="date">日付</Label>
                        <Input
                          id="date"
                          type="date"
                          value={format(selectedDate, "yyyy-MM-dd")}
                          onChange={(e) => {
                            if (e.target.value) {
                              setSelectedDate(new Date(e.target.value));
                            }
                          }}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="receipt">
                    {receiptItems.length > 0 ? (
                      <ReceiptItems
                        items={receiptItems}
                        categories={categories}
                        onSave={handleSaveReceiptItems}
                        onCancel={handleCancelReceiptItems}
                      />
                    ) : (
                      <div className="space-y-4 py-4">
                        {receiptError && (
                          <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm mb-4">
                            {receiptError}
                          </div>
                        )}
                        <ReceiptUpload
                          onAnalysisComplete={handleReceiptAnalysisComplete}
                          onError={handleReceiptAnalysisError}
                        />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}

              {/* 編集モードの場合は既存のフォームを表示 */}
              {editingTransaction && (
                <div className="space-y-4 py-2">
                  {/* 収支タイプ選択 */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={
                        transactionType === "expense" ? "default" : "outline"
                      }
                      className={`flex items-center justify-center ${
                        transactionType === "expense"
                          ? "bg-red-500 hover:bg-red-600"
                          : ""
                      }`}
                      onClick={() => setTransactionType("expense")}
                    >
                      <ArrowDownIcon className="mr-2 h-4 w-4" />
                      支出
                    </Button>
                    <Button
                      type="button"
                      variant={
                        transactionType === "income" ? "default" : "outline"
                      }
                      className={`flex items-center justify-center ${
                        transactionType === "income"
                          ? "bg-green-500 hover:bg-green-600"
                          : ""
                      }`}
                      onClick={() => setTransactionType("income")}
                    >
                      <ArrowUpIcon className="mr-2 h-4 w-4" />
                      収入
                    </Button>
                  </div>

                  {/* カテゴリー選択 */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">カテゴリー</Label>
                    <Select
                      value={mainCategory}
                      onValueChange={handleMainCategoryChange}
                    >
                      <SelectTrigger id="edit-category">
                        <SelectValue placeholder="カテゴリーを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter(
                            (cat) =>
                              cat.type.toLowerCase() ===
                              transactionType.toLowerCase()
                          )
                          .map((category) => (
                            <SelectItem
                              key={category.major_category_id}
                              value={category.major_category_id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* サブカテゴリー選択 */}
                  {mainCategory && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-subcategory">サブカテゴリー</Label>
                      <Select
                        value={subCategory}
                        onValueChange={setSubCategory}
                      >
                        <SelectTrigger id="edit-subcategory">
                          <SelectValue placeholder="サブカテゴリーを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .find(
                              (cat) =>
                                cat.major_category_id.toString() ===
                                mainCategory
                            )
                            ?.minor_categories.map((subCat) => (
                              <SelectItem
                                key={subCat.minor_category_id}
                                value={subCat.minor_category_id.toString()}
                              >
                                {subCat.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* 金額入力 */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-amount">金額</Label>
                    <Input
                      id="edit-amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="金額を入力"
                    />
                  </div>

                  {/* メモ入力 */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-memo">メモ</Label>
                    <Input
                      id="edit-memo"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      placeholder="メモを入力（任意）"
                    />
                  </div>

                  {/* 日付選択 */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-date">日付</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={format(selectedDate, "yyyy-MM-dd")}
                      onChange={(e) => {
                        if (e.target.value) {
                          setSelectedDate(new Date(e.target.value));
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* 手動入力モードまたは編集モードの場合のみ表示するフッター */}
              {(inputMode === "manual" || editingTransaction) && (
                <DialogFooter>
                  <Button
                    type="button"
                    onClick={saveTransaction}
                    disabled={isRegistering || !amount || !mainCategory}
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      "保存"
                    )}
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 概要カード */}
      <div className="grid gap-6 md:grid-cols-3 px-4">
        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                今月の支出
              </p>
              <h3 className="text-2xl font-bold mt-2">
                ¥{currentMonthExpense.toLocaleString()}
              </h3>
            </div>
            <div
              className={cn(
                "p-2 rounded-full",
                expenseChangeRate > 0
                  ? "bg-red-100 dark:bg-red-900/20"
                  : "bg-green-100 dark:bg-green-900/20"
              )}
            >
              {expenseChangeRate > 0 ? (
                <ArrowUpIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm text-muted-foreground">
            {expenseChangeRate > 0 ? (
              <ArrowUpIcon className="h-3 w-3 mr-1 text-red-600 dark:text-red-400" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />
            )}
            <span>先月比 {Math.abs(Math.round(expenseChangeRate))}%</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                1日あたりの支出
              </p>
              <h3 className="text-2xl font-bold mt-2">
                ¥{dailyExpense.toLocaleString()}
              </h3>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
              <TrendingUpIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm text-muted-foreground">
            <span>先月: ¥{lastMonthDailyExpense.toLocaleString()}/日</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                最大支出カテゴリー
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {largestExpenseCategory.name || "-"}
              </h3>
            </div>
            <div className="p-2 bg-primary/10 rounded-full">
              <Bot className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-muted-foreground">
              ¥{largestExpenseCategory.amount.toLocaleString()}
            </div>
          </div>
        </Card>
      </div>

      {/* タブ付きコンテンツ */}
      <div className="flex-1 overflow-hidden px-4 pb-4">
        <Tabs defaultValue="calendar" className="h-full flex flex-col">
          <TabsList>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              カレンダー
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              一覧
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3Icon className="h-4 w-4" />
              分析
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="flex-1 overflow-hidden">
            <Card className="h-full">
              <div className="grid grid-cols-[2fr_1fr] divide-x h-full">
                <div className="p-4 overflow-y-auto">
                  <div className="grid grid-cols-7 gap-0 text-center text-sm font-medium mb-2">
                    <div>月</div>
                    <div>火</div>
                    <div>水</div>
                    <div>木</div>
                    <div>金</div>
                    <div>土</div>
                    <div>日</div>
                  </div>
                  <CalendarGrid
                    currentMonth={currentMonth}
                    selectedDate={selectedDate}
                    transactions={dailyTransactions}
                    onSelectDate={setSelectedDate}
                  />
                </div>
                <div className="p-4 overflow-y-auto">
                  <h3 className="font-medium mb-4 sticky top-0 bg-background pt-2">
                    {selectedDate &&
                      format(selectedDate, "M月d日", { locale: ja })}
                    の収支
                  </h3>
                  <div className="space-y-4">
                    {getSelectedDateTransactions().map((transaction) => (
                      <div
                        key={transaction.transaction_id}
                        className="flex items-center justify-between py-2 border-b"
                      >
                        <div>
                          <div className="font-medium">
                            {transaction.type === "INCOME" ? "収入" : "支出"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.major_category_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.description}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`font-medium ${
                              transaction.type === "INCOME"
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {transaction.type === "INCOME" ? "+" : "-"}¥
                            {transaction.amount.toLocaleString()}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                editTransaction(
                                  format(selectedDate, "yyyy-MM-dd"),
                                  transaction
                                )
                              }
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleDeleteTransaction(
                                  Number(transaction.transaction_id)
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="table" className="flex-1 overflow-hidden">
            <Card className="h-full">
              <div className="h-full flex flex-col">
                <div className="p-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                  {Object.entries(dailyTransactions as DailyTransactions)
                    .flatMap(([date, transactions]) =>
                      transactions.map((t: Transaction) => ({ ...t, date }))
                    )
                    .filter((t: Transaction & { date: string }) => {
                      if (!searchTerm) return true;

                      const searchLower = searchTerm.toLowerCase();
                      const description = t.description?.toLowerCase() ?? "";
                      const categoryName =
                        t.major_category_name?.toLowerCase() ?? "";
                      const amount = t.amount?.toString() ?? "";

                      return (
                        description.includes(searchLower) ||
                        categoryName.includes(searchLower) ||
                        amount.includes(searchLower)
                      );
                    })
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((transaction) => (
                      <div
                        key={transaction.transaction_id}
                        className="flex items-center justify-between py-2 border-b"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-2 rounded-full ${
                              transaction.type === "INCOME"
                                ? "bg-blue-100 dark:bg-blue-900/20"
                                : "bg-red-100 dark:bg-red-900/20"
                            }`}
                          >
                            {transaction.type === "INCOME" ? (
                              <ArrowUpIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <ArrowDownIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              {transaction.type === "INCOME" ? "収入" : "支出"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {transaction.major_category_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {transaction.description}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div
                            className={`font-medium ${
                              transaction.type === "INCOME"
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {transaction.type === "INCOME" ? "+" : "-"}¥
                            {transaction.amount.toLocaleString()}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                editTransaction(transaction.date, transaction)
                              }
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleDeleteTransaction(
                                  Number(transaction.transaction_id)
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="flex-1 overflow-hidden">
            <div className="grid gap-6 md:grid-cols-2 h-full">
              <Card className="p-4 sm:p-6 overflow-hidden flex flex-col">
                <h3 className="text-lg font-semibold mb-2 sm:mb-4">
                  月別支出推移
                </h3>
                <div className="w-full h-[250px] sm:h-[300px]">
                  {monthlyExpenseData.length > 0 ? (
                    <ResponsiveLine
                      data={[
                        {
                          id: "支出",
                          color: chartColors[0],
                          data: monthlyExpenseData.map((item) => ({
                            x: item.name,
                            y: item.支出,
                          })),
                        },
                      ]}
                      margin={{ top: 30, right: 30, bottom: 70, left: 80 }}
                      xScale={{ type: "point" }}
                      yScale={{
                        type: "linear",
                        min: 0,
                        max: "auto",
                        stacked: false,
                        reverse: false,
                      }}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "月",
                        legendOffset: 40,
                        legendPosition: "middle",
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "金額 (円)",
                        legendOffset: -60,
                        legendPosition: "middle",
                        format: (value) =>
                          value >= 1000000
                            ? `${(value / 1000000).toFixed(1)}M`
                            : value >= 1000
                            ? `${(value / 1000).toFixed(0)}K`
                            : `${value}`,
                      }}
                      enableGridX={false}
                      enableGridY={true}
                      colors={chartColors}
                      pointSize={10}
                      pointColor={{ theme: "background" }}
                      pointBorderWidth={2}
                      pointBorderColor={{ from: "serieColor" }}
                      pointLabelYOffset={-12}
                      useMesh={true}
                      enableSlices="x"
                      sliceTooltip={({ slice }) => {
                        return (
                          <div
                            style={{
                              background:
                                theme === "dark" ? "#1e293b" : "#ffffff",
                              padding: "9px 12px",
                              border: `1px solid ${
                                theme === "dark" ? "#475569" : "#ccc"
                              }`,
                              borderRadius: "4px",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                              color: theme === "dark" ? "#e2e8f0" : "#334155",
                            }}
                          >
                            {slice.points.map((point) => (
                              <div
                                key={point.id}
                                style={{
                                  padding: "3px 0",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 12,
                                      height: 12,
                                      backgroundColor: point.serieColor,
                                      borderRadius: "50%",
                                      marginRight: 8,
                                    }}
                                  />
                                  <strong>{point.data.xFormatted}</strong>: ¥
                                  {Number(point.data.y).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }}
                      theme={{
                        axis: {
                          ticks: {
                            text: {
                              fontSize: 12,
                              fill: theme === "dark" ? "#e2e8f0" : "#64748b",
                            },
                          },
                          legend: {
                            text: {
                              fontSize: 14,
                              fontWeight: "bold",
                              fill: theme === "dark" ? "#e2e8f0" : "#64748b",
                            },
                          },
                        },
                        grid: {
                          line: {
                            stroke: theme === "dark" ? "#334155" : "#e2e8f0",
                            strokeWidth: 1,
                          },
                        },
                        tooltip: {
                          container: {
                            fontSize: 14,
                            background:
                              theme === "dark" ? "#1e293b" : "#ffffff",
                            color: theme === "dark" ? "#e2e8f0" : "#334155",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        データがありません
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-2 sm:mb-4">
                  カテゴリー別支出
                </h3>
                <div className="w-full h-[250px] sm:h-[300px]">
                  {categoryExpenseData.length > 0 ? (
                    <ResponsivePie
                      data={categoryExpenseData.map((item) => ({
                        id: item.name,
                        label: item.name,
                        value: item.value,
                        formattedValue: `¥${item.value.toLocaleString()}`,
                      }))}
                      margin={{ top: 30, right: 80, bottom: 70, left: 80 }}
                      innerRadius={0.5}
                      padAngle={0.7}
                      cornerRadius={3}
                      activeOuterRadiusOffset={8}
                      colors={chartColors}
                      borderWidth={1}
                      borderColor={{
                        from: "color",
                        modifiers: [["darker", 0.2]],
                      }}
                      enableArcLinkLabels={true}
                      arcLinkLabelsSkipAngle={10}
                      arcLinkLabelsTextColor={
                        theme === "dark" ? "#e2e8f0" : "#334155"
                      }
                      arcLinkLabelsThickness={2}
                      arcLinkLabelsColor={{ from: "color" }}
                      arcLinkLabelsDiagonalLength={16}
                      arcLinkLabelsStraightLength={24}
                      arcLinkLabelsTextOffset={6}
                      arcLabelsSkipAngle={10}
                      arcLabelsTextColor={{
                        from: "color",
                        modifiers: [["darker", 2]],
                      }}
                      valueFormat={(value) =>
                        `¥${Number(value).toLocaleString()}`
                      }
                      tooltip={({ datum }) => (
                        <div
                          style={{
                            background:
                              theme === "dark" ? "#1e293b" : "#ffffff",
                            padding: "9px 12px",
                            border: `1px solid ${
                              theme === "dark" ? "#475569" : "#ccc"
                            }`,
                            borderRadius: "4px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            color: theme === "dark" ? "#e2e8f0" : "#334155",
                          }}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <div
                              style={{
                                width: 12,
                                height: 12,
                                backgroundColor: datum.color,
                                borderRadius: "50%",
                                marginRight: 8,
                              }}
                            />
                            <strong>{datum.label}:</strong> ¥
                            {datum.value.toLocaleString()}
                          </div>
                        </div>
                      )}
                      legends={[
                        {
                          anchor: "bottom",
                          direction: "row",
                          justify: false,
                          translateX: 0,
                          translateY: 56,
                          itemsSpacing: 2,
                          itemWidth: 70,
                          itemHeight: 18,
                          itemTextColor:
                            theme === "dark" ? "#e2e8f0" : "#64748b",
                          itemDirection: "left-to-right",
                          itemOpacity: 1,
                          symbolSize: 12,
                          symbolShape: "circle",
                          effects: [
                            {
                              on: "hover",
                              style: {
                                itemTextColor:
                                  theme === "dark" ? "#ffffff" : "#000000",
                              },
                            },
                          ],
                        },
                      ]}
                      theme={{
                        labels: {
                          text: {
                            fontSize: 12,
                            fontWeight: "bold",
                            fill: theme === "dark" ? "#e2e8f0" : "#334155",
                          },
                        },
                        tooltip: {
                          container: {
                            fontSize: 14,
                            background:
                              theme === "dark" ? "#1e293b" : "#ffffff",
                            color: theme === "dark" ? "#e2e8f0" : "#334155",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          },
                        },
                        legends: {
                          text: {
                            fill: theme === "dark" ? "#e2e8f0" : "#64748b",
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        データがありません
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 sm:mt-4">
                  {categoryExpenseData.slice(0, 5).map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center space-x-2 min-w-[140px]"
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            chartColors[index % chartColors.length],
                        }}
                      />
                      <div className="text-sm">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-500 ml-2">
                          ¥{item.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
