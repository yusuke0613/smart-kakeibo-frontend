import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
  description: "Manage your categories",
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
