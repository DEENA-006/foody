import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Favorite Dishes",
  description: "Quickly access and reorder your favorite chef-crafted meals.",
};

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
