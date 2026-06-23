import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Noto_Sans_Arabic, Noto_Sans_Thai } from "next/font/google";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/i18n-server";
import { isRtlLocale } from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ReviewBite | Turn Every Table Into a 5-Star Review",
  description:
    "Digital menus, Wi-Fi lead capture, and automated Google review follow-ups for modern restaurants. reviewbite.co",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";

  return (
    <html
      dir={dir}
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansThai.variable} ${notoSansArabic.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <LocaleProvider dict={dict} locale={locale}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
