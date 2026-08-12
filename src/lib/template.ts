const TIME_UNITS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
};

export function resolveTimeExpressions(template: string, now = new Date()): string {
  return template.replace(/\{\{\s*now\s*(?:([+-])\s*(\d+)\s*([smhdw]))?\s*\}\}/gi, (_, sign?: string, amount?: string, unit?: string) => {
    const offset = amount && unit ? Number(amount) * TIME_UNITS[unit.toLowerCase()] : 0;
    const timestamp = now.getTime() + (sign === '-' ? -offset : offset);
    return new Date(timestamp).toISOString();
  });
}

export function isTimeExpression(value: string): boolean {
  return /^now\s*(?:[+-]\s*\d+\s*[smhdw])?$/i.test(value.trim());
}

export function getEmptyReferencedParam(
  template: string,
  params: Record<string, string>,
  skipEmptyParams: string[],
): string | null {
  for (const name of skipEmptyParams) {
    if (params[name]?.trim()) continue;
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\{\\{\\s*${escapedName}\\s*\\}\\}`).test(template)) return name;
  }
  return null;
}
