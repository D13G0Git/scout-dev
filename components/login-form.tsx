"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, LogIn } from "lucide-react";
import { ScoutMark } from "@/components/brand/scout-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    if (result?.error || !result?.ok) {
      setError(true);
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <Card className="w-full max-w-sm border-border/60 bg-card/90 backdrop-blur">
        <CardContent className="p-8">
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="relative">
              <ScoutMark className="h-16 w-16 drop-shadow-[0_0_30px_rgba(236,72,153,0.3)]" />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-md bg-brand-gradient px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.15em] text-white">
                DEV
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Scout DEV</h1>
            <p className="text-center text-sm text-muted-foreground">
              Inicia sesión para continuar
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@orisha.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-center text-sm text-destructive">
                Credenciales incorrectas. Verifica tu email y contraseña.
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              Iniciar sesión
            </Button>
          </form>

          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            an{" "}
            <span
              className="font-semibold"
              style={{ color: "var(--brand-magenta)" }}
            >
              Orisha Agrifood
            </span>{" "}
            product
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
