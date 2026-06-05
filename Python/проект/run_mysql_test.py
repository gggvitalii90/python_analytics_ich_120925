from mysql_connector import MySQLConnector

def main():
    conn = MySQLConnector()
    try:
        conn.connect()
        with conn.conn.cursor() as cur:
            cur.execute('SELECT COUNT(*) FROM film')
            row = cur.fetchone()
        print('OK', row[0] if row else 0)
    except Exception as e:
        print('ERROR', str(e))
    finally:
        conn.close()

if __name__ == '__main__':
    main()
