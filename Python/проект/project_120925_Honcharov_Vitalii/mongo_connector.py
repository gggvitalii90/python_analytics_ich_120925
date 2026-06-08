
"""MongoDB connector shared across log components."""
from config import MONGO_URI, MONGO_DB, MONGO_COLLECTION
from pymongo import MongoClient


class MongoConnector:
    """Единая точка подключения к MongoDB для LogWriter и LogStats."""

    def __init__(self):
        self.client = None
        self.col = None
        self.connected = False

    def connect(self):
        try:
            # Timeout 2 сек вместо 30 по умолчанию.
            # Если MongoDB недоступна, программа не зависнет, а сразу попадет в except
            self.client = MongoClient(
                MONGO_URI,
                serverSelectionTimeoutMS=2000,
                tz_aware=True
            )

            # ping — принудительная проверка реального соединения
            # MongoClient "ленивый": объект создается даже без реального подключения
            # ping заставляет проверить связь ДО того, как начнем писать логи
            self.client.admin.command('ping')

            self.col = self.client[MONGO_DB][MONGO_COLLECTION]
            self.connected = True
        except Exception as e:
            print(f'Ошибка подключения к MongoDB: {e}')
            self.client = None
            self.col = None
            # Mongo недоступна -> статистика и логи будут временно отключены.
            self.connected = False

    def close(self):
        """Закрывает соединение с MongoDB."""
        if self.client:
            self.client.close()
            self.client = None
            self.col = None
            self.connected = False
