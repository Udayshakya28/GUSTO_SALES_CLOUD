import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs"; // Import ClerkProvider
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- MODIFIED METADATA OBJECT ---
export const metadata: Metadata = {
  title: "Gusto Sales Cloud - AI-Powered Reddit Lead Generation",
  description: "Revolutionize your lead generation with Gusto Sales Cloud's AI-driven platform, leveraging Reddit's vast community to find warm prospects and automate outreach.",
  openGraph: {
    title: "Gusto Sales Cloud - AI-Powered Reddit Lead Generation",
    description: "Find warm prospects and automate outreach with AI.",
    url: "https://www.redlead.net",
    siteName: "Gusto Sales Cloud",
    images: [
      {
        url: "https://www.redlead.net/Landing.png",
        width: 1200,
        height: 630,
        alt: "RedLead Application Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RedLead - AI-Powered Reddit Lead Generation",
    description: "Find warm prospects and automate outreach with AI.",
    images: ["https://www.redlead.net/Landing.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}