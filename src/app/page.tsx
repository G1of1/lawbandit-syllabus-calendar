"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-black to-gray-800 text-white px-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
          LawBandit Syllabus Calendar
        </h1>
        <p className="text-lg text-gray-200">
          Upload your syllabus and instantly turn assignments, exams, and readings into a calendar
          that keeps you on track.
        </p>

        <div className="pt-6">
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg shadow-lg hover:bg-yellow-500 transition"
          >
            Sign Up with Google
          </button>
        </div>
      </div>
    </main>
  );
}
