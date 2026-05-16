/**
 * Members use a short PIN (e.g. 4 digits). Supabase requires min 6 chars,
 * so we append a constant suffix for PINs shorter than 6 characters.
 * This function must be used consistently in both createMember and memberLogin.
 */
export function memberPinToPassword(pin: string): string {
  return pin.length < 6 ? pin + "##bfc" : pin;
}
