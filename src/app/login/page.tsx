"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/upload");
    }
  }, [status, router]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold">Login</h1>
        <button
          onClick={() => signIn("google")}
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
