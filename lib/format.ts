export function formatGnf(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " GNF";
}