// app/layout.jsx
import "./globals.css";

export const metadata = {
  title: "Expansion Signal Engine",
  description:
    "Event-driven cross-sell intelligence for Deel's product suite. Listens for the moment an account reveals it needs the next product.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
