const owner = "gggvitalii90";
const repo = "python_analytics_ich_120925";
const branch = "main";

const listEl = document.getElementById("notebook-list");
const statsEl = document.getElementById("stats");
const searchEl = document.getElementById("search");
const rowTpl = document.getElementById("row-template");
const indexStatusEl = document.getElementById("index-status");
const assistantEl = document.getElementById("search-assistant");
const courseTabs = [...document.querySelectorAll("[data-course]")];
const analyticsCountEl = document.getElementById("analytics-count");
const fundamentalCountEl = document.getElementById("fundamental-count");

let allNotebooks = [];
let referenceCards = [];
let miniSearch = null;
let activeCourse = "analytics";

const referenceIndexFiles = [
  "references/python-core.json",
  "references/python-language.json",
  "references/python-builtins.json",
  "references/python-stdlib.json",
  "references/python-stdlib-extended.json",
  "references/python-ecosystem-catalog.json",
  "references/data-analytics.json",
  "references/data-databases.json",
  "references/visualization-ml.json",
  "references/web-dash-api.json",
  "references/workflows-faq.json",
  "references/python-oop.json",
  "references/python-api-web.json",
  "reference-index.json",
];

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

const courseMeta = {
  analytics: { title: "Python для аналитиков", order: 1 },
  fundamental: { title: "Фундаментальный Python", order: 2 },
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
  "удалить": ["del", "drop", "remove", "pop"],
  "удаление": ["del", "drop", "remove", "pop"],
  "колонки": ["columns", "col", "df.columns"],
  "столбцы": ["columns", "col", "df.columns"],
  "тип": ["type", "dtype", "astype"],
  "график": ["plot", "hist", "scatter", "bar"],
  "dubl": ["duplicated", "drop_duplicates"],
  "dupl": ["duplicated", "drop_duplicates"],
  "duplicat": ["duplicated", "drop_duplicates"],
  "dublicated": ["duplicated", "drop_duplicates"],
  "histogramm": ["hist", "histogram", "histplot"],
};

const categoryOf = (path, name) => {
  const lower = `${path} ${name}`.toLowerCase();
  if (path.startsWith("Python/DZ_Python/")) return "homework";
  if (path.startsWith("Python/")) {
    if (lower.includes("summary") || lower.includes("summury")) return "summary";
    if (
      lower.includes("practicum") ||
      lower.includes("practica") ||
      lower.includes("practice") ||
      lower.includes("практика") ||
      lower.includes("_pr_") ||
      lower.includes(" pr_")
    ) {
      return "practice";
    }
    return "lessons";
  }
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
  if (path.startsWith("Python/проект/")) return false;
  return true;
};

const sortNotebooks = (a, b) => {
  const courseA = courseMeta[a.course]?.order || 99;
  const courseB = courseMeta[b.course]?.order || 99;
  if (courseA !== courseB) return courseA - courseB;
  const cA = categoryMeta[a.category].order;
  const cB = categoryMeta[b.category].order;
  if (cA !== cB) return cA - cB;
  return a.name.localeCompare(b.name, "ru", { numeric: true, sensitivity: "base" });
};

const normalizeSearch = (value) => value.toLowerCase().trim();
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
  const aliases = (card.aliases || []).map((term) => term.toLowerCase());
  const weakTerms = [...referenceTokens(card.title), ...referenceTokens(card.package)];
  const relatedTerms = (card.related || []).map((term) => term.toLowerCase());

  return terms.reduce((score, term) => {
    const shortTerm = term.length <= 2;
    if (title === term) return score + 40;
    if (!shortTerm && (title.endsWith(`.${term}`) || title.endsWith(`-${term}`))) return score + 32;
    if (exactTerms.includes(term)) return score + 28;
    if (aliases.includes(term)) return score + 20;
    if (weakTerms.includes(term)) return score + 10;
    if (!shortTerm && exactTerms.some((cardTerm) => cardTerm.startsWith(term))) return score + 8;
    if (!shortTerm && aliases.some((alias) => alias.includes(term))) return score + 6;
    if (!shortTerm && title.includes(term)) return score + 5;
    if (!shortTerm && weakTerms.some((wt) => wt.startsWith(term))) return score + 4;
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

const initMiniSearch = (notebooks) => {
  if (typeof MiniSearch === "undefined") return;
  miniSearch = new MiniSearch({
    fields: ["name", "searchText"],
    storeFields: ["path"],
    idField: "path",
    tokenize: (text) =>
      text
        .toLowerCase()
        .split(/[\s_\-./()\[\]{},;'"!?@#$%^&*=+<>|~`\\]+/)
        .filter((t) => t.length > 0),
    searchOptions: {
      boost: { name: 5 },
      fuzzy: 0.2,
      prefix: true,
      combineWith: "OR",
    },
  });
  miniSearch.addAll(notebooks);
};

const searchNotebooks = (query, pool) => {
  if (!query.trim()) return pool;
  const terms = queryTerms(query);

  if (miniSearch) {
    const expanded = terms.join(" ");
    const results = miniSearch.search(expanded);
    const scoreMap = new Map(results.map((r) => [r.id, r.score]));
    return pool
      .filter((n) => scoreMap.has(n.path))
      .sort((a, b) => (scoreMap.get(b.path) || 0) - (scoreMap.get(a.path) || 0));
  }

  return pool.filter((item) => matchesQuery(item, terms));
};

const referenceUrls = (path) => [
  `${path}?v=${Date.now()}`,
  `https://${owner}.github.io/${repo}/${path}?v=${Date.now()}`,
  `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/docs/${path}`,
];

const loadReferenceFile = async (path) => {
  for (const url of referenceUrls(path)) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const data = await response.json();
      return data.references || [];
    } catch (error) {
      // Try the next mirror.
    }
  }
  return [];
};

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

    const extSearch = document.createElement("div");
    extSearch.className = "external-search";
    const label = document.createElement("span");
    label.textContent = "Поискать в официальной документации:";
    extSearch.appendChild(label);
    [
      { text: "Python docs ↗", url: `https://docs.python.org/3/search.html?q=${encodeURIComponent(query)}` },
      { text: "Pandas docs ↗", url: `https://pandas.pydata.org/docs/search.html?q=${encodeURIComponent(query)}` },
      { text: "NumPy docs ↗", url: `https://numpy.org/doc/stable/search.html?q=${encodeURIComponent(query)}` },
      { text: "Stack Overflow ↗", url: `https://stackoverflow.com/search?q=python+${encodeURIComponent(query)}` },
    ].forEach(({ text, url }) => {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.textContent = text;
      a.className = "external-link";
      extSearch.appendChild(a);
    });
    assistantEl.appendChild(extSearch);
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

const createCopyButton = (text) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "copy-btn";
  btn.textContent = "Копировать";
  btn.addEventListener("click", () => {
    const copy = (t) => {
      btn.textContent = "Скопировано ✓";
      setTimeout(() => { btn.textContent = "Копировать"; }, 2000);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(copy).catch(() => {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        copy();
      });
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      copy();
    }
  });
  return btn;
};

const createSearchRow = (entry, terms) => {
  const frag = rowTpl.content.cloneNode(true);
  frag.querySelector(".nb-name").textContent = entry.name;
  frag.querySelector(".nb-path").textContent = entry.path;
  frag.querySelector('[data-action="view"]').href = githubViewUrl(entry.path);
  frag.querySelector('[data-action="colab"]').href = colabUrl(entry.path);
  frag.querySelector('[data-action="binder"]').href = binderUrl(entry.path);
  frag.querySelector('[data-action="raw"]').href = githubRawUrl(entry.path);

  const article = frag.querySelector(".nb-row");
  if (!article) return frag;

  const cells = matchedCells(entry, terms);
  if (cells.length > 0) {
    const details = document.createElement("details");
    details.className = "nb-snippets-toggle";

    const summary = document.createElement("summary");
    summary.className = "nb-snippets-summary";
    summary.textContent = `Фрагменты кода (${cells.length})`;
    details.appendChild(summary);

    const snippets = document.createElement("div");
    snippets.className = "nb-snippets";
    cells.forEach((cell) => {
      const snip = document.createElement("div");
      snip.className = "nb-snippet";

      const header = document.createElement("div");
      header.className = "nb-snippet-header";

      const meta = document.createElement("span");
      meta.className = "nb-snippet-meta";
      meta.textContent = cell.type === "code" ? "Код" : "Текст";

      header.appendChild(meta);
      header.appendChild(createCopyButton(cell.text));

      if (cell.type === "code") {
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.textContent = cell.text;
        pre.appendChild(code);
        snip.appendChild(header);
        snip.appendChild(pre);
      } else {
        const p = document.createElement("p");
        p.textContent = cell.text;
        snip.appendChild(header);
        snip.appendChild(p);
      }

      snippets.appendChild(snip);
    });
    details.appendChild(snippets);
    article.appendChild(details);
  }

  return frag;
};

const renderSearchResults = (items, terms) => {
  listEl.innerHTML = "";
  if (items.length === 0) {
    const empty = document.createElement("p");
    empty.className = "search-empty";
    empty.textContent = "По запросу ничего не найдено в архиве.";
    listEl.appendChild(empty);
    return;
  }
  const rows = document.createElement("div");
  rows.className = "nb-rows";
  items.slice(0, 60).forEach((item) => rows.appendChild(createSearchRow(item, terms)));
  listEl.appendChild(rows);
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

const createCourseGroup = (courseKey, items, terms) => {
  const wrapper = document.createElement("section");
  wrapper.className = "course-group";

  const heading = document.createElement("h3");
  heading.className = "course-group-title";
  heading.textContent = `${courseMeta[courseKey].title} (${items.length})`;
  wrapper.appendChild(heading);

  Object.keys(categoryMeta)
    .sort((a, b) => categoryMeta[a].order - categoryMeta[b].order)
    .forEach((categoryKey) => {
      const groupItems = items.filter((item) => item.category === categoryKey);
      if (groupItems.length > 0) {
        wrapper.appendChild(createSection(categoryKey, groupItems, terms));
      }
    });

  return wrapper;
};

const render = (items, terms = []) => {
  listEl.innerHTML = "";
  const fragment = document.createDocumentFragment();
  const coursesToRender = terms.length > 0 ? Object.keys(courseMeta) : [activeCourse];

  coursesToRender
    .sort((a, b) => courseMeta[a].order - courseMeta[b].order)
    .forEach((courseKey) => {
      const courseItems = items.filter((item) => item.course === courseKey);
      if (courseItems.length > 0) {
        fragment.appendChild(createCourseGroup(courseKey, courseItems, terms));
      }
    });

  listEl.appendChild(fragment);
};

const updateCourseCounts = () => {
  const analyticsCount = allNotebooks.filter((item) => item.course === "analytics").length;
  const fundamentalCount = allNotebooks.filter((item) => item.course === "fundamental").length;
  analyticsCountEl.textContent = analyticsCount;
  fundamentalCountEl.textContent = fundamentalCount;
};

const setStats = (count, filteredCount = count, terms = []) => {
  if (count === filteredCount) {
    statsEl.textContent =
      terms.length > 0
        ? `Найдено notebook: ${count}`
        : `Найдено notebook: ${count} в разделе "${courseMeta[activeCourse].title}"`;
    return;
  }
  statsEl.textContent = `Найдено notebook: ${filteredCount} из ${count}`;
};

const applySearch = () => {
  const query = searchEl.value;
  const terms = queryTerms(query);
  const isSearch = query.trim().length > 0;
  const pool = isSearch ? allNotebooks : allNotebooks.filter((item) => item.course === activeCourse);
  const filtered = isSearch ? searchNotebooks(query, allNotebooks) : pool;
  renderAssistant(query, filtered, terms);
  if (isSearch) {
    renderSearchResults(filtered, terms);
  } else {
    render(filtered, terms);
  }
  setStats(pool.length, filtered.length, terms);
};

const setActiveCourse = (course) => {
  activeCourse = course;
  courseTabs.forEach((tab) => {
    const isActive = tab.dataset.course === course;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });
  applySearch();
};

const courseOf = (path) => (path.startsWith("Python/") ? "fundamental" : "analytics");

const notebookFromPath = (path) => {
  const name = normalizeName(path);
  return {
    name,
    path,
    course: courseOf(path),
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
    course: entry.course || courseOf(entry.path),
    category: categoryOf(entry.path, entry.name),
  }));
};

const loadReferences = async () => {
  const loaded = await Promise.all(referenceIndexFiles.map(loadReferenceFile));
  const byId = new Map();

  loaded.flat().forEach((card) => {
    if (!card.id || byId.has(card.id)) return;
    byId.set(card.id, card);
  });

  referenceCards = [...byId.values()];
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
    initMiniSearch(allNotebooks);
    updateCourseCounts();
    render(allNotebooks.filter((item) => item.course === activeCourse));
    setStats(allNotebooks.filter((item) => item.course === activeCourse).length);

    searchEl.addEventListener("input", applySearch);
    courseTabs.forEach((tab) => {
      tab.setAttribute("aria-pressed", String(tab.dataset.course === activeCourse));
      tab.addEventListener("click", () => setActiveCourse(tab.dataset.course));
    });
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
