# Final project — Movie search

## Quick start

1. Create and activate a Python environment (recommended).
2. Install dependencies:

```bash
python -m pip install -r requirements.txt
```

3. Create a local `.env` file from `.env.example` and fill credentials (do NOT commit `.env`).

4. Run the application:

```bash
python main.py
```

## Files

- `main.py` — entry point and menu (exit via 0)
- `mysql_connector.py` — MySQL access and search functions
- `mongo_connector.py` — MongoDB connection manager
- `log_writer.py` — MongoDB logging
- `log_stats.py` — functions to read statistics
- `formatter.py` — result formatting for console
- `config.py` — loads `.env` values
- `.env.example` — template for credentials
- `requirements.txt` — Python dependencies

## Security

Do not add your real `.env` to git. Use `.env.example` as template.
