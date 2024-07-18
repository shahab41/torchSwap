import type { Metadata } from "next";
import { Chakra_Petch, Darker_Grotesque } from "next/font/google";
import "./globals.css";
import "./app.css";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import Cookie from "@/components/Cookie";
import Loading from "./loading";

const poppins = Darker_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TourchSwap",
  description: "TourchSwap WEB APP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Suspense fallback={<Loading />}>
          <Toaster
            toastOptions={{
              className: "toast-container",
              style: {
                border: "0.5px solid #ffc400",
                padding: "16px",
                color: "#ffc400",
                backgroundColor: "#1f2937", // Dark background
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)", // Subtle shadow
                borderRadius: "15px", // Rounded corners
                fontWeight: "700",
              },
            }}
          />
          <Cookie />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
