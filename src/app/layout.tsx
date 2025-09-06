import "./globals.css";
import NextAuthProvider from "@/providers/SessionProvider";

export const metadata = {
  title: "Syllabus Calendar",
  description: "Turn your syllabus into a calendar with LawBandit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
