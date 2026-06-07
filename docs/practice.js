const PRACTICE_TASKS_URL = "practice-tasks.json";

let allTasks = [];
let activeTopic = "all";
let activeLevel = "all";
let pyodideReady = false;
let pyodideLoading = false;
let pyodide = null;

const topicLabels = {
  "all": "Все темы",
  "python-basics": "Python базовый",
  "pandas": "Pandas",
  "numpy": "NumPy",
  "visualization": "Визуализация",
  "python-oop": "ООП",
};

const levelLabels = {
  "all": "Все уровни",
  "базовый": "Базовый",
  "средний": "Средний",
};

async function initPyodide() {
  if (pyodideReady || pyodideLoading) return;
  pyodideLoading = true;

  const statusEl = document.getElementById("pyodide-status");
  if (statusEl) {
    statusEl.textContent = "Загрузка Python в браузер... (~15 сек)";
    statusEl.className = "pyodide-status loading";
  }

  const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/";

  try {
    if (typeof window.loadPyodide !== "function") {
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = PYODIDE_CDN + "pyodide.js";
        s.onload = resolve;
        s.onerror = () => reject(new Error("Не удалось загрузить pyodide.js"));
        document.head.appendChild(s);
      });
    }

    pyodide = await window.loadPyodide({ indexURL: PYODIDE_CDN });
    await pyodide.loadPackagesFromImports("import micropip");

    pyodideReady = true;
    pyodideLoading = false;

    if (statusEl) {
      statusEl.textContent = "✓ Python готов к работе";
      statusEl.className = "pyodide-status ready";
    }

    document.querySelectorAll(".run-btn").forEach((btn) => {
      btn.disabled = false;
      btn.textContent = "▶ Запустить";
    });
  } catch (err) {
    pyodideLoading = false;
    if (statusEl) {
      statusEl.textContent = "Ошибка загрузки Python: " + err.message;
      statusEl.className = "pyodide-status error";
    }
  }
}

async function runCode(taskId) {
  const editorEl = document.getElementById(`editor-${taskId}`);
  const outputEl = document.getElementById(`output-${taskId}`);
  const runBtn = document.getElementById(`run-btn-${taskId}`);

  if (!editorEl || !outputEl) return;

  const code = editorEl.value;

  if (!pyodideReady) {
    outputEl.textContent = "Python ещё загружается, подождите...";
    outputEl.className = "task-output output-error";
    await initPyodide();
    return;
  }

  runBtn.disabled = true;
  runBtn.textContent = "⏳ Выполняется...";
  outputEl.textContent = "";
  outputEl.className = "task-output";

  try {
    pyodide.runPython(`
import sys, io
_stdout = io.StringIO()
sys.stdout = _stdout
`);

    await pyodide.runPythonAsync(code);

    const output = pyodide.runPython("_stdout.getvalue(); sys.stdout = sys.__stdout__; _stdout.getvalue()");
    outputEl.textContent = output.trimEnd() || "(нет вывода)";
    outputEl.className = "task-output output-ok";
  } catch (err) {
    pyodide.runPython("sys.stdout = sys.__stdout__").catch(() => {});
    const msg = err.message || String(err);
    const clean = msg.replace(/File "<exec>", /g, "");
    outputEl.textContent = clean;
    outputEl.className = "task-output output-error";
  } finally {
    runBtn.disabled = false;
    runBtn.textContent = "▶ Запустить";
  }
}

function resetCode(taskId) {
  const task = allTasks.find((t) => t.id === taskId);
  if (!task) return;
  const editorEl = document.getElementById(`editor-${taskId}`);
  if (editorEl) editorEl.value = task.starter;
  const outputEl = document.getElementById(`output-${taskId}`);
  if (outputEl) {
    outputEl.textContent = "";
    outputEl.className = "task-output";
  }
}

function toggleHint(taskId) {
  const hintEl = document.getElementById(`hint-${taskId}`);
  const btn = document.getElementById(`hint-btn-${taskId}`);
  if (!hintEl || !btn) return;
  const visible = hintEl.hidden === false;
  hintEl.hidden = visible;
  btn.textContent = visible ? "Показать подсказку" : "Скрыть подсказку";
}

function createTaskCard(task) {
  const card = document.createElement("article");
  card.className = "practice-card";
  card.id = `task-card-${task.id}`;

  const header = document.createElement("div");
  header.className = "practice-card-header";

  const titleRow = document.createElement("div");
  titleRow.className = "practice-title-row";

  const num = document.createElement("span");
  num.className = "practice-num";
  num.textContent = `#${task.id}`;

  const title = document.createElement("h3");
  title.className = "practice-title";
  title.textContent = task.title;

  const badges = document.createElement("div");
  badges.className = "practice-badges";

  const topicBadge = document.createElement("span");
  topicBadge.className = "practice-badge badge-topic";
  topicBadge.textContent = topicLabels[task.topic] || task.topic;

  const levelBadge = document.createElement("span");
  levelBadge.className = `practice-badge badge-level badge-${task.level}`;
  levelBadge.textContent = task.level;

  badges.appendChild(topicBadge);
  badges.appendChild(levelBadge);
  titleRow.appendChild(num);
  titleRow.appendChild(title);
  header.appendChild(titleRow);
  header.appendChild(badges);

  const desc = document.createElement("p");
  desc.className = "practice-desc";
  desc.textContent = task.description;

  const hintBtn = document.createElement("button");
  hintBtn.type = "button";
  hintBtn.id = `hint-btn-${task.id}`;
  hintBtn.className = "hint-btn";
  hintBtn.textContent = "Показать подсказку";
  hintBtn.addEventListener("click", () => toggleHint(task.id));

  const hintEl = document.createElement("div");
  hintEl.id = `hint-${task.id}`;
  hintEl.className = "practice-hint";
  hintEl.hidden = true;
  hintEl.textContent = task.hint;

  const editorWrap = document.createElement("div");
  editorWrap.className = "editor-wrap";

  const textarea = document.createElement("textarea");
  textarea.id = `editor-${task.id}`;
  textarea.className = "code-editor";
  textarea.value = task.starter;
  textarea.spellcheck = false;
  textarea.autocomplete = "off";
  textarea.autocorrect = "off";
  textarea.autocapitalize = "off";

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value = textarea.value.substring(0, start) + "    " + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 4;
    }
  });

  editorWrap.appendChild(textarea);

  const controls = document.createElement("div");
  controls.className = "editor-controls";

  const runBtn = document.createElement("button");
  runBtn.type = "button";
  runBtn.id = `run-btn-${task.id}`;
  runBtn.className = "run-btn";
  runBtn.textContent = pyodideReady ? "▶ Запустить" : "⏳ Загрузка Python...";
  runBtn.disabled = !pyodideReady;
  runBtn.addEventListener("click", () => runCode(task.id));

  const resetBtn = document.createElement("button");
  resetBtn.type = "button";
  resetBtn.className = "reset-btn";
  resetBtn.textContent = "Сбросить";
  resetBtn.addEventListener("click", () => resetCode(task.id));

  controls.appendChild(runBtn);
  controls.appendChild(resetBtn);

  const outputEl = document.createElement("pre");
  outputEl.id = `output-${task.id}`;
  outputEl.className = "task-output";

  const tagsEl = document.createElement("div");
  tagsEl.className = "practice-tags";
  (task.tags || []).forEach((tag) => {
    const t = document.createElement("span");
    t.className = "practice-tag";
    t.textContent = tag;
    tagsEl.appendChild(t);
  });

  card.appendChild(header);
  card.appendChild(desc);
  card.appendChild(hintBtn);
  card.appendChild(hintEl);
  card.appendChild(editorWrap);
  card.appendChild(controls);
  card.appendChild(outputEl);
  card.appendChild(tagsEl);

  return card;
}

function getFilteredTasks() {
  return allTasks.filter((t) => {
    const topicOk = activeTopic === "all" || t.topic === activeTopic;
    const levelOk = activeLevel === "all" || t.level === activeLevel;
    return topicOk && levelOk;
  });
}

const PAGE_SIZE = 6;
let visibleCount = PAGE_SIZE;

function renderTasks() {
  const listEl = document.getElementById("practice-list");
  const countEl = document.getElementById("practice-count");
  if (!listEl) return;

  listEl.innerHTML = "";
  const tasks = getFilteredTasks();

  if (countEl) countEl.textContent = `${tasks.length} задач`;

  if (tasks.length === 0) {
    listEl.innerHTML = '<p class="practice-empty">Нет задач по выбранным фильтрам.</p>';
    return;
  }

  const visible = tasks.slice(0, visibleCount);
  visible.forEach((task) => listEl.appendChild(createTaskCard(task)));

  if (visibleCount < tasks.length) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "load-more-btn";
    btn.textContent = `Показать ещё (${tasks.length - visibleCount} осталось)`;
    btn.addEventListener("click", () => {
      visibleCount += PAGE_SIZE;
      renderTasks();
    });
    listEl.appendChild(btn);
  }
}

function setTopicFilter(topic) {
  activeTopic = topic;
  visibleCount = PAGE_SIZE;
  document.querySelectorAll(".topic-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.topic === topic);
  });
  renderTasks();
}

function setLevelFilter(level) {
  activeLevel = level;
  visibleCount = PAGE_SIZE;
  document.querySelectorAll(".level-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.level === level);
  });
  renderTasks();
}

function buildFilters() {
  const topicBar = document.getElementById("topic-filters");
  const levelBar = document.getElementById("level-filters");
  if (!topicBar || !levelBar) return;

  Object.entries(topicLabels).forEach(([key, label]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `topic-btn${key === "all" ? " is-active" : ""}`;
    btn.dataset.topic = key;
    btn.textContent = label;
    btn.addEventListener("click", () => setTopicFilter(key));
    topicBar.appendChild(btn);
  });

  Object.entries(levelLabels).forEach(([key, label]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `level-btn${key === "all" ? " is-active" : ""}`;
    btn.dataset.level = key;
    btn.textContent = label;
    btn.addEventListener("click", () => setLevelFilter(key));
    levelBar.appendChild(btn);
  });
}

async function initPractice() {
  try {
    const resp = await fetch("practice-tasks.json");
    allTasks = await resp.json();
  } catch {
    const listEl = document.getElementById("practice-list");
    if (listEl) listEl.innerHTML = '<p class="practice-empty">Не удалось загрузить задачи.</p>';
    return;
  }

  buildFilters();
  renderTasks();
  initPyodide();
}

document.addEventListener("DOMContentLoaded", () => {
  const practiceTab = document.querySelector('[data-tab="practice"]');
  if (practiceTab) {
    practiceTab.addEventListener("click", () => {
      if (allTasks.length === 0) initPractice();
    });
  }
});
