"""MongoDB statistics helper."""
from mongo_connector import MongoConnector


class LogStats:
    """Читает статистику поисков из MongoDB через коннектор."""

    def __init__(self, mongo_connector: MongoConnector):
        self.mongo_connector = mongo_connector

    def is_connected(self):
        # Перед показом статистики проверяем, доступна ли MongoDB.
        return self.mongo_connector.connected

    def get_top(self, n: int = 5, search_type: str = None):
        if search_type is None:
            print('Ошибка: search_type не передан')
            return []

        # Для разных типов поиска разные структуры params,
        # поэтому используем разные pipelines с $toLower
        if search_type == 'keyword':
            pipeline = [
                {'$match': {'search_type': search_type}},
                {'$sort': {'timestamp': -1}},
                {
                    '$group': {
                        '_id': {
                            'keyword': {'$toLower': '$params.keyword'}
                        },
                        # Сколько раз этот запрос встречался
                        'count': {'$sum': 1},
                        # Дата последнего такого запроса
                        'last_date': {'$first': '$timestamp'},
                        # Сколько фильмов нашлось в последний раз
                        'results_count': {'$first': '$results_count'}
                    }
                },
                {'$sort': {'count': -1}},
                {'$limit': n}
            ]
        elif search_type == 'genre_and_year':
            pipeline = [
                {'$match': {'search_type': search_type}},
                {'$sort': {'timestamp': -1}},
                {
                    '$group': {
                        '_id': {
                            'genre': {'$toLower': '$params.genre'},
                            'year_from': '$params.year_from',
                            'year_to': '$params.year_to'
                        },
                        # Сколько раз искали этот жанр/диапазон
                        'count': {'$sum': 1},
                        # Дата последнего такого запроса
                        'last_date': {'$first': '$timestamp'},
                        # Сколько фильмов нашлось в последний раз
                        'results_count': {'$first': '$results_count'}
                    }
                },
                {'$sort': {'count': -1}},
                {'$limit': n}
            ]
        else:
            return []

        result = list(self.mongo_connector.col.aggregate(pipeline))
        return result

    def get_recent(self, n: int = 5):
        """Получить последние N УНИКАЛЬНЫХ поисков."""
        pipeline = [
            # Шаг 1: Сначала сортируем по времени, чтобы $first взял
            # самый новый документ в каждой группе
            {'$sort': {'timestamp': -1}},

            # Шаг 2: Группируем по ключу (search_type + params)
            {
                '$group': {
                    '_id': {
                        'search_type': '$search_type',
                        'params': '$params'
                    },
                    'timestamp': {'$first': '$timestamp'},
                    'search_type': {'$first': '$search_type'},
                    'params': {'$first': '$params'},
                    'results_count': {'$first': '$results_count'},
                    'count': {'$sum': 1}
                }
            },

            # Шаг 3: Сортируем по дате (новые первые)
            {'$sort': {'timestamp': -1}},

            # Шаг 4: Берём первые N
            {'$limit': n}
        ]

        result = list(self.mongo_connector.col.aggregate(pipeline))
        return result
