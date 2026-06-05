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

const helperCards = [
  {
    terms: ["duplicated", "drop_duplicates", "дубликат", "дубликаты", "повторы"],
    title: "Дубликаты в pandas",
    note: "Проверить повторяющиеся строки и удалить их.",
    code: `import pandas as pd

# Проверить, сколько строк повторяются
df.duplicated().sum()

# Посмотреть дубликаты
df[df.duplicated()]

# Удалить дубликаты
df = df.drop_duplicates()`,
  },
  {
    terms: ["drop", "dropna", "fillna", "isna", "isnull", "пропуски", "пустые"],
    title: "Пропуски и удаление данных",
    note: "Базовые методы pandas для пропусков, колонок и строк.",
    code: `import pandas as pd

# Проверить пропуски
df.isna().sum()

# Заполнить пропуски
df["column"] = df["column"].fillna(0)

# Удалить строки с пропусками
df = df.dropna()

# Удалить колонку
df = df.drop(columns=["column_name"])`,
  },
  {
    terms: ["groupby", "группировка", "группировать"],
    title: "Группировка данных",
    note: "Посчитать агрегаты по категориям.",
    code: `import pandas as pd

result = (
    df
    .groupby("category", as_index=False)
    .agg(
        total=("value", "sum"),
        avg_value=("value", "mean"),
        count=("value", "count"),
    )
)`,
  },
  {
    terms: ["merge", "join", "concat", "объединение", "объединить"],
    title: "Объединение таблиц",
    note: "Соединить таблицы по ключу или склеить по строкам.",
    code: `import pandas as pd

# SQL-like join по ключу
merged = left.merge(right, on="id", how="left")

# Склеить таблицы по строкам
combined = pd.concat([df1, df2], ignore_index=True)`,
  },
  {
    terms: ["datetime", "date", "dt", "дата", "даты", "время"],
    title: "Работа с датами",
    note: "Преобразовать колонку в дату и достать год/месяц/день.",
    code: `import pandas as pd

df["date"] = pd.to_datetime(df["date"])
df["year"] = df["date"].dt.year
df["month"] = df["date"].dt.month
df["weekday"] = df["date"].dt.day_name()`,
  },
  {
    terms: ["boxplot", "hist", "scatter", "matplotlib", "seaborn", "график"],
    title: "Быстрые графики",
    note: "Посмотреть распределение или связь между признаками.",
    code: `import matplotlib.pyplot as plt
import seaborn as sns

sns.boxplot(data=df, x="category", y="value")
plt.show()

sns.scatterplot(data=df, x="x_column", y="y_column")
plt.show()`,
  },
  {
    terms: ["dash", "dashboard", "дашборд"],
    title: "Минимальный Dash",
    note: "Базовый каркас приложения Dash.",
    code: `from dash import Dash, html, dcc
import plotly.express as px

app = Dash(__name__)

app.layout = html.Div([
    html.H1("Dashboard"),
    dcc.Graph(figure=px.scatter(df, x="x", y="y")),
])

app.run(debug=True)`,
  },
  {
    terms: ["prophet", "forecast", "прогноз"],
    title: "Прогноз в Prophet",
    note: "Prophet ожидает колонки ds для даты и y для значения.",
    code: `from prophet import Prophet

model = Prophet()
model.fit(df[["ds", "y"]])

future = model.make_future_dataframe(periods=30)
forecast = model.predict(future)
model.plot(forecast)`,
  },
];

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

const bestHelper = (terms) =>
  helperCards.find((card) => card.terms.some((term) => terms.includes(term)));

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

  const helper = bestHelper(terms);
  if (helper) {
    const note = document.createElement("p");
    note.className = "assistant-note";
    note.textContent = `${helper.title}. ${helper.note}`;
    assistantEl.appendChild(note);
    assistantEl.appendChild(createCodeBlock("Синтаксис / импорт", helper.code));
  }

  const realCells = [];
  filtered.forEach((entry) => {
    matchedCells(entry, terms).forEach((match) => {
      if (match.type === "code") {
        realCells.push({ entry, match });
      }
    });
  });

  if (realCells.length > 0) {
    const sourceTitle = document.createElement("p");
    sourceTitle.className = "assistant-note";
    sourceTitle.textContent = helper
      ? "Ниже реальные похожие ячейки из материалов курса."
      : "Готового шаблона нет, но вот реальные ячейки из материалов курса.";
    assistantEl.appendChild(sourceTitle);

    realCells.slice(0, 3).forEach(({ entry, match }) => {
      assistantEl.appendChild(
        createCodeBlock(`${entry.name} · ячейка ${match.cell}`, match.text)
      );
    });
  }

  if (!helper && realCells.length === 0) {
    const empty = document.createElement("p");
    empty.className = "assistant-note";
    empty.textContent = `По запросу "${query}" нет подсказки и совпадений в ячейках. Попробуйте другое слово или английское название метода.`;
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

const loadNotebooks = async () => {
  try {
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
