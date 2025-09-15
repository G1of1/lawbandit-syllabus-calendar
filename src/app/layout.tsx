//TODO: Fix layout so that routes are protected
import "./globals.css";
import { SessionProvider as Provider } from "@/providers/SessionProvider";
import { Toaster } from "../components/ui/sonner";
import { GeistSans } from "geist/font/sans";
import Link from "next/link";
import { GrTask } from "react-icons/gr";
import { MdFileUpload } from "react-icons/md";
import { ToastContainer } from "react-toastify";
import { getServerSession } from "next-auth";
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
  const session = await getServerSession();

  return (
    <html lang="en" className={GeistSans.className}>
      
      <body className="flex min-h-screen">
        
        { session && (<aside className="w-64 p-6 flex flex-col border-r border-gray-800">
          <Link href="/" className="text-xl font-bold mb-6 cursor-pointer">📅 SyllaSync</Link>
          <nav className="flex flex-col gap-4">
            <Link href="/upload" className="flex text-gray-400 hover:text-white duration-200"><MdFileUpload className="m-1"/>Upload</Link>
            <Link href="/tasks" className="flex text-gray-400 hover:text-white duration-200"><GrTask className="m-1"/>Assignments</Link>
          </nav>
        </aside>)}
        
        <main className="flex-1 p-6 overflow-y-auto">
        <Provider>{children}</Provider>
        <Toaster position="top-right" />
        <ToastContainer theme="dark" position="bottom-right"/>
        </main>
      </body>
    </html>
  );
}
