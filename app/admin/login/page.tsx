
"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function AdminLogin() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-4 py-12">
      {/* Arrière-plan décoratif */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <section className="relative w-full max-w-md">
        {/* Marque */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400 text-2xl font-black tracking-tight text-neutral-950 shadow-lg shadow-amber-400/20">
            LS
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            LOCAL SHOP
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            Espace administrateur
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Connectez-vous pour gérer votre boutique et vos commandes.
          </p>
        </div>

        {/* Carte de connexion */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <div className="mb-7">
            <h2 className="text-xl font-semibold text-white">
              Bienvenue
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Entrez vos identifiants pour continuer.
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-neutral-200"
              >
                Adresse e-mail
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="vous@exemple.com"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-white/10 bg-neutral-900/80 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-neutral-200"
              >
                Mot de passe
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Saisissez votre mot de passe"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-white/10 bg-neutral-900/80 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10"
              />
            </div>

            {state?.error && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-300"
              >
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3.5 text-sm font-bold text-neutral-950 shadow-lg shadow-amber-400/10 transition hover:bg-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950/30 border-t-neutral-950" />
                  Connexion en cours…
                </>
              ) : (
                <>
                  Se connecter
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
              Accès sécurisé
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <p className="mt-4 text-center text-xs leading-5 text-neutral-500">
            Réservé aux administrateurs autorisés de LOCAL SHOP.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-600">
          © 2026 LOCAL SHOP
        </p>
      </section>
    </main>
  );
}
