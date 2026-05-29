import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "砺波の土偶 謎解きクイズ",
  description: "砺波正倉の古文書から出題される謎解きクイズ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;600&family=Noto+Sans+JP:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#1A0E05" }}>{children}</body>
    </html>
  );
}
