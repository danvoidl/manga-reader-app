// Decodifica o payload de um JWT apenas para ler o claim `sub` (o id do usuário
// MangaDex, um UUID). Não há verificação de assinatura: o `sub` só decide qual
// arquivo do próprio Drive do usuário ler/gravar, então não cruza fronteira de
// confiança. Implementação sem `atob` para não depender do runtime.

const B64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  let str = "";
  let buffer = 0;
  let bits = 0;
  for (const ch of base64) {
    if (ch === "=") break;
    const idx = B64_ALPHABET.indexOf(ch);
    if (idx === -1) continue;
    buffer = (buffer << 6) | idx;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      str += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  return str;
}

/** Retorna o claim `sub` do JWT, ou null se ausente/ilegível. */
export function decodeJwtSub(token: string | null | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(base64UrlDecode(parts[1])) as { sub?: string };
    return typeof payload.sub === "string" && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}
