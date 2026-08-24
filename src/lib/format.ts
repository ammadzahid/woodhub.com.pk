export function pkr(amount: number): string {
  return 'Rs ' + Math.round(amount).toLocaleString('en-PK');
}

export function pkrPlain(amount: number): string {
  return Math.round(amount).toLocaleString('en-PK');
}

export function orderDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function newOrderNumber(): string {
  const d = new Date();
  const stamp =
    String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `WH-${stamp}-${rand}`;
}

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}
