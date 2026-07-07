import type { Metadata } from "next";
import "./globals.css";
import { getBrandConfig } from "@/lib/settings";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export const metadata: Metadata = {
  title: "MIRRA Wellness — Marketing Command Center",
  description: "Marketing-Steuerzentrale für MIRRA WELLNESS Planegg",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

function googleFontsHref(heading: string, body: string) {
  const families = [heading, body]
    .filter(Boolean)
    .map((f) => `family=${encodeURIComponent(f.trim()).replace(/%20/g, "+")}:wght@300;400;500;600;700`);
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = await getBrandConfig().catch(() => null);

  const colorPrimary = brand?.colorPrimary ?? "#F5EFE6";
  const colorSecondary = brand?.colorSecondary ?? "#A8B5A0";
  const colorAccent = brand?.colorAccent ?? "#C9A961";
  const fontHeading = brand?.fontHeading ?? "Cormorant Garamond";
  const fontBody = brand?.fontBody ?? "Inter";

  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={googleFontsHref(fontHeading, fontBody)} />
        <style
          dangerouslySetInnerHTML={{
            __html: `:root {
          --brand-primary: ${colorPrimary};
          --brand-secondary: ${colorSecondary};
          --brand-accent: ${colorAccent};
          --font-heading: "${fontHeading}";
          --font-body: "${fontBody}";
        }`,
          }}
        />
      </head>
      <body className="font-body antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-h-screen flex-1 flex-col">
            <MobileNav />
            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
