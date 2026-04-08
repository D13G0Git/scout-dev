import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/provider";
import { SiteHeader } from "@/components/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scout DEV · Orisha Agrifood",
  description:
    "Scout DEV — AI-powered functional documentation for Business Central AL repositories. Built by Orisha Agrifood.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <head>
        <script
          // Prevent FOUC for theme: read from localStorage before hydration
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('bcdoc.theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark');var l=localStorage.getItem('bcdoc.locale');if(l){document.documentElement.lang=l;}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <I18nProvider>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Scout DEV</span>
              <span className="mx-1.5 opacity-50">·</span>
              an{" "}
              <span
                className="font-semibold"
                style={{ color: "var(--brand-magenta)" }}
              >
                Orisha Agrifood
              </span>{" "}
              product
            </footer>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
