import hindiData from '../data/quotes/hindi.json';
import hinglishData from '../data/quotes/hinglish.json';
import englishData from '../data/quotes/english.json';
import urduData from '../data/quotes/urdu.json';

export type QuoteLanguage = 'Hindi' | 'English' | 'Hinglish' | 'Urdu';

export type QuoteCategory =
  | 'Motivational'
  | 'Business'
  | 'Success'
  | 'Life'
  | 'Religious';

type QuoteDatabase = {
  language: string;
  categories: Record<QuoteCategory, string[]>;
};

const DATABASES: Record<QuoteLanguage, QuoteDatabase> = {
  Hindi: hindiData as QuoteDatabase,
  English: englishData as QuoteDatabase,
  Hinglish: hinglishData as QuoteDatabase,
  Urdu: urduData as QuoteDatabase,
};

const usedIndexes: Record<string, Set<number>> = {};

export function getRandomQuote(
  language: QuoteLanguage,
  category: QuoteCategory,
): string {
  const quotes = DATABASES[language]?.categories?.[category];

  if (!quotes || quotes.length === 0) {
    throw new Error(
      `No quotes found for language="${language}", category="${category}"`,
    );
  }

  const key = `${language}:${category}`;

  if (!usedIndexes[key]) {
    usedIndexes[key] = new Set<number>();
  }

  const used = usedIndexes[key];

  // Current category ke saare quotes use ho jaane par pool reset.
  if (used.size >= quotes.length) {
    used.clear();
  }

  let index = Math.floor(Math.random() * quotes.length);

  // Same session mein immediately/repeated quote avoid karo.
  while (used.has(index)) {
    index = Math.floor(Math.random() * quotes.length);
  }

  used.add(index);

  return quotes[index];
}
