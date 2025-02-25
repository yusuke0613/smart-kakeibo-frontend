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
  const [inputMode, setInputMode] = useState<"manual" | "receipt">("manual");
  const [isScanning, setIsScanning] = useState(false);
  const [receiptItems, setReceiptItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastMonthTransactions, setLastMonthTransactions] = useState<
    Transaction[]
  >([]);

  // カテゴリーデータの取得
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetch(
          `http://127.0.0.1:8000/api/v1/categories/user/1/all`
        ).then((res) => res.json());
        console.log(data);
        setCategories(data);
      } catch (err) {
        console.error("Error loading categories:", err);
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
        const [currentMonthData, lastMonthData] = await Promise.all([
          getTransactions("1", currentMonth),
          getTransactions("1", addMonths(currentMonth, -1)),
        ]);

        // カテゴリーデータを取得
        const categoriesData = await fetch(
          `http://127.0.0.1:8000/api/v1/categories/user/1/all`
        ).then((res) => res.json());
        setCategories(categoriesData);

        setTransactions(currentMonthData);
        setLastMonthTransactions(lastMonthData);
        setDailyTransactions(groupTransactionsByDate(currentMonthData));
      } catch (error) {
        console.error("Error loading initial data:", error);
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
              name: transaction.major_category_name,
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
      await deleteTransaction(transactionId);
      // データを再取得
      const data = await getTransactions("1", currentMonth);
      const groupedData = groupTransactionsByDate(data);
      setDailyTransactions(groupedData);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
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
    setInputMode("manual");
    setReceiptItems([]);
    setSelectedItems([]);
    // 注意: 日付はリセットしない（現在選択されている日付を維持）
  };

  // 取引を保存
  const saveTransaction = async () => {
    if (!amount || !mainCategory) return;

    setIsRegistering(true);
    try {
      const formData = {
        type: transactionType.toUpperCase() as "INCOME" | "EXPENSE",
        major_category_id: parseInt(mainCategory),
        minor_category_id: subCategory ? parseInt(subCategory) : undefined,
        amount: amount,
        description: memo,
        transaction_date: format(selectedDate, "yyyy-MM-dd"),
      };

      if (editingTransaction) {
        await updateTransaction(editingTransaction.transaction_id, formData);
      } else {
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
      console.error("Error saving transaction:", error);
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
    console.log("dailyTransactions:", dailyTransactions);
    console.log("transactions:", transactions);

    // トランザクションから直接計算する方法に変更
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const targetMonth = subMonths(currentMonth, i);
      const monthStr = format(targetMonth, "M月");

      // 対象月のトランザクションをフィルタリング
      const monthlyTransactions = transactions.filter((t: Transaction) => {
        const transactionDate = new Date(t.transaction_date);
        return isSameMonth(transactionDate, targetMonth);
      });

      const monthlyExpense = calculateMonthlyExpense(monthlyTransactions);
      data.push({
        name: monthStr,
        支出: monthlyExpense,
      });
    }

    console.log("月別支出データ:", data);

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
    const categoryExpenses = transactions.reduce(
      (acc: { [key: string]: number }, transaction) => {
        if (transaction.type === "EXPENSE") {
          const categoryName = transaction.major_category_name;
          acc[categoryName] =
            (acc[categoryName] || 0) + Number(transaction.amount);
        }
        return acc;
      },
      {}
    );

    return Object.entries(categoryExpenses)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTransaction ? "収支の編集" : "収支の追加"}
                </DialogTitle>
              </DialogHeader>
              <Tabs
                value={inputMode}
                onValueChange={(value) => {
                  if (value === "manual" || value === "receipt") {
                    setInputMode(value);
                  }
                }}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">手動入力</TabsTrigger>
                  <TabsTrigger value="receipt">レシート読み取り</TabsTrigger>
                </TabsList>
                <TabsContent value="manual">
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>種類</Label>
                      <Select
                        value={transactionType}
                        onValueChange={(value: "income" | "expense") =>
                          setTransactionType(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">収入</SelectItem>
                          <SelectItem value="expense">支出</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>日付</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="date"
                          value={format(selectedDate, "yyyy-MM-dd")}
                          onChange={(e) => {
                            if (e.target.value) {
                              setSelectedDate(new Date(e.target.value));
                            }
                          }}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>大カテゴリー</Label>
                        <Select
                          value={mainCategory}
                          onValueChange={handleMainCategoryChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="カテゴリーを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories
                              .filter(
                                (cat) =>
                                  cat.type === transactionType.toUpperCase()
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

                      <div className="space-y-2">
                        <Label>小カテゴリー</Label>
                        <Select
                          value={subCategory}
                          onValueChange={setSubCategory}
                          disabled={
                            !mainCategory || minorCategories.length === 0
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="小カテゴリーを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {minorCategories.map((minor: MinorCategory) => (
                              <SelectItem
                                key={minor.minor_category_id}
                                value={minor.minor_category_id.toString()}
                              >
                                {minor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>金額</Label>
                      <Input
                        type="number"
                        placeholder="金額を入力"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>メモ</Label>
                      <Input
                        placeholder="メモを入力"
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="receipt">
                  <div className="grid gap-4 py-4">
                    <div className="text-center py-8">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">
                        レシートをスキャン
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        レシートを撮影して自動で支出を記録できます
                      </p>
                      <Button
                        onClick={() => setIsScanning(true)}
                        disabled={isScanning}
                      >
                        {isScanning ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            スキャン中...
                          </>
                        ) : (
                          <>
                            <Camera className="h-4 w-4 mr-2" />
                            レシートを撮影
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    resetForm();
                  }}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={saveTransaction}
                  disabled={
                    (inputMode === "manual" && (!amount || !mainCategory)) ||
                    (inputMode === "receipt" && selectedItems.length === 0) ||
                    isRegistering
                  }
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      登録中...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {editingTransaction ? "更新" : "登録"}
                    </>
                  )}
                </Button>
              </DialogFooter>
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
              <Card className="p-6 overflow-hidden flex flex-col">
                <h3 className="text-lg font-semibold mb-4">月別支出推移</h3>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveLine
                    data={[
                      {
                        id: "支出",
                        color: chartColors[0],
                        data: [
                          { x: "1月", y: 120000 },
                          { x: "2月", y: 150000 },
                          { x: "3月", y: 130000 },
                          { x: "4月", y: 170000 },
                          { x: "5月", y: 140000 },
                          { x: "6月", y: 160000 },
                        ],
                      },
                    ]}
                    margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                    xScale={{ type: "point" }}
                    yScale={{
                      type: "linear",
                      min: "auto",
                      max: "auto",
                    }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: "月",
                      legendOffset: 36,
                      legendPosition: "middle",
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: "金額",
                      legendOffset: -40,
                      legendPosition: "middle",
                      format: (value) => `¥${value.toLocaleString()}`,
                    }}
                    colors={chartColors}
                    pointSize={10}
                    pointColor={{ theme: "background" }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: "serieColor" }}
                    pointLabelYOffset={-12}
                    useMesh={true}
                    legends={[
                      {
                        anchor: "bottom-right",
                        direction: "column",
                        justify: false,
                        translateX: 100,
                        translateY: 0,
                        itemsSpacing: 0,
                        itemDirection: "left-to-right",
                        itemWidth: 80,
                        itemHeight: 20,
                        itemOpacity: 0.75,
                        symbolSize: 12,
                        symbolShape: "circle",
                        symbolBorderColor: "rgba(0, 0, 0, .5)",
                        effects: [
                          {
                            on: "hover",
                            style: {
                              itemBackground: "rgba(0, 0, 0, .03)",
                              itemOpacity: 1,
                            },
                          },
                        ],
                      },
                    ]}
                  />
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">カテゴリー別支出</h3>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsivePie
                    data={[
                      { id: "通信費", label: "通信費", value: 434243 },
                      { id: "光熱費", label: "光熱費", value: 425766 },
                      { id: "食費", label: "食費", value: 251460 },
                      { id: "住居費", label: "住居費", value: 225929 },
                      { id: "日用品", label: "日用品", value: 55050 },
                    ]}
                    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
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
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: "color" }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{
                      from: "color",
                      modifiers: [["darker", 2]],
                    }}
                    legends={[
                      {
                        anchor: "bottom",
                        direction: "row",
                        justify: false,
                        translateX: 0,
                        translateY: 56,
                        itemsSpacing: 0,
                        itemWidth: 100,
                        itemHeight: 18,
                        itemTextColor: "#999",
                        itemDirection: "left-to-right",
                        itemOpacity: 1,
                        symbolSize: 18,
                        symbolShape: "circle",
                        effects: [
                          {
                            on: "hover",
                            style: {
                              itemTextColor: "#000",
                            },
                          },
                        ],
                      },
                    ]}
                  />
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  {[
                    { name: "通信費", value: 434243 },
                    { name: "光熱費", value: 425766 },
                    { name: "食費", value: 251460 },
                    { name: "住居費", value: 225929 },
                    { name: "日用品", value: 55050 },
                  ].map((item, index) => (
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
