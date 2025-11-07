export const WHATSAPP_NUMBER = "+19516668518"; // Default bot number (can be overridden via ?wa= or ?phone=)

/**
 * Build a WhatsApp chat URL that opens chat directly.
 * - If phone is provided, opens chat with that number.
 * - Otherwise, opens WhatsApp with the message composer.
 * Phone can include + and spaces (we'll clean to digits).
 */
export function getWhatsAppChatURL({ phone = WHATSAPP_NUMBER, message = "" } = {}) {
  const encoded = encodeURIComponent(message || "");
  const clean = (phone || "").replace(/[^\d]/g, "");
  if (clean.length > 0) {
    return `https://wa.me/${clean}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}