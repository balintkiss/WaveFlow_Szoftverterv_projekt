import type { Metadata } from "next";

import "../index.css";

export const metadata: Metadata = {
  title: "GDE - WaveFlow Music Player",
  description: "Spotify-stílusú zenelejátszó Next.js alapon.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%231ed760'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-size='20'>🎵</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  );
}
