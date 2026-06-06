const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const referenceFiles = [
  "docs/references/python-core.json",
  "docs/references/python-language.json",
  "docs/references/python-builtins.json",
  "docs/references/python-stdlib.json",
  "docs/references/python-stdlib-extended.json",
  "docs/references/python-ecosystem-catalog.json",
  "docs/references/data-analytics.json",
  "docs/references/data-databases.json",
  "docs/references/visualization-ml.json",
  "docs/references/web-dash-api.json",
  "docs/references/workflows-faq.json",
  "docs/reference-index.json",
];

const queryAliases = {
  "дубликат": ["duplicated", "drop_duplicates"],
  "дубликаты": ["duplicated", "drop_duplicates"],
  "повторы": ["duplicated", "drop_duplicates"],
  "группировка": ["groupby"],
  "группировать": ["groupby"],
  "объединение": ["merge", "join", "concat"],
  "объединить": ["merge", "join", "concat"],
  "сортировка": ["sort_values", "sort_index"],
  "сортировать": ["sort_values", "sort_index"],
  "пропуски": ["isna", "isnull", "dropna", "fillna"],
  "пустые": ["isna", "isnull", "dropna", "fillna"],
  "удалить": ["del", "drop", "remove", "pop"],
  "удаление": ["del", "drop", "remove", "pop"],
  "колонки": ["columns", "col", "df.columns"],
  "столбцы": ["columns", "col", "df.columns"],
  "тип": ["type", "dtype", "astype"],
  "график": ["plot", "hist", "scatter", "bar"],
  dubl: ["duplicated", "drop_duplicates"],
  dupl: ["duplicated", "drop_duplicates"],
  duplicat: ["duplicated", "drop_duplicates"],
  dublicated: ["duplicated", "drop_duplicates"],
  histogramm: ["hist", "histogram", "histplot"],
};

const normalizeSearch = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .trim();

const searchStopWords = new Set(["to", "in", "into", "from", "как", "в", "из", "и"]);

const queryTerms = (query) => {
  const normalized = normalizeSearch(query);
  const baseTerms = normalized.split(/\s+/).filter((term) => term && !searchStopWords.has(term));
  const expanded = new Set(baseTerms);
  if (baseTerms.length > 1) expanded.add(normalized);
  baseTerms.forEach((term) => {
    (queryAliases[term] || []).forEach((alias) => expanded.add(alias));
  });
  return [...expanded];
};

const referenceTokens = (value) =>
  normalizeSearch(value)
    .split(/[^a-zа-я0-9_]+/i)
    .filter(Boolean);

const referenceScore = (card, terms) => {
  const title = normalizeSearch(card.title);
  const exactTerms = (card.terms || []).map(normalizeSearch);
  const aliases = (card.aliases || []).map(normalizeSearch);
  const weakTerms = [...referenceTokens(card.title), ...referenceTokens(card.package)];
  const relatedTerms = (card.related || []).map(normalizeSearch);

  return terms.reduce((score, rawTerm) => {
    const term = normalizeSearch(rawTerm);
    const shortTerm = term.length <= 3;
    if (title === term) return score + 40;
    if (!shortTerm && (title.endsWith(`.${term}`) || title.endsWith(`-${term}`))) return score + 32;
    if (exactTerms.includes(term)) return score + 28;
    if (aliases.includes(term)) return score + 20;
    if (weakTerms.includes(term)) return score + 10;
    if (!shortTerm && exactTerms.some((cardTerm) => cardTerm.startsWith(term))) return score + 8;
    if (!shortTerm && aliases.some((alias) => alias.includes(term))) return score + 6;
    if (!shortTerm && title.includes(term)) return score + 5;
    if (relatedTerms.includes(term)) return score + 1;
    return score;
  }, 0);
};

const loadReferences = () => {
  const byId = new Map();
  for (const file of referenceFiles) {
    const fullPath = path.join(root, file);
    if (!fs.existsSync(fullPath)) continue;
    const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    for (const card of data.references || []) {
      if (card.id && !byId.has(card.id)) byId.set(card.id, card);
    }
  }
  return [...byId.values()];
};

const references = loadReferences();
const cases = JSON.parse(fs.readFileSync(path.join(root, "tests/search-cases.json"), "utf8"));
const failures = [];

for (const testCase of cases) {
  const terms = queryTerms(testCase.query);
  const top = references
    .map((card) => ({ card, score: referenceScore(card, terms) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.card.title.localeCompare(b.card.title))
    .slice(0, 3);
  const ids = top.map((item) => item.card.id);
  if (ids[0] !== testCase.top) {
    failures.push(`${testCase.query}: expected ${testCase.top}, got ${ids.join(", ") || "nothing"}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Reference search cases passed: ${cases.length}`);
