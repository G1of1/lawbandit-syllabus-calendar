"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center from-[rgb(23_21_20/var(--tw-bg-opacity))] to-[#1e1c1a]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center from-[rgb(23_21_20/var(--tw-bg-opacity))] to-[#1e1c1a] px-6 text-center">
      {/* Heading */}
      <motion.div
        className="mb-4 text-4xl font-extrabold text-gray-900 sm:text-5xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="text-white"><img src="icons/lawbandit.svg"/>SyllaSync</span>
      </motion.div>

      {/* Subheading */}
      <motion.p
        className="mb-8 max-w-xl text-lg text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <span className="font-semibold">SyllaSync</span> is our new AI tool that extracts your law school syllabus' assignments/tasks and saves them to Google Calendar.
      </motion.p>

      {/* Buttons */}
      <motion.div
        className="flex flex-col gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {session ? (
          <>
            <button
              onClick={() => router.push("/upload")}
              className="rounded-full bg-white px-8 py-3 text-md font-medium text-black shadow-lg transition cursor-pointer hover:bg-gray-500 active:scale-90"
            >
              Go to Upload
            </button>
            <button
              onClick={() => signOut()}
              className="rounded-full px-8 py-3 text-md font-medium text-white shadow-sm transition hover:text-gray-500 cursor-pointer"
            >
              Sign out
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="rounded-full bg-white px-8 py-3 text-lg font-medium text-black shadow-lg transition cursor-pointer hover:bg-gray-500 active:scale-90"
          >
            Sign in with Google
          </button>
        )}
      </motion.div>
    </main>
  );
}
