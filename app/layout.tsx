import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "Foodiee - Delicious Food Delivered Fresh & Fast",
    template: "%s | Foodiee",
  },
  description:
    "Experience chef-crafted meals from top local kitchens. Fresh ingredients, authentic international recipes, live order tracking, and 25-minute fast delivery.",
  keywords: [
    "food delivery",
    "online restaurant",
    "gourmet meals",
    "fast food delivery",
    "fresh food",
    "order dinner",
    "healthy meal delivery",
  ],
  authors: [{ name: "Foodiee Team" }],
  creator: "Foodiee",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
    other: [
      { rel: "apple-touch-icon-precomposed", url: "/logo.png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Foodiee",
    title: "Foodiee - Delicious Food Delivered Fresh & Fast",
    description:
      "Order from over 300+ freshly prepared gourmet dishes with instant live delivery tracking.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Foodiee Gourmet Delivery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Foodiee - Delicious Food Delivered Fresh & Fast",
    description: "Order delicious food from top local kitchens with live tracking.",
    images: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  name: "Foodiee",
  image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
  url: "http://localhost:3000",
  telephone: "+1-555-123-4567",
  priceRange: "$$",
  servesCuisine: ["International", "Italian", "Seafood", "Asian", "American", "Vegan"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "123 Food Street, Culinary District",
    addressLocality: "Miami",
    addressRegion: "FL",
    postalCode: "33101",
    addressCountry: "US",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "08:00",
      closes: "23:00",
    },
  ],
  hasMenu: "http://localhost:3000/menu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicon — explicit tags for maximum browser compatibility */}
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="shortcut icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${jakarta.variable} ${outfit.variable} ${playfair.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        {/* Skip to Content for Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-brand focus:text-white focus:px-4 focus:py-2 focus:rounded-xl focus:font-bold focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>

        <Providers>
          <Navbar />
          <main id="main-content" className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
