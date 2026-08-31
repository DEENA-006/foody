import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders & Live Tracking",
  description: "View past orders, track live food delivery status, initiate returns, or cancel pending orders.",
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
