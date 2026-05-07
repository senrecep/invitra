import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.DOMAIN ?? "http://localhost:3000"),
  title: "Invitra",
  description: "Event Guest Management System",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Invitra",
    startupImage: "/icons/icon-512.png",
  },
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  openGraph: {
    title: "Invitra",
    description: "Event Guest Management System",
    images: [{ url: "/banner.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invitra",
    description: "Event Guest Management System",
    images: ["/banner.png"],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <meta name="theme-color" content="#1e293b" />
      </head>
      <body className={`${geist.className} min-h-screen`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
