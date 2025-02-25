import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Loader2 } from "lucide-react";
import { Category } from "../types";

interface ReceiptItemsProps {
  items: any[];
  categories: Category[];
  onSave: (items: any[]) => Promise<void>;
  onCancel: () => void;
}

export function ReceiptItems({
  items,
  categories,
  onSave,
  onCancel,
}: ReceiptItemsProps) {
  const [editedItems, setEditedItems] = useState(items);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editedItems);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {editedItems.map((item, index) => (
          <div key={index} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>大カテゴリー</Label>
              <Select
                value={item.categoryId}
                onValueChange={(value) => {
                  const newItems = [...editedItems];
                  newItems[index] = { ...item, categoryId: value };
                  setEditedItems(newItems);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリーを選択" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* 他の入力フィールド */}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
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
  );
}
