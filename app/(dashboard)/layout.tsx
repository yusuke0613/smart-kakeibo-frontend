"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Home,
  Bot,
  User,
  Settings,
  LogOut,
  WalletCards,
  BarChart3,
  Tags,
  MessageSquare,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { name: "ホーム", href: "/dashboard", icon: Home },
    { name: "AIアドバイザー", href: "/advisor", icon: Bot },
    { name: "AIチャット", href: "/dashboard/chat", icon: MessageSquare },
    { name: "年間収支", href: "/yearly", icon: BarChart3 },
    { name: "カテゴリー", href: "/categories", icon: Tags },
    { name: "プロフィール", href: "/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* サイドバー */}
      <div className="fixed inset-y-0 z-50 flex w-72 flex-col">
        <div className="flex flex-1 flex-col bg-card px-4 py-6">
          <div className="flex items-center gap-2 px-2">
            <WalletCards className="h-6 w-6" />
            <span className="font-semibold">マイ家計簿</span>
          </div>

          {/* ユーザー情報 */}
          <div className="mt-6 px-2">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10">
                <div className="bg-primary/10 w-full h-full flex items-center justify-center font-bold">
                  ユ
                </div>
              </Avatar>
              <div>
                <div className="font-medium">ユーザー名</div>
                <div className="text-xs text-muted-foreground">Level 3</div>
              </div>
            </div>
            <Progress value={70} className="h-1" />
          </div>

          <nav className="flex-1 space-y-1 mt-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-1">
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent"
            >
              <Settings className="h-4 w-4" />
              設定
            </Link>
            <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent">
              <LogOut className="h-4 w-4" />
              ログアウト
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="pl-72">{children}</div>
    </div>
  );
}
