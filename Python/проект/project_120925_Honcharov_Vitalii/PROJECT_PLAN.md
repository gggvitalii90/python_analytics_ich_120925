# Project Plan: Movie Search Application

**Student:** Honcharov Vitaliy  
**Group:** 120925  
**DB:** sakila (MySQL)  
**Logging:** MongoDB (final_project_120925_Honcharov_Vitaliy)

---

## ✅ COMPLETED

### 1. Project Structure
- [x] Created folder `project_120925_Honcharov_Vitalii`
- [x] Moved all project files here
- [x] `.gitignore` configured (excludes `.env`, `__pycache__`, etc.)
- [x] Git initialized locally

### 2. Configuration & Secrets
- [x] `.env` created (local, not in git)
- [x] `.env.example` created (template for others)
- [x] `config.py` fully implemented and commented
  - Loads `.env` using `python-dotenv`
  - `MYSQL_CONFIG` dictionary with fallback defaults
  - `MONGO_URI`, `MONGO_DB`, `MONGO_COLLECTION` from env
  - `show_config()` function for safe debugging (no passwords)

### 3. File Explanations (for defense)
- **`.env`**: Stores real credentials locally (not versioned)
- **`.env.example`**: Shows what variables are needed (safe to share)
- **`.gitignore`**: Prevents accidental commit of `.env` and other sensitive/temp files
- **`config.py`**: Central place to load and distribute configuration

---

## 🚧 IN PROGRESS

### 4. MySQL Connector (`mysql_connector.py`)
- [ ] Implement `get_connection()` - returns pymysql connection
- [ ] Implement `fetch_genres()` - list all genres from DB
- [ ] Implement `fetch_year_range()` - min/max years
- [ ] Implement `search_by_keyword(keyword, limit=10)` - search film by title
- [ ] Implement `search_by_genre_year(genre, year_from, year_to, limit=10)` - filter by genre+year
- [ ] Add comments explaining each function
- [ ] Test with real data

---

## ❌ TODO

### 5. Log Writer (`log_writer.py`)
- [ ] Implement `get_collection()` - connect to MongoDB
- [ ] Implement `write_search_log(search_type, params, results_count)` - save search to DB
- [ ] Add timestamp to each log
- [ ] Test write to MongoDB

### 6. Log Statistics (`log_stats.py`)
- [ ] Implement `get_top(n=5)` - top N queries by frequency
- [ ] Implement `get_recent(n=5)` - recent unique queries
- [ ] Format output nicely (use `tabulate` if available)

### 7. Main Application (`main.py`)
- [ ] Implement menu loop
- [ ] Menu item 1: Search by keyword
- [ ] Menu item 2: Search by genre/year
- [ ] Menu item 3: Show top searches
- [ ] Menu item 4: Show recent searches
- [ ] Menu item 0: Exit (gracefully close connections)
- [ ] Error handling for invalid input

### 8. Formatter (`formatter.py`)
- [ ] Implement `pretty_print_results(results)` - display search results in console

### 9. Final Checklist
- [ ] All modules have comments
- [ ] PEP8 compliance
- [ ] No code duplication
- [ ] Error handling works
- [ ] Tested with real data
- [ ] Project uploaded to LMS 1 day before defense

---

## 📝 Key Concepts for Defense

1. **`.env` and `python-dotenv`**:
   - Separates secrets from code
   - Safe to share `.env.example`
   - Real `.env` in `.gitignore`

2. **`config.py` Pattern**:
   - Central configuration hub
   - All modules import from here
   - Easy to change settings without code edits

3. **MySQL Queries**:
   - Limit results to 10 for pagination
   - Join with `film_category` and `genre` for filter queries
   - Handle empty results gracefully

4. **MongoDB Logging**:
   - Each search logs: `{timestamp, search_type, params, results_count}`
   - Used to calculate "top 5" and "recent" statistics

5. **Git & GitHub Desktop**:
   - Local `.git` folder tracks history
   - Can revert to any previous commit if needed
   - Optional: publish to GitHub.com for cloud backup

---

## 🔗 Files Overview

```
project_120925_Honcharov_Vitalii/
├── .env                # Local credentials (NOT in git)
├── .env.example        # Template (in git)
├── .gitignore          # Excludes .env, __pycache__, etc.
├── config.py           # ✅ DONE - Load .env, export MYSQL_CONFIG, MONGO_*
├── mysql_connector.py  # 🚧 IN PROGRESS
├── log_writer.py       # ❌ TODO
├── log_stats.py        # ❌ TODO
├── main.py             # ❌ TODO
├── formatter.py        # ❌ TODO
├── utils.py            # Helper functions
├── requirements.txt    # Project dependencies
├── README.md           # Quick start guide
└── .git/               # Git history (hidden folder)
```

---

## 💡 Next Step

Start with `mysql_connector.py`: implement search functions and test with real sakila DB.


пролистование не долно работать в бесконечность
# подумать над аннотацией
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    # fallback to environment -------------ЗАДАТЬ ВОПРОСЫ
    load_dotenv()


def mongoagr(key_word):
    result = mongoconn().aggregate([
    {
        '$group': {
            '_id': '$name_film', 
            'total': {
                '$sum': 1
            }
        }
    }, {
        '$sort': {
            'total': -1
        }
    }, {
        '$limit': 5
    }
])
    return result