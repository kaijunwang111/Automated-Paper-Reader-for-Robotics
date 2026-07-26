import type { Metadata } from "next";
import { headers } from "next/headers";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title: {
      default: "具身智能观察站",
      template: "%s · 具身智能观察站",
    },
    description: "面向机器人研究者的具身智能论文日报与公司动态追踪。",
    openGraph: {
      title: "具身智能观察站",
      description: "从论文证据到研究判断。",
      type: "website",
      locale: "zh_CN",
      images: [{ url: imageUrl, width: 1712, height: 909, alt: "具身智能观察站" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "具身智能观察站",
      description: "从论文证据到研究判断。",
      images: [imageUrl],
    },
  };
}

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
