'use client';

import { useSession } from "next-auth/react";

export default function UserGreeting() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 rounded-lg text-center">
      <p className="text-green-800 dark:text-green-100">
        Welcome back, <strong>{session.user.name || session.user.email}</strong>!
      </p>
      <p className="text-xs text-green-600 dark:text-green-300 mt-1">
        (Logged in via Google)
      </p>
    </div>
  );
}
