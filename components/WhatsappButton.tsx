const NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

export default function WhatsAppButton({
  message = "Bonjour, j'ai une question.",
  label = "Discuter sur WhatsApp",
  floating = false,
}: {
  message?: string;
  label?: string;
  floating?: boolean;
}) {
  if (!NUMBER) return null;
  const href = `https://wa.me/${NUMBER}?text=${encodeURIComponent(message)}`;

  if (floating) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Nous écrire sur WhatsApp"
        className="fixed bottom-4 right-4 z-20 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg"
      >
        WhatsApp
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block rounded-full bg-green-600 px-6 py-3 font-semibold text-white"
    >
      {label}
    </a>
  );
}