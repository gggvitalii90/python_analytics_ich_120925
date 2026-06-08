import os
from dotenv import load_dotenv
# модуль для загрузки переменных окружения из .env файла,
# который может содержать конфиденциальные данные


env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

# env = environment (переменные окружения)
# os.environ (как словарь),
# os.getenv('KEY') (удобный способ получить значение с дефолтом).
# вторым аргументом указывается значение по умолчанию,
# если переменная окружения не установлена
MYSQL_CONFIG = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'port': int(os.getenv('MYSQL_PORT', 3306)),
    'user': os.getenv('MYSQL_USER', ''),
    'password': os.getenv('MYSQL_PASS', ''),
    # sakila на всякий случай чтоб не падало если .env не загрузится
    'db': os.getenv('MYSQL_DB', 'sakila'),
}

MONGO_URI = os.getenv('MONGO_URI', '')
MONGO_DB = os.getenv('MONGO_DB', '')
MONGO_COLLECTION = os.getenv(
    'MONGO_COLLECTION', 'final_project_group_name'
)


def show_config():
    # Для разработчика: показываем конфиг без паролей (для отладки)
    return {
        'mysql_host': MYSQL_CONFIG['host'],
        'mysql_db': MYSQL_CONFIG['db'],
        'mongo_db': MONGO_DB,
        'mongo_collection': MONGO_COLLECTION,
    }
