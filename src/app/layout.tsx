// Root layout for the Next.js application
// TODO: Fix layout so that routes are protected

import "./globals.css";
import { SessionProvider as Provider } from "@/providers/SessionProvider";
import { Toaster } from "../components/ui/sonner";
import { GeistSans } from "geist/font/sans";
import Link from "next/link";
import { GrTask } from "react-icons/gr";
import { MdFileUpload } from "react-icons/md";
import { ToastContainer } from "react-toastify";
import { getServerSession } from "next-auth";

/**
 * Global metadata for the application.
 * This controls the document title, description, and favicon.
 */
export const metadata = {
  title: "SyllaSync",
  description: "Turn your syllabus into a calendar with LawBandit",
  icons: "icons/lawbandit.svg",
};

/**
 * RootLayout
 * -----------
 * Defines the global structure of the app, including:
 * - Session provider for authentication state
 * - Sidebar navigation (conditionally rendered if user is authenticated)
 * - Toast/notification providers
 * - Main content area
 *
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Nested page content
 * @returns {JSX.Element} The root application layout
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch the current session (server-side)
  const session = await getServerSession();

  return (
    <html lang="en" className={GeistSans.className}>
      <body className="flex min-h-screen">
        {/* Sidebar is only visible if the user is logged in */}
        {session && (
          <aside className="w-64 p-6 flex flex-col border-r border-gray-800">
            {/* App Branding */}
            <Link
              href="/"
              className="text-xl font-bold mb-6 cursor-pointer"
            >
              📅 SyllaSync
            </Link>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-4">
              <Link
                href="/upload"
                className="flex text-gray-400 hover:text-white duration-200"
              >
                <MdFileUpload className="m-1" />
                Upload
              </Link>
              <Link
                href="/tasks"
                className="flex text-gray-400 hover:text-white duration-200"
              >
                <GrTask className="m-1" />
                Assignments
              </Link>
            </nav>
          </aside>
        )}

        {/* Main content area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Provide session context to all children */}
          <Provider>{children}</Provider>

          {/* Toast/notification providers */}
          <Toaster position="top-right" />
          <ToastContainer theme="dark" position="bottom-right" />
        </main>
      </body>
    </html>
  );
}
