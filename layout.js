import "./globals.css";

export const metadata = {
  title: "ALLANIMA Universe — Live Database",
  description: "จักรวาล ALLANIMA — ฐานข้อมูลเชื่อมต่อ Notion แบบ Real-time",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
