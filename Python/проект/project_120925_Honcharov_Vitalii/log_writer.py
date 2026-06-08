"""MongoDB logging helper (skeleton)."""
from typing import Dict
from datetime import datetime, timezone
from mongo_connector import MongoConnector


class LogWriter:
    """Записывает логи поисков в MongoDB, не влияя на основной поиск."""

    def __init__(self, mongo_connector: MongoConnector):
        # Используем готовое подключение из MongoConnector.
        self.mongo_connector = mongo_connector

    def write_search_log(
            self, search_type: str, params: Dict, results_count: int
            ):
        """Логирует поиск в MongoDB с UTC timestamp."""
        if not self.mongo_connector.connected:
            return  # Если MongoDB не подключена, ничего не пишем

        doc = {
            # Используем UTC, чтобы время логов одинаково читалось везде.
            # Без timezone.utc дата будет без информации о часовом поясе.
            'timestamp': datetime.now(timezone.utc),
            'search_type': search_type,
            'params': params,
            'results_count': results_count
        }
        try:
            self.mongo_connector.col.insert_one(doc)
        except Exception:
            # Если MongoDB недоступна, просто отключаем логи и работаем дальше.
            self.mongo_connector.connected = False
