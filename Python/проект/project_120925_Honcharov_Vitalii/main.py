import sys
from mysql_connector import MySQLConnector
from mongo_connector import MongoConnector
from log_writer import LogWriter
from log_stats import LogStats
from formatter import Formatter

LINE_WIDTH = 110

# Простая проверка зависимостей: если чего-то нет, даём подсказку
required_packages = {
    'pymysql': 'pymysql',
    'pymongo': 'pymongo',
    'dotenv': 'python-dotenv',
    'tabulate': 'tabulate'
}

missing = []
for module_name, package_name in required_packages.items():
    try:
        __import__(module_name)
    except ImportError:
        missing.append(package_name)

if missing:
    print('Не установлены зависимости:')
    for package_name in missing:
        print(f'- {package_name}')
    print('\nУстановите командой:')
    print('pip install -r requirements.txt')
    sys.exit(1)


def menu():
    print('\n' + '=' * LINE_WIDTH)
    print('МЕНЮ ДЛЯ ПОИСКА ФИЛЬМОВ'.center(LINE_WIDTH))
    print('=' * LINE_WIDTH)
    print('1 — Поиск по ключевому слову')
    print('2 — Поиск по жанру и году')
    print('3 — СТАТИСТИКА')
    print('0 — Выход')
    print('=' * LINE_WIDTH)


def menu_stats():
    print('\n' + '=' * LINE_WIDTH)
    print('МЕНЮ СТАТИСТИКИ'.center(LINE_WIDTH))
    print('=' * LINE_WIDTH)
    print('1 — TOP-N популярных запросов по {keyword}')
    print('2 — TOP-N популярных запросов по {genres-years}')
    print('3 — TOP-N последних уникальных запросов')
    print('0 — Назад')
    print('=' * LINE_WIDTH)


def main():
    connector = MySQLConnector()  # Объект для работы с MySQL
    mongo_connector = MongoConnector()
    log_writer = LogWriter(mongo_connector)  # Запись логов в MongoDB
    log_stats = LogStats(mongo_connector)  # Чтение статистики из MongoDB

    try:
        # Подключаемся к MySQL
        connector.connect()
        print('Подключение к БД установлено.')
    except Exception as e:
        print(f'Ошибка подключения к MySQL: {e}')
        return

    # Подключаем MongoDB один раз: и для логов, и для статистики
    mongo_connector.connect()

    while True:
        menu()  # показываем меню пользователю
        choice = input('Выберите пункт меню: ').strip()

        if not choice:
            print('Пункт меню не может быть пустым. Доступно: 0, 1, 2, 3.')
            continue
        if not choice.isdigit():
            print(
                'Неверный пункт меню. '
                'Введите только одну цифру: 0, 1, 2 или 3.'
            )
            continue
        if choice not in {'0', '1', '2', '3'}:
            print('Неверный пункт меню. Доступно: 0, 1, 2, 3.')
            continue

        if choice == '0':
            print('Выход из программы...')
            break

        elif choice == '1':
            while True:
                keyword = input('Введите ключевое слово (0 — назад): ').strip()
                if keyword == '0':
                    break
                if not keyword:
                    print(
                        'Ключевое слово не может быть пустым. '
                        'Попробуйте снова.'
                    )
                    continue

                # Проверка длины
                if len(keyword) > 100:
                    print(
                        'Ключевое слово слишком длинное (макс 100 символов).'
                    )
                    continue

                # Проверка разрешённых символов
                allowed = all(
                    ch.isalpha() or ch.isspace()
                    for ch in keyword
                )
                if not allowed:
                    print(
                        'Ключевое слово может содержать только буквы '
                        'и пробелы.'
                    )
                    continue

                # Не пропускаем ключи из одних знаков препинания
                if not any(ch.isalpha() for ch in keyword):
                    print(
                        'Ключевое слово должно содержать хотя бы одну букву.'
                    )
                    continue

                # в sakila названия фильмов в основном на английском
                if any('а' <= ch.lower() <= 'я' for ch in keyword):
                    print(
                        'В базе названия фильмов на английском,'
                        ' попробуйте латиницу.'
                    )
                    continue
                try:
                    # Сначала получаем общее количество (для логов)
                    total_count = connector.count_by_keyword(keyword)

                    if total_count == 0:
                        print('Фильмы не найдены.')
                        break

                    print(
                        f'\nВсего найдено {total_count} фильмов '
                        f'по ключевому слову "{keyword}"'
                    )


                    # Логируем поиск по ключевому слову
                    try:
                        # Если MongoDB недоступна, результаты поиска
                        # все равно покажем.
                        log_writer.write_search_log(
                            'keyword',
                            {'keyword': keyword},
                            total_count
                        )
                    except Exception:
                        pass

                    # Пагинация: грузим только по 10 за раз
                    page_size = 10
                    page = 0

                    while True:
                        offset = page * page_size

                        # Загружаем только текущую страницу
                        page_results = connector.search_by_keyword(
                            keyword,
                            limit=page_size,
                            offset=offset
                        )

                        if not page_results:
                            print('Больше страниц нет.')
                            break

                        end = min(offset + page_size, total_count)
                        Formatter.pretty_print_results(
                            page_results,
                            start_index=offset + 1
                        )

                        # Если это последняя страница,
                        # не спрашиваем "Показать ещё?"
                        if end >= total_count:
                            if total_count > page_size:
                                print('Это последняя страница.')
                            break

                        while True:
                            show_more = input(
                                'Показать ещё? [y/N]: '
                            ).strip().lower()
                            if show_more in {'y', 'n'}:
                                break
                            print('Введите только y или n.')

                        if show_more == 'n':
                            break
                        page += 1

                    break
                except Exception as e:
                    print(f'Ошибка поиска: {e}')
                    break

        elif choice == '2':
            while True:
                try:
                    # Получаем список всех жанров
                    genres = connector.get_genres()

                    # Выводим нумерованный список жанров
                    print('\n' + '=' * LINE_WIDTH)
                    print('ДОСТУПНЫЕ ЖАНРЫ:'.center(LINE_WIDTH))
                    print('=' * LINE_WIDTH)
                    for idx, g in enumerate(genres, start=1):
                        year_from = g['year_from'] if g['year_from'] else '?'
                        # На случай если в категории нет фильмов вообще
                        # — тогда MIN(f.release_year) вернёт NULL из SQL
                        year_to = g['year_to'] if g['year_to'] else '?'
                        print(
                            f'{idx} — {g["name"]} '
                            f'(годы в базе: {year_from}-{year_to})'
                        )
                    print('=' * LINE_WIDTH)

                    # Пользователь выбирает жанр по номеру
                    genre_id_raw = input(
                        'Введите номер жанра (0 — назад): '
                    ).strip()
                    if genre_id_raw == '0':
                        break
                    if not genre_id_raw.isdigit():
                        print(
                            'Номер жанра: введите только цифры '
                            '(например, 1).'
                        )
                        continue
                    if len(genre_id_raw) > 3:
                        print('Номер жанра: слишком длинное число.')
                        continue
                    genre_id = int(genre_id_raw)
                    if genre_id < 1 or genre_id > len(genres):
                        print(
                            f'Номер жанра: допустимый диапазон '
                            f'от 1 до {len(genres)}.'
                        )
                        continue
                    if 1 <= genre_id <= len(genres):
                        selected_genre = genres[genre_id - 1]
                        # так как нумерация с 1, а индексы в списке с 0
                    else:
                        print('Неверный номер жанра.')
                        continue

                    genre_min_year = selected_genre['year_from']
                    genre_max_year = selected_genre['year_to']
                    if genre_min_year is None or genre_max_year is None:
                        print(
                            'Для выбранного жанра нет данных '
                            'о диапазоне годов.'
                        )
                        continue

                    # После выбора жанра повторяем только ввод годов
                    cancel_genre_search = False
                    while True:
                        year_from_raw = input(
                            'С какого года (0 — назад): '
                        ).strip()
                        if year_from_raw == '0':
                            cancel_genre_search = True
                            break
                        if not year_from_raw.isdigit():
                            print('Начальный год: введите только 4 цифры.')
                            continue
                        if len(year_from_raw) != 4:
                            print(
                                'Начальный год: год должен состоять '
                                'из 4 цифр.'
                            )
                            continue
                        year_from = int(year_from_raw)
                        if (
                            year_from < genre_min_year
                            or year_from > genre_max_year
                        ):
                            print(
                                f'Начальный год: допустимый диапазон '
                                f'{genre_min_year}..{genre_max_year} '
                                f'для жанра {selected_genre["name"]}.'
                            )
                            continue

                        year_to_raw = input(
                            'До какого года (0 — назад): '
                        ).strip()
                        if year_to_raw == '0':
                            cancel_genre_search = True
                            break
                        if not year_to_raw.isdigit():
                            print('Конечный год: введите только 4 цифры.')
                            continue
                        if len(year_to_raw) != 4:
                            print(
                                'Конечный год: год должен состоять '
                                'из 4 цифр.'
                            )
                            continue
                        year_to = int(year_to_raw)
                        if (
                            year_to < genre_min_year
                            or year_to > genre_max_year
                        ):
                            print(
                                f'Конечный год: допустимый диапазон '
                                f'{genre_min_year}..{genre_max_year} '
                                f'для жанра {selected_genre["name"]}.'
                            )
                            continue
                        if year_from > year_to:
                            print(
                                'Начальный год не может быть '
                                'больше конечного.'
                            )
                            continue
                        break

                    if cancel_genre_search:
                        break

                    # Сначала получаем общее количество (для логов)
                    total_count = connector.count_by_genre_and_year(
                        selected_genre['name'], year_from, year_to
                    )

                    if total_count == 0:
                        print('Фильмы не найдены.')
                        break

                    print(
                        f"\nВсего фильмов для жанра '{selected_genre['name']}'"
                        f" за период {year_from}-{year_to}: {total_count}"
                    )


                    # Логируем поиск по жанру и году
                    try:
                        # Если MongoDB недоступна, результаты поиска
                        # все равно покажем.
                        log_writer.write_search_log(
                            'genre_and_year',
                            {
                                'genre': selected_genre['name'],
                                'year_from': year_from,
                                'year_to': year_to
                            },
                            total_count
                        )
                    except Exception:
                        pass

                    # Пагинация: грузим только по 10 за раз
                    page_size = 10
                    page = 0

                    while True:
                        offset = page * page_size

                        # Загружаем только текущую страницу
                        page_results = connector.search_by_genre_and_year(
                            selected_genre['name'],
                            year_from, year_to,
                            limit=page_size,
                            offset=offset
                        )

                        if not page_results:
                            print('Больше страниц нет.')
                            break

                        end = min(offset + page_size, total_count)
                        Formatter.pretty_print_results(
                            page_results,
                            start_index=offset + 1
                        )

                        # Если это последняя страница,
                        # не спрашиваем "Показать ещё?"
                        if end >= total_count:
                            if total_count > page_size:
                                print('Это последняя страница.')
                            break

                        while True:
                            show_more = input(
                                'Показать ещё? [y/N]: '
                            ).strip().lower()
                            if show_more in {'y', 'n'}:
                                break
                            print('Введите только y или n.')

                        if show_more == 'n':
                            break
                        page += 1

                    break
                except Exception as e:
                    print(f'Ошибка поиска: {e}')
                    break

        elif choice == '3':
            if not log_stats.is_connected():
                print('\nСтатистика недоступна: MongoDB не подключен.')
                continue

            while True:
                menu_stats()
                stat_choice = input('Выберите пункт: ').strip()

                if not stat_choice:
                    print(
                        'Пункт статистики не может быть пустым. '
                        'Доступно: 0, 1, 2, 3.'
                    )
                    continue
                if not stat_choice.isdigit():
                    print(
                        'Неверный пункт статистики. '
                        'Введите только одну цифру: 0, 1, 2 или 3.'
                    )
                    continue
                if stat_choice not in {'0', '1', '2', '3'}:
                    print('Неверный пункт статистики. Доступно: 0, 1, 2, 3.')
                    continue

                if stat_choice == '0':
                    break

                elif stat_choice == '1':
                    # TOP-N популярных запросов по keyword
                    try:
                        n_raw = input(
                            'Сколько TOP результатов показать? (0 — назад): '
                        ).strip()
                        if n_raw == '0':
                            continue
                        if not n_raw.isdigit():
                            print('TOP-N: введите только цифры.')
                            continue
                        if len(n_raw) > 4:
                            print('TOP-N: слишком длинное число.')
                            continue
                        n = int(n_raw)
                        if n < 1 or n > 1000:
                            print('TOP-N: допустимый диапазон 1..1000.')
                            continue
                        top_keyword = log_stats.get_top(n, 'keyword')
                        if top_keyword:
                            print(
                                f'\nTOP-{n} популярных запросов '
                                f'{{keyword}}'.center(LINE_WIDTH)
                            )
                            headers = [
                                '№',
                                'Запрос',
                                'Дата',
                                'Кол-во запросов',
                                'Кол-во результатов'
                            ]
                            rows = []
                            for i, item in enumerate(top_keyword, start=1):
                                keyword = item['_id'].get('keyword', '?')
                                count = item.get('count', 0)
                                last_date = item.get('last_date', '')
                                results_count = item.get('results_count', 0)
                                rows.append(
                                    [
                                        i,
                                        keyword,
                                        last_date,
                                        count,
                                        results_count
                                    ]
                                )
                            Formatter.pretty_print_stats(headers, rows)
                        else:
                            print('Нет данных о поисках.')
                    except Exception as e:
                        print(f'Ошибка: {e}')

                elif stat_choice == '2':
                    # TOP-N популярных запросов по genres-years
                    try:
                        n_raw = input(
                            'Сколько TOP результатов показать? (0 — назад): '
                        ).strip()
                        if n_raw == '0':
                            continue
                        if not n_raw.isdigit():
                            print('TOP-N: введите только цифры.')
                            continue
                        if len(n_raw) > 4:
                            print('TOP-N: слишком длинное число.')
                            continue
                        n = int(n_raw)
                        if n < 1 or n > 1000:
                            print('TOP-N: допустимый диапазон 1..1000.')
                            continue
                        top_genre = log_stats.get_top(n, 'genre_and_year')
                        if top_genre:
                            print(
                                f'\nTOP-{n} популярных запросов '
                                f'{{genres-years}}'.center(LINE_WIDTH)
                            )
                            headers = [
                                '№',
                                'Запрос',
                                'Дата',
                                'Кол-во запросов',
                                'Кол-во результатов'
                            ]
                            rows = []
                            for i, item in enumerate(top_genre, start=1):
                                genre = item['_id'].get('genre', '?')
                                year_from = item['_id'].get('year_from', '?')
                                year_to = item['_id'].get('year_to', '?')
                                count = item.get('count', 0)
                                last_date = item.get('last_date', '')
                                results_count = item.get('results_count', 0)
                                rows.append(
                                    [
                                        i,
                                        f'{genre}, {year_from}-{year_to}',
                                        last_date,
                                        count,
                                        results_count
                                    ]
                                )
                            Formatter.pretty_print_stats(headers, rows)
                        else:
                            print('Нет данных о поисках.')
                    except Exception as e:
                        print(f'Ошибка: {e}')

                elif stat_choice == '3':
                    # TOP-N последних запросов
                    try:
                        n_raw = input(
                            'Сколько последних запросов показать? '
                            '(0 — назад): '
                        ).strip()
                        if n_raw == '0':
                            continue
                        if not n_raw.isdigit():
                            print('TOP-N: введите только цифры.')
                            continue
                        if len(n_raw) > 4:
                            print('TOP-N: слишком длинное число.')
                            continue
                        n = int(n_raw)
                        if n < 1 or n > 1000:
                            print('TOP-N: допустимый диапазон 1..1000.')
                            continue
                        recent = log_stats.get_recent(n)
                        if recent:
                            print(
                                f'\nTOP-{n} последних уникальных '
                                f'запросов'.center(LINE_WIDTH)
                            )
                            headers = [
                                '№',
                                'Запрос',
                                'Дата',
                                'Кол-во запросов',
                                'Кол-во результатов'
                            ]
                            rows = []
                            for i, item in enumerate(recent, start=1):
                                timestamp = item.get('timestamp', '')
                                search_type = item['search_type']
                                params = item['params']
                                count = item.get('count', 0)
                                results_count = item.get('results_count', 0)
                                params_text = Formatter.format_search_params(
                                    search_type,
                                    params
                                )

                                rows.append(
                                    [
                                        i,
                                        params_text,
                                        timestamp,
                                        count,
                                        results_count
                                    ]
                                )
                            Formatter.pretty_print_stats(headers, rows)
                        else:
                            print('Нет данных о поисках.')
                    except Exception as e:
                        print(f'Ошибка: {e}')

                else:
                    print(
                        'Неверный пункт статистики. '
                        'Доступно: 0, 1, 2, 3. '
                        'Введите только одну цифру.'
                    )

    connector.close()
    mongo_connector.close()
    print('Отключение от БД и MongoDB.')


# Этот блок запускается только когда файл запускают напрямую.
# Если main.py импортировать в другой файл, main() автоматически не выполнится.
if __name__ == '__main__':
    main()
