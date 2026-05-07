"use client";

import { useEffect, useState } from "react";

import { supabase } from "../../../lib/supabase";

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Bejelentkezés feldolgozása...");

  useEffect(() => {
    let cancelled = false;

    async function finishLogin() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const authError =
        params.get("error_description") ?? params.get("error");

      try {
        if (authError) {
          throw new Error(authError);
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
              throw error;
            }
          }
        }

        for (let attempt = 0; attempt < 8; attempt += 1) {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            window.location.replace("/");
            return;
          }
          await wait(150);
        }

        window.location.replace("/");
      } catch (error) {
        console.error("Google auth callback error:", error);
        if (cancelled) return;
        setMessage("Nem sikerült befejezni a Google bejelentkezést.");
        await wait(1600);
        window.location.replace("/");
      }
    }

    void finishLogin();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#121212] px-6 text-center text-white">
      <div>
        <div className="mx-auto mb-5 size-9 animate-pulse rounded-full bg-primary" />
        <h1 className="text-2xl font-black">WaveFlow</h1>
        <p className="mt-3 text-sm font-semibold text-zinc-400">{message}</p>
      </div>
    </main>
  );
}
