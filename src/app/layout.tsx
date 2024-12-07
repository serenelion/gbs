import { Metadata } from "next";
import { Providers } from "./providers";
import Header from "@/components/layout/Header";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Giving Back Studio",
  description: "Connect and share opportunities with the social enterprise community",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
