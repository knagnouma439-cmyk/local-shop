
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase-ssr";
import { supabaseAdmin } from "@/lib/supabase-server";
import { formatGnf } from "@/lib/format";
import { saveAdvance, setStatus, cancelOrder, logout } from "./actions";


type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  address: string;
  total_gnf: number;
  advance_gnf: number;
  advance_received_gnf: number;
  status: string;
  order_items?: {
    product_name: string;
    size: string | null;
    color: string | null;
    quantity: number;
  }[];
};

type SearchParams = {
  q?: string | string[];
  status?: string | string[];
};

const STATUS_LABELS: Record<string, string> = {
  new: "Nouvelle",
  awaiting_advance: "En attente d'avance",
  advance_paid: "Avance reçue",
  shipping: "Livraison en cours",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 ring-blue-200",
  awaiting_advance: "bg-amber-50 text-amber-800 ring-amber-200",
  advance_paid: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  shipping: "bg-violet-50 text-violet-800 ring-violet-200",
  delivered: "bg-green-100 text-green-800 ring-green-200",
  cancelled: "bg-red-100 text-red-800 ring-red-200",
};

function money(value: number | null | undefined) {
  return formatGnf(Number(value ?? 0));
}

function whatsappLink(phone: string) {
  const digits = (phone ?? "").replace(/\D/g, "");
  const number = digits.startsWith("224")
    ? digits
    : digits.length === 9
      ? `224${digits}`
      : digits;

  return `https://wa.me/${number}`;
}

function dateLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date indisponible";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  color = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  icon: string;
  color?: "neutral" | "green" | "amber" | "violet";
}) {
  const styles = {
    neutral: "border-neutral-200 bg-white",
    green: "border-emerald-200 bg-emerald-50/70",
    amber: "border-amber-200 bg-amber-50/70",
    violet: "border-violet-200 bg-violet-50/70",
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${styles[color]}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-neutral-500">{label}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
          {icon}
        </span>
      </div>
      <p className="mt-4 break-words text-2xl font-bold tracking-tight text-neutral-950">
        {value}
      </p>
      <p className="mt-1 text-xs text-neutral-500">{detail}</p>
    </div>
  );
}

async function Orders({
  query,
  selectedStatus,
}: {
  query: string;
  selectedStatus: string;
}) {
  const { data, error } = await supabaseAdmin()
    .from("orders")
    .select(`
      id,
      created_at,
      customer_name,
      phone,
      address,
      total_gnf,
      advance_gnf,
      advance_received_gnf,
      status,
      order_items (
        product_name,
        size,
        color,
        quantity
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        Impossible de charger les commandes. Vérifie la connexion Supabase et
        les colonnes de la table orders.
      </div>
    );
  }

  const orders = (data ?? []) as unknown as Order[];

  const filteredOrders = orders.filter((order) => {
    const text = [
      order.id,
      order.customer_name,
      order.phone,
      order.address,
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = text.includes(query.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;

    return matchesQuery && matchesStatus;
  });

  return (
    <div id="liste-commandes" className="scroll-mt-24">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
          Gestion commerciale
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950">
          Toutes les commandes
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Recherche, avances, clients et suivi des livraisons.
        </p>
      </div>

      <form
        action="/admin"
        method="GET"
        className="mb-5 grid gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_220px_auto]"
      >
        <input
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Nom, téléphone ou numéro de commande..."
          className="min-w-0 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-neutral-500 focus:bg-white"
        />

        <select
          name="status"
          defaultValue={selectedStatus}
          className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-neutral-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="new">Nouvelles</option>
          <option value="awaiting_advance">En attente d'avance</option>
          <option value="advance_paid">Avance reçue</option>
          <option value="shipping">Livraison en cours</option>
          <option value="delivered">Livrées</option>
          <option value="cancelled">Annulées</option>
        </select>

        <button
          type="submit"
          className="rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700"
        >
          Rechercher
        </button>
      </form>

      <p className="mb-4 text-sm text-neutral-500">
        {filteredOrders.length} commande(s) affichée(s)
      </p>

      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
          <p className="font-semibold text-neutral-800">
            Aucune commande trouvée
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Essaie une autre recherche ou sélectionne un autre statut.
          </p>
          <a
            href="/admin#liste-commandes"
            className="mt-4 inline-block rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Réinitialiser les filtres
          </a>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const received = Number(order.advance_received_gnf ?? 0);
            const requested = Number(order.advance_gnf ?? 0);
            const total = Number(order.total_gnf ?? 0);
            const remaining = Math.max(0, total - received);
            const cancelled = order.status === "cancelled";
            const delivered = order.status === "delivered";
            const locked = cancelled || delivered;
            const progress =
              total > 0 ? Math.min(100, (received / total) * 100) : 0;

            let cardStyle = "border-neutral-200 bg-white";

            if (cancelled) {
              cardStyle = "border-red-300 bg-red-50/70";
            } else if (delivered) {
              cardStyle = "border-emerald-300 bg-emerald-50/50";
            } else if (order.status === "advance_paid") {
              cardStyle = "border-emerald-300 bg-white";
            } else if (order.status === "shipping") {
              cardStyle = "border-violet-300 bg-white";
            } else if (
              order.status === "new" ||
              order.status === "awaiting_advance"
            ) {
              cardStyle = "border-amber-200 bg-white";
            }

            return (
              <article
                key={order.id}
                className={`overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-md ${cardStyle}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-200/80 p-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-neutral-950">
                        Commande #{String(order.id).slice(0, 8)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                          STATUS_STYLES[order.status] ??
                          "bg-neutral-100 text-neutral-700 ring-neutral-200"
                        }`}
                      >
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">
                      Reçue le {dateLabel(order.created_at)}
                    </p>
                  </div>

                  <p className="text-xl font-bold text-neutral-950">
                    {money(total)}
                  </p>
                </div>

                <div className="grid gap-6 p-5 lg:grid-cols-2">
                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Informations client
                    </p>
                    <p className="font-semibold text-neutral-900">
                      {order.customer_name}
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">
                      {order.phone}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {order.address}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={`tel:${order.phone}`}
                        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        Appeler
                      </a>
                      <a
                        href={whatsappLink(order.phone)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Articles commandés
                    </p>

                    <div className="space-y-3">
                      {(order.order_items ?? []).map((item, index) => (
                        <div
                          key={`${order.id}-${index}`}
                          className="flex items-start justify-between gap-3 rounded-xl border border-neutral-200/80 bg-white p-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-neutral-800">
                              {item.product_name}
                            </p>
                            <p className="mt-1 text-xs text-neutral-500">
                              {item.size ? `Taille : ${item.size}` : ""}
                              {item.size && item.color ? " · " : ""}
                              {item.color ? `Couleur : ${item.color}` : ""}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-lg bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-700">
                            × {item.quantity}
                          </span>
                        </div>
                      ))}

                      {(order.order_items ?? []).length === 0 && (
                        <p className="text-sm text-neutral-500">
                          Aucun détail d'article disponible.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-200/80 bg-white/80 p-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-neutral-50 p-3">
                      <p className="text-xs text-neutral-500">Montant total</p>
                      <p className="mt-1 font-bold text-neutral-900">
                        {money(total)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-emerald-50 p-3">
                      <p className="text-xs text-emerald-700">Avance reçue</p>
                      <p className="mt-1 font-bold text-emerald-800">
                        {money(received)}
                      </p>
                    </div>

                    <div
                      className={`rounded-xl p-3 ${
                        remaining > 0 ? "bg-amber-50" : "bg-neutral-50"
                      }`}
                    >
                      <p
                        className={`text-xs ${
                          remaining > 0
                            ? "text-amber-700"
                            : "text-neutral-500"
                        }`}
                      >
                        Reste à payer
                      </p>
                      <p
                        className={`mt-1 font-bold ${
                          remaining > 0
                            ? "text-amber-800"
                            : "text-neutral-900"
                        }`}
                      >
                        {money(remaining)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex justify-between text-xs text-neutral-500">
                      <span>Avance reçue sur le total</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {!locked && (
                    <div className="mt-5 space-y-4 border-t border-neutral-200 pt-5">
                      {["new", "awaiting_advance", "advance_paid"].includes(
                        order.status
                      ) && (
                        <form
                          action={saveAdvance}
                          className="flex flex-col gap-3 sm:flex-row sm:items-end"
                        >
                          <input
                            type="hidden"
                            name="orderId"
                            value={order.id}
                          />
                          <label className="flex-1">
                            <span className="mb-1 block text-xs font-medium text-neutral-600">
                              Avance réellement reçue (GNF)
                            </span>
                            <input
                              type="number"
                              name="amount"
                              min="0"
                              max={total}
                              step="1"
                              defaultValue={received || requested}
                              required
                              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-500"
                            />
                          </label>
                          <button
                            type="submit"
                            className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            Confirmer l'avance
                          </button>
                        </form>
                      )}

                      {order.status === "advance_paid" && (
                        <form action={setStatus}>
                          <input
                            type="hidden"
                            name="orderId"
                            value={order.id}
                          />
                          <input
                            type="hidden"
                            name="status"
                            value="shipping"
                          />
                          <button
                            type="submit"
                            className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"
                          >
                            Démarrer la livraison
                          </button>
                        </form>
                      )}

                      {order.status === "shipping" && (
                        <form action={setStatus}>
                          <input
                            type="hidden"
                            name="orderId"
                            value={order.id}
                          />
                          <input
                            type="hidden"
                            name="status"
                            value="delivered"
                          />
                          <button
                            type="submit"
                            className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            Confirmer la livraison
                          </button>
                        </form>
                      )}

                      <form action={cancelOrder}>
                        <input
                          type="hidden"
                          name="orderId"
                          value={order.id}
                        />
                        <button
                          type="submit"
                          className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                        >
                          Annuler cette commande
                        </button>
                      </form>
                    </div>
                  )}

                  {cancelled && (
                    <p className="mt-4 rounded-xl border border-red-200 bg-red-100 p-3 text-sm font-semibold text-red-800">
                      Commande annulée — conservée dans l'historique.
                    </p>
                  )}

                  {delivered && (
                    <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                      Livraison terminée.
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams;
}) {
  const user = await requireAdmin();

  if (!user) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] ?? "" : params.q ?? "";
  const rawStatus = Array.isArray(params.status)
    ? params.status[0] ?? "all"
    : params.status ?? "all";

  const allowedStatuses = [
    "all",
    "new",
    "awaiting_advance",
    "advance_paid",
    "shipping",
    "delivered",
    "cancelled",
  ];

  const selectedStatus = allowedStatuses.includes(rawStatus)
    ? rawStatus
    : "all";

  const { data, error } = await supabaseAdmin()
  .from("orders")
  .select("id, status, total_gnf, advance_received_gnf")
  .order("created_at", { ascending: false })
  .limit(1000);

  const orders = error ? [] : data ?? [];
  const activeOrders = orders.filter((order) => order.status !== "cancelled");

  const totalOrders = orders.length;

  const toProcess = orders.filter((order) =>
    ["new", "awaiting_advance"].includes(order.status)
  ).length;

  const shipping = orders.filter(
    (order) => order.status === "shipping"
  ).length;

  const cancelledCount = orders.filter(
    (order) => order.status === "cancelled"
  ).length;

  const advances = activeOrders.reduce(
    (sum, order) => sum + Number(order.advance_received_gnf ?? 0),
    0
  );

  const outstanding = activeOrders.reduce(
    (sum, order) =>
      sum +
      Math.max(
        0,
        Number(order.total_gnf ?? 0) -
          Number(order.advance_received_gnf ?? 0)
      ),
    0
  );

  const deliveredTotal = orders
    .filter((order) => order.status === "delivered")
    .reduce((sum, order) => sum + Number(order.total_gnf ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-neutral-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-[#111113] text-white lg:flex">
        <div className="border-b border-white/10 px-6 py-7">
          <a href="/admin" className="text-xl font-black tracking-tight">
            LOCAL<span className="text-emerald-400">.</span>SHOP
          </a>
          <p className="mt-2 text-xs text-neutral-400">
            Espace d'administration
          </p>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          <a
            href="#vue-ensemble"
            className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white"
          >
            <span>▦</span> Vue d'ensemble
          </a>
          <a
            href="#commandes"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-neutral-400 transition hover:bg-white/10 hover:text-white"
          >
            <span>☷</span> Commandes
          </a>
          <a
  href="/admin/produits"
  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-neutral-400 transition hover:bg-white/10 hover:text-white"
>
  <span>▣</span> Produits
</a>
<a
  href="/admin/statistiques"
  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-neutral-400 transition hover:bg-white/10 hover:text-white"
>
  <span>▥</span> Statistiques
</a>
          <a
            href="/admin"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-neutral-400 transition hover:bg-white/10 hover:text-white"
          >
            <span>↻</span> Actualiser
          </a>
        </nav>

        <div className="border-t border-white/10 p-5">
          <p className="text-xs text-neutral-500">Tableau de bord</p>
          <p className="mt-1 text-sm font-medium text-neutral-300">
            Gestion des ventes
          </p>
        </div>
      </aside>

      <main className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">
                Local Shop
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-800">
                Vue d'ensemble
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
  <a
    href="#commandes"
    className="rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700"
  >
    Voir les commandes →
  </a>

  <form action={logout}>
    <button
      type="submit"
      className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
    >
      Déconnexion
    </button>
  </form>
</div>
          </div>
        </header>

        <div
          id="vue-ensemble"
          className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                Ton activité en un coup d'œil
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                Bonjour, prêt à gérer tes ventes ?
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">
                Suis les commandes, contrôle les avances et organise les
                livraisons depuis un seul espace.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs text-neutral-500">
                Commandes enregistrées
              </p>
              <p className="mt-1 text-lg font-bold">{totalOrders}</p>
            </div>
          </div>

          {error && (
            <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Les statistiques n'ont pas pu être chargées.
            </p>
          )}

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Avances encaissées"
              value={money(advances)}
              detail="Hors commandes annulées"
              icon="↗"
              color="green"
            />
            <MetricCard
              label="Montant restant"
              value={money(outstanding)}
              detail="Reste à percevoir sur les commandes actives"
              icon="◷"
              color="amber"
            />
            <MetricCard
              label="À traiter"
              value={String(toProcess)}
              detail="Nouvelles et en attente d'avance"
              icon="▤"
            />
            <MetricCard
              label="En livraison"
              value={String(shipping)}
              detail={`${cancelledCount} commande(s) annulée(s) · ${money(deliveredTotal)} livrés`}
              icon="⇢"
              color="violet"
            />
          </section>

          <section id="commandes" className="mt-12 scroll-mt-24">
            <Orders query={query} selectedStatus={selectedStatus} />
          </section>

          <footer className="mt-12 border-t border-neutral-200 py-6 text-center text-xs text-neutral-400">
            Local Shop · Espace d'administration
          </footer>
        </div>
      </main>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams;
}) {
  return <Dashboard searchParams={searchParams} />;
}