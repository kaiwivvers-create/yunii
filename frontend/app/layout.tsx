import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatbotWrapper from "@/components/ChatbotWrapper";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { BrandProvider } from "@/contexts/BrandContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { getBrandSettings } from "@/utils/brand";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#C8C8E0",
};

const DESCRIPTION =
  "Explore and connect with top universities from around the world. Compare rankings, tuition, deadlines and more to find your perfect academic match.";

/**
 * Page metadata (title, OG/Twitter tags, authors...) is built from the
 * configured app name so rebranding the app updates every document.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { appName } = await getBrandSettings();
  const title = `${appName} - Discover Universities Worldwide`;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    title: {
      default: title,
      template: `%s | ${appName}`,
    },
    description: DESCRIPTION,
    keywords: [
      "study abroad",
      "universities",
      "university comparison",
      "scholarships",
      "student visa",
      "college application",
      "higher education",
    ],
    authors: [{ name: appName }],
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: appName,
      title,
      description: DESCRIPTION,
      images: [
        {
          url: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=630&fit=crop",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: DESCRIPTION,
      images: [
        "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=630&fit=crop",
      ],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

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
          <BrandProvider>
            <LanguageProvider>
              {children}
              <ChatbotWrapper />
            </LanguageProvider>
          </BrandProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
