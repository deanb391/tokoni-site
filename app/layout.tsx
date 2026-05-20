import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/MainLayout";
import { UserProvider } from "@/context/UserContext";
import { FeedProvider } from "@/context/FeedContext";
import { HomeFeedProvider } from "@/context/HomeFeedContext";
import { ProductsProvider } from "@/context/ProductsContext";
import ExpandedPostContainer from "@/components/ExpandedPostContainer";

const headingFont = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Tokoni - Premium Marketplace",
  description: "Join the premium marketplace for unique goods.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <UserProvider>
          <FeedProvider>
            <HomeFeedProvider>
              <ProductsProvider>
                <MainLayout>{children}</MainLayout>
                <ExpandedPostContainer />
              </ProductsProvider>
            </HomeFeedProvider>
          </FeedProvider>
        </UserProvider>
      </body>
    </html>
  );
}
