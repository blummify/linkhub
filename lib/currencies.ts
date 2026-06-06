export type CurrencyCode =
  | "GHS" | "USD" | "GBP" | "EUR"
  | "NGN" | "KES" | "ZAR" | "CAD" | "AUD";

export type Currency = {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number; // multiplier from GHS base (GHS = 1.0)
};

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  GHS: { code: "GHS", symbol: "₵",   name: "Ghanaian Cedi",      rate: 1     },
  USD: { code: "USD", symbol: "$",    name: "US Dollar",           rate: 0.067 },
  GBP: { code: "GBP", symbol: "£",    name: "British Pound",       rate: 0.053 },
  EUR: { code: "EUR", symbol: "€",    name: "Euro",                rate: 0.062 },
  NGN: { code: "NGN", symbol: "₦",    name: "Nigerian Naira",      rate: 100   },
  KES: { code: "KES", symbol: "KSh",  name: "Kenyan Shilling",     rate: 8.7   },
  ZAR: { code: "ZAR", symbol: "R",    name: "South African Rand",  rate: 1.22  },
  CAD: { code: "CAD", symbol: "CA$",  name: "Canadian Dollar",     rate: 0.091 },
  AUD: { code: "AUD", symbol: "A$",   name: "Australian Dollar",   rate: 0.104 },
};

const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  GH: "GHS",
  NG: "NGN",
  KE: "KES",
  ZA: "ZAR",
  US: "USD",
  CA: "CAD",
  AU: "AUD",
  GB: "GBP",
  DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR", NL: "EUR",
  BE: "EUR", PT: "EUR", AT: "EUR", FI: "EUR", IE: "EUR",
};

export function detectCurrency(countryCode: string | null | undefined): CurrencyCode {
  if (!countryCode) return "USD";
  return COUNTRY_TO_CURRENCY[countryCode] ?? "USD";
}


export function formatPrice(ghsAmount: number, currency: Currency): string {
  const converted = ghsAmount * currency.rate;
  const display = converted === 0
    ? "0"
    : converted < 1
    ? converted.toFixed(2)
    : converted >= 100
    ? Math.round(converted).toLocaleString()
    : converted.toFixed(0);
  return `${currency.symbol}${display}`;
}
