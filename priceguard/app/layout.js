import "./globals.css";

export const metadata = {
  title: "PriceGuard — Price Drop Tracker",
  description: "Track product prices and get alerted when they drop.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
