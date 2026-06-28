import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudentBuilder - AI-Powered Student Success Platform",
  description: "Predict student dropout risk, generate personalized roadmaps, and improve educational outcomes with AI.",
  keywords: ["StudentBuilder", "Education", "AI", "Student Success", "Risk Prediction", "Roadmap"],
  authors: [{ name: "StudentBuilder Team" }],
  openGraph: {
    title: "StudentBuilder - AI-Powered Student Success Platform",
    description: "Predict student dropout risk, generate personalized roadmaps, and improve educational outcomes with AI.",
    url: "https://studentbuilder.ai",
    siteName: "StudentBuilder",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudentBuilder - AI-Powered Student Success Platform",
    description: "Predict student dropout risk, generate personalized roadmaps, and improve educational outcomes with AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
