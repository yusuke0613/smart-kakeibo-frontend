"use client"

import { Avatar } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, Lock, CheckCircle2 } from "lucide-react"

export default function ProfilePage() {
  // TODO: ユーザー情報をSupabaseから取得
  const user = {
    name: "ユーザー名",
    level: 3,
    exp: 350,
    expToNextLevel: 500,
    joinedAt: "2024年1月",
    achievements: [
      { id: 1, name: "初めての記録", description: "最初の支出を記録", completed: true },
      { id: 2, name: "継続は力なり", description: "7日連続で記録", completed: true },
      { id: 3, name: "分析マスター", description: "全ての分析機能を使用", completed: false },
    ]
  }

  const features = [
    { level: 1, name: "基本機能", description: "支出の記録と基本的なグラフ表示", unlocked: true },
    { level: 3, name: "カスタムカテゴリー", description: "オリジナルの支出カテゴリーを作成可能", unlocked: true },
    { level: 5, name: "AIアドバイザー", description: "AIによる支出分析とアドバイス", unlocked: false },
    { level: 7, name: "高度な分析", description: "詳細な支出パターン分析と予測", unlocked: false },
    { level: 10, name: "カスタムテーマ", description: "UIのカラーテーマをカスタマイズ", unlocked: false },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        {/* プロフィール情報 */}
        <Card className="p-6 h-fit">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <div className="bg-primary/10 w-full h-full flex items-center justify-center text-2xl font-bold">
                {user.name[0]}
              </div>
            </Avatar>
            <h2 className="text-xl font-bold mb-1">{user.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {user.joinedAt}から利用開始
            </p>
            <div className="w-full space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Level {user.level}</span>
                <span>{user.exp}/{user.expToNextLevel} EXP</span>
              </div>
              <Progress value={(user.exp / user.expToNextLevel) * 100} />
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">
                <Trophy className="h-3 w-3 mr-1" />
                レベル {user.level}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                継続 {30} 日
              </Badge>
            </div>
          </div>
        </Card>

        <div className="space-y-8">
          {/* 機能解放状況 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">機能解放状況</h3>
            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature.name} className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full shrink-0 ${
                    feature.unlocked 
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {feature.unlocked ? <CheckCircle2 className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{feature.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        Level {feature.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 実績 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">実績</h3>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-4">
                {user.achievements.map((achievement) => (
                  <div key={achievement.id}>
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-full shrink-0 ${
                        achievement.completed
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {achievement.completed ? (
                          <Trophy className="h-5 w-5" />
                        ) : (
                          <Lock className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{achievement.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    <Separator className="my-4" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}