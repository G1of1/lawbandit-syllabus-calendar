import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { SessionProvider as Provider } from "@/providers/SessionProvider";
import { Toaster } from "../components/ui/sonner";
export const metadata = {
  title: "SyllaSync",
  description: "Turn your syllabus into a calendar with LawBandit",
  icons: "icons/lawbandit.svg"
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
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
