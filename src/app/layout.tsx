import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "",
  description: "",
  keywords: [],
  authors: [{ name: "" }],
  creator: "",
  publisher: "",
  openGraph: {
    title: "",
    description: "",
    url: "",
    siteName: "",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "",
    description: "",
    creator: "",
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "mx-3 min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)] bg-background font-sans antialiased",
          inter.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
