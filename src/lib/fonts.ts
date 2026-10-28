import localFont from "next/font/local";

// Self-hosted (public/fonts, latin subset, OFL). next/font serves them from /_next/static with preload and no third-party requests.
export const fraunces = localFont({
  src: [
    { path: "../../public/fonts/Fraunces-var.woff2", weight: "300 800", style: "normal" },
    { path: "../../public/fonts/Fraunces-italic-var.woff2", weight: "300 800", style: "italic" },
  ],
  variable: "--font-fraunces",
  display: "swap",
});
export const bricolage = localFont({ src: "../../public/fonts/BricolageGrotesque-var.woff2", weight: "200 800", variable: "--font-bricolage", display: "swap" });
export const jetbrains = localFont({
  src: [
    { path: "../../public/fonts/JetBrainsMono-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/JetBrainsMono-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
});

export const fontClasses = `${fraunces.variable} ${bricolage.variable} ${jetbrains.variable}`;
