export interface OrderLine {
  slug: string;
  name: string;
  sku: string;
  unitPrice: number;
  qty: number;
  engraving: string;
  lineTotal: number;
}

export interface Order {
  number: string;
  createdAt: string;
  status: 'confirmed' | 'awaiting-verification';
  customer: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    postal: string;
    notes: string;
  };
  account: { sub: string; email: string } | null;
  payment: { method: string; label: string; txnId: string };
  lines: OrderLine[];
  totals: {
    subtotal: number;
    shipping: number;
    codFee: number;
    total: number;
    currency: string;
  };
}
