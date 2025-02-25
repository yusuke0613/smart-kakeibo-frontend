"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 仮のデータ
const monthlyData = [
  { month: "1月", income: 450000, expense: 320000 },
  { month: "2月", income: 450000, expense: 280000 },
  { month: "3月", income: 650000, expense: 350000 }, // 賞与月
  { month: "4月", income: 450000, expense: 300000 },
  { month: "5月", income: 450000, expense: 290000 },
  { month: "6月", income: 450000, expense: 310000 },
  { month: "7月", income: 650000, expense: 380000 }, // 賞与月
  { month: "8月", income: 450000, expense: 340000 },
  { month: "9月", income: 450000, expense: 290000 },
  { month: "10月", income: 450000, expense: 300000 },
  { month: "11月", income: 450000, expense: 320000 },
  { month: "12月", income: 850000, expense: 420000 }, // 賞与月
];

const categoryData = {
  income: [
    { name: "給与", value: 5400000 },
    { name: "賞与", value: 1800000 },
    { name: "副収入", value: 300000 },
  ],
  expense: [
    { name: "食費", value: 960000 },
    { name: "住居費", value: 1800000 },
    { name: "光熱費", value: 240000 },
    { name: "交通費", value: 180000 },
    { name: "通信費", value: 144000 },
    { name: "娯楽費", value: 360000 },
    { name: "その他", value: 216000 },
  ],
};

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function YearlyPage() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [chartType, setChartType] = useState<"monthly" | "category">("monthly");

  // 年間の合計を計算
  const yearlyTotal = {
    income: monthlyData.reduce((sum, month) => sum + month.income, 0),
    expense: monthlyData.reduce((sum, month) => sum + month.expense, 0),
  };

  const handleYearChange = (direction: "prev" | "next") => {
    const currentYear = parseInt(selectedYear);
    setSelectedYear(
      direction === "prev"
        ? (currentYear - 1).toString()
        : (currentYear + 1).toString()
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">年間収支</h1>
          <p className="text-muted-foreground">年間の収支状況を分析します</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleYearChange("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium min-w-[5rem] text-center">
              {selectedYear}年
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleYearChange("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Select
            value={chartType}
            onValueChange={(value: "monthly" | "category") =>
              setChartType(value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">月別推移</SelectItem>
              <SelectItem value="category">カテゴリー別</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 年間サマリー */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            年間収入
          </h3>
          <div className="text-2xl font-bold">
            ¥{yearlyTotal.income.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            月平均: ¥{Math.round(yearlyTotal.income / 12).toLocaleString()}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            年間支出
          </h3>
          <div className="text-2xl font-bold">
            ¥{yearlyTotal.expense.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            月平均: ¥{Math.round(yearlyTotal.expense / 12).toLocaleString()}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            年間収支
          </h3>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            +¥{(yearlyTotal.income - yearlyTotal.expense).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            貯蓄率:{" "}
            {Math.round(
              ((yearlyTotal.income - yearlyTotal.expense) /
                yearlyTotal.income) *
                100
            )}
            %
          </div>
        </Card>
      </div>

      {chartType === "monthly" ? (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">月別収支推移</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
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
                <Legend />
                <Bar
                  dataKey="income"
                  name="収入"
                  fill="#4f46e5" // 直接色を指定
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  name="支出"
                  fill="#4f46e5" // 直接色を指定
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* 収入カテゴリー */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">収入カテゴリー別</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData.income}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.income.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
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
            <div className="flex flex-wrap gap-4 mt-4">
              {categoryData.income.map((item, index) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
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
          </Card>

          {/* 支出カテゴリー */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">支出カテゴリー別</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData.expense}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.expense.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
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
            <div className="flex flex-wrap gap-4 mt-4">
              {categoryData.expense.map((item, index) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
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
          </Card>
        </div>
      )}
    </div>
  );
}
