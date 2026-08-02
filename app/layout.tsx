import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { absoluteSiteUrl } from "@/lib/site-url";
import "./globals.css";

const imageUrl = absoluteSiteUrl("/og.png");

export const metadata: Metadata = {
  metadataBase: new URL(absoluteSiteUrl("/")),
  title: {
    default: "具身智能观察站",
    template: "%s · 具身智能观察站",
  },
  description: "面向机器人研究者的具身智能论文日报与公司动态追踪。",
  openGraph: {
    title: "具身智能观察站",
    description: "具身智能论文概览、分类检索与公司动态。",
    type: "website",
    locale: "zh_CN",
    images: [{ url: imageUrl, width: 1536, height: 1024, alt: "具身智能观察站" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "具身智能观察站",
    description: "具身智能论文概览、分类检索与公司动态。",
    images: [imageUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
