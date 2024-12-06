import { Metadata } from "next";
import { DeepgramContextProvider } from "@/lib/contexts/DeepgramContext";
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
    <html lang="en">
      <body>
        <DeepgramContextProvider>
          {children}
        </DeepgramContextProvider>
      </body>
    </html>
  );
}
