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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
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
} from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  getTransactions,
  groupTransactionsByDate,
} from "./services/transaction-service";
import { Transaction, DailyTransactions } from "./types";
import { fetchCategories } from "./services/category-service";

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
    .filter((t: any) => t.type === "income")
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const expense = dayTransactions
    .filter((t: any) => t.type === "expense")
    .reduce((sum: number, t: any) => sum + t.amount, 0);

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
            {income.toLocaleString()}
          </div>
        )}
        {expense > 0 && (
          <div className="text-xs font-medium text-red-600 dark:text-red-400">
            {expense.toLocaleString()}
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

// 仮のデータ
const monthlyData = [
  { name: "1月", 支出: 85000 },
  { name: "2月", 支出: 92000 },
  { name: "3月", 支出: 78000 },
  { name: "4月", 支出: 88000 },
  { name: "5月", 支出: 95000 },
  { name: "6月", 支出: 82000 },
];

const categoryData = [
  { name: "食費", value: 45000 },
  { name: "日用品", value: 15000 },
  { name: "交通費", value: 12000 },
  { name: "娯楽", value: 8000 },
  { name: "その他", value: 2000 },
];

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

// 日別収支データ（サンプル）
const initialTransactions: DailyTransactions = {
  "2024-02-01": [
    {
      id: "1",
      type: "income",
      category: "salary",
      amount: 450000,
      memo: "2月分給与",
      date: "2024-02-01",
    },
    {
      id: "2",
      type: "expense",
      category: "food",
      amount: 8000,
      memo: "スーパー",
      date: "2024-02-01",
    },
  ],
  "2024-02-02": [
    {
      id: "3",
      type: "expense",
      category: "daily",
      amount: 1200,
      memo: "日用品",
      date: "2024-02-02",
    },
  ],
  "2024-02-03": [
    {
      id: "4",
      type: "expense",
      category: "food",
      amount: 2200,
      memo: "コンビニ",
      date: "2024-02-03",
    },
  ],
  "2024-02-04": [
    {
      id: "5",
      type: "expense",
      category: "entertainment",
      amount: 3200,
      memo: "映画",
      date: "2024-02-04",
    },
  ],
  "2024-02-05": [
    {
      id: "6",
      type: "expense",
      category: "food",
      amount: 13200,
      memo: "外食",
      date: "2024-02-05",
    },
  ],
  "2024-02-06": [
    {
      id: "7",
      type: "expense",
      category: "daily",
      amount: 40200,
      memo: "家電",
      date: "2024-02-06",
    },
  ],
  "2024-02-07": [
    {
      id: "8",
      type: "expense",
      category: "transport",
      amount: 2000,
      memo: "電車",
      date: "2024-02-07",
    },
  ],
  "2024-02-08": [
    {
      id: "9",
      type: "expense",
      category: "food",
      amount: 9800,
      memo: "スーパー",
      date: "2024-02-08",
    },
  ],
  "2024-02-09": [
    {
      id: "10",
      type: "expense",
      category: "entertainment",
      amount: 11800,
      memo: "ショッピング",
      date: "2024-02-09",
    },
  ],
  "2024-02-10": [
    {
      id: "11",
      type: "expense",
      category: "utilities",
      amount: 88000,
      memo: "家賃",
      date: "2024-02-10",
    },
  ],
  "2024-02-11": [
    {
      id: "12",
      type: "expense",
      category: "food",
      amount: 7200,
      memo: "外食",
      date: "2024-02-11",
    },
  ],
  "2024-02-12": [
    {
      id: "13",
      type: "expense",
      category: "daily",
      amount: 4200,
      memo: "日用品",
      date: "2024-02-12",
    },
  ],
  "2024-02-13": [
    {
      id: "14",
      type: "expense",
      category: "entertainment",
      amount: 24200,
      memo: "趣味",
      date: "2024-02-13",
    },
  ],
};

export default function DashboardPage() {
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
  const [categories, setCategories] = useState<Category[]>([]);
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

  // カテゴリーデータの取得
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories("1");
        setCategories(data);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };
    loadCategories();
  }, []);

  // 選択された大カテゴリーの小カテゴリーを取得
  const minorCategories = useMemo(() => {
    const category = categories.find((c) => c.id === mainCategory);
    return category?.minor_categories || [];
  }, [categories, mainCategory]);

  // 大カテゴリー選択時に小カテゴリーの初期値を設定
  const handleMainCategoryChange = (value: string) => {
    setMainCategory(value);
    const category = categories.find((c) => c.id === value);
    if (category?.minor_categories?.length > 0) {
      setSubCategory(category.minor_categories[0].id);
    } else {
      setSubCategory("");
    }
  };

  // カテゴリー名を日本語に変換
  const getCategoryName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      food: "食費",
      daily: "日用品",
      entertainment: "娯楽",
      transport: "交通費",
      utilities: "光熱費",
      salary: "給与",
      bonus: "賞与",
      other: "その他",
    };
    return categoryMap[category] || category;
  };

  // 月を変更する関数
  const changeMonth = async (date: Date) => {
    try {
      setIsLoading(true);
      const data = await getTransactions("1", date);
      setTransactions(data);
      const groupedData = groupTransactionsByDate(data);
      setDailyTransactions(groupedData);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 取引を削除
  const deleteTransaction = (date: string, transactionId: string) => {
    setDailyTransactions((prev) => ({
      ...prev,
      [date]: prev[date].filter((t) => t.id !== transactionId),
    }));
  };

  // 取引を編集
  const editTransaction = (date: string, transaction: any) => {
    setEditingTransaction({ ...transaction, date });
    setTransactionType(transaction.type);
    setMainCategory(transaction.category);
    setAmount(transaction.amount.toString());
    setMemo(transaction.memo);
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
  };

  // 取引を保存
  const saveTransaction = async () => {
    if (!amount || !mainCategory) return;

    setIsRegistering(true);
    try {
      const formData = {
        type: transactionType,
        category_id: mainCategory,
        sub_category_id: subCategory,
        amount: parseInt(amount),
        memo,
        date: format(selectedDate, "yyyy-MM-dd"),
      };

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, formData);
      } else {
        await createTransaction(formData);
      }

      setShowAddDialog(false);
      resetForm();
      // データ再取得
      const data = await getTransactions("1", currentMonth);
      const groupedData = groupTransactionsByDate(data);
      setDailyTransactions(groupedData);
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

  return (
    <div className="container mx-auto py-8 px-4">
      {/* 月選択ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">
            {format(currentMonth, "yyyy年M月", { locale: ja })}
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeMonth(new Date(currentMonth))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeMonth(new Date(addMonths(currentMonth, 1)))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
                            .filter((cat) => cat.type === transactionType)
                            .map((category) => (
                              <SelectItem key={category.id} value={category.id}>
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
                        disabled={!mainCategory || minorCategories.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="小カテゴリーを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {minorCategories.map((minor) => (
                            <SelectItem key={minor.id} value={minor.id}>
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

      {/* 概要カード */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                今月の支出
              </p>
              <h3 className="text-2xl font-bold mt-2">¥82,000</h3>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
              <ArrowUpIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm text-muted-foreground">
            <ArrowUpIcon className="h-3 w-3 mr-1 text-red-600 dark:text-red-400" />
            <span>先月比 +5%</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                平均支出（6ヶ月）
              </p>
              <h3 className="text-2xl font-bold mt-2">¥86,667</h3>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
              <TrendingUpIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm text-muted-foreground">
            <ArrowDownIcon className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />
            <span>平均以下で推移中</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                最大支出カテゴリー
              </p>
              <h3 className="text-2xl font-bold mt-2">食費</h3>
            </div>
            <div className="p-2 bg-primary/10 rounded-full">
              <Bot className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="mt-4">
            <Button
              variant="link"
              className="h-auto p-0 text-sm text-muted-foreground"
            >
              AIアドバイスを見る
            </Button>
          </div>
        </Card>
      </div>

      {/* タブ付きコンテンツ */}
      <Tabs defaultValue="calendar" className="space-y-4">
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

        <TabsContent value="calendar">
          <Card>
            <div className="grid grid-cols-[2fr_1fr] divide-x">
              <div className="p-4">
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
              <div className="p-4">
                <h3 className="font-medium mb-4">
                  {selectedDate &&
                    format(selectedDate, "M月d日", { locale: ja })}
                  の収支
                </h3>
                <div className="space-y-4">
                  {getSelectedDateTransactions().map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between py-2 border-b"
                    >
                      <div>
                        <div className="font-medium">
                          {transaction.type === "income" ? "収入" : "支出"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getCategoryName(transaction.category)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.memo}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`font-medium ${
                            transaction.type === "income"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}¥
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
                              deleteTransaction(
                                format(selectedDate, "yyyy-MM-dd"),
                                transaction.id
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

        <TabsContent value="table">
          <Card className="p-6">
            <div className="mb-6">
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
            <div className="space-y-4">
              {Object.entries(dailyTransactions as DailyTransactions)
                .flatMap(([date, transactions]) =>
                  transactions.map((t: Transaction) => ({ ...t, date }))
                )
                .filter((t: Transaction & { date: string }) => {
                  const searchLower = searchTerm.toLowerCase();
                  return (
                    t.memo.toLowerCase().includes(searchLower) ||
                    t.category.toLowerCase().includes(searchLower) ||
                    t.amount.toString().includes(searchLower)
                  );
                })
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between py-3 border-b"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === "income"
                            ? "bg-blue-100 dark:bg-blue-900/20"
                            : "bg-red-100 dark:bg-red-900/20"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <ArrowUpIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {getCategoryName(transaction.category)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.memo}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(transaction.date), "yyyy/MM/dd")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div
                        className={`font-medium ${
                          transaction.type === "income"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}¥
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
                            deleteTransaction(transaction.date, transaction.id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">月別支出推移</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--border))"
                      tick={{ fill: "hsl(var(--foreground))" }}
                    />
                    <YAxis
                      stroke="hsl(var(--border))"
                      tick={{ fill: "hsl(var(--foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="支出"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                      activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">カテゴリー別支出</h3>
              <div className="flex flex-col h-[300px]">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        startAngle={90}
                        endAngle={450}
                      >
                        {categoryData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            strokeWidth={1}
                            stroke="hsl(var(--background))"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-4 mt-2">
                  {categoryData.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center space-x-2 min-w-[140px]"
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <div className="text-sm">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground ml-2">
                          ¥{item.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
