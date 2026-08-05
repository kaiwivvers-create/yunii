import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatbotWrapper from "@/components/ChatbotWrapper";
import FloatingBubbles from "@/components/FloatingBubbles";
import { ThemeProvider } from "@/contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UniVerse - Discover Universities Worldwide",
  description: "Explore and connect with top universities from around the world. Find your perfect academic match across continents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <FloatingBubbles />
          {children}
          <ChatbotWrapper />
        </ThemeProvider>
      </body>
    </html>
  );
}
