import "../styles/globals.css";
import Providers from "../components/Providers";
import { ConditionalNav } from "../components/layout/ConditionalNav";

export const metadata = {
  title: "Brews Lee",
  description: "Freshly brewed and crafted for you. Order online for delivery or pickup.",
  openGraph: {
    title: "Brews Lee",
    description: "Freshly brewed and crafted for you. Order online for delivery or pickup.",
    url: "https://brewslee.com",
    siteName: "Brews Lee",
    locale: "en_US",
    type: "website",
  },
};

import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <ConditionalNav />
            <main className="flex-grow">{children}</main>
          </div>
        </Providers>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
