const owner = "gggvitalii90";
const repo = "python_analytics_ich_120925";
const branch = "main";

const listEl = document.getElementById("notebook-list");
const statsEl = document.getElementById("stats");
const searchEl = document.getElementById("search");
const rowTpl = document.getElementById("row-template");
const indexStatusEl = document.getElementById("index-status");

let allNotebooks = [];
let contentIndexReady = false;

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

const createSnippet = (match) => {
  const snippet = document.createElement("div");
  snippet.className = "nb-snippet";

  const meta = document.createElement("span");
  meta.className = "nb-snippet-meta";
  meta.textContent = `Ячейка ${match.cell}, ${match.type}`;

  const text = document.createElement("p");
  text.textContent = match.text;

  snippet.appendChild(meta);
  snippet.appendChild(text);
  return snippet;
};

const createRow = (entry, terms = []) => {
  const frag = rowTpl.content.cloneNode(true);
  const row = frag.querySelector(".nb-row");
  frag.querySelector(".nb-name").textContent = entry.name;
  frag.querySelector(".nb-path").textContent = entry.path;

  frag.querySelector('[data-action="view"]').href = githubViewUrl(entry.path);
  frag.querySelector('[data-action="colab"]').href = colabUrl(entry.path);
  frag.querySelector('[data-action="binder"]').href = binderUrl(entry.path);
  frag.querySelector('[data-action="raw"]').href = githubRawUrl(entry.path);

  const snippets = matchedCells(entry, terms);
  if (snippets.length > 0) {
    const snippetsEl = document.createElement("div");
    snippetsEl.className = "nb-snippets";
    snippets.forEach((match) => snippetsEl.appendChild(createSnippet(match)));
    row.appendChild(snippetsEl);
  }

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
  items.forEach((item) => rows.appendChild(createRow(item, terms)));

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
  const terms = queryTerms(searchEl.value);
  const filtered = allNotebooks.filter((item) => matchesQuery(item, terms));
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
  const response = await fetch(`search-index.json?v=${Date.now()}`);
  if (!response.ok) throw new Error(`Search index error: ${response.status}`);
  const data = await response.json();
  contentIndexReady = true;
  indexStatusEl.textContent = `Поиск по содержимому активен: ${data.meta.notebookCount} notebooks, индекс обновляется автоматически после push.`;
  return (data.notebooks || []).map((entry) => ({
    ...entry,
    category: categoryOf(entry.path, entry.name),
  }));
};

const loadNotebooks = async () => {
  try {
    try {
      allNotebooks = await loadFromSearchIndex();
    } catch (indexError) {
      contentIndexReady = false;
      indexStatusEl.textContent =
        "Пока доступен поиск только по названию файла. Индекс содержимого еще не собран или обновляется.";
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
