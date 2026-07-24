import { UnifrakturMaguntia, Playfair_Display, Lora, Courier_Prime } from "next/font/google";

// Masthead only — the gothic blackletter title lockup ("ByteNews").
export const displayFont = UnifrakturMaguntia({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display"
});

// Article headlines — dramatic, high-contrast serif.
export const headlineFont = Playfair_Display({
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-headline"
});

// Body copy — weathered newspaper serif for summaries and running text.
export const bodyFont = Lora({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body"
});

// Bylines / metadata — typewriter-press texture for source · time stamps.
export const pressFont = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-press"
});
