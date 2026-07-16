import type { Metadata } from "next";
import "./globals.css";
import BgmProvider from "@/components/BgmProvider";

export const metadata: Metadata = {
  title: "となみれきし なぞとき クイズ",
  description: "砺波市埋蔵文化財センター",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <BgmProvider>
          {children}
        </BgmProvider>
      </body>
    </html>
  );
}
