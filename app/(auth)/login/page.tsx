"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bot, LineChart, TrendingUp, Receipt, WalletCards } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center p-8 bg-muted">
        <div className="flex items-center space-x-2 mb-6">
          <WalletCards className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold">Smart Finance</h1>
        </div>
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              スマートな家計管理を、<br />ゲーム感覚で始めよう
            </h2>
            <p className="text-muted-foreground">
              AIを活用した家計簿アプリで、楽しみながら
              賢明な経済管理を実現しましょう。
            </p>
          </div>
          <div className="grid gap-6">
            <div className="flex items-start space-x-4 group">
              <div className="p-2 bg-background rounded-full shrink-0 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <LineChart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">スマートな支出分析</h3>
                <p className="text-sm text-muted-foreground">
                  支出パターンをAIが分析し、あなたに最適な
                  家計管理方法をアドバイス
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 group">
              <div className="p-2 bg-background rounded-full shrink-0 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">パーソナルAIチャット</h3>
                <p className="text-sm text-muted-foreground">
                  AIアシスタントがあなたの家計に関する
                  質問や相談に24時間対応
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 group">
              <div className="p-2 bg-background rounded-full shrink-0 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">レベルアップシステム</h3>
                <p className="text-sm text-muted-foreground">
                  継続的な記録でキャラクターがレベルアップ！
                  新機能のアンロックで記録が楽しくなる
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 group">
              <div className="p-2 bg-background rounded-full shrink-0 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">AIレシート読み取り</h3>
                <p className="text-sm text-muted-foreground">
                  レシートを撮影するだけで自動的に内容を読み取り、
                  カテゴリー分類まで完了
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold">ログイン</h2>
            <p className="text-muted-foreground">
              アカウントにログインして家計管理を始めましょう
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input id="password" type="password" />
            </div>
            <Button className="w-full">ログイン</Button>
            <div className="text-sm text-center text-muted-foreground">
              アカウントをお持ちでない方は{" "}
              <Link href="/register" className="text-primary underline-offset-4 hover:underline">
                新規登録
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}