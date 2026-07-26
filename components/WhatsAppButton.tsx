// Official WhatsApp branding (brand green #25D366 + the real WhatsApp glyph)
// and a real `wa.me/<number>?text=` deep link — distinct from
// components/listings/ShareButton.tsx, which is a generic "share this
// listing to any contact" action, not a "chat with us" business CTA.
const DEFAULT_MESSAGE = "Hi! I'd like to know more about a property on Diggaj Realty.";

export default function WhatsAppButton({
  message = DEFAULT_MESSAGE,
  className = "",
}: {
  message?: string;
  className?: string;
}) {
  // Placeholder until a real WhatsApp Business number is provided — set
  // NEXT_PUBLIC_WHATSAPP_NUMBER (digits only, country code, no + or spaces).
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "911234567890";
  const href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={`inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-px ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-1.5-.7-2.5-1.3-3.4-3-.3-.4.3-.4.7-1.3.1-.2 0-.4 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2.1 3.2 5 4.4.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.3-.1-.2-.3-.2-.5-.3Z" />
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.2-.4-4.5-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 20.2 12 8.2 8.2 0 0 1 12 20.2Z" />
      </svg>
      Chat on WhatsApp
    </a>
  );
}
