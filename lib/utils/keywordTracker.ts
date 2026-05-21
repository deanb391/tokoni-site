// lib/utils/keywordTracker.ts

const STORAGE_KEY = "tokoni_keyword_scores";

// Standard English stop words to filter out
const STOP_WORDS = new Set([
  "the", "a", "an", "is", "of", "and", "or", "to", "in", "for", "with", "on", "at", 
  "by", "from", "this", "that", "it", "my", "your", "our", "their", "me", "you", 
  "he", "she", "they", "we", "us", "him", "her", "them", "be", "are", "was", "were", 
  "been", "has", "have", "had", "do", "does", "did", "but", "as", "if", "then", 
  "than", "about", "into", "up", "down", "out", "how", "why", "what", "where", 
  "who", "which", "will", "would", "should", "can", "could", "may", "might", "must"
]);

/**
 * Extracts and cleans words from a string, removing stop words, punctuation, and words under 3 characters.
 */
function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  // Lowercase and remove punctuation
  const cleanText = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/_/g, "");

  // Split and filter
  return cleanText
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w));
}

/**
 * Retrieves the current keyword scores dictionary from LocalStorage.
 */
function getScores(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Error reading keyword scores from localStorage:", e);
    return {};
  }
}

/**
 * Saves the keyword scores dictionary to LocalStorage.
 */
function saveScores(scores: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch (e) {
    console.error("Error saving keyword scores to localStorage:", e);
  }
}

/**
 * Increments the score for a list of words by a given weight.
 */
function addWordScores(words: string[], weight: number) {
  if (words.length === 0) return;
  const scores = getScores();
  
  words.forEach(word => {
    scores[word] = (scores[word] || 0) + weight;
  });

  saveScores(scores);
}

/**
 * Tracks search query terms. Score +3 per word.
 */
export function trackSearchKeywords(query: string) {
  const words = extractKeywords(query);
  addWordScores(words, 3);
}

/**
 * Tracks viewed product terms. Score +2 per word.
 */
export function trackProductViewKeywords(name: string, description?: string) {
  const combined = `${name} ${description || ""}`;
  const words = extractKeywords(combined);
  addWordScores(words, 2);
}

/**
 * Tracks liked post terms. Score +5 per word.
 */
export function trackPostLikeKeywords(caption: string) {
  const words = extractKeywords(caption);
  addWordScores(words, 5);
}

/**
 * Tracks time spent watching a post. Score +1 point per 5 seconds (min 3s, max 10 points).
 */
export function trackPostTimeSpentKeywords(caption: string, durationSeconds: number) {
  if (durationSeconds < 3) return;
  const points = Math.min(10, Math.max(1, Math.floor(durationSeconds / 5)));
  const words = extractKeywords(caption);
  addWordScores(words, points);
}

/**
 * Returns the top 3 highest scoring keywords.
 */
export function getTopKeywords(): string[] {
  const scores = getScores();
  const sortedEntries = Object.entries(scores)
    .sort((a, b) => b[1] - a[1]) // sort descending by score
    .slice(0, 3);
    
  return sortedEntries.map(entry => entry[0]);
}
