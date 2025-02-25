"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  Bot,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  LineChart,
  PieChart,
  Lightbulb,
  Settings,
  Sparkles,
  GraduationCap,
  Heart
} from "lucide-react"

// AIアシスタントのキャラクター定義
const AI_CHARACTERS = [
  {
    id: "professional",
    name: "プロフェッショナル",
    description: "客観的で的確なアドバイスを提供する専門家",
    icon: GraduationCap,
    style: "text-blue-600 dark:text-blue-400",
    messageStyle: "冷静で論理的な分析に基づいて、"
  },
  {
    id: "friendly",
    name: "フレンドリー",
    description: "優しく励ましながらアドバイスするパートナー",
    icon: Heart,
    style: "text-pink-600 dark:text-pink-400",
    messageStyle: "一緒に頑張りましょう！"
  },
  {
    id: "energetic",
    name: "エネルギッシュ",
    description: "ポジティブで行動的なモチベーター",
    icon: Sparkles,
    style: "text-yellow-600 dark:text-yellow-400",
    messageStyle: "さあ、一緒にチャレンジしていきましょう！"
  }
]

// 仮の分析データ
const insights = {
  monthlyTrend: {
    status: "warning",
    title: "支出増加傾向",
    description: "先月比で支出が15%増加しています。主な要因は食費と娯楽費の増加です。",
    recommendations: [
      "食費は前月比+20%です。外食を週1回減らすことで約5,000円の節約が可能です。",
      "娯楽費は休日の出費が多くなっています。平日の活動を増やすことをお勧めします。"
    ]
  },
  categoryAnalysis: {
    status: "success",
    title: "カテゴリーバランス改善",
    description: "先月と比べて支出のカテゴリーバランスが改善しています。",
    recommendations: [
      "食費の割合が適正範囲内に収まってきています。この調子を維持しましょう。",
      "日用品の購入を月初めにまとめることで、さらに費用を抑えられる可能性があります。"
    ]
  },
  savingsPotential: {
    status: "info",
    title: "節約の機会",
    description: "現在の支出パターンから、以下の節約機会が見つかりました。",
    recommendations: [
      "定期購入サービスの見直しで月額2,000円の節約が可能です。",
      "光熱費の使用時間帯を調整することで、約5%の削減が期待できます。"
    ]
  }
}

type InsightStatus = "warning" | "success" | "info"

const statusConfig = {
  warning: {
    icon: AlertTriangle,
    className: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
  },
  success: {
    icon: CheckCircle2,
    className: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
  },
  info: {
    icon: Lightbulb,
    className: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
  }
}

export default function AdvisorPage() {
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState(AI_CHARACTERS[0])
  const [showCharacterSelect, setShowCharacterSelect] = useState(false)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">AIアドバイザー</h1>
          <p className="text-muted-foreground">
            支出パターンを分析し、最適な家計管理のアドバイスを提供します
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            <Bot className="h-3 w-3 mr-1" />
            Level 5機能
          </Badge>
          <Badge variant="secondary">
            <TrendingUp className="h-3 w-3 mr-1" />
            今月の分析: 3回
          </Badge>
          <Dialog open={showCharacterSelect} onOpenChange={setShowCharacterSelect}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AIアシスタントの選択</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <RadioGroup
                  value={selectedCharacter.id}
                  onValueChange={(value) => {
                    const character = AI_CHARACTERS.find(c => c.id === value)
                    if (character) {
                      setSelectedCharacter(character)
                      setShowCharacterSelect(false)
                    }
                  }}
                >
                  {AI_CHARACTERS.map((character) => (
                    <div key={character.id} className="flex items-center space-x-2 mb-4">
                      <RadioGroupItem value={character.id} id={character.id} />
                      <Label
                        htmlFor={character.id}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <div className={cn(
                          "p-2 rounded-full bg-primary/10",
                          character.style
                        )}>
                          <character.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{character.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {character.description}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {Object.entries(insights).map(([key, insight]) => {
          const StatusIcon = statusConfig[insight.status as InsightStatus].icon
          const statusClass = statusConfig[insight.status as InsightStatus].className

          return (
            <Card
              key={key}
              className={cn(
                "p-6 cursor-pointer transition-all hover:shadow-md",
                selectedInsight === key ? "ring-2 ring-primary" : ""
              )}
              onClick={() => setSelectedInsight(key)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2 rounded-full", statusClass)}>
                  <StatusIcon className="h-4 w-4" />
                </div>
                {key === "monthlyTrend" && <LineChart className="h-4 w-4 text-muted-foreground" />}
                {key === "categoryAnalysis" && <PieChart className="h-4 w-4 text-muted-foreground" />}
                {key === "savingsPotential" && <Bot className="h-4 w-4 text-muted-foreground" />}
              </div>
              <h3 className="font-semibold mb-2">{insight.title}</h3>
              <p className="text-sm text-muted-foreground">{insight.description}</p>
              <Button
                variant="link"
                className="h-auto p-0 text-sm mt-4"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedInsight(key)
                }}
              >
                詳細を見る
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Card>
          )
        })}
      </div>

      {selectedInsight && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className={cn(
              "p-2 rounded-full",
              statusConfig[insights[selectedInsight as keyof typeof insights].status as InsightStatus].className
            )}>
              {React.createElement(statusConfig[insights[selectedInsight as keyof typeof insights].status as InsightStatus].icon, {
                className: "h-4 w-4"
              })}
            </div>
            <h2 className="text-lg font-semibold">
              {insights[selectedInsight as keyof typeof insights].title}
            </h2>
          </div>

          <p className="text-muted-foreground mb-6">
            {insights[selectedInsight as keyof typeof insights].description}
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-2 rounded-full bg-primary/10",
                selectedCharacter.style
              )}>
                <selectedCharacter.icon className="h-4 w-4" />
              </div>
              <h3 className="font-medium">{selectedCharacter.name}からのアドバイス</h3>
            </div>
            {insights[selectedInsight as keyof typeof insights].recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-full bg-primary/10",
                  selectedCharacter.style
                )}>
                  <selectedCharacter.icon className="h-4 w-4" />
                </div>
                <p className="text-sm">{selectedCharacter.messageStyle} {recommendation}</p>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="flex justify-end gap-3">
            <Button variant="outline">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              アドバイスを保存
            </Button>
            <Button>
              <ArrowRight className="h-4 w-4 mr-2" />
              実行計画を立てる
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}