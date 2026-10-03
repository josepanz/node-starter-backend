import { ipMatchesRule, isIpAllowed, normalizeIp } from './ip.helper';

describe('ip.helper', () => {
  it('normaliza IPv4 mapeada en IPv6', () => {
    expect(normalizeIp('::ffff:10.0.0.5')).toBe('10.0.0.5');
    expect(normalizeIp(' 10.0.0.5 ')).toBe('10.0.0.5');
  });

  it('coincide por IP exacta', () => {
    expect(ipMatchesRule('10.0.0.5', '10.0.0.5')).toBe(true);
    expect(ipMatchesRule('::ffff:10.0.0.5', '10.0.0.5')).toBe(true);
    expect(ipMatchesRule('10.0.0.6', '10.0.0.5')).toBe(false);
  });

  it('coincide por CIDR IPv4', () => {
    expect(ipMatchesRule('192.168.1.77', '192.168.1.0/24')).toBe(true);
    expect(ipMatchesRule('192.168.2.1', '192.168.1.0/24')).toBe(false);
    expect(ipMatchesRule('8.8.8.8', '0.0.0.0/0')).toBe(true);
  });

  it('rechaza CIDR o IP mal formados', () => {
    expect(ipMatchesRule('10.0.0.1', '10.0.0.0/33')).toBe(false);
    expect(ipMatchesRule('10.0.0.1', '10.0.0.0/x')).toBe(false);
    expect(ipMatchesRule('999.0.0.1', '10.0.0.0/8')).toBe(false);
  });

  it('lista vacía permite todo; con reglas exige coincidencia', () => {
    expect(isIpAllowed('1.2.3.4', [])).toBe(true);
    expect(isIpAllowed(undefined, [])).toBe(true);
    expect(isIpAllowed(undefined, ['1.2.3.4'])).toBe(false);
    expect(isIpAllowed('1.2.3.4', ['9.9.9.9', '1.2.3.0/24'])).toBe(true);
    expect(isIpAllowed('5.6.7.8', ['9.9.9.9', '1.2.3.0/24'])).toBe(false);
  });
});
