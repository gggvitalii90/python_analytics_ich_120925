"""MySQL connector для работы с базой sakila."""
from config import MYSQL_CONFIG
import pymysql


class MySQLConnector:
    """Работа с MySQL базой (поиск фильмов)."""
    def __init__(self):
        self.conn = None # заглушка для соединения

    def connect(self):
        """Подключается к MySQL используя настройки из config."""
        config = MYSQL_CONFIG
        self.conn = pymysql.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password'],
            db=config['db']
        )
        return self.conn

    def close(self):
        """Закрывает соединение с MySQL."""
        if self.conn:
            self.conn.close()

    def get_genres(self):
        # Получаем список жанров с диапазоном годов
        query = """
            SELECT c.name,
                   MIN(f.release_year),
                   MAX(f.release_year)
            FROM category AS c
            LEFT JOIN film_category AS fc
                ON fc.category_id = c.category_id
            LEFT JOIN film AS f
                ON f.film_id = fc.film_id
            GROUP BY c.category_id, c.name
            ORDER BY c.name
        """
        with self.conn.cursor() as cur:
            cur.execute(query)
            rows = cur.fetchall() # забирает все из cursor и ложит в список
        return [
            {
                'name': r[0],
                'year_from': r[1],
                'year_to': r[2]
            }
            for r in rows
        ]

    # Возвращает список словарей фильмов:
    # [{'film_id': 1, 'title': 'Alien', ...}, ...]
    def search_by_keyword(
            self,
            keyword: str,
            limit: int = 10,
            offset: int = 0):
        """Поиск фильмов по ключевому слову с пагинацией.
        Параметризованный запрос %s — защита от SQL-инъекций."""
        q = (
            "SELECT f.film_id, f.title, f.description, f.release_year, "
            "GROUP_CONCAT(DISTINCT c.name ORDER BY c.name "
            "SEPARATOR ', ') AS genre "
            "FROM film AS f "
            "LEFT JOIN film_category AS fc ON fc.film_id = f.film_id "
            "LEFT JOIN category AS c ON c.category_id = fc.category_id "
            "WHERE LOWER(f.title) LIKE LOWER(%s) "
            "GROUP BY f.film_id, f.title, f.description, f.release_year "
            "ORDER BY f.title "
            "LIMIT %s OFFSET %s")
        with self.conn.cursor() as cur:
            # %s подставляет значения безопасно (экранирует спецсимволы)
            cur.execute(q, (f"%{keyword}%", limit, offset))
            rows = cur.fetchall()
        return [
            {'film_id': r[0], 'title': r[1],
             'description': r[2], 'year': r[3], 'genre': r[4] or ''}
            for r in rows
        ]

    def count_by_keyword(self, keyword: str):
        """Подсчитывает количество фильмов по ключу (для пагинации)."""
        q = (
            "SELECT COUNT(*) "
            "FROM film AS f "
            "WHERE LOWER(f.title) LIKE LOWER(%s)"
        )
        with self.conn.cursor() as cur:
            cur.execute(q, (f"%{keyword}%",))
            result = cur.fetchone()
        return result[0] if result else 0

    def search_by_genre_and_year(
            self, category_name: str,
            year_from: int, year_to: int,
            limit: int = 10, offset: int = 0
    ):
        """Поиск по жанру и диапазону годов с пагинацией.
        BETWEEN — удобнее для диапазонов, чем >= и <=."""
        q = """
            SELECT f.film_id, f.title, f.description, f.release_year, c.name
            FROM film AS f
            JOIN film_category AS fc
            ON fc.film_id = f.film_id
            JOIN category AS c
            ON c.category_id = fc.category_id
            WHERE LOWER(c.name) = LOWER(%s)
              AND f.release_year BETWEEN %s AND %s
            ORDER BY f.title
            LIMIT %s OFFSET %s
        """
        with self.conn.cursor() as cur:
            cur.execute(
                q, (category_name, year_from, year_to, limit, offset)
            )
            rows = cur.fetchall()
        return [
            {'film_id': r[0], 'title': r[1],
             'description': r[2], 'year': r[3], 'genre': r[4]}
            for r in rows
        ]

    def count_by_genre_and_year(
            self, category_name: str,
            year_from: int, year_to: int
    ):
        """Считает фильмы по жанру/годам без загрузки данных."""
        q = """
            SELECT COUNT(*)
            FROM film AS f
            JOIN film_category AS fc
            ON fc.film_id = f.film_id
            JOIN category AS c
            ON c.category_id = fc.category_id
            WHERE LOWER(c.name) = LOWER(%s)
              AND f.release_year BETWEEN %s AND %s
        """
        with self.conn.cursor() as cur:
            cur.execute(q, (category_name, year_from, year_to))
            result = cur.fetchone()
        return result[0] if result else 0
