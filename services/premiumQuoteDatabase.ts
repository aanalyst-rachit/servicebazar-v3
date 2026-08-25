import geetaData from '../data/quotes/geeta.json';
import quranData from '../data/quotes/quran.json';

export type PremiumQuoteType = 'Bhagavad Gita' | 'Quran';

export type PremiumQuoteItem = {
  source: string;
  reference: string;
  text: string;
};

type PremiumDatabase = {
  type: string;
  items: PremiumQuoteItem[];
};

const DATABASES: Record<PremiumQuoteType, PremiumDatabase> = {
  'Bhagavad Gita': geetaData as PremiumDatabase,
  Quran: quranData as PremiumDatabase,
};

const usedIndexes: Record<string, Set<number>> = {};

export function getRandomPremiumQuote(
  type: PremiumQuoteType,
): PremiumQuoteItem {
  const database = DATABASES[type];

  if (!database?.items?.length) {
    throw new Error(`No premium quotes found for "${type}"`);
  }

  if (!usedIndexes[type]) {
    usedIndexes[type] = new Set<number>();
  }

  const used = usedIndexes[type];

  if (used.size >= database.items.length) {
    used.clear();
  }

  let index = Math.floor(Math.random() * database.items.length);

  while (used.has(index)) {
    index = Math.floor(Math.random() * database.items.length);
  }

  used.add(index);

  return database.items[index];
}
