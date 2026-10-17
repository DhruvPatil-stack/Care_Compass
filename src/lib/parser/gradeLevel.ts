/**
 * Flesch-Kincaid Grade Level formula: 0.39*(words/sentences) + 11.8*(syllables/words) - 15.59
 * Target grade 6 or below for patient-facing text.
 */
export function fleschKincaidGrade(text: string): number {
  const sentences = countSentences(text);
  const words = countWords(text);
  const syllables = countSyllables(text);

  if (words === 0 || sentences === 0) return 0;

  const grade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
  return Math.round(grade * 10) / 10;
}

function countSentences(text: string): number {
  const matches = text.match(/[.!?]+/g);
  return Math.max(matches ? matches.length : 1, 1);
}

function countWords(text: string): number {
  const matches = text.match(/\b\w+\b/g);
  return matches ? matches.length : 0;
}

function countSyllables(text: string): number {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) ?? [];
  return words.reduce((total, word) => total + syllablesInWord(word), 0);
}

function syllablesInWord(word: string): number {
  if (word.length <= 3) return 1;
  const cleaned = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const matches = cleaned.match(/[aeiouy]{1,2}/g);
  return Math.max(matches ? matches.length : 1, 1);
}
