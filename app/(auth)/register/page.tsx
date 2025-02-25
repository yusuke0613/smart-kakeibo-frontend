"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bot, TrendingUp, Receipt, Sparkles, WalletCards } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
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
              家計管理の新しいスタンダード
            </h2>
            <p className="text-muted-foreground">
              レシート読み取り、AI分析、レベルアップシステムで
              楽しみながら賢く家計を管理できます。
            </p>
          </div>
          <div className="grid gap-6">
            <div className="relative">
              <div className="absolute -left-4 -top-4">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <div className="bg-background rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold">新規登録特典</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <span className="text-sm">AIアシスタント30日間無料</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-sm">初期レベル+3ブースト</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Receipt className="h-5 w-5 text-primary" />
                    <span className="text-sm">レシート読み取り10回無料</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-background/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">レベルアップの特典</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Lv.5: カスタムカテゴリー作成
                </p>
                <p className="text-sm text-muted-foreground">
                  Lv.10: 高度な分析レポート
                </p>
                <p className="text-sm text-muted-foreground">
                  Lv.15: AIアシスタントの性格カスタマイズ
                </p>
                <p className="text-sm text-muted-foreground">
                  Lv.20: プレミアムテーマ解放
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold">アカウント作成</h2>
            <p className="text-muted-foreground">
              新規アカウントを作成して、スマートな家計管理を始めましょう
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">お名前</Label>
              <Input id="name" placeholder="山田 太郎" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input id="password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">パスワード（確認）</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Button className="w-full">アカウント作成</Button>
            <div className="text-sm text-center text-muted-foreground">
              既にアカウントをお持ちの方は{" "}
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                ログイン
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}