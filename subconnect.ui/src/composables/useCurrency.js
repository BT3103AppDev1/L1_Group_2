import { ref, computed } from 'vue';
import { getPreferences, updatePreferences } from '@/services/preferences';

export const CURRENCIES = [
  { code: 'SGD', name: 'Singapore Dollar', symbol: '$',    country: 'Singapore'      },
  { code: 'USD', name: 'US Dollar',        symbol: 'US$',  country: 'United States'  },
  { code: 'EUR', name: 'Euro',             symbol: '€',    country: 'Europe (EU)'    },
  { code: 'GBP', name: 'British Pound',    symbol: '£',    country: 'United Kingdom' },
  { code: 'AUD', name: 'Australian Dollar',symbol: 'A$',   country: 'Australia'      },
  { code: 'MYR', name: 'Malaysian Ringgit',symbol: 'RM',   country: 'Malaysia'       },
  { code: 'IDR', name: 'Indonesian Rupiah',symbol: 'Rp',   country: 'Indonesia'      },
  { code: 'JPY', name: 'Japanese Yen',     symbol: '¥',    country: 'Japan'          },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$',  country: 'Hong Kong'      },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩',    country: 'South Korea'    },
  { code: 'INR', name: 'Indian Rupee',     symbol: '₹',    country: 'India'          },
  { code: 'CNY', name: 'Chinese Yuan',     symbol: '¥',    country: 'China'          },
];

const SYMBOL_MAP  = Object.fromEntries(CURRENCIES.map((c) => [c.code, c.symbol]));
const COUNTRY_MAP = Object.fromEntries(CURRENCIES.map((c) => [c.code, c.country]));

// Module-level singleton — shared reactively across all components
export const currentCurrency = ref('SGD');
let loadedForUser = null;

/** Returns the symbol for a given currency code, or the current one if omitted. */
export function getSymbol(code) {
  return SYMBOL_MAP[code ?? currentCurrency.value] ?? '$';
}

/** Returns the country name for a currency code (used in the Gemini prompt). */
export function getCountry(code) {
  return COUNTRY_MAP[code ?? currentCurrency.value] ?? 'Singapore';
}

/** Load the user's saved currency from Firestore. Cached per user — safe to call on every mount. */
export async function loadCurrency(userId) {
  if (!userId || loadedForUser === userId) return;
  const prefs = await getPreferences(userId);
  currentCurrency.value = prefs.currency || 'SGD';
  loadedForUser = userId;
}

/** Persist a new currency choice to Firestore and update reactive state immediately. */
export async function saveCurrency(userId, code) {
  currentCurrency.value = code;
  loadedForUser = userId;
  await updatePreferences(userId, { currency: code });
}

/** Composable for use in Composition API components. */
export function useCurrency() {
  return {
    currentCurrency,
    symbol: computed(() => SYMBOL_MAP[currentCurrency.value] ?? '$'),
    country: computed(() => COUNTRY_MAP[currentCurrency.value] ?? 'Singapore'),
    CURRENCIES,
    loadCurrency,
    saveCurrency,
    getSymbol,
    getCountry,
  };
}
