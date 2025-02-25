"use client";

import { useState } from "react";
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
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, PencilIcon, Camera, ShoppingCart } from "lucide-react";

type Expense = {
  id: string;
  store: string;
  amount: number;
  category: string;
  date: Date;
  paymentMethod: string;
};

export default function ReceiptsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      store: "スーパーマーケット",
      amount: 3240,
      category: "食費",
      date: new Date("2024-02-18"),
      paymentMethod: "現金",
    },
    {
      id: "2",
      store: "スーパーマーケット",
      amount: 3240,
      category: "食費",
      date: new Date("2024-02-18"),
      paymentMethod: "現金",
    },
    {
      id: "3",
      store: "スーパーマーケット",
      amount: 3240,
      category: "食費",
      date: new Date("2024-02-18"),
      paymentMethod: "現金",
    },
  ]);

  const [date, setDate] = useState<Date>(new Date());

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">支出の登録</h1>
        <div className="flex gap-3">
          <Button>
            <PencilIcon className="h-4 w-4 mr-2" />
            手入力で登録
          </Button>
          <Button variant="secondary">
            <Camera className="h-4 w-4 mr-2" />
            レシートから登録
          </Button>
        </div>
      </div>

      {/* 登録フォーム */}
      <Card className="p-6 mb-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="store">店舗名</Label>
            <Input id="store" placeholder="店舗名を入力" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">金額</Label>
            <Input
              id="amount"
              type="number"
              placeholder="金額を入力"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div className="space-y-2">
            <Label>カテゴリー</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="カテゴリーを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="food">食費</SelectItem>
                <SelectItem value="daily">日用品</SelectItem>
                <SelectItem value="entertainment">娯楽</SelectItem>
                <SelectItem value="transport">交通費</SelectItem>
                <SelectItem value="utilities">光熱費</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>日付</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ja }) : "日付を選択"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button>登録する</Button>
        </div>
      </Card>

      {/* 最近の支出 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">最近の支出</h2>
        <div className="space-y-4">
          {expenses.map((expense) => (
            <Card key={expense.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{expense.store}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(expense.date, "yyyy/MM/dd")} ・ {expense.category}{" "}
                      ・ {expense.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">
                    ¥{expense.amount.toLocaleString()}
                  </span>
                  <Button variant="ghost" size="icon">
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
