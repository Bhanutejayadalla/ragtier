import pymysql

# Replace with your MySQL root credentials
HOST = "localhost"
USER = "root"
PASSWORD = "12345" # update this if your local mysql password is different
DB_NAME = "tierrag"

def create_database():
    try:
        connection = pymysql.connect(host=HOST, user=USER, password=PASSWORD)
        with connection.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        connection.commit()
        print(f"Database '{DB_NAME}' created successfully.")
    except Exception as e:
        print(f"Error creating database: {e}")
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

if __name__ == "__main__":
    create_database()
