"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { useTheme } from "next-themes";

// APIレスポンスの型定義
interface CategorySummary {
  category_id: number;
  category_name: string;
  amount: string;
}

interface MonthlySummary {
  yearmonth: string;
  total_income: string;
  total_expense: string;
  income_categories: CategorySummary[];
  expense_categories: CategorySummary[];
}

interface YearlySummaryResponse {
  year: number;
  user_id: number;
  monthly_summaries: MonthlySummary[];
}

// グラフ用のデータ型
interface MonthlyChartData {
  month: string;
  income: number;
  expense: number;
}

interface CategoryChartData {
  name: string;
  value: number;
}

const CHART_COLORS = [
  "#4f46e5", // インディゴ
  "#0ea5e9", // スカイブルー
  "#10b981", // エメラルド
  "#f59e0b", // アンバー
  "#ef4444", // レッド
  "#8884d8", // パープル
  "#82ca9d", // グリーン
  "#ffc658", // イエロー
  "#ff8042", // オレンジ
  "#0088fe", // ブルー
];

export default function YearlyPage() {
  const { theme } = useTheme();
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [chartType, setChartType] = useState<"monthly" | "category">("monthly");
  const [loading, setLoading] = useState(true);
  const [yearlyData, setYearlyData] = useState<YearlySummaryResponse | null>(
    null
  );
  const [monthlyChartData, setMonthlyChartData] = useState<MonthlyChartData[]>(
    []
  );
  const [incomeCategoryData, setIncomeCategoryData] = useState<
    CategoryChartData[]
  >([]);
  const [expenseCategoryData, setExpenseCategoryData] = useState<
    CategoryChartData[]
  >([]);
  const [yearlyTotal, setYearlyTotal] = useState({ income: 0, expense: 0 });

  // 年間データを取得する関数
  const fetchYearlyData = async (year: string, userId: number = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/transactions/summary/${userId}/${year}`
      );
      if (!response.ok) {
        throw new Error("データの取得に失敗しました");
      }
      const data: YearlySummaryResponse = await response.json();
      setYearlyData(data);
      processDataForCharts(data);
    } catch (error) {
      console.error("データ取得エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  // APIデータをグラフ用に加工する関数
  const processDataForCharts = (data: YearlySummaryResponse) => {
    // 月別データの作成
    const monthlyData: MonthlyChartData[] = data.monthly_summaries.map(
      (summary) => {
        const month = summary.yearmonth.substring(4, 6);
        return {
          month: `${month}月`,
          income: parseFloat(summary.total_income),
          expense: parseFloat(summary.total_expense),
        };
      }
    );
    setMonthlyChartData(monthlyData);

    // カテゴリー別データの集計
    const incomeCategories: Record<string, number> = {};
    const expenseCategories: Record<string, number> = {};

    data.monthly_summaries.forEach((summary) => {
      // 収入カテゴリーの集計
      summary.income_categories.forEach((category) => {
        if (incomeCategories[category.category_name]) {
          incomeCategories[category.category_name] += parseFloat(
            category.amount
          );
        } else {
          incomeCategories[category.category_name] = parseFloat(
            category.amount
          );
        }
      });

      // 支出カテゴリーの集計
      summary.expense_categories.forEach((category) => {
        if (expenseCategories[category.category_name]) {
          expenseCategories[category.category_name] += parseFloat(
            category.amount
          );
        } else {
          expenseCategories[category.category_name] = parseFloat(
            category.amount
          );
        }
      });
    });

    // カテゴリー別データをグラフ用に変換
    const incomeData: CategoryChartData[] = Object.entries(
      incomeCategories
    ).map(([name, value]) => ({
      name,
      value,
    }));

    const expenseData: CategoryChartData[] = Object.entries(
      expenseCategories
    ).map(([name, value]) => ({
      name,
      value,
    }));

    setIncomeCategoryData(incomeData);
    setExpenseCategoryData(expenseData);

    // 年間合計の計算
    const totalIncome = monthlyData.reduce(
      (sum, month) => sum + month.income,
      0
    );
    const totalExpense = monthlyData.reduce(
      (sum, month) => sum + month.expense,
      0
    );
    setYearlyTotal({ income: totalIncome, expense: totalExpense });
  };

  // 年が変更されたときにデータを再取得
  useEffect(() => {
    fetchYearlyData(selectedYear);
  }, [selectedYear]);

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
          <div
            className={`text-2xl font-bold ${
              yearlyTotal.income - yearlyTotal.expense >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {yearlyTotal.income - yearlyTotal.expense >= 0 ? "+" : ""}¥
            {(yearlyTotal.income - yearlyTotal.expense).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            貯蓄率:{" "}
            {yearlyTotal.income > 0
              ? Math.round(
                  ((yearlyTotal.income - yearlyTotal.expense) /
                    yearlyTotal.income) *
                    100
                )
              : 0}
            %
          </div>
        </Card>
      </div>

      {loading ? (
        <Card className="p-6 flex justify-center items-center h-[400px]">
          <div>データを読み込み中...</div>
        </Card>
      ) : chartType === "monthly" ? (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">月別収支推移</h3>
          <div className="h-[400px]">
            <ResponsiveLine
              data={[
                {
                  id: "収入",
                  color: CHART_COLORS[0],
                  data: monthlyChartData.map((item) => ({
                    x: item.month,
                    y: item.income,
                  })),
                },
                {
                  id: "支出",
                  color: CHART_COLORS[1],
                  data: monthlyChartData.map((item) => ({
                    x: item.month,
                    y: item.expense,
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
              colors={CHART_COLORS}
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
                      background: theme === "dark" ? "#1e293b" : "#ffffff",
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
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              backgroundColor: point.serieColor,
                              borderRadius: "50%",
                              marginRight: 8,
                            }}
                          />
                          <strong>{point.serieId}:</strong> ¥
                          {point.data.yFormatted
                            ? point.data.yFormatted
                            : Number(point.data.y).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }}
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
                  itemTextColor: theme === "dark" ? "#e2e8f0" : "#64748b",
                  itemDirection: "left-to-right",
                  itemOpacity: 1,
                  symbolSize: 12,
                  symbolShape: "circle",
                },
              ]}
            />
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* 収入カテゴリー */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">収入カテゴリー別</h3>
            {incomeCategoryData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsivePie
                  data={incomeCategoryData.map((item) => ({
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
                  colors={CHART_COLORS}
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
                  valueFormat={(value) => `¥${Number(value).toLocaleString()}`}
                  tooltip={({ datum }) => (
                    <div
                      style={{
                        background: theme === "dark" ? "#1e293b" : "#ffffff",
                        padding: "9px 12px",
                        border: `1px solid ${
                          theme === "dark" ? "#475569" : "#ccc"
                        }`,
                        borderRadius: "4px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        color: theme === "dark" ? "#e2e8f0" : "#334155",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
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
                      itemTextColor: theme === "dark" ? "#e2e8f0" : "#64748b",
                      itemDirection: "left-to-right",
                      itemOpacity: 1,
                      symbolSize: 12,
                      symbolShape: "circle",
                    },
                  ]}
                />
              </div>
            ) : (
              <div className="flex justify-center items-center h-[300px]">
                <p className="text-muted-foreground">データがありません</p>
              </div>
            )}
          </Card>

          {/* 支出カテゴリー */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">支出カテゴリー別</h3>
            {expenseCategoryData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsivePie
                  data={expenseCategoryData.map((item) => ({
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
                  colors={CHART_COLORS}
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
                  valueFormat={(value) => `¥${Number(value).toLocaleString()}`}
                  tooltip={({ datum }) => (
                    <div
                      style={{
                        background: theme === "dark" ? "#1e293b" : "#ffffff",
                        padding: "9px 12px",
                        border: `1px solid ${
                          theme === "dark" ? "#475569" : "#ccc"
                        }`,
                        borderRadius: "4px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        color: theme === "dark" ? "#e2e8f0" : "#334155",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
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
                      itemTextColor: theme === "dark" ? "#e2e8f0" : "#64748b",
                      itemDirection: "left-to-right",
                      itemOpacity: 1,
                      symbolSize: 12,
                      symbolShape: "circle",
                    },
                  ]}
                />
              </div>
            ) : (
              <div className="flex justify-center items-center h-[300px]">
                <p className="text-muted-foreground">データがありません</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
