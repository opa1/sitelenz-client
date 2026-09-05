import type { Metadata } from "next";
import { Geist, Geist_Mono, Public_Sans, DM_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { NetworkProvider } from "@/context/NetworkContext";
import { ThemeProvider } from "next-themes";
import { WalletProviders } from "@/components/providers/WalletProviders";
import { TooltipProvider } from "@/components/ui/tooltip";

const dmSansHeading = DM_Sans({ subsets: ["latin"], variable: "--font-heading" });

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SiteLenz",
  description: "Website Intelligence API",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        publicSans.variable,
        dmSansHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="sitelenz_theme">
          <NetworkProvider>
            <WalletProviders>
              <TooltipProvider>{children}</TooltipProvider>
            </WalletProviders>
          </NetworkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
