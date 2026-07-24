import "./globals.css";
import { displayFont, headlineFont, bodyFont, pressFont } from "./fonts";

export const metadata = {
  title: "Byte News — The living, breathing bytesize paper",
  description:
    "India, EU and Global news condensed into quick, bite-size stories — sourced from free public RSS feeds."
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${headlineFont.variable} ${bodyFont.variable} ${pressFont.variable}`}
    >
      <body className="parchment-texture bg-prophet-parchment text-prophet-ink dark:bg-prophet-night dark:text-prophet-night-ink transition-colors font-parchment">
        {children}
      </body>
    </html>
  );
}
