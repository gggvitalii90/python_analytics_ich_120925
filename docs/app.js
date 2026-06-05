const owner = "gggvitalii90";
const repo = "python_analytics_ich_120925";
const branch = "main";

const listEl = document.getElementById("notebook-list");
const statsEl = document.getElementById("stats");
const searchEl = document.getElementById("search");
const rowTpl = document.getElementById("row-template");

const encodePath = (path) => path.split("/").map(encodeURIComponent).join("/");

const githubViewUrl = (path) =>
  `https://github.com/${owner}/${repo}/blob/${branch}/${encodePath(path)}`;

const githubRawUrl = (path) =>
  `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encodePath(path)}`;

const binderUrl = (path) =>
  `https://mybinder.org/v2/gh/${owner}/${repo}/${branch}?urlpath=lab/tree/${encodePath(path)}`;

const categoryMeta = {
  lessons: { title: "Лекции", order: 1 },
  practice: { title: "Практика", order: 2 },
  homework: { title: "Домашние задания", order: 3 },
  summary: { title: "Сводные уроки", order: 4 },
  extra: { title: "Дополнительно", order: 5 },
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
  if (cA !== cB) {
    return cA - cB;
  }
  return a.name.localeCompare(b.name, "ru", { numeric: true, sensitivity: "base" });
};

const createRow = (entry) => {
  const frag = rowTpl.content.cloneNode(true);
  frag.querySelector(".nb-name").textContent = entry.name;
  frag.querySelector(".nb-path").textContent = entry.path;

  frag.querySelector('[data-action="view"]').href = githubViewUrl(entry.path);
  frag.querySelector('[data-action="raw"]').href = githubRawUrl(entry.path);
  frag.querySelector('[data-action="binder"]').href = binderUrl(entry.path);

  return frag;
};

const createSection = (categoryKey, items) => {
  const section = document.createElement("details");
  section.className = "folder";
  section.open = true;

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

const render = (items) => {
  listEl.innerHTML = "";
  const fragment = document.createDocumentFragment();

  Object.keys(categoryMeta)
    .sort((a, b) => categoryMeta[a].order - categoryMeta[b].order)
    .forEach((categoryKey) => {
      const groupItems = items.filter((item) => item.category === categoryKey);
      if (groupItems.length > 0) {
        fragment.appendChild(createSection(categoryKey, groupItems));
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

const loadNotebooks = async () => {
  try {
    const api = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    const response = await fetch(api);

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    const notebooks = (data.tree || [])
      .filter((item) => item.type === "blob")
      .map((item) => item.path)
      .filter(allowedNotebook)
      .map((path) => {
        const name = normalizeName(path);
        return { name, path, category: categoryOf(path, name) };
      })
      .sort(sortNotebooks);

    render(notebooks);
    setStats(notebooks.length);

    searchEl.addEventListener("input", () => {
      const query = searchEl.value.trim().toLowerCase();
      const filtered = notebooks.filter(
        (item) =>
          item.name.toLowerCase().includes(query) || item.path.toLowerCase().includes(query)
      );
      render(filtered);
      setStats(notebooks.length, filtered.length);
    });
  } catch (error) {
    statsEl.textContent = "Не удалось загрузить список notebook. Откройте репозиторий напрямую.";
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
