# Python Analytics ICH — контекст проекта

## Что это

Личный архив кода студента Гончарова Виталия (курс Python DA, IT Career Hub).
Другие ученики заходят, ищут функцию/концепцию → видят карточку документации + список ноутбуков где это есть → копируют нужный код.

Портал: https://gggvitalii90.github.io/python_analytics_ich_120925/
Репо: https://github.com/gggvitalii90/python_analytics_ich_120925

## Структура

```
docs/               ← GitHub Pages (main ветка, /docs папка)
  index.html        ← Главная: поиск + архив ноутбуков
  practice.html     ← Отдельная страница: задачи онлайн (Pyodide)
  portal.js         ← Логика главной (поиск MiniSearch, вкладки курсов)
  practice.js       ← Логика практики (Pyodide, фильтры, пагинация)
  styles.css        ← Все стили
  practice-tasks.json  ← 75 задач по 5 темам
  search-index.json    ← Индекс поиска (200+ ноутбуков, 2.8 MB)
  reference-index.json ← Дополнительный файл карточек документации (загружается в portal.js)
  references/          ← JSON карточки документации (13 файлов)
scripts/
  build_search_index.py  ← Сборка search-index.json + редакция credentials
.github/workflows/
  update-search-index.yml  ← CI/CD: пересборка индекса при push ноутбуков
```

## Что уже сделано

- [x] Веб-портал с двумя страницами (index.html + practice.html)
- [x] Поиск через MiniSearch (fuzzy, карточки документации + ноутбуки)
- [x] 75 задач на practice.html (Python, Pandas, NumPy, визуализация, ООП)
- [x] Pyodide — запуск Python кода прямо в браузере (без сервера)
- [x] Пагинация задач: 6 штук + кнопка "Показать ещё"
- [x] CI/CD: автопересборка search-index.json при push
- [x] Редакция credentials перед индексацией (MongoDB URI, пароли)
- [x] Исправлен баг: функция initPyodide не должна называться loadPyodide (конфликт с window.loadPyodide)
- [x] Очищена история git от реального MongoDB URI (git filter-repo)
- [x] Исправлен GitHub Pages 404 (убраны broken submodules)
- [x] Sticky course-switcher (две кнопки: Python для аналитиков / Фундаментальный Python)
- [x] CTA баннер на главной → ведёт на practice.html

## Что в планах (незавершённое)

### Видео-туториал (заблокировано TTS в облачном контейнере)
Хотим: ~3 мин видео как пользоваться порталом, без участия пользователя.
Пробовали: edge-tts, gTTS — оба заблокированы SSL прокси в облачном контейнере.
Варианты которые остались:
- Пользователь предоставляет ElevenLabs API ключ → генерируем озвучку + Playwright скринкаст
- Записать в Loom / HeyGen самостоятельно

### Pagefind (замена поиска)
Текущий поиск: MiniSearch по search-index.json. Pagefind НЕ подключён.
Цель: Pagefind — нечёткий поиск, подсветка фрагментов, ранжирование.
Что нужно:
- Добавить шаг `npx pagefind --site docs/` в CI workflow
- Заменить функцию matchesQuery() в portal.js на Pagefind API
- Подключить pagefind.js в index.html

### Расширение reference базы (частично сделано)
Файлы созданы но неполные:
- docs/references/python-oop.json — 7 карточек (нужно ~12: ABC, @dataclass, super, @property и др.)
- docs/references/python-api-web.json — 10 карточек (нужно проверить полноту)
Ещё нужно добавить в docs/references/data-analytics.json:
- pandas .str accessor, .dt accessor, DataFrame.apply, .transform

### Превью кода в результатах поиска
Поле `matches` в search-index.json содержит фрагменты ячеек.
Добавить: раскрывающийся блок кода + кнопка "Скопировать" под каждым результатом.

## Важные технические детали

### Pyodide
- CDN: `https://cdn.jsdelivr.net/pyodide/v0.27.5/full/`
- Глобал из CDN: `window.loadPyodide` — НЕЛЬЗЯ называть свою функцию так же!
- Наша функция называется: `initPyodide()` в practice.js

### Безопасность credentials
КРИТИЧНО: в ноутбуках встречаются реальные пароли (MySQL, MongoDB, API ключи школы).
Правило: заменять любые строки похожие на пароли/URI/токены на `YOUR_PASSWORD`, `YOUR_URI`, etc.
Скрипт: `scripts/build_search_index.py` — уже содержит редакцию, проверять при любых изменениях.

### Как работает автопуш (autogit)
- Папка `.autogit` в корне проекта — VS Code расширение Auto Git
- Пушит каждый час автоматически (только ОТПРАВЛЯЕТ, не тянет с GitHub)
- Ветка: main
- Чтобы получить изменения из облачной сессии Claude → нужно сделать `git pull` вручную в терминале

### GitHub Pages
- Настройки: Settings → Pages → Branch: main, Folder: /docs
- Деплой занимает 1-3 минуты после push в main

## Как запустить портал локально

```bash
cd docs
python -m http.server 8080
# открыть http://localhost:8080
```

## Что можно удалить локально (не в репо — только на компьютере)

Папки (gitignored мусор, безопасно удалять):
- `_tmp_manual_test/`, `_tmp_manual_test2/`
- `.pytest_tmp/`, `.tmp_pr19/`, `.tmp_pytest/`, `.tmp_pytest_run/`
- `.ipynb_checkpoints/`
- `лекции/` (если не нужны локально — в GitHub их нет)

Файлы в репо которые можно удалить:
- `docs/app.js` — нигде не подключён, не используется (orphan файл)
- `docs/vercel.json` — конфиг Vercel, но портал на GitHub Pages, не нужен
