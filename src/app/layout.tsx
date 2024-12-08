import { Metadata } from "next";
import { Suspense } from 'react';
import { Providers } from "./providers";
import Header from "@/components/layout/Header";
import "@/styles/globals.css";
import Footer from "@/components/layout/Footer";

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
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Suspense>
          <Providers>
            <Header />
            {children}
            <Footer />
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}

// Add static page config
export const dynamic = 'force-static';
