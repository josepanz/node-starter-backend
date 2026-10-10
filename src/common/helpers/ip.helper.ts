/**
 * Allowlist de IPs: coincidencia exacta o CIDR IPv4. Helper puro (KISS): IPv6 solo por igualdad
 * exacta; para rangos IPv6 conviene resolverlo en el proxy/WAF.
 */
const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/** Normaliza IPv4 mapeada en IPv6 (`::ffff:1.2.3.4`) y espacios. */
export function normalizeIp(ip: string): string {
  const trimmed = ip.trim();
  return trimmed.toLowerCase().startsWith('::ffff:')
    ? trimmed.slice(7)
    : trimmed;
}

function ipv4ToInt(ip: string): number | null {
  const match = IPV4.exec(ip);
  if (!match) return null;
  const octets = match.slice(1).map(Number);
  if (octets.some((octet) => octet > 255)) return null;
  return (
    ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0
  );
}

export function ipMatchesRule(ip: string, rule: string): boolean {
  const candidate = normalizeIp(ip);
  const [base, prefixRaw] = normalizeIp(rule).split('/');
  if (prefixRaw === undefined) return candidate === base;

  const prefix = Number(prefixRaw);
  const candidateInt = ipv4ToInt(candidate);
  const baseInt = ipv4ToInt(base);
  if (
    candidateInt === null ||
    baseInt === null ||
    !Number.isInteger(prefix) ||
    prefix < 0 ||
    prefix > 32
  ) {
    return false;
  }
  if (prefix === 0) return true;
  const mask = (0xffffffff << (32 - prefix)) >>> 0;
  return (candidateInt & mask) === (baseInt & mask);
}

/** Lista vacía = sin restricción. */
export function isIpAllowed(ip: string | undefined, rules: string[]): boolean {
  if (rules.length === 0) return true;
  if (!ip) return false;
  return rules.some((rule) => ipMatchesRule(ip, rule));
}
