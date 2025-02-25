"use client"

import { createContext, useContext, useState, useEffect } from "react"

export type SubCategory = {
  id: string
  name: string
}

export type Category = {
  id: string
  name: string
  type: "income" | "expense"
  color: string
  subcategories: SubCategory[]
}

type CategoryContextType = {
  categories: Category[]
  setCategories: (categories: Category[]) => void
  getCategoryById: (id: string) => Category | undefined
  getSubcategoryById: (categoryId: string, subcategoryId: string) => SubCategory | undefined
  getCategoryByType: (type: "income" | "expense") => Category[]
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

// 初期カテゴリーデータ
const initialCategories: Category[] = [
  {
    id: "1",
    name: "食費",
    type: "expense",
    color: "red",
    subcategories: [
      { id: "1-1", name: "食料品" },
      { id: "1-2", name: "外食" }
    ]
  },
  {
    id: "2",
    name: "日用品",
    type: "expense",
    color: "blue",
    subcategories: [
      { id: "2-1", name: "消耗品" },
      { id: "2-2", name: "家庭用品" }
    ]
  },
  {
    id: "3",
    name: "給与",
    type: "income",
    color: "green",
    subcategories: [
      { id: "3-1", name: "基本給" },
      { id: "3-2", name: "残業代" }
    ]
  }
]

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)

  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id)
  }

  const getSubcategoryById = (categoryId: string, subcategoryId: string) => {
    const category = getCategoryById(categoryId)
    return category?.subcategories.find(sub => sub.id === subcategoryId)
  }

  const getCategoryByType = (type: "income" | "expense") => {
    return categories.filter(cat => cat.type === type)
  }

  return (
    <CategoryContext.Provider value={{
      categories,
      setCategories,
      getCategoryById,
      getSubcategoryById,
      getCategoryByType
    }}>
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoryContext)
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoryProvider")
  }
  return context
}