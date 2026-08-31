import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Command Center",
  description: "Foodiee administrative operations, order status updates, menu dish management, review moderation, and customer accounts.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
