export const SITE = {
  name: 'WoodHub',
  legalName: 'WoodHub Pakistan',
  tagline: 'Handmade wood, made to be used',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://woodhub.pk').replace(/\/$/, ''),
  description:
    'WoodHub makes handcrafted sheesham, walnut and acacia home decor in Pakistan — wall art, shelves, serving boards, desk organisers, lamps and engraved gifts. Cash on delivery, JazzCash, Easypaisa and bank transfer. Nationwide delivery.',
  locale: 'en_PK',
  currency: 'PKR',
  country: 'PK',
  city: 'Lahore',
  street: 'Hall Road',
  postalCode: '54000',
  phone: process.env.NEXT_PUBLIC_PHONE || '+92 311 7338244',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || '923171713002',
  email: process.env.NEXT_PUBLIC_EMAIL || 'orders@woodhub.pk',
  social: {
    instagram: 'https://instagram.com/woodhub.pk',
    facebook: 'https://facebook.com/woodhub.pk',
    tiktok: 'https://tiktok.com/@woodhub.pk',
  },
} as const;

export const SHIPPING = {
  flatRate: 250,
  freeOver: 7500,
  codFee: 100,
  etaCity: '2–3 working days',
  etaCountry: '3–5 working days',
} as const;

/** Manual payment accounts — apni real details yahan daalo. */
export const PAYMENT_ACCOUNTS = {
  jazzcash: { title: 'WoodHub Pakistan', number: '0311 7338244' },
  easypaisa: { title: 'WoodHub Pakistan', number: '0311 7338244' },
  bank: {
    title: 'WoodHub Pakistan',
    bank: 'Meezan Bank',
    number: 'PK00 MEZN 0000 0000 0000 0000',
    branch: 'Lahore Main',
  },
} as const;

export type PaymentMethodId = 'cod' | 'jazzcash' | 'easypaisa' | 'bank';

export const PAYMENT_METHODS: {
  id: PaymentMethodId;
  label: string;
  note: string;
  needsProof: boolean;
}[] = [
  {
    id: 'cod',
    label: 'Cash on delivery',
    note: 'Pay the rider when the parcel reaches you. Rs 100 handling fee applies.',
    needsProof: false,
  },
  {
    id: 'jazzcash',
    label: 'JazzCash',
    note: 'Send to our JazzCash account, then enter the transaction ID below.',
    needsProof: true,
  },
  {
    id: 'easypaisa',
    label: 'Easypaisa',
    note: 'Send to our Easypaisa account, then enter the transaction ID below.',
    needsProof: true,
  },
  {
    id: 'bank',
    label: 'Bank transfer',
    note: 'Transfer to our bank account, then enter the reference number below.',
    needsProof: true,
  },
];

export const CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Gujranwala',
  'Peshawar',
  'Sialkot',
  'Quetta',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Abbottabad',
  'Other',
];
