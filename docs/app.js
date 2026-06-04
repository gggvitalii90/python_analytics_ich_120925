const owner = "gggvitalii90";
const repo = "python_analytics_ich_120925";
const branch = "main";

const listEl = document.getElementById("notebook-list");
const statsEl = document.getElementById("stats");
const searchEl = document.getElementById("search");
const cardTpl = document.getElementById("card-template");

const encodePath = (path) => path.split("/").map(encodeURIComponent).join("/");

const githubViewUrl = (path) =>
  `https://github.com/${owner}/${repo}/blob/${branch}/${encodePath(path)}`;

const githubRawUrl = (path) =>
  `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encodePath(path)}`;

const binderUrl = (path) =>
  `https://mybinder.org/v2/gh/${owner}/${repo}/${branch}?urlpath=lab/tree/${encodePath(path)}`;

const classify = (path) => {
  if (path.startsWith("DZ_python_DA/")) return 1;
  if (path.startsWith("Python for DA_L")) return 2;
  if (path.startsWith("Python for DA_PR")) return 3;
  if (path.startsWith("Summary Lesson")) return 4;
  return 5;
};

const normalizeName = (path) => path.split("/").pop();

const allowedNotebook = (path) => {
  if (!path.toLowerCase().endsWith(".ipynb")) return false;
  if (path.includes(".ipynb_checkpoints")) return false;
  if (path.includes("backup_before_restore")) return false;
  return true;
};

const sortNotebooks = (a, b) => {
  const cA = classify(a.path);
  const cB = classify(b.path);
  if (cA !== cB) return cA - cB;
  return a.name.localeCompare(b.name, "ru", { numeric: true, sensitivity: "base" });
};

const createCard = (entry) => {
  const frag = cardTpl.content.cloneNode(true);
  frag.querySelector(".card-title").textContent = entry.name;
  frag.querySelector(".card-path").textContent = entry.path;

  frag.querySelector('[data-action="view"]').href = githubViewUrl(entry.path);
  frag.querySelector('[data-action="raw"]').href = githubRawUrl(entry.path);
  frag.querySelector('[data-action="binder"]').href = binderUrl(entry.path);

  return frag;
};

const render = (items) => {
  listEl.innerHTML = "";
  const fragment = document.createDocumentFragment();
  items.forEach((item) => fragment.appendChild(createCard(item)));
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
      .map((path) => ({ name: normalizeName(path), path }))
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
      <article class="card">
        <h3 class="card-title">Ошибка загрузки списка</h3>
        <p class="card-path">${error.message}</p>
        <div class="card-actions">
          <a class="mini-btn accent" href="https://github.com/${owner}/${repo}" target="_blank" rel="noreferrer">Открыть GitHub</a>
        </div>
      </article>
    `;
  }
};

loadNotebooks();
