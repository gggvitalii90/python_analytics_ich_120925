"""Форматирование вывода таблиц в консоль."""
try:
    from tabulate import tabulate
except Exception:
    # если tabulate не установлен, tabulate = None и будем выводить простой
    # текст
    tabulate = None


LINE_WIDTH = 110
USE_TABULATE = True  # True — использовать tabulate, False — простой текст


class Formatter:
    """Статические методы для красивого вывода таблиц."""

    @staticmethod
    # @staticmethod — метод класса, но не требует self
    # Можно вызвать как Formatter.format_search_params(...)
    # без создания объекта.
    def format_search_params(search_type, params):
        if search_type == 'keyword':
            return f"Keyword: {params.get('keyword', '?')}"
        if search_type == 'genre_and_year':
            genre = params.get('genre', '?')
            year_from = params.get('year_from', '?')
            year_to = params.get('year_to', '?')
            return f'Genre: {genre}, Years: {year_from}-{year_to}'
        return 'Неизвестный формат'

    @staticmethod
    def pretty_print_stats(headers, rows, empty_message='Нет данных.'):
        """Выводит статистические таблицы (5 колонок, единое выравнивание)."""
        if not rows:
            print(empty_message)
            return

        if tabulate is not None and USE_TABULATE:
            # Основной путь: красивая таблица через tabulate
            from datetime import datetime
            patched_rows = []
            for row in rows:
                r = list(row)
                if isinstance(r[2], datetime):
                    r[2] = r[2].isoformat(timespec='milliseconds')
                patched_rows.append(r)
            print(
                tabulate(
                    patched_rows,
                    headers=headers,
                    tablefmt='fancy_grid',
                    colalign=('right', 'left', 'center', 'center', 'center')
                )
            )
        else:
            # Если tabulate выключен или недоступен, выводим простой текст.
            header_line = (
                f"| {'№':>3} | {'Запрос':<36} | {'Дата':<27} "
                f"| {'Кол-во запросов':>15} | {'Кол-во результатов':>18} |"
            )
            line = '=' * len(header_line)
            mid_line = '-' * len(header_line)

            print(line)
            print(header_line)
            print(mid_line)
            from datetime import datetime
            for row in rows:
                date_val = row[2]
                if isinstance(date_val, datetime):
                    date_str = date_val.isoformat(timespec='milliseconds')
                else:
                    date_str = str(date_val)
                print(
                    f"| {str(row[0]):>3} "
                    f"| {str(row[1])[:36]:<36} "
                    f"| {date_str:<27} "
                    f"| {str(row[3]):>15} "
                    f"| {str(row[4]):>18} |"
                )
            print(line)

    @staticmethod
    def pretty_print_results(results, start_index=1):
        """Выводит результаты поиска (№, Название, Жанр, Год, ID)."""
        if not results:
            print('Результатов не найдено.')
            return

        headers = ['№', 'Название', 'Жанр', 'Год', 'ID']
        rows = []
        for idx, item in enumerate(results, start=start_index):
            # Обрезаем длинные названия, чтобы таблица не расползалась.
            title = f"{str(item.get('title', ''))[:30]:<30}"
            genre = f"{str(item.get('genre', ''))[:15]:<15}"
            year = f"{str(item.get('year', '')):^4}"
            film_id = f"{str(item.get('film_id', '')):^4}"
            rows.append([idx, title, genre, year, film_id])

        if tabulate is not None and USE_TABULATE:
            # Основной путь: красивая таблица
            print(
                tabulate(
                    rows,
                    headers=headers,
                    tablefmt='fancy_grid',
                    colalign=('right', 'left', 'left', 'center', 'center'),
                    preserve_whitespace=True,
                )
            )
        else:
            # Если tabulate выключен или недоступен, выводим простой текст.
            header_line = (
                f"| {'№':>3} | {'Название':<30} | {'Жанр':<15} "
                f"| {'Год':>4} | {'ID':>4} |"
            )
            line = '=' * len(header_line)
            mid_line = '-' * len(header_line)

            print(line)
            print(header_line)
            print(mid_line)
            for row in rows:
                print(
                    f"| {str(row[0]):>3} | {str(row[1])[:30]:<30} | "
                    f"{str(row[2])[:15]:<15} | {str(row[3]):>4} "
                    f"| {str(row[4]):>4} |"
                )
            print(line)
