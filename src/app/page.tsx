"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <h1 className="mb-4 text-4xl font-bold text-gray-900">
        Welcome to Syllabus Calendar
      </h1>
      <p className="mb-8 max-w-xl text-lg text-gray-600">
        Turn your law school syllabus into an organized calendar. Upload your
        syllabus, let AI parse the tasks, and sync them to Google Calendar.
      </p>

      {session ? (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.push("/upload")}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white shadow hover:bg-blue-700"
          >
            Go to Upload
          </button>
          <button
            onClick={() => signOut()}
            className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      ) : (
        <button
          onClick={() => signIn("google")}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white shadow hover:bg-blue-700"
        >
          Sign in with Google
        </button>
      )}
    </main>
  );
}

