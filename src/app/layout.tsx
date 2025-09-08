import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { SessionProvider as Provider } from "@/providers/SessionProvider";
export const metadata = {
  title: "Syllabus Calendar",
  description: "Turn your syllabus into a calendar with LawBandit",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <html lang="en">
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
