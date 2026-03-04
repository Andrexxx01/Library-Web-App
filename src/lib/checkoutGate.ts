export type CheckoutGatePayload =
  | { mode: "cart"; at: number }
  | { mode: "direct"; bookId: number; at: number };

const KEY = "checkout_gate_v1";
const TTL_MS = 1000 * 60 * 5; 

export function setCheckoutGate(payload: CheckoutGatePayload) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {}
}

export function readCheckoutGate(): CheckoutGatePayload | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CheckoutGatePayload;
    if (!parsed?.at) return null;
    if (Date.now() - parsed.at > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearCheckoutGate() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}
