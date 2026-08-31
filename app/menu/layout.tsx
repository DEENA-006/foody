import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Full Menu - 300+ Chef Recipes & Categories",
  description: "Explore our complete menu of fresh pizzas, gourmet pastas, seafood delicacies, hearty beef dishes, and vegan treats.",
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
