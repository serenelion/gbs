import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { DeepgramContextProvider } from "@/lib/contexts/DeepgramContext";
import Header from "@/components/layout/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DeepgramContextProvider>
            <Header />
            {children}
          </DeepgramContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
