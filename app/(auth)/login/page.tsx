"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { Heart } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { session, loading, configured } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) router.replace("/dashboard");
  }, [loading, session, router]);

  if (!configured) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
          <h1 className="mb-2 text-lg font-semibold text-white">Configuration requise</h1>
          <p className="mb-3">
            L&apos;application n&apos;est pas encore connectée à Supabase. Copie{" "}
            <code className="rounded bg-black/40 px-1 py-0.5">.env.local.example</code> vers{" "}
            <code className="rounded bg-black/40 px-1 py-0.5">.env.local</code>, renseigne l&apos;URL
            et la clé anonyme de ton projet Supabase, puis redémarre le serveur.
          </p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const supabase = getSupabaseClient();
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName || email.split("@")[0] } },
        });
        if (error) throw error;
      }
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600">
            <Heart size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-white">Famille</h1>
          <p className="text-sm text-slate-400">Calendrier, garde et documents partagés</p>
        </div>

        <div className="mb-4 flex rounded-lg bg-white/5 p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-md py-1.5 ${mode === "signin" ? "bg-indigo-600 text-white" : "text-slate-400"}`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-md py-1.5 ${mode === "signup" ? "bg-indigo-600 text-white" : "text-slate-400"}`}
          >
            Créer un compte
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <div>
              <Label>Ton prénom (Maman / Papa…)</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Maman" />
            </div>
          )}
          <div>
            <Label>Courriel</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Mot de passe</Label>
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Un instant…" : mode === "signin" ? "Se connecter" : "Créer le compte"}
          </Button>
        </form>
      </div>
    </div>
  );
}
