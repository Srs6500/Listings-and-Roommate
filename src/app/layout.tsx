import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Web3Provider } from "@/context/Web3Context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Roommate Listings - NYC/NJ",
  description: "Find your perfect roommate in the NYC/NJ area",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
