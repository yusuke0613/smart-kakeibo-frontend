import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Loader2 } from "lucide-react";
import { MajorCategory, MinorCategory } from "../types";
import { ReceiptItem } from "../services/receipt-service";

interface ReceiptItemsProps {
  items: ReceiptItem[];
  categories: MajorCategory[];
  onSave: (items: ReceiptItem[]) => Promise<void>;
  onCancel: () => void;
}

export function ReceiptItems({
  items,
  categories,
  onSave,
  onCancel,
}: ReceiptItemsProps) {
  const [editedItems, setEditedItems] = useState<ReceiptItem[]>(items);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editedItems);
    } finally {
      setIsSaving(false);
    }
  };

  const updateItem = (index: number, field: keyof ReceiptItem, value: any) => {
    const newItems = [...editedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditedItems(newItems);
  };

  const getMinorCategories = (majorCategoryId: number) => {
    const majorCategory = categories.find(
      (cat) => cat.major_category_id === majorCategoryId
    );
    return majorCategory?.minor_categories || [];
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">
          レシートアイテム ({editedItems.length}件)
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            キャンセル
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                一括登録
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[60vh] pr-2">
        <div className="space-y-4">
          {editedItems.map((item, index) => (
            <div
              key={index}
              className="p-3 border rounded-lg space-y-3 bg-card"
            >
              <div className="font-medium text-sm border-b pb-1 flex justify-between items-center">
                <span>アイテム {index + 1}</span>
                <span className="text-sm font-bold text-primary">
                  {parseInt(item.amount).toLocaleString()}円
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor={`description-${index}`} className="text-xs">
                    説明
                  </Label>
                  <Input
                    id={`description-${index}`}
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                    className="h-8"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`amount-${index}`} className="text-xs">
                    金額
                  </Label>
                  <Input
                    id={`amount-${index}`}
                    type="number"
                    value={item.amount}
                    onChange={(e) =>
                      updateItem(index, "amount", e.target.value)
                    }
                    className="h-8"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor={`date-${index}`} className="text-xs">
                    日付
                  </Label>
                  <Input
                    id={`date-${index}`}
                    type="date"
                    value={item.transaction_date}
                    onChange={(e) =>
                      updateItem(index, "transaction_date", e.target.value)
                    }
                    className="h-8"
                  />
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor={`major-category-${index}`}
                    className="text-xs"
                  >
                    大カテゴリー
                  </Label>
                  <Select
                    value={item.major_category_id.toString()}
                    onValueChange={(value) => {
                      updateItem(index, "major_category_id", Number(value));
                      // 大カテゴリーが変更されたら小カテゴリーをリセット
                      const minorCategories = getMinorCategories(Number(value));
                      if (minorCategories.length > 0) {
                        updateItem(
                          index,
                          "minor_category_id",
                          minorCategories[0].minor_category_id
                        );
                      }
                    }}
                  >
                    <SelectTrigger
                      id={`major-category-${index}`}
                      className="h-8"
                    >
                      <SelectValue placeholder="カテゴリーを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.major_category_id}
                          value={category.major_category_id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor={`minor-category-${index}`} className="text-xs">
                  小カテゴリー
                </Label>
                <Select
                  value={item.minor_category_id?.toString()}
                  onValueChange={(value) =>
                    updateItem(index, "minor_category_id", Number(value))
                  }
                >
                  <SelectTrigger id={`minor-category-${index}`} className="h-8">
                    <SelectValue placeholder="サブカテゴリーを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {getMinorCategories(item.major_category_id).map(
                      (minorCategory) => (
                        <SelectItem
                          key={minorCategory.minor_category_id}
                          value={minorCategory.minor_category_id.toString()}
                        >
                          {minorCategory.name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
