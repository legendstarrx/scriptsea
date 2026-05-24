"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessionUser } from "@/lib/supabase-auth";

export default function AppHomePage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const user = await getSessionUser();
      router.replace(user ? "/decision/new" : "/");
    };
    void run();
  }, [router]);

  return null;
}
