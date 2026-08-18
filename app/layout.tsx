import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "next-themes";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const getDefaultMetadata = () => ({
  title: "Luxury Marriage Hall",
  description: "Premium banquet and wedding venue booking platform",
  icons: {
    icon: "/favicon.ico",
  },
});

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient();
  const { data: settings } = await supabase.from("site_settings").select("*").maybeSingle();

  const title = settings?.meta_title || settings?.site_name || "Luxury Marriage Hall";
  const description = settings?.meta_description || settings?.description || "Premium banquet and wedding venue booking platform";
  const canonicalUrl = settings?.canonical_url && /^https?:\/\//.test(settings.canonical_url)
    ? settings.canonical_url
    : "https://example.com";
  const favicon = settings?.favicon_url || settings?.logo_url || "/favicon.ico";
  const ogImage = settings?.og_image_url || settings?.logo_url || "";

  return {
    ...getDefaultMetadata(),
    title,
    description,
    alternates: { canonical: canonicalUrl },
    metadataBase: new URL(canonicalUrl),
    openGraph: {
      title: settings?.og_title || title,
      description: settings?.og_description || description,
      images: ogImage ? [{ url: ogImage, alt: settings?.site_name || "Marriage Hall" }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: settings?.og_title || title,
      description: settings?.og_description || description,
      images: ogImage ? [ogImage] : undefined,
    },
    icons: {
      icon: favicon,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="marriage-hall-theme"
          enableColorScheme
        >
          {children}
        </ThemeProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "hsl(var(--background))",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
            },
          }}
        />
      </body>
    </html>
  );
}
