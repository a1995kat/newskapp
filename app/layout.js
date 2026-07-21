import "./globals.css";

export const metadata = {
  title: "Byte News — Quick, bite-size headlines",
  description:
    "India, EU and Global news condensed into quick, bite-size stories — sourced from free public RSS feeds."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 dark:bg-neutral-950 dark:text-gray-100 transition-colors">
        {children}
      </body>
    </html>
  );
}
