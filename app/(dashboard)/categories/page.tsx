"use client";

import { useState, Suspense } from "react";
import {
  useCategories,
  type Category,
  type SubCategory,
} from "@/lib/contexts/category-context";
import { CategoryList } from "./components/category-list";
import { CategorySkeleton } from "./components/category-skeleton";

const COLORS = [
  { value: "slate", label: "スレート", class: "bg-slate-500" },
  { value: "red", label: "レッド", class: "bg-red-500" },
  { value: "orange", label: "オレンジ", class: "bg-orange-500" },
  { value: "amber", label: "アンバー", class: "bg-amber-500" },
  { value: "yellow", label: "イエロー", class: "bg-yellow-500" },
  { value: "lime", label: "ライム", class: "bg-lime-500" },
  { value: "green", label: "グリーン", class: "bg-green-500" },
  { value: "emerald", label: "エメラルド", class: "bg-emerald-500" },
  { value: "teal", label: "ティール", class: "bg-teal-500" },
  { value: "cyan", label: "シアン", class: "bg-cyan-500" },
  { value: "sky", label: "スカイ", class: "bg-sky-500" },
  { value: "blue", label: "ブルー", class: "bg-blue-500" },
  { value: "indigo", label: "インディゴ", class: "bg-indigo-500" },
  { value: "violet", label: "バイオレット", class: "bg-violet-500" },
  { value: "purple", label: "パープル", class: "bg-purple-500" },
  { value: "fuchsia", label: "フクシア", class: "bg-fuchsia-500" },
  { value: "pink", label: "ピンク", class: "bg-pink-500" },
  { value: "rose", label: "ローズ", class: "bg-rose-500" },
];

export default function CategoriesPage() {
  const { categories, setCategories } = useCategories();
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<{
    categoryId: string;
    subcategory: SubCategory | null;
  } | null>(null);
  const [showSubcategoryDialog, setShowSubcategoryDialog] = useState(false);

  // メインカテゴリー用のstate
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [color, setColor] = useState(COLORS[0].value);

  // サブカテゴリー用のstate
  const [subcategoryName, setSubcategoryName] = useState("");

  const resetMainForm = () => {
    setName("");
    setType("expense");
    setColor(COLORS[0].value);
    setEditingCategory(null);
  };

  const resetSubForm = () => {
    setSubcategoryName("");
    setEditingSubcategory(null);
  };

  const handleSubmitMain = async () => {
    if (editingCategory) {
      // 既存のカテゴリーを更新
      setCategories(
        categories.map((cat) =>
          cat.id === editingCategory.id ? { ...cat, name, type, color } : cat
        )
      );
    } else {
      // 新規カテゴリーを追加
      const newCategory: Category = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        type,
        color,
        subcategories: [],
      };
      setCategories([...categories, newCategory]);
    }
    setShowDialog(false);
    resetMainForm();
  };

  const handleSubmitSub = async () => {
    if (!editingSubcategory?.categoryId) return;

    if (editingSubcategory.subcategory) {
      // 既存のサブカテゴリーを更新
      setCategories(
        categories.map((cat) =>
          cat.id === editingSubcategory.categoryId
            ? {
                ...cat,
                subcategories: cat.subcategories.map((sub) =>
                  sub.id === editingSubcategory.subcategory?.id
                    ? { ...sub, name: subcategoryName }
                    : sub
                ),
              }
            : cat
        )
      );
    } else {
      // 新規サブカテゴリーを追加
      const newSubcategory: SubCategory = {
        id: Math.random().toString(36).substr(2, 9),
        name: subcategoryName,
      };
      setCategories(
        categories.map((cat) =>
          cat.id === editingSubcategory.categoryId
            ? {
                ...cat,
                subcategories: [...cat.subcategories, newSubcategory],
              }
            : cat
        )
      );
    }
    setShowSubcategoryDialog(false);
    resetSubForm();
  };

  const handleEditMain = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setType(category.type);
    setColor(category.color);
    setShowDialog(true);
  };

  const handleEditSub = (categoryId: string, subcategory: SubCategory) => {
    setEditingSubcategory({ categoryId, subcategory });
    setSubcategoryName(subcategory.name);
    setShowSubcategoryDialog(true);
  };

  const handleAddSub = (categoryId: string) => {
    setEditingSubcategory({ categoryId, subcategory: null });
    resetSubForm();
    setShowSubcategoryDialog(true);
  };

  const handleDeleteMain = (categoryId: string) => {
    setCategories(categories.filter((cat) => cat.id !== categoryId));
  };

  const handleDeleteSub = (categoryId: string, subcategoryId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              subcategories: cat.subcategories.filter(
                (sub) => sub.id !== subcategoryId
              ),
            }
          : cat
      )
    );
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
      </div>
      <Suspense fallback={<CategorySkeleton />}>
        <CategoryList />
      </Suspense>
    </div>
  );
}
