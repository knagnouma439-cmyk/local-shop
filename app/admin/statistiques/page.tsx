
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase-ssr";
import { supabaseAdmin } from "@/lib/supabase-server";
import { formatGnf } from "@/lib/format";

export const dynamic = "force-dynamic";

const DAYS = 30;
const CHART_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

const CONFIRMED = ["advance_paid", "shipping", "delivered"];
const WAITING = ["new", "awaiting_advance"];

type OrderItem = {
  product_name: string;
  quantity: number;
  unit_price_gnf: number;
};

type Order = {
  created_at: string;
  total_gnf: number;
  advance_received_gnf: number | null;
  status: string;
  order_items: OrderItem[] | null;
};

function Card({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 break-words text-xl font-bold tracking-tight sm:text-2xl">
        {value}
      </p>
      <p className="mt-2 text-xs text-neutral-500">{hint}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
      {children}
    </section>
  );
}

export default async function StatistiquesPage() {
  if (!(await requireAdmin())) redirect("/admin/login");

  const since = new Date(Date.now() - DAYS * DAY_MS);

  const { data, error } = await supabaseAdmin()
    .from("orders")
    .select(
      "created_at, total_gnf, advance_received_gnf, status, order_items(product_name, quantity, unit_price_gnf)"
    )
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    return (
      <main className="mx-auto max-w-7xl p-4 sm:p-8">
        <h1 className="text-2xl font-bold">Statistiques</h1>
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Impossible de charger les statistiques. Vérifie la configuration
          Supabase et la relation entre les commandes et leurs articles.
        </p>
      </main>
    );
  }

  const orders = (data ?? []) as Order[];

  const confirmed = orders.filter((o) => CONFIRMED.includes(o.status));
  const waiting = orders.filter((o) => WAITING.includes(o.status));
  const cancelled = orders.filter((o) => o.status === "cancelled");

  const salesTotal = confirmed.reduce(
    (sum, o) => sum + Number(o.total_gnf || 0),
    0
  );

  const advancesReceived = orders.reduce(
    (sum, o) => sum + Number(o.advance_received_gnf || 0),
    0
  );

  const average = confirmed.length
    ? Math.round(salesTotal / confirmed.length)
    : 0;

  const today = new Date();
  const chart = Array.from({ length: CHART_DAYS }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (CHART_DAYS - 1 - i));
    const key = date.toLocaleDateString("en-CA");

    const value = confirmed
      .filter((o) => {
        const d = new Date(o.created_at);
        return d.toLocaleDateString("en-CA") === key;
      })
      .reduce((sum, o) => sum + Number(o.total_gnf || 0), 0);

    return {
      key,
      label: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
      value,
    };
  });

  const chartMax = Math.max(...chart.map((d) => d.value), 1);

  const products = new Map<string, { quantity: number; total: number }>();

  for (const order of confirmed) {
    for (const item of order.order_items ?? []) {
      const current = products.get(item.product_name) ?? {
        quantity: 0,
        total: 0,
      };

      current.quantity += Number(item.quantity || 0);
      current.total +=
        Number(item.quantity || 0) * Number(item.unit_price_gnf || 0);

      products.set(item.product_name, current);
    }
  }

  const topProducts = [...products.entries()]
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 5);

  const maxQuantity = Math.max(
    ...topProducts.map(([, value]) => value.quantity),
    1
  );

  const statuses = [
    { label: "Nouvelles", count: orders.filter((o) => o.status === "new").length, color: "bg-amber-400" },
    { label: "En attente d'avance", count: orders.filter((o) => o.status === "awaiting_advance").length, color: "bg-orange-400" },
    { label: "Avance reçue", count: orders.filter((o) => o.status === "advance_paid").length, color: "bg-sky-500" },
    { label: "En livraison", count: orders.filter((o) => o.status === "shipping").length, color: "bg-violet-500" },
    { label: "Livrées", count: orders.filter((o) => o.status === "delivered").length, color: "bg-emerald-500" },
    { label: "Annulées", count: cancelled.length, color: "bg-red-400" },
  ];

  return (
    <main className="min-h-screen bg-neutral-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              LOCAL SHOP · ADMINISTRATION
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950">
              Statistiques
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Activité des {DAYS} derniers jours
            </p>
          </div>
          <div className="w-fit rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Données Supabase
          </div>
        </header>

        <section className="rounded-3xl bg-neutral-950 p-6 text-white sm:p-8">
          <p className="text-sm text-neutral-400">Montant des commandes confirmées</p>
          <p className="mt-3 break-words text-3xl font-bold sm:text-5xl">
            {formatGnf(salesTotal)}
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-300">
            <span>{confirmed.length} commandes avec avance confirmée ou livraison</span>
            <span>{orders.length} commandes analysées</span>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card
            label="Avances enregistrées"
            value={formatGnf(advancesReceived)}
            hint="Montants enregistrés sur les commandes"
          />
          <Card
            label="Panier moyen"
            value={formatGnf(average)}
            hint="Montant moyen des commandes confirmées"
          />
          <Card
            label="En attente"
            value={String(waiting.length)}
            hint="Nouvelles commandes et avances attendues"
          />
          <Card
            label="Annulées"
            value={String(cancelled.length)}
            hint={`Sur ${orders.length} commandes`}
          />
        </section>

        <Section title={`Évolution des ventes · ${CHART_DAYS} jours`}>
          <p className="mt-1 text-sm text-neutral-500">
            Montant des commandes confirmées, selon leur date de création.
          </p>
          <div className="mt-6 flex h-52 items-end gap-2 overflow-x-auto pb-1">
            {chart.map((day) => (
              <div
                key={day.key}
                className="flex h-full min-w-4 flex-1 flex-col justify-end"
                title={`${day.label} : ${formatGnf(day.value)}`}
              >
                <div
                  className={`w-full rounded-t-md ${
                    day.value > 0 ? "bg-neutral-900" : "bg-neutral-200"
                  }`}
                  style={{
                    height: `${day.value > 0 ? Math.max((day.value / chartMax) * 100, 4) : 2}%`,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {chart.map((day, i) => (
              <span
                key={day.key}
                className={`min-w-4 flex-1 text-center text-[10px] ${
                  i % 2 === 0 ? "text-neutral-600" : "text-neutral-400"
                }`}
              >
                {i % 2 === 0 ? day.label : ""}
              </span>
            ))}
          </div>
        </Section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Produits les plus vendus">
            {topProducts.length === 0 ? (
              <p className="mt-5 text-sm text-neutral-500">
                Aucun article vendu dans les commandes retenues.
              </p>
            ) : (
              <ul className="mt-5 space-y-5">
                {topProducts.map(([name, value], index) => (
                  <li key={name}>
                    <div className="flex items-start justify-between gap-3 text-sm">
                      <span className="font-medium">
                        <span className="mr-2 text-neutral-400">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {name}
                      </span>
                      <span className="shrink-0 text-neutral-500">
                        {value.quantity} vendu{value.quantity > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-neutral-900"
                        style={{
                          width: `${(value.quantity / maxQuantity) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      {formatGnf(value.total)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Répartition des commandes">
            <ul className="mt-5 space-y-5">
              {statuses.map((status) => (
                <li key={status.label}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span>{status.label}</span>
                    <span className="font-semibold">{status.count}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className={`h-full rounded-full ${status.color}`}
                      style={{
                        width: `${
                          orders.length
                            ? (status.count / orders.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <p className="text-xs leading-5 text-neutral-500">
          Les avances enregistrées ne représentent pas nécessairement la totalité
          des paiements reçus. Le chiffre d&apos;affaires présenté correspond aux
          montants des commandes retenues selon leur statut, et non à un bénéfice net.
        </p>
      </div>
    </main>
  );
}