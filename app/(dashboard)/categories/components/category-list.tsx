"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, PencilIcon, Trash2 } from "lucide-react";
import { useCategories } from "@/lib/contexts/category-context";
import { fetchCategories } from "../services/category-service";

export function CategoryList() {
  const { categories, setCategories } = useCategories();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCategories("1"); // ユーザーIDは後で動的に取得するように修正
        setCategories(data);
      } catch (err) {
        setError("カテゴリーの取得に失敗しました");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [setCategories]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新規カテゴリー
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className={`h-4 w-4 rounded-full bg-${category.color}-500`}
                />
                <h3 className="font-medium">{category.name}</h3>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon">
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {category.subcategories && category.subcategories.length > 0 && (
              <div className="mt-4 space-y-2">
                {category.subcategories.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between rounded-md bg-muted p-2"
                  >
                    <span>{sub.name}</span>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon">
                        <PencilIcon className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
