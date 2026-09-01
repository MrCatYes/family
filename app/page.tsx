"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Home() {
  const router = useRouter();
  const { session, loading, configured } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!configured || !session) {
      router.replace("/login");
    } else {
      router.replace("/dashboard");
    }
  }, [loading, configured, session, router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-sm text-slate-500">Chargement…</p>
    </div>
  );
}
