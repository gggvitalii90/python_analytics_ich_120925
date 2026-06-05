const owner = "gggvitalii90";
const repo = "python_analytics_ich_120925";
const branch = "main";

const listEl = document.getElementById("notebook-list");
const statsEl = document.getElementById("stats");
const searchEl = document.getElementById("search");
const rowTpl = document.getElementById("row-template");
const indexStatusEl = document.getElementById("index-status");
const assistantEl = document.getElementById("search-assistant");

let allNotebooks = [];
let referenceCards = [];

const encodePath = (path) => path.split("/").map(encodeURIComponent).join("/");

const githubViewUrl = (path) =>
  `https://github.com/${owner}/${repo}/blob/${branch}/${encodePath(path)}`;

const githubRawUrl = (path) =>
  `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encodePath(path)}`;

const colabUrl = (path) =>
  `https://colab.research.google.com/github/${owner}/${repo}/blob/${branch}/${encodePath(path)}`;

const binderUrl = (path) =>
  `https://mybinder.org/v2/gh/${owner}/${repo}/${branch}?urlpath=lab/tree/${encodePath(path)}`;

const categoryMeta = {
  lessons: { title: "Лекции", order: 1 },
  practice: { title: "Практика", order: 2 },
  homework: { title: "Домашние задания", order: 3 },
  summary: { title: "Сводные уроки", order: 4 },
  extra: { title: "Дополнительно", order: 5 },
};

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
  "dubl": ["duplicated", "drop_duplicates"],
  "dupl": ["duplicated", "drop_duplicates"],
  "duplicat": ["duplicated", "drop_duplicates"],
  "dublicated": ["duplicated", "drop_duplicates"],
  "histogramm": ["hist", "histogram", "histplot"],
};

const categoryOf = (path, name) => {
  if (path.startsWith("DZ_python_DA/")) return "homework";
  if (path.startsWith("notebooks/")) {
    if (name.startsWith("Python for DA_L")) return "lessons";
    if (name.startsWith("Python for DA_PR")) return "practice";
    if (name.startsWith("Summary Lesson")) return "summary";
  }
  return "extra";
};

const normalizeName = (path) => path.split("/").pop();

const allowedNotebook = (path) => {
  if (!path.toLowerCase().endsWith(".ipynb")) return false;
  if (path.includes(".ipynb_checkpoints")) return false;
  if (path.includes("backup_before_restore")) return false;
  return true;
};

const sortNotebooks = (a, b) => {
  const cA = categoryMeta[a.category].order;
  const cB = categoryMeta[b.category].order;
  if (cA !== cB) return cA - cB;
  return a.name.localeCompare(b.name, "ru", { numeric: true, sensitivity: "base" });
};

const normalizeSearch = (value) => value.toLowerCase().trim();

const queryTerms = (query) => {
  const baseTerms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  const expanded = new Set(baseTerms);

  baseTerms.forEach((term) => {
    (queryAliases[term] || []).forEach((alias) => expanded.add(alias));
  });

  return [...expanded];
};

const matchesQuery = (entry, terms) => {
  if (terms.length === 0) return true;
  const haystack = `${entry.name} ${entry.path} ${entry.searchText || ""}`.toLowerCase();
  return terms.some((term) => haystack.includes(term));
};

const matchedCells = (entry, terms) => {
  if (terms.length === 0 || !entry.matches) return [];
  return entry.matches
    .filter((match) => {
      const text = `${match.text || ""}`.toLowerCase();
      return terms.some((term) => text.includes(term));
    })
    .slice(0, 3);
};

const referenceTokens = (value) =>
  value
    .toLowerCase()
    .split(/[^a-zа-яё0-9_]+/i)
    .filter(Boolean);

const referenceScore = (card, terms) => {
  const title = card.title.toLowerCase();
  const exactTerms = (card.terms || []).map((term) => term.toLowerCase());
  const weakTerms = [...referenceTokens(card.title), ...referenceTokens(card.package)];
  const relatedTerms = (card.related || []).map((term) => term.toLowerCase());

  return terms.reduce((score, term) => {
    if (exactTerms.includes(term)) return score + 12;
    if (title === term || title.endsWith(`.${term}`)) return score + 10;
    if (weakTerms.includes(term)) return score + 5;
    if (exactTerms.some((cardTerm) => cardTerm.startsWith(term))) return score + 3;
    if (relatedTerms.includes(term)) return score + 1;
    return score;
  }, 0);
};

const bestReferences = (terms) =>
  referenceCards
    .map((card) => ({ card, score: referenceScore(card, terms) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.card.title.localeCompare(b.card.title))
    .slice(0, 4)
    .map((item) => item.card);

const createCodeBlock = (label, code) => {
  const cell = document.createElement("article");
  cell.className = "assistant-cell";

  const meta = document.createElement("span");
  meta.className = "assistant-cell-meta";
  meta.textContent = label;

  const pre = document.createElement("pre");
  const codeEl = document.createElement("code");
  codeEl.textContent = code;
  pre.appendChild(codeEl);

  cell.appendChild(meta);
  cell.appendChild(pre);
  return cell;
};

const renderAssistant = (query, filtered, terms) => {
  assistantEl.innerHTML = "";

  if (terms.length === 0) {
    assistantEl.hidden = true;
    return;
  }

  assistantEl.hidden = false;
  const title = document.createElement("h3");
  title.textContent = "Помощник по запросу";
  assistantEl.appendChild(title);

  const refs = bestReferences(terms);
  if (refs.length > 0) {
    const note = document.createElement("p");
    note.className = "assistant-note";
    note.textContent = "Справка из локальной базы. Источник: официальная документация по ссылке в карточке.";
    assistantEl.appendChild(note);

    refs.forEach((ref) => {
      const card = document.createElement("article");
      card.className = "reference-card";

      const head = document.createElement("div");
      head.className = "reference-head";

      const titleLink = document.createElement("a");
      titleLink.href = ref.docsUrl;
      titleLink.target = "_blank";
      titleLink.rel = "noreferrer";
      titleLink.textContent = ref.title;

      const docsLink = document.createElement("a");
      docsLink.className = "official-link";
      docsLink.href = ref.docsUrl;
      docsLink.target = "_blank";
      docsLink.rel = "noreferrer";
      docsLink.textContent = "Official docs";

      const pkg = document.createElement("span");
      pkg.textContent = ref.package;

      head.appendChild(titleLink);
      head.appendChild(docsLink);
      head.appendChild(pkg);

      const summary = document.createElement("p");
      summary.textContent = ref.summary;

      const related = document.createElement("p");
      related.className = "reference-related";
      related.textContent = `Похожие запросы: ${(ref.related || []).join(", ")}`;

      card.appendChild(head);
      card.appendChild(summary);
      card.appendChild(createCodeBlock("Импорт", ref.import));
      card.appendChild(createCodeBlock("Синтаксис", ref.syntax));
      if ((ref.related || []).length > 0) card.appendChild(related);
      assistantEl.appendChild(card);
    });
  }

  if (refs.length === 0) {
    const empty = document.createElement("p");
    empty.className = "assistant-note";
    empty.textContent = `По запросу "${query}" нет справочной карточки. Ниже остаются файлы курса, если в них найдено совпадение.`;
    assistantEl.appendChild(empty);
  }
};

const createRow = (entry) => {
  const frag = rowTpl.content.cloneNode(true);
  frag.querySelector(".nb-name").textContent = entry.name;
  frag.querySelector(".nb-path").textContent = entry.path;

  frag.querySelector('[data-action="view"]').href = githubViewUrl(entry.path);
  frag.querySelector('[data-action="colab"]').href = colabUrl(entry.path);
  frag.querySelector('[data-action="binder"]').href = binderUrl(entry.path);
  frag.querySelector('[data-action="raw"]').href = githubRawUrl(entry.path);

  return frag;
};

const createSection = (categoryKey, items, terms) => {
  const section = document.createElement("details");
  section.className = "folder";
  if (terms.length > 0) section.open = true;

  const summary = document.createElement("summary");
  summary.className = "folder-summary";

  const title = document.createElement("h3");
  title.className = "folder-title";
  title.textContent = `${categoryMeta[categoryKey].title} (${items.length})`;

  const hint = document.createElement("p");
  hint.className = "folder-hint";
  hint.textContent = "Нажмите, чтобы свернуть или развернуть";

  summary.appendChild(title);
  summary.appendChild(hint);

  const body = document.createElement("div");
  body.className = "folder-body";

  const header = document.createElement("div");
  header.className = "nb-header";
  header.innerHTML = `
    <span>Файл</span>
    <span>Путь</span>
    <span>Действия</span>
  `;

  const rows = document.createElement("div");
  rows.className = "nb-rows";
  items.forEach((item) => rows.appendChild(createRow(item)));

  body.appendChild(header);
  body.appendChild(rows);
  section.appendChild(summary);
  section.appendChild(body);
  return section;
};

const render = (items, terms = []) => {
  listEl.innerHTML = "";
  const fragment = document.createDocumentFragment();

  Object.keys(categoryMeta)
    .sort((a, b) => categoryMeta[a].order - categoryMeta[b].order)
    .forEach((categoryKey) => {
      const groupItems = items.filter((item) => item.category === categoryKey);
      if (groupItems.length > 0) {
        fragment.appendChild(createSection(categoryKey, groupItems, terms));
      }
    });

  listEl.appendChild(fragment);
};

const setStats = (count, filteredCount = count) => {
  if (count === filteredCount) {
    statsEl.textContent = `Найдено notebook: ${count}`;
    return;
  }
  statsEl.textContent = `Найдено notebook: ${filteredCount} из ${count}`;
};

const applySearch = () => {
  const query = searchEl.value;
  const terms = queryTerms(searchEl.value);
  const filtered = allNotebooks.filter((item) => matchesQuery(item, terms));
  renderAssistant(query, filtered, terms);
  render(filtered, terms);
  setStats(allNotebooks.length, filtered.length);
};

const notebookFromPath = (path) => {
  const name = normalizeName(path);
  return {
    name,
    path,
    category: categoryOf(path, name),
    searchText: `${name} ${path}`,
    matches: [],
  };
};

const loadFromGitHubApi = async () => {
  const api = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const response = await fetch(api);
  if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
  const data = await response.json();
  return (data.tree || [])
    .filter((item) => item.type === "blob")
    .map((item) => item.path)
    .filter(allowedNotebook)
    .map(notebookFromPath);
};

const loadFromSearchIndex = async () => {
  const urls = [
    `search-index.json?v=${Date.now()}`,
    `https://${owner}.github.io/${repo}/search-index.json?v=${Date.now()}`,
    `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/docs/search-index.json`,
  ];
  const errors = [];
  let data = null;

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      data = await response.json();
      break;
    } catch (error) {
      errors.push(`${url}: ${error.message}`);
    }
  }

  if (!data) {
    throw new Error(errors.join(" | "));
  }

  indexStatusEl.textContent = `Поиск по содержимому активен: ${data.meta.notebookCount} notebooks. Индекс обновляется автоматически после push.`;
  return (data.notebooks || []).map((entry) => ({
    ...entry,
    category: categoryOf(entry.path, entry.name),
  }));
};

const loadReferences = async () => {
  const urls = [
    `reference-index.json?v=${Date.now()}`,
    `https://${owner}.github.io/${repo}/reference-index.json?v=${Date.now()}`,
    `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/docs/reference-index.json`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const data = await response.json();
      referenceCards = data.references || [];
      return;
    } catch (error) {
      referenceCards = [];
    }
  }
};

const loadNotebooks = async () => {
  try {
    await loadReferences();
    try {
      allNotebooks = await loadFromSearchIndex();
    } catch (indexError) {
      indexStatusEl.textContent =
        `Пока доступен поиск только по названию файла. Индекс содержимого не загрузился: ${indexError.message}`;
      allNotebooks = await loadFromGitHubApi();
    }

    allNotebooks = allNotebooks.sort(sortNotebooks);
    render(allNotebooks);
    setStats(allNotebooks.length);

    searchEl.addEventListener("input", applySearch);
  } catch (error) {
    statsEl.textContent =
      "Не удалось загрузить список notebook. Откройте репозиторий напрямую.";
    listEl.innerHTML = `
      <article class="error-card">
        <h3 class="error-title">Ошибка загрузки списка</h3>
        <p class="error-text">${error.message}</p>
        <div class="error-actions">
          <a class="row-btn row-btn-accent" href="https://github.com/${owner}/${repo}" target="_blank" rel="noreferrer">Открыть GitHub</a>
        </div>
      </article>
    `;
  }
};

loadNotebooks();
