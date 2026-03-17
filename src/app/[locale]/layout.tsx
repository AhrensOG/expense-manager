import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";
import type { Locale } from "../../i18n/routing";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeToaster } from "@/components/ui/ThemeToaster";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={geistSans.variable}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            {children}
            <ThemeToaster />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
